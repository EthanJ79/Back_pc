// lib/core/network/api_client.dart
// API client with token authentication and retry logic

import 'dart:async';
import 'package:dio/dio.dart';
import 'package:logging/logging.dart';
import '../storage/config_store.dart';

final _logger = Logger('ApiClient');

class ApiClient {
  final ConfigStore _configStore;
  late final Dio _dio;
  String? _cachedApiToken;

  ApiClient(this._configStore) {
    _dio = Dio(BaseOptions(
      baseUrl: _configStore.serverUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // 인터셉터: 토큰 헤더 자동 추가
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = _cachedApiToken ?? _configStore.apiToken;
        if (token.isNotEmpty) {
          options.headers['X-Agent-Token'] = token;
        }
        handler.next(options);
      },
      onError: (error, handler) {
        _logger.warning('API Error: ${error.response?.statusCode} ${error.message}');
        handler.next(error);
      },
    ));
  }

  // 베이스 URL 업데이트
  void updateBaseUrl(String url) {
    _dio.options.baseUrl = url;
  }

  // 토큰 캐시 업데이트
  void updateToken(String token) {
    _cachedApiToken = token;
  }

  // 회사 코드 검증
  Future<({bool success, String? companyName, String? error})> verifyCompanyCode(
    String companyCode,
  ) async {
    try {
      final response = await _dio.get(
        '/api/agent/verify',
        queryParameters: {'company_code': companyCode},
      );
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        return (success: true, companyName: data['company_name'] as String?, error: null);
      } else {
        return (success: false, companyName: null, error: '등록되지 않은 회사 코드입니다.');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return (success: false, companyName: null, error: '등록되지 않은 회사 코드입니다.');
      }
      return (success: false, companyName: null, error: '서버 연결 실패: ${e.message}');
    } catch (e) {
      return (success: false, companyName: null, error: '오류: $e');
    }
  }

  // 활동 데이터 전송
  Future<({bool success, int? statusCode, String? error})> sendActivities(
    List<Map<String, dynamic>> activities,
  ) async {
    try {
      final body = {
        'company_code': _configStore.companyCode,
        'employee_id': _configStore.employeeId,
        'employee_name': _configStore.employeeName,
        'activities': activities,
      };
      final response = await _dio.post(
        '/api/activity',
        data: body,
        options: Options(
          headers: {'X-Agent-Token': _cachedApiToken ?? _configStore.apiToken},
        ),
      );
      return (success: response.statusCode == 200, statusCode: response.statusCode, error: null);
    } on DioException catch (e) {
      return (success: false, statusCode: e.response?.statusCode, error: e.message);
    } catch (e) {
      return (success: false, statusCode: null, error: e.toString());
    }
  }

  // 설정 가져오기
  Future<({bool success, Map<String, dynamic>? settings, String? error})> fetchSettings() async {
    try {
      final response = await _dio.get(
        '/api/agent/settings',
        queryParameters: {
          'company_code': _configStore.companyCode,
          'employee_id': _configStore.employeeId,
        },
        options: Options(
          headers: {'X-Agent-Token': _cachedApiToken ?? _configStore.apiToken},
        ),
      );
      if (response.statusCode == 200) {
        return (success: true, settings: response.data as Map<String, dynamic>, error: null);
      }
      return (success: false, settings: null, error: '설정 조회 실패: ${response.statusCode}');
    } on DioException catch (e) {
      return (success: false, settings: null, error: e.message);
    }
  }

  // 시작 핑 전송 (에이전트 가동 알림)
  Future<void> sendStartupPing() async {
    try {
      await _dio.post(
        '/api/agent/startup',
        data: {
          'company_code': _configStore.companyCode,
          'employee_id': _configStore.employeeId,
          'employee_name': _configStore.employeeName,
        },
        options: Options(
          headers: {'X-Agent-Token': _cachedApiToken ?? _configStore.apiToken},
        ),
      );
    } catch (e) {
      _logger.warning('Startup ping failed: $e');
    }
  }

  // 관리자 명령 폴링
  Future<List<Map<String, dynamic>>?> pollCommands() async {
    try {
      final response = await _dio.get(
        '/api/agent/commands',
        queryParameters: {
          'company_code': _configStore.companyCode,
          'employee_id': _configStore.employeeId,
        },
        options: Options(
          headers: {'X-Agent-Token': _cachedApiToken ?? _configStore.apiToken},
        ),
      );
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(response.data as List);
      }
    } catch (e) {
      _logger.warning('Command poll failed: $e');
    }
    return null;
  }

  // 회사 설정 동기화 (서버에서 전역 설정 가져오기)
  Future<({bool success, Map<String, dynamic>? settings, String? error})> syncCompanySettings() async {
    try {
      final response = await _dio.get(
        '/api/agent/company-settings',
        queryParameters: {'company_code': _configStore.companyCode},
        options: Options(
          headers: {'X-Agent-Token': _cachedApiToken ?? _configStore.apiToken},
        ),
      );
      if (response.statusCode == 200) {
        return (success: true, settings: response.data as Map<String, dynamic>, error: null);
      }
      return (success: false, settings: null, error: '설정 동기화 실패');
    } on DioException catch (e) {
      return (success: false, settings: null, error: e.message);
    }
  }

  void dispose() {
    _dio.close();
  }
}