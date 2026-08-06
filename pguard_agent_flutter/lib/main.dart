// lib/main.dart
// PGuard Agent Flutter - Main entry point

import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:window_manager/window_manager.dart';
import 'package:logging/logging.dart';
import 'core/storage/config_store.dart';
import 'core/storage/activity_buffer.dart';
import 'core/network/api_client.dart';
import 'core/monitor/activity_monitor.dart';
import 'core/platform/background_service.dart';
import 'ui/setup_wizard.dart';
import 'ui/system_tray.dart';
import 'l10n/app_localizations.dart';

// Windows에서 sqflite ffi 초기화
import 'core/platform/database.dart'
    if (dart.library.io) 'core/platform/database.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Windows에서 sqflite ffi 초기화
  if (Platform.isWindows || Platform.isLinux) {
    initializeDatabase();
  }
  
  // 로깅 설정
  Logger.root.level = Level.INFO;
  Logger.root.onRecord.listen((record) {
    debugPrint('${record.level.name}: ${record.time}: ${record.message}');
  });

  // 윈도우 매니저 초기화 (숨김 모드)
  await windowManager.ensureInitialized();
  WindowOptions windowOptions = const WindowOptions(
    size: Size(480, 640),
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: true,
    titleBarStyle: TitleBarStyle.hidden,
  );
  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.hide();
    await windowManager.setPreventClose(true);
  });

  // 백그라운드 서비스 초기화 (Android/iOS만)
  if (Platform.isAndroid || Platform.isIOS) {
    await initializeBackgroundService();
  }

  // 설정 저장소 초기화
  final configStore = ConfigStore();
  await configStore.initialize();

  // 활동 버퍼 초기화
  final activityBuffer = ActivityBuffer(
    companyCode: configStore.companyCode,
    employeeId: configStore.employeeId,
    employeeName: configStore.employeeName,
    apiToken: configStore.apiToken,
    serverUrl: configStore.serverUrl,
  );
  await activityBuffer.initialize();

  // API 클라이언트 초기화
  final apiClient = ApiClient(configStore);

  // 활동 모니터 초기화
  final activityMonitor = ActivityMonitor(configStore, apiClient, activityBuffer);

  // 설정 완료 여부에 따라 UI 표시 또는 백그라운드 모드 진입
  if (!configStore.settingsVerified || 
      configStore.companyCode.isEmpty || 
      configStore.employeeId.isEmpty) {
    // 설정 마법사 표시
    runApp(PGuardAgentApp(
      configStore: configStore,
      activityBuffer: activityBuffer,
      apiClient: apiClient,
      activityMonitor: activityMonitor,
      showSetupWizard: true,
    ));
  } else {
    // 백그라운드 모드로 시작
    await activityMonitor.start();
    SystemTrayManager().initialize(configStore, activityMonitor);
    
    runApp(PGuardAgentApp(
      configStore: configStore,
      activityBuffer: activityBuffer,
      apiClient: apiClient,
      activityMonitor: activityMonitor,
      showSetupWizard: false,
    ));
  }
}

class PGuardAgentApp extends StatelessWidget {
  final ConfigStore configStore;
  final ActivityBuffer activityBuffer;
  final ApiClient apiClient;
  final ActivityMonitor activityMonitor;
  final bool showSetupWizard;

  const PGuardAgentApp({
    super.key,
    required this.configStore,
    required this.activityBuffer,
    required this.apiClient,
    required this.activityMonitor,
    required this.showSetupWizard,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PGuard Agent',
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      locale: Locale(configStore.language),
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        fontFamily: 'Pretendard',
      ),
      home: showSetupWizard
          ? SetupWizard(
              configStore: configStore,
              activityBuffer: activityBuffer,
              apiClient: apiClient,
              activityMonitor: activityMonitor,
            )
          : const SizedBox.shrink(),
    );
  }
}