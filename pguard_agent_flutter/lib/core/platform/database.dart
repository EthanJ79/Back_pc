// lib/core/platform/database.dart
// Platform-specific database initialization

// Windows/Linux: sqflite_common_ffi 사용 (dart.library.io가 true여서 ffi 버전 import)
// macOS: sqflite 기본 (dart.library.io가 true지만 sqflite_ffi 안 씀)
import 'package:sqflite_common_ffi/sqflite_ffi.dart'
    if (dart.library.html) 'package:sqflite/sqflite.dart';

void initializeDatabase() {
  // Windows/Linux에서만 호출 - sqflite_common_ffi 2.x API
  sqfliteFfiInit();
  databaseFactory = databaseFactoryFfi;
}