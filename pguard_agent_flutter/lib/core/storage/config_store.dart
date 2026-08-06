// lib/core/storage/config_store.dart
// Configuration storage using shared_preferences

import 'package:shared_preferences/shared_preferences.dart';

class ConfigStore {
  static const String _keyServerUrl = 'server_url';
  static const String _keyCompanyCode = 'company_code';
  static const String _keyEmployeeId = 'employee_id';
  static const String _keyEmployeeName = 'employee_name';
  static const String _keyApiToken = 'api_token';
  static const String _keyLanguage = 'language';
  static const String _keyLoopInterval = 'loop_interval';
  static const String _keySendInterval = 'send_interval';
  static const String _keyIdleThreshold = 'idle_threshold';
  static const String _keySettingsVerified = 'settings_verified';
  static const String _keyAutoStartEnabled = 'auto_start_enabled';

  static const String _defaultServerUrl = 'http://localhost:3000';
  static const String _defaultLanguage = 'ko';
  static const int _defaultLoopInterval = 60;
  static const int _defaultSendInterval = 600;
  static const int _defaultIdleThreshold = 600;

  SharedPreferences? _prefs;

  Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // 서버 URL
  String get serverUrl => _prefs?.getString(_keyServerUrl) ?? _defaultServerUrl;
  Future<void> setServerUrl(String url) async {
    await _prefs?.setString(_keyServerUrl, url);
  }

  // 회사 코드
  String get companyCode => _prefs?.getString(_keyCompanyCode) ?? '';
  Future<void> setCompanyCode(String code) async {
    await _prefs?.setString(_keyCompanyCode, code);
  }

  // 사원 번호
  String get employeeId => _prefs?.getString(_keyEmployeeId) ?? '';
  Future<void> setEmployeeId(String id) async {
    await _prefs?.setString(_keyEmployeeId, id);
  }

  // 사원 이름
  String get employeeName => _prefs?.getString(_keyEmployeeName) ?? '';
  Future<void> setEmployeeName(String name) async {
    await _prefs?.setString(_keyEmployeeName, name);
  }

  // API 토큰
  String get apiToken => _prefs?.getString(_keyApiToken) ?? '';
  Future<void> setApiToken(String token) async {
    await _prefs?.setString(_keyApiToken, token);
  }

  // 언어
  String get language => _prefs?.getString(_keyLanguage) ?? _defaultLanguage;
  Future<void> setLanguage(String lang) async {
    await _prefs?.setString(_keyLanguage, lang);
  }

  // 스캔 주기 (초)
  int get loopInterval => _prefs?.getInt(_keyLoopInterval) ?? _defaultLoopInterval;
  Future<void> setLoopInterval(int seconds) async {
    await _prefs?.setInt(_keyLoopInterval, seconds);
  }

  // 전송 주기 (초)
  int get sendInterval => _prefs?.getInt(_keySendInterval) ?? _defaultSendInterval;
  Future<void> setSendInterval(int seconds) async {
    await _prefs?.setInt(_keySendInterval, seconds);
  }

  // 자리비움 임계값 (초)
  int get idleThreshold => _prefs?.getInt(_keyIdleThreshold) ?? _defaultIdleThreshold;
  Future<void> setIdleThreshold(int seconds) async {
    await _prefs?.setInt(_keyIdleThreshold, seconds);
  }

  // 설정 검증 여부
  bool get settingsVerified => _prefs?.getBool(_keySettingsVerified) ?? false;
  Future<void> setSettingsVerified(bool verified) async {
    await _prefs?.setBool(_keySettingsVerified, verified);
  }

  // 자동 시작 여부
  bool get autoStartEnabled => _prefs?.getBool(_keyAutoStartEnabled) ?? false;
  Future<void> setAutoStartEnabled(bool enabled) async {
    await _prefs?.setBool(_keyAutoStartEnabled, enabled);
  }

  // 모든 설정 한번에 저장
  Future<void> saveAll({
    required String serverUrl,
    required String companyCode,
    required String employeeId,
    required String employeeName,
    required String apiToken,
    required String language,
    int? loopInterval,
    int? sendInterval,
    int? idleThreshold,
  }) async {
    await setServerUrl(serverUrl);
    await setCompanyCode(companyCode);
    await setEmployeeId(employeeId);
    await setEmployeeName(employeeName);
    await setApiToken(apiToken);
    await setLanguage(language);
    if (loopInterval != null) await setLoopInterval(loopInterval);
    if (sendInterval != null) await setSendInterval(sendInterval);
    if (idleThreshold != null) await setIdleThreshold(idleThreshold);
    await setSettingsVerified(true);
  }

  // 설정 초기화
  Future<void> clear() async {
    await _prefs?.clear();
  }

  // Map으로 내보내기 (디버깅용)
  Map<String, dynamic> toMap() {
    return {
      'server_url': serverUrl,
      'company_code': companyCode,
      'employee_id': employeeId,
      'employee_name': employeeName,
      'api_token': apiToken,
      'language': language,
      'loop_interval': loopInterval,
      'send_interval': sendInterval,
      'idle_threshold': idleThreshold,
      'settings_verified': settingsVerified,
      'auto_start_enabled': autoStartEnabled,
    };
  }
}