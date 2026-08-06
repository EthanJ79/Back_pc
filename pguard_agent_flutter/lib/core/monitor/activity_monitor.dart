// lib/core/monitor/activity_monitor.dart
// Main activity monitoring loop

import 'dart:async';
import 'dart:io' show Platform;
import 'package:logging/logging.dart';
import 'domain_extractor.dart';
import 'category_classifier.dart';
import '../platform/platform_monitor.dart';
import '../storage/activity_buffer.dart';
import '../storage/config_store.dart';
import '../network/api_client.dart';

final _logger = Logger('ActivityMonitor');

class ActivityMonitor {
  final ConfigStore _configStore;
  final ApiClient _apiClient;
  final ActivityBuffer _activityBuffer;
  final PlatformMonitor _platformMonitor = PlatformMonitor();

  Timer? _monitorTimer;
  Timer? _settingsSyncTimer;
  Timer? _commandPollTimer;

  // 상태 변수
  ActivityItem? _currentActivity;
  String? _prevCategory;
  final List<ActivityItem> _recentIdleActivities = [];
  DateTime _lastActiveTime = DateTime.now();
  Point? _lastMousePos;
  String _lastWindowTitle = '';
  bool _isOverlayActive = false;
  Map<String, dynamic> _overlayResult = {'reason': null, 'detail': null, 'submitted': false};
  Completer<Map<String, dynamic>> _overlayCompleter = Completer<Map<String, dynamic>>();

  // 설정 동기화 주기
  static const int _settingsSyncInterval = 300; // 5분
  static const int _commandPollInterval = 30; // 30초

  // 최대 누적 시간 (동일 활동 합산)
  static const int _maxAccumulateTime = 60; // 초

  ActivityMonitor(this._configStore, this._apiClient, this._activityBuffer);

  Future<void> start() async {
    _logger.info('Starting activity monitor...');
    
    // 초기 설정 동기화
    await _syncSettings();
    await _apiClient.sendStartupPing();
    await _pollCommands();

    // 메인 모니터링 루프 시작 (기본 60초, 서버 설정으로 변경 가능)
    _startMonitorLoop(_configStore.loopInterval);
    
    // 주기적 설정 동기화
    _settingsSyncTimer = Timer.periodic(
      const Duration(seconds: _settingsSyncInterval),
      (_) => _syncSettings(),
    );

    // 명령 폴링
    _commandPollTimer = Timer.periodic(
      const Duration(seconds: _commandPollInterval),
      (_) => _pollCommands(),
    );
  }

  void _startMonitorLoop(int intervalSeconds) {
    _monitorTimer?.cancel();
    _monitorTimer = Timer.periodic(
      Duration(seconds: intervalSeconds),
      (_) => _monitorTick(),
    );
    // 즉시 첫 실행
    _monitorTick();
  }

  void updateMonitorInterval(int intervalSeconds) {
    _startMonitorLoop(intervalSeconds);
  }

  Future<void> _monitorTick() async {
    try {
      // 1. 활성 창 및 프로세스 정보 획득
      final windowInfo = await _platformMonitor.getActiveWindow();
      final processName = windowInfo.processName;
      final windowTitle = windowInfo.windowTitle;

      String? domain;
      if (processName != null && windowTitle != null) {
        final isBrowser = DomainExtractor.isBrowser(processName);
        if (isBrowser) {
          domain = DomainExtractor.extractDomainFromTitle(windowTitle, processName);
        }
      }

      // 2. OS 유휴 시간 확인
      final osIdleSeconds = await _platformMonitor.getIdleSeconds();

      // 3. 2차 자체 활동 감지 보강 (Windows만)
      final currentTime = DateTime.now();
      bool mouseMoved = false;
      bool windowChanged = false;

      if (Platform.isWindows) {
        // 마우스 좌표 변화 감지
        final cursorPos = await _platformMonitor.getCursorPos();
        if (_lastMousePos != null && cursorPos != null && cursorPos != _lastMousePos) {
          mouseMoved = true;
        }
        _lastMousePos = cursorPos;

// 주요 키보드 입력 감지
  final keysToCheck = <int>[
    0x20, 0x0D, 0x08, 0x09, // Space, Enter, Backspace, Tab
    0xA0, 0xA1, 0xA2, 0xA3, // L/R Shift, L/R Ctrl
    0x25, 0x26, 0x27, 0x28, // Left, Up, Right, Down
    ...List<int>.generate(26, (i) => 0x41 + i), // A-Z
    ...List<int>.generate(10, (i) => 0x30 + i), // 0-9
  ];

        for (final key in keysToCheck) {
          if (await _platformMonitor.isKeyPressed(key)) {
            mouseMoved = true;
            break;
          }
        }
      }

      // 창 제목 변화 감지
      if (windowTitle != null && windowTitle != _lastWindowTitle) {
        windowChanged = true;
        _lastWindowTitle = windowTitle;
      }

      // 활동 감지 시 타이머 리셋
      final isVideoMeeting = processName != null && windowTitle != null && domain != null
          ? CategoryClassifier.isVideoOrMeetingActive(processName, windowTitle, domain)
          : false;

      if (mouseMoved || windowChanged || isVideoMeeting || processName == 'admin_process') {
        _lastActiveTime = currentTime;
      }

      final customIdleSeconds = currentTime.difference(_lastActiveTime).inSeconds.toDouble();
      
      // 최종 유휴 시간: OS API와 자체 감지 중 최소값
      double idleSeconds = customIdleSeconds < osIdleSeconds ? customIdleSeconds : osIdleSeconds;

      // 부팅/시작 직후 10분 즉시 자리비움 방지
      if (customIdleSeconds < 5.0 && osIdleSeconds > 300) {
        idleSeconds = 0.0;
      }

      // 4. 자리비움 오버레이 처리
      final idleThreshold = _configStore.idleThreshold.toDouble();
      bool isAfk;

      if (_isOverlayActive) {
        if (_overlayResult['reason'] != null) {
          // 사유 입력됨: 최근 유휴 활동에 사유 채우기 (flush 시 처리)
        }

        if (_overlayResult['submitted'] == true) {
          _isOverlayActive = false;
          isAfk = false;
          // 복귀 시 타이머 리셋
          _lastActiveTime = DateTime.now();
          if (Platform.isWindows) {
            _lastMousePos = await _platformMonitor.getCursorPos();
          }
        } else {
          isAfk = true;
        }
      } else {
        isAfk = idleSeconds > idleThreshold;
      }

      // 5. 카테고리 판별
      String category;
      String finalProcessName = processName ?? 'system_process';
      String finalWindowTitle = windowTitle ?? '시스템 화면(UAC 등)';
      String? finalDomain = domain;

      if (!isAfk) {
        if (processName != null && windowTitle != null) {
          category = CategoryClassifier.determineCategory(processName, windowTitle, domain);
        } else {
          category = _prevCategory ?? 'work';
          if (_prevCategory == 'idle') category = 'work';
        }
      } else {
        category = 'idle';
        finalProcessName = processName ?? 'system_idle';
        finalWindowTitle = windowTitle ?? '자리비움 또는 화면 잠금';
        finalDomain = null;
      }

      // 6. 자리비움 → 업무 전환 감지 (복귀)
      if (_prevCategory == 'idle' && category != 'idle') {
        _logger.info('자리비움에서 업무 상태로 복귀 감지');
        _overlayCompleter.complete({'submitted': true});
        _isOverlayActive = false;
        _overlayResult = {'reason': null, 'detail': null, 'submitted': true};
      }

      // 7. 활동 누적/로깅
      await _accumulateActivity(
        category: category,
        processName: finalProcessName,
        windowTitle: finalWindowTitle,
        domain: finalDomain,
        currentTime: currentTime,
      );

      _prevCategory = category;

    } catch (e, stack) {
      _logger.severe('Monitor tick error: $e', e, stack);
    }
  }

  Future<void> _accumulateActivity({
    required String category,
    required String processName,
    required String windowTitle,
    String? domain,
    required DateTime currentTime,
  }) async {
    final nowSec = currentTime.millisecondsSinceEpoch ~/ 1000;

    if (_currentActivity != null &&
        _currentActivity!.category == category &&
        _currentActivity!.processName == processName &&
        _currentActivity!.windowTitle == windowTitle &&
        _currentActivity!.domain == domain &&
        (nowSec - _currentActivity!.startTime) < _maxAccumulateTime) {
      // 동일 활동 누적: duration 업데이트
      _currentActivity = ActivityItem(
        companyCode: _currentActivity!.companyCode,
        employeeId: _currentActivity!.employeeId,
        employeeName: _currentActivity!.employeeName,
        processName: _currentActivity!.processName,
        windowTitle: _currentActivity!.windowTitle,
        domain: _currentActivity!.domain,
        category: _currentActivity!.category,
        startTime: _currentActivity!.startTime,
        duration: nowSec - _currentActivity!.startTime,
        idleReason: _currentActivity!.idleReason,
        idleDetailedReason: _currentActivity!.idleDetailedReason,
        createdAt: _currentActivity!.createdAt,
      );
    } else {
      // 새 활동 시작: 이전 활동 저장
      if (_currentActivity != null) {
        final duration = nowSec - _currentActivity!.startTime;
        final item = ActivityItem(
          companyCode: _configStore.companyCode,
          employeeId: _configStore.employeeId,
          employeeName: _configStore.employeeName,
          processName: _currentActivity!.processName,
          windowTitle: _currentActivity!.windowTitle,
          domain: _currentActivity!.domain,
          category: _currentActivity!.category,
          startTime: _currentActivity!.startTime,
          duration: duration,
          idleReason: _currentActivity!.idleReason,
          idleDetailedReason: _currentActivity!.idleDetailedReason,
        );
        await _activityBuffer.add(item);

        if (_currentActivity!.category == 'idle') {
          _recentIdleActivities.add(item);
          if (_recentIdleActivities.length > 100) {
            _recentIdleActivities.removeAt(0);
          }
        }
      }

      // 새 활동 시작
      _currentActivity = ActivityItem(
        companyCode: _configStore.companyCode,
        employeeId: _configStore.employeeId,
        employeeName: _configStore.employeeName,
        processName: processName,
        windowTitle: windowTitle,
        domain: domain,
        category: category,
        startTime: nowSec,
        duration: 0,
      );
    }
  }

  Future<void> _syncSettings() async {
    try {
      final result = await _apiClient.syncCompanySettings();
      if (result.success && result.settings != null) {
        final settings = result.settings!;
        if (settings['agent_scan_interval_seconds'] != null) {
          final newInterval = settings['agent_scan_interval_seconds'] as int;
          if (newInterval != _configStore.loopInterval) {
            await _configStore.setLoopInterval(newInterval);
            updateMonitorInterval(newInterval);
          }
        }
        if (settings['agent_send_interval_seconds'] != null) {
          final newInterval = settings['agent_send_interval_seconds'] as int;
          if (newInterval != _configStore.sendInterval) {
            await _configStore.setSendInterval(newInterval);
            _activityBuffer.updateFlushInterval(newInterval);
          }
        }
        if (settings['idle_threshold_seconds'] != null) {
          await _configStore.setIdleThreshold(settings['idle_threshold_seconds'] as int);
        }
      }
    } catch (e) {
      _logger.warning('Settings sync failed: $e');
    }
  }

  Future<void> _pollCommands() async {
    try {
      final commands = await _apiClient.pollCommands();
      if (commands != null) {
        for (final cmd in commands) {
          if (cmd['type'] == 'message') {
            final message = cmd['payload']?['message'] as String?;
            if (message != null && message.isNotEmpty) {
              _logger.info('Admin message received: $message');
            }
          }
        }
      }
    } catch (e) {
      _logger.warning('Command poll failed: $e');
    }
  }

  // 자리비움 사유 입력 요청 (UI에서 호출)
  Future<Map<String, dynamic>> requestIdleReason() async {
    _isOverlayActive = true;
    _overlayResult = {'reason': null, 'detail': null, 'submitted': false};
    _overlayCompleter = Completer<Map<String, dynamic>>();
    return _overlayCompleter.future;
  }

  void submitIdleReason(String reason, String? detail) {
    _overlayResult = {'reason': reason, 'detail': detail, 'submitted': true};
    _overlayCompleter.complete(_overlayResult);
  }

  void cancelIdleReason() {
    _overlayResult = {'reason': null, 'detail': null, 'submitted': true};
    _overlayCompleter.complete(_overlayResult);
  }

  // 강제 플러시
  Future<void> flush() async {
    // 현재 활동 완료 후 플러시
    if (_currentActivity != null) {
      final nowSec = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      final duration = nowSec - _currentActivity!.startTime;
      if (duration > 0) {
        final item = ActivityItem(
          companyCode: _configStore.companyCode,
          employeeId: _configStore.employeeId,
          employeeName: _configStore.employeeName,
          processName: _currentActivity!.processName,
          windowTitle: _currentActivity!.windowTitle,
          domain: _currentActivity!.domain,
          category: _currentActivity!.category,
          startTime: _currentActivity!.startTime,
          duration: duration,
          idleReason: _currentActivity!.idleReason,
          idleDetailedReason: _currentActivity!.idleDetailedReason,
        );
        await _activityBuffer.add(item);
      }
      _currentActivity = null;
    }
    await _activityBuffer.flush();
  }

  void dispose() {
    _monitorTimer?.cancel();
    _settingsSyncTimer?.cancel();
    _commandPollTimer?.cancel();
    _activityBuffer.dispose();
  }
}