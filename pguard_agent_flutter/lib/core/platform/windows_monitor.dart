// lib/core/platform/windows_monitor.dart
// Windows FFI bridge for active window and idle detection

import 'dart:ffi';
import 'package:ffi/ffi.dart';
import 'package:win32/win32.dart';
import 'platform_monitor.dart';

class WindowsMonitor {
  // GetForegroundWindow - 활성 창 핸들 가져오기
  static int getForegroundWindow() {
    return GetForegroundWindow();
  }

  // GetWindowText - 창 제목 가져오기
  static String getWindowText(int hwnd) {
    final length = GetWindowTextLength(hwnd);
    if (length == 0) return '';
    final buffer = wsalloc(length + 1);
    GetWindowText(hwnd, buffer, length + 1);
    final title = buffer.toDartString();
    free(buffer);
    return title;
  }

  // GetWindowThreadProcessId - 창의 프로세스 ID 가져오기
  static int getWindowProcessId(int hwnd) {
    final pid = calloc<DWORD>();
    GetWindowThreadProcessId(hwnd, pid);
    final result = pid.value;
    free(pid);
    return result;
  }

  // GetLastInputInfo - 마지막 입력 시간 가져오기 (밀리초)
  static int getLastInputInfo() {
    final lastInputInfo = calloc<LASTINPUTINFO>()
      ..ref.cbSize = sizeOf<LASTINPUTINFO>();
    final result = GetLastInputInfo(lastInputInfo);
    if (result == 0) {
      free(lastInputInfo);
      return 0;
    }
    final tickCount = lastInputInfo.ref.dwTime;
    free(lastInputInfo);
    return tickCount;
  }

  // GetTickCount - 시스템 시작 후 경과 시간 (밀리초)
  static int getTickCount() {
    return GetTickCount();
  }

  // GetAsyncKeyState - 키 상태 확인
  static bool isKeyPressed(int virtualKey) {
    return (GetAsyncKeyState(virtualKey) & 0x8000) != 0;
  }

  // GetCursorPos - 마우스 커서 위치
  static Point? getCursorPos() {
    final point = calloc<POINT>();
    final result = GetCursorPos(point);
    if (result == 0) {
      free(point);
      return null;
    }
    final p = Point(point.ref.x, point.ref.y);
    free(point);
    return p;
  }

  // 프로세스 이름으로 실행 파일 경로 가져오기
  static String? getProcessName(int pid) {
    if (pid == 0) return null;
    final hProcess = OpenProcess(
      PROCESS_QUERY_LIMITED_INFORMATION,
      FALSE,
      pid,
    );
    if (hProcess == 0) return null;

    final buffer = wsalloc(MAX_PATH);
    final result = GetModuleFileNameEx(hProcess, 0, buffer, MAX_PATH);
    CloseHandle(hProcess);

    if (result == 0) {
      free(buffer);
      return null;
    }

    final path = buffer.toDartString();
    free(buffer);

    // 파일명만 추출
    final parts = path.split('\\');
    return parts.isNotEmpty ? parts.last.toLowerCase() : path.toLowerCase();
  }

  // 유휴 시간 계산 (초)
  static double getIdleSeconds() {
    final lastInput = getLastInputInfo();
    if (lastInput == 0) return 0.0;

    final tickCount = getTickCount();
    // 32비트 오버플로 처리
    int elapsed = (tickCount - lastInput) & 0xFFFFFFFF;
    return elapsed / 1000.0;
  }

  // 활성 창 정보 가져오기 (프로세스명, 타이틀)
  static ({String? processName, String? windowTitle}) getActiveWindow() {
    try {
      final hwnd = getForegroundWindow();
      if (hwnd == 0) return (processName: null, windowTitle: null);

      final title = getWindowText(hwnd);
      final pid = getWindowProcessId(hwnd);
      final processName = getProcessName(pid);

      return (processName: processName, windowTitle: title.isEmpty ? null : title);
    } catch (e) {
      return (processName: null, windowTitle: null);
    }
  }

  // 자동 시작 등록 (레지스트리) - TODO: win32_registry 패키지 API 확인 후 구현
  static Future<bool> registerAutoStart(String exePath) async {
    // TODO: Registry 구현
    return false;
  }

  // 자동 시작 해제
  static Future<bool> unregisterAutoStart() async {
    // TODO: Registry 구현
    return false;
  }

  // 자동 시작 여부 확인
  static Future<bool> isAutoStartEnabled() async {
    // TODO: Registry 구현
    return false;
  }
}