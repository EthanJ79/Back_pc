// lib/ui/system_tray.dart
// 시스템 트레이(윈도우 작업표시줄 알림영역 / macOS 메뉴바) 매니저
// 에이전트가 백그라운드에서 실행 중임을 아이콘으로 표시하고, 우클릭 메뉴 제공.

import 'dart:io' show Platform, Process, exit;
import 'package:system_tray/system_tray.dart';
import 'package:window_manager/window_manager.dart';
import 'package:path_provider/path_provider.dart';
import '../core/storage/config_store.dart';
import '../core/monitor/activity_monitor.dart';
import '../core/platform/platform_monitor.dart';

class SystemTrayManager {
  static final SystemTrayManager _instance = SystemTrayManager._internal();
  factory SystemTrayManager() => _instance;
  SystemTrayManager._internal();

  final PlatformMonitor _platformMonitor = PlatformMonitor();
  final SystemTray _systemTray = SystemTray();
  ConfigStore? _configStore;
  ActivityMonitor? _activityMonitor;
  bool _isInitialized = false;

  String get _iconPath =>
      Platform.isWindows ? 'assets/icons/app_icon.ico' : 'assets/icons/app_icon.png';

  Future<void> initialize(ConfigStore configStore, ActivityMonitor activityMonitor) async {
    if (_isInitialized) return;
    _configStore = configStore;
    _activityMonitor = activityMonitor;

    try {
      // 트레이 아이콘 등록 (실행 중 표시)
      await _systemTray.initSystemTray(
        iconPath: _iconPath,
        toolTip: 'PGuard Agent · 실행 중',
      );
      if (Platform.isMacOS) {
        // macOS 메뉴바에 라벨 표시
        await _systemTray.setTitle('PGuard');
      }

      // 우클릭 컨텍스트 메뉴
      final Menu menu = Menu();
      await menu.buildFrom([
        MenuItemLabel(label: '● PGuard 실행 중', enabled: false),
        MenuSeparator(),
        MenuItemLabel(label: '설정 창 열기', onClicked: (_) => showSetupWindow()),
        MenuItemLabel(label: '지금 서버로 전송', onClicked: (_) => forceSync()),
        MenuItemLabel(label: '로그 폴더 열기', onClicked: (_) => openLogFolder()),
        MenuSeparator(),
        MenuItemLabel(label: '종료', onClicked: (_) => quitApp()),
      ]);
      await _systemTray.setContextMenu(menu);

      // 트레이 아이콘 클릭 이벤트
      _systemTray.registerSystemTrayEventHandler((eventName) {
        if (eventName == kSystemTrayEventClick) {
          Platform.isWindows ? showSetupWindow() : _systemTray.popUpContextMenu();
        } else if (eventName == kSystemTrayEventRightClick) {
          Platform.isWindows ? _systemTray.popUpContextMenu() : showSetupWindow();
        }
      });
    } catch (e) {
      // 트레이 초기화 실패 시에도 백그라운드 수집은 계속 동작
      // ignore: avoid_print
      print('[SystemTray] 초기화 실패(백그라운드 유지): $e');
    }

    _isInitialized = true;
  }

  // 창을 닫아도 종료하지 않고 트레이로 숨김 (선택적으로 호출)
  Future<void> hideToTray() async {
    await windowManager.hide();
  }

  Future<void> showSetupWindow() async {
    await windowManager.show();
    await windowManager.focus();
  }

  Future<void> forceSync() async {
    await _activityMonitor?.flush();
  }

  Future<void> openLogFolder() async {
    final dir = await getApplicationDocumentsDirectory();
    if (Platform.isWindows) {
      await Process.run('explorer', [dir.path]);
    } else if (Platform.isMacOS) {
      await Process.run('open', [dir.path]);
    }
  }

  Future<void> toggleAutoStart() async {
    final current = _configStore?.autoStartEnabled ?? false;
    final newValue = !current;
    await _configStore?.setAutoStartEnabled(newValue);

    if (Platform.isWindows) {
      final exePath = Platform.resolvedExecutable;
      if (newValue) {
        await _platformMonitor.registerAutoStart(exePath);
      } else {
        await _platformMonitor.unregisterAutoStart();
      }
    }
  }

  Future<void> quitApp() async {
    try {
      await _systemTray.destroy();
    } catch (_) {}
    _activityMonitor?.dispose();
    await windowManager.destroy();
    exit(0);
  }
}
