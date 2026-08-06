// lib/core/platform/macos_monitor.dart
// macOS platform channel bridge for active window and idle detection
// Uses method channels to communicate with native Swift/Objective-C code

import 'dart:async';
import 'package:flutter/services.dart';

class MacOSMonitor {
  static const MethodChannel _channel = MethodChannel('com.pguard.agent/macos');

  // 활성 창 정보 가져오기
  static Future<({String? processName, String? windowTitle})> getActiveWindow() async {
    try {
      final result = await _channel.invokeMethod('getActiveWindow');
      if (result != null) {
        return (
          processName: result['processName'] as String?,
          windowTitle: result['windowTitle'] as String?,
        );
      }
    } catch (e) {
      // Fallback or error handling
    }
    return (processName: null, windowTitle: null);
  }

  // 유휴 시간 가져오기 (초)
  static Future<double> getIdleSeconds() async {
    try {
      final result = await _channel.invokeMethod('getIdleTime');
      if (result != null) {
        return (result as num).toDouble();
      }
    } catch (e) {
      // Error handling
    }
    return 0.0;
  }

  // 자동 시작 등록 (LaunchAgent)
  static Future<bool> registerAutoStart(String scriptPath) async {
    try {
      final result = await _channel.invokeMethod('registerAutoStart', {
        'scriptPath': scriptPath,
      });
      return result == true;
    } catch (e) {
      return false;
    }
  }

  // 자동 시작 해제
  static Future<bool> unregisterAutoStart() async {
    try {
      final result = await _channel.invokeMethod('unregisterAutoStart');
      return result == true;
    } catch (e) {
      return false;
    }
  }

  // 자동 시작 여부 확인
  static Future<bool> isAutoStartEnabled() async {
    try {
      final result = await _channel.invokeMethod('isAutoStartEnabled');
      return result == true;
    } catch (e) {
      return false;
    }
  }
}