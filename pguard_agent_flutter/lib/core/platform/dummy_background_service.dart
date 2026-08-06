// lib/core/platform/dummy_background_service.dart
// Non-Android/iOS platforms dummy implementation

import 'package:flutter_background_service/flutter_background_service.dart';

// Windows/Linux/macOS에서는 백그라운드 서비스 비활성화
class FlutterBackgroundService {
  static final FlutterBackgroundService _instance = FlutterBackgroundService._internal();
  factory FlutterBackgroundService() => _instance;
  FlutterBackgroundService._internal();

  Future<void> configure({dynamic iosConfiguration, dynamic androidConfiguration}) async {
    // Windows/Linux/macOS: no-op
  }

  Future<void> startService() async {
    // Windows/Linux/macOS: no-op
  }
}

@pragma('vm:entry-point')
Future<void> _onStart(dynamic service) async {
  // Windows/Linux/macOS: no-op
}

Future<void> _initializeBackgroundService() async {
  // Windows/Linux/macOS: no-op
}