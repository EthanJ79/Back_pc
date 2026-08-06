// lib/core/platform/background_service.dart
// Platform-specific background service implementation

// Windows/Linux/macOS용 dummy 구현
import 'package:flutter_background_service/flutter_background_service.dart'
    if (dart.library.io) 'package:flutter_background_service/flutter_background_service.dart';

class BackgroundService {
  static final BackgroundService _instance = BackgroundService._internal();
  factory BackgroundService() => _instance;
  BackgroundService._internal();

  final FlutterBackgroundService _service = FlutterBackgroundService();

  Future<void> initialize() async {
    // Windows/Linux/macOS에서는 flutter_background_service 사용 안 함
    // Android/iOS에서만 초기화
  }

  Future<void> start() async {
    // no-op
  }
}

// Android/iOS용 구현은 별도 파일에서 처리
@pragma('vm:entry-point')
Future<void> _onStart(dynamic service) async {
  // no-op
}

Future<void> initializeBackgroundService() async {
  // Windows/Linux/macOS: no-op
}