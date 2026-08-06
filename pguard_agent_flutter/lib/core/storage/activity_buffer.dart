// lib/core/storage/activity_buffer.dart
// Local activity buffer with exponential backoff retry logic

import 'dart:async';
import 'dart:math' as math;
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class ActivityItem {
  final String companyCode;
  final String employeeId;
  final String employeeName;
  final String processName;
  final String windowTitle;
  final String? domain;
  final String category; // 'work', 'non-work', 'idle'
  final int startTime; // Unix timestamp (seconds)
  final int duration; // seconds
  final String? idleReason;
  final String? idleDetailedReason;
  final DateTime createdAt;

  ActivityItem({
    required this.companyCode,
    required this.employeeId,
    required this.employeeName,
    required this.processName,
    required this.windowTitle,
    this.domain,
    required this.category,
    required this.startTime,
    required this.duration,
    this.idleReason,
    this.idleDetailedReason,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'company_code': companyCode,
    'employee_id': employeeId,
    'employee_name': employeeName,
    'process_name': processName,
    'window_title': windowTitle,
    'domain': domain,
    'category': category,
    'timestamp': startTime,
    'duration': duration,
    'idle_reason': idleReason,
    'idle_detailed_reason': idleDetailedReason,
  };

  factory ActivityItem.fromJson(Map<String, dynamic> json) => ActivityItem(
    companyCode: json['company_code'] as String,
    employeeId: json['employee_id'] as String,
    employeeName: json['employee_name'] as String,
    processName: json['process_name'] as String,
    windowTitle: json['window_title'] as String,
    domain: json['domain'] as String?,
    category: json['category'] as String,
    startTime: json['start_time'] as int,
    duration: json['duration'] as int,
    idleReason: json['idle_reason'] as String?,
    idleDetailedReason: json['idle_detailed_reason'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  ActivityItem copyWith({
    String? idleReason,
    String? idleDetailedReason,
  }) {
    return ActivityItem(
      companyCode: companyCode,
      employeeId: employeeId,
      employeeName: employeeName,
      processName: processName,
      windowTitle: windowTitle,
      domain: domain,
      category: category,
      startTime: startTime,
      duration: duration,
      idleReason: idleReason ?? this.idleReason,
      idleDetailedReason: idleDetailedReason ?? this.idleDetailedReason,
      createdAt: createdAt,
    );
  }
}

class ActivityBuffer {
  static const int _maxBufferItems = 500;
  static const int _retryBaseBackoff = 15; // seconds
  static const int _retryMaxBackoff = 300; // seconds

  Database? _db;

  int _sendFailureCount = 0;
  int _nextSendTime = 0; // Unix timestamp (milliseconds)
  Timer? _flushTimer;
  bool _isSending = false;

  ActivityBuffer({
    required String companyCode,
    required String employeeId,
    required String employeeName,
    required String apiToken,
    required String serverUrl,
  });

  Future<void> initialize() async {
    final dir = await getApplicationDocumentsDirectory();
    final dbPath = join(dir.path, 'pguard_activity.db');
    _db = await openDatabase(
      dbPath,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_code TEXT NOT NULL,
            employee_id TEXT NOT NULL,
            employee_name TEXT NOT NULL,
            process_name TEXT NOT NULL,
            window_title TEXT NOT NULL,
            domain TEXT,
            category TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            idle_reason TEXT,
            idle_detailed_reason TEXT,
            created_at TEXT NOT NULL
          )
        ''');
        await db.execute('CREATE INDEX idx_created_at ON activities(created_at)');
      },
    );

    // 시작 시 오래된 버퍼 정리 (7일 이상)
    await _cleanOldActivities();
    
    // 주기적 플러시 타이머 시작 (기본 10분, 서버 설정으로 동적 변경 가능)
    _startFlushTimer(600);
  }

  Future<void> _cleanOldActivities() async {
    if (_db == null) return;
    final cutoff = DateTime.now().subtract(const Duration(days: 7)).toIso8601String();
    await _db!.delete(
      'activities',
      where: 'created_at < ?',
      whereArgs: [cutoff],
    );
  }

  void _startFlushTimer(int intervalSeconds) {
    _flushTimer?.cancel();
    _flushTimer = Timer.periodic(
      Duration(seconds: intervalSeconds),
      (_) => flush(),
    );
  }

  void updateFlushInterval(int intervalSeconds) {
    _startFlushTimer(intervalSeconds);
  }

  // 활동 추가 (메모리 + DB)
  Future<void> add(ActivityItem item) async {
    if (_db == null) return;

    // 버퍼 크기 제한: 가장 오래된 항목 삭제
    final count = Sqflite.firstIntValue(await _db!.rawQuery('SELECT COUNT(*) FROM activities'));
    if (count != null && count >= _maxBufferItems) {
      await _db!.rawDelete('''
        DELETE FROM activities WHERE id IN (
          SELECT id FROM activities ORDER BY created_at ASC LIMIT ?
        )
      ''', [_maxBufferItems ~/ 10]); // 10% 삭제
    }

    await _db!.insert('activities', item.toJson());
  }

  // 버퍼에서 활동 조회 (전송용)
  Future<List<ActivityItem>> getPendingActivities({int limit = 100}) async {
    if (_db == null) return [];
    final maps = await _db!.query(
      'activities',
      orderBy: 'created_at ASC',
      limit: limit,
    );
    return maps.map(ActivityItem.fromJson).toList();
  }

  // 전송 성공 시 활동 삭제
  Future<void> removeSent(List<ActivityItem> items) async {
    if (_db == null || items.isEmpty) return;
    final ids = items.map((e) => e.createdAt.toIso8601String()).toList();
    // id가 없으므로 created_at으로 삭제 (유니크하지 않을 수 있으므로 주의)
    // 더 안전한 방법: rowid 사용
    final placeholders = List.filled(ids.length, '?').join(',');
    await _db!.rawDelete(
      'DELETE FROM activities WHERE created_at IN ($placeholders)',
      ids,
    );
  }

  // 4xx 에러 시 버퍼 비우기 (재시도 불필요한 데이터)
  Future<void> clearBuffer() async {
    if (_db == null) return;
    await _db!.delete('activities');
    _sendFailureCount = 0;
    _nextSendTime = 0;
  }

  // 메인 전송 함수 (지수 백오프 적용)
  Future<void> flush() async {
    if (_db == null || _isSending) return;
    
    final now = DateTime.now().millisecondsSinceEpoch;
    if (now < _nextSendTime) {
      return; // 백오프 대기 중
    }

    _isSending = true;
    try {
      final activities = await getPendingActivities();
      if (activities.isEmpty) {
        _sendFailureCount = 0;
        _nextSendTime = 0;
        return;
      }

      final success = await _sendToServer(activities);
      if (success) {
        await removeSent(activities);
        _sendFailureCount = 0;
        _nextSendTime = 0;
      } else {
        _scheduleRetry();
      }
    } finally {
      _isSending = false;
    }
  }

  Future<bool> _sendToServer(List<ActivityItem> activities) async {
    // HTTP 클라이언트는 별도 모듈에서 주입받는 방식으로 구현 예정
    // 여기서는 인터페이스만 정의
    return false; // 실제 구현은 network 모듈에서
  }

  void _scheduleRetry() {
    _sendFailureCount++;
    final backoff = math.min(
      _retryBaseBackoff * math.pow(2, _sendFailureCount - 1),
      _retryMaxBackoff,
    ).toInt();
    // 지터 추가 (±20%)
    final jitter = (backoff * 0.2 * (math.Random().nextDouble() * 2 - 1)).round();
    _nextSendTime = DateTime.now().millisecondsSinceEpoch + 
        (backoff + jitter).clamp(_retryBaseBackoff, _retryMaxBackoff) * 1000;
  }

  // 4xx 에러 처리 (즉시 버퍼 비우기)
  void handleClientError(int statusCode) {
    if (statusCode >= 400 && statusCode < 500) {
      clearBuffer();
    } else {
      _scheduleRetry();
    }
  }

  Future<void> dispose() async {
    _flushTimer?.cancel();
    await _db?.close();
    _db = null;
  }

  // 통계용
  Future<int> getBufferSize() async {
    if (_db == null) return 0;
    return Sqflite.firstIntValue(await _db!.rawQuery('SELECT COUNT(*) FROM activities')) ?? 0;
  }
}