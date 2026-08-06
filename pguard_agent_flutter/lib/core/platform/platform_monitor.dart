// lib/core/platform/platform_monitor.dart
// Platform-agnostic interface for window and idle monitoring

import 'dart:async';
import 'dart:io' show Platform;
import 'windows_monitor.dart';
import 'macos_monitor.dart';

abstract class PlatformMonitor {
  factory PlatformMonitor() {
    if (Platform.isWindows) {
      return _WindowsMonitorImpl();
    } else if (Platform.isMacOS) {
      return _MacOSMonitorImpl();
    } else {
      return _LinuxMonitorImpl();
    }
  }

  Future<({String? processName, String? windowTitle})> getActiveWindow();
  Future<double> getIdleSeconds();
  Future<Point?> getCursorPos();
  Future<bool> isKeyPressed(int virtualKey);
  Future<bool> registerAutoStart(String exePath);
  Future<bool> unregisterAutoStart();
  Future<bool> isAutoStartEnabled();
}

class _WindowsMonitorImpl implements PlatformMonitor {
  @override
  Future<({String? processName, String? windowTitle})> getActiveWindow() async {
    return WindowsMonitor.getActiveWindow();
  }

  @override
  Future<double> getIdleSeconds() async {
    return WindowsMonitor.getIdleSeconds();
  }

  @override
  Future<Point?> getCursorPos() async {
    return WindowsMonitor.getCursorPos();
  }

  @override
  Future<bool> isKeyPressed(int virtualKey) async {
    return WindowsMonitor.isKeyPressed(virtualKey);
  }

  @override
  Future<bool> registerAutoStart(String exePath) async {
    return WindowsMonitor.registerAutoStart(exePath);
  }

  @override
  Future<bool> unregisterAutoStart() async {
    return WindowsMonitor.unregisterAutoStart();
  }

  @override
  Future<bool> isAutoStartEnabled() async {
    return WindowsMonitor.isAutoStartEnabled();
  }
}

class _MacOSMonitorImpl implements PlatformMonitor {
  @override
  Future<({String? processName, String? windowTitle})> getActiveWindow() async {
    return MacOSMonitor.getActiveWindow();
  }

  @override
  Future<double> getIdleSeconds() async {
    return MacOSMonitor.getIdleSeconds();
  }

  @override
  Future<Point?> getCursorPos() async => null;

  @override
  Future<bool> isKeyPressed(int virtualKey) async => false;

  @override
  Future<bool> registerAutoStart(String exePath) async {
    return MacOSMonitor.registerAutoStart(exePath);
  }

  @override
  Future<bool> unregisterAutoStart() async {
    return MacOSMonitor.unregisterAutoStart();
  }

  @override
  Future<bool> isAutoStartEnabled() async {
    return MacOSMonitor.isAutoStartEnabled();
  }
}

class _LinuxMonitorImpl implements PlatformMonitor {
  @override
  Future<({String? processName, String? windowTitle})> getActiveWindow() async {
    return (processName: null, windowTitle: null);
  }

  @override
  Future<double> getIdleSeconds() async => 0.0;

  @override
  Future<Point?> getCursorPos() async => null;

  @override
  Future<bool> isKeyPressed(int virtualKey) async => false;

  @override
  Future<bool> registerAutoStart(String exePath) async => false;

  @override
  Future<bool> unregisterAutoStart() async => false;

  @override
  Future<bool> isAutoStartEnabled() async => false;
}

class Point {
  final int x;
  final int y;
  Point(this.x, this.y);
  
  @override
  bool operator ==(Object other) =>
      other is Point && other.x == x && other.y == y;
  
  @override
  int get hashCode => Object.hash(x, y);
}