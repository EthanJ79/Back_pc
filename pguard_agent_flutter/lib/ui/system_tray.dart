// lib/ui/system_tray.dart
// System tray manager for background mode (simplified implementation)

import 'dart:io' show Platform, Process, exit;
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
  ConfigStore? _configStore;
  ActivityMonitor? _activityMonitor;
  bool _isInitialized = false;

  Future<void> initialize(ConfigStore configStore, ActivityMonitor activityMonitor) async {
    if (_isInitialized) return;
    _configStore = configStore;
    _activityMonitor = activityMonitor;

    // TODO: system_tray 패키지 API 확인 후 구현
    // 현재는 시스템 트레이 없이 백그라운드 모드로 동작

    _isInitialized = true;
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
    _activityMonitor?.dispose();
    windowManager.destroy();
    exit(0);
  }
}