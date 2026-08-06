// lib/l10n/app_localizations.dart
// Generated localization delegate

import 'package:flutter/material.dart';

class AppLocalizations {
  static const List<Locale> supportedLocales = [
    Locale('ko'),
    Locale('en'),
    Locale('th'),
    Locale('lo'),
  ];

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  // Korean
  static const Map<String, String> _ko = {
    'setupTitle': 'PGuard 에이전트 연동 설정',
    'setupHeader': '에이전트 연동 설정',
    'serverLabel': '📡  서버 주소 (Server URL) *',
    'serverHint': '예) http://192.168.1.100:3000',
    'companyLabel': '🏢  회사 코드 (Company Code) *',
    'employeeIdLabel': '👤  사원 번호 (Employee ID) *',
    'employeeNameLabel': '✏  사원 이름 (Employee Name) *',
    'tokenLabel': '🔑  연동 토큰 (Agent Token) *',
    'btnVerify': '검증',
    'btnVerifyOk': '✔ 인증 완료',
    'btnVerifyFail': '✖ 인증 실패',
    'btnVerifyOffline': '⚠ 오프라인',
    'statusServerEmpty': '⚠  서버 주소를 먼저 입력해 주세요.',
    'statusCodeEmpty': '⚠  회사 코드를 입력해 주세요.',
    'statusVerifying': '⏳  서버에서 검증 중...',
    'statusVerified': '✅  인증됨: {cname}',
    'statusInvalid': '❌  등록되지 않은 회사 코드입니다.',
    'statusServerErr': '⚠  서버 오류 ({code})',
    'statusOffline': '⚠  서버 연결 실패 - 오프라인 저장 가능',
    'btnSubmit': '  설정 저장 및 에이전트 시작  ',
    'footerInfo': '설정은 로컬에 안전하게 저장됩니다.',
    'errTitle': '입력 오류',
    'errEmpty': '모든 필수 항목을 빠짐없이 입력해 주세요.',
    'msgNotVerifiedTitle': '검증 안 됨',
    'msgNotVerified': "회사 코드 '{code}' 이(가) 아직 서버에서 검증되지 않았습니다.\n[검증] 버튼을 눌러 먼저 확인하는 것을 권장합니다.\n\n검증 없이 저장하고 계속하시겠습니까?",
    'msgOfflineTitle': '오프라인 저장',
    'msgOffline': '서버에 연결할 수 없습니다. 오프라인 상태로 설정을 저장하시겠습니까?\n(에이전트 가동 후 서버 연결 시 자동으로 동기화됩니다.)',
    'msgConfirmTitle': '연동 확인',
    'msgConfirm': '✅  회사: {cname}\n👤  사원번호: {empid}  |  이름: {empname}\n📡  서버: {server}\n🔑  토큰: {token}\n\n위 정보로 에이전트를 연동하시겠습니까?',
    'msgDoneTitle': '설정 완료',
    'msgDone': '에이전트 연동 설정이 성공적으로 저장되었습니다.\n모니터링을 시작합니다.',
    'msgSaveErrTitle': '저장 오류',
    'msgSaveErr': '설정 파일 저장 중 오류: {ex}',
    'langSelect': '🌐  언어 선택 (Language) :',
  };

  // English
  static const Map<String, String> _en = {
    'setupTitle': 'PGuard Agent Connection Setup',
    'setupHeader': 'Agent Connection Setup',
    'serverLabel': '📡  Server URL *',
    'serverHint': 'e.g.) http://192.168.1.100:3000',
    'companyLabel': '🏢  Company Code *',
    'employeeIdLabel': '👤  Employee ID *',
    'employeeNameLabel': '✏  Employee Name *',
    'tokenLabel': '🔑  Agent Token *',
    'btnVerify': 'Verify',
    'btnVerifyOk': '✔ Verified',
    'btnVerifyFail': '✖ Failed',
    'btnVerifyOffline': '⚠ Offline',
    'statusServerEmpty': '⚠  Please enter the server URL first.',
    'statusCodeEmpty': '⚠  Please enter the company code.',
    'statusVerifying': '⏳  Verifying with server...',
    'statusVerified': '✅  Verified: {cname}',
    'statusInvalid': '❌  Company code not registered.',
    'statusServerErr': '⚠  Server error ({code})',
    'statusOffline': '⚠  Cannot connect to server - offline save available',
    'btnSubmit': '  Save Settings & Start Agent  ',
    'footerInfo': 'Settings are stored securely on this device.',
    'errTitle': 'Input Error',
    'errEmpty': 'Please fill in all required fields.',
    'msgNotVerifiedTitle': 'Not Verified',
    'msgNotVerified': "Company code '{code}' has not been verified by the server yet.\nWe recommend clicking [Verify] first.\n\nContinue saving without verification?",
    'msgOfflineTitle': 'Offline Save',
    'msgOffline': 'Cannot connect to server. Save settings in offline mode?\n(Will auto-sync when agent connects to server.)',
    'msgConfirmTitle': 'Confirm Connection',
    'msgConfirm': '✅  Company: {cname}\n👤  Employee ID: {empid}  |  Name: {empname}\n📡  Server: {server}\n🔑  Token: {token}\n\nConnect agent with the above information?',
    'msgDoneTitle': 'Setup Complete',
    'msgDone': 'Agent connection settings have been saved successfully.\nMonitoring is now starting.',
    'msgSaveErrTitle': 'Save Error',
    'msgSaveErr': 'Error saving settings: {ex}',
    'langSelect': '🌐  Language :',
  };

  // Thai
  static const Map<String, String> _th = {
    'setupTitle': 'การตั้งค่าเชื่อมต่อ PGuard Agent',
    'setupHeader': 'การตั้งค่าเชื่อมต่อ Agent',
    'serverLabel': '📡  ที่อยู่เซิร์ฟเวอร์ (Server URL) *',
    'serverHint': 'เช่น) http://192.168.1.100:3000',
    'companyLabel': '🏢  รหัสบริษัท (Company Code) *',
    'employeeIdLabel': '👤  รหัสพนักงาน (Employee ID) *',
    'employeeNameLabel': '✏  ชื่อพนักงาน (Employee Name) *',
    'tokenLabel': '🔑  โทเค็น Agent *',
    'btnVerify': 'ตรวจสอบ',
    'btnVerifyOk': '✔ ยืนยันแล้ว',
    'btnVerifyFail': '✖ ล้มเหลว',
    'btnVerifyOffline': '⚠ ออฟไลน์',
    'statusServerEmpty': '⚠  กรุณากรอกที่อยู่เซิร์ฟเวอร์ก่อน',
    'statusCodeEmpty': '⚠  กรุณากรอกรหัสบริษัท',
    'statusVerifying': '⏳  กำลังตรวจสอบกับเซิร์ฟเวอร์...',
    'statusVerified': '✅  ยืนยันแล้ว: {cname}',
    'statusInvalid': '❌  รหัสบริษัทไม่ได้ลงทะเบียน',
    'statusServerErr': '⚠  ข้อผิดพลาดเซิร์ฟเวอร์ ({code})',
    'statusOffline': '⚠  เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ - สามารถบันทึกออฟไลน์ได้',
    'btnSubmit': '  บันทึกการตั้งค่าและเริ่ม Agent  ',
    'footerInfo': 'การตั้งค่าจะถูกเก็บไว้ในอุปกรณ์นี้อย่างปลอดภัย',
    'errTitle': 'ข้อผิดพลาดในการป้อนข้อมูล',
    'errEmpty': 'กรุณากรอกข้อมูลที่จำเป็นให้ครบทุกช่อง',
    'msgNotVerifiedTitle': 'ยังไม่ได้ตรวจสอบ',
    'msgNotVerified': "รหัสบริษัท '{code}' ยังไม่ได้รับการยืนยันจากเซิร์ฟเวอร์\nแนะนำให้กดปุ่ม [ตรวจสอบ] ก่อน\n\nต้องการบันทึกต่อโดยไม่ตรวจสอบหรือไม่?",
    'msgOfflineTitle': 'บันทึกแบบออฟไลน์',
    'msgOffline': 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ต้องการบันทึกการตั้งค่าแบบออฟไลน์หรือไม่?\n(จะซิงก์อัตโนมัติเมื่อ Agent เชื่อมต่อเซิร์ฟเวอร์ได้)',
    'msgConfirmTitle': 'ยืนยันการเชื่อมต่อ',
    'msgConfirm': '✅  บริษัท: {cname}\n👤  รหัสพนักงาน: {empid}  |  ชื่อ: {empname}\n📡  เซิร์ฟเวอร์: {server}\n🔑  โทเค็น: {token}\n\nเชื่อมต่อ Agent ด้วยข้อมูลข้างต้นหรือไม่?',
    'msgDoneTitle': 'ตั้งค่าเสร็จสิ้น',
    'msgDone': 'บันทึกการตั้งค่าการเชื่อมต่อ Agent เรียบร้อยแล้ว\nกำลังเริ่มการตรวจสอบกิจกรรม',
    'msgSaveErrTitle': 'ข้อผิดพลาดในการบันทึก',
    'msgSaveErr': 'เกิดข้อผิดพลาดขณะบันทึกการตั้งค่า: {ex}',
    'langSelect': '🌐  เลือกภาษา :',
  };

  // Lao
  static const Map<String, String> _lo = {
    'setupTitle': 'ການຕັ້ງຄ່າເຊື່ອມຕໍ່ PGuard Agent',
    'setupHeader': 'ການຕັ້ງຄ່າເຊື່ອມຕໍ່ Agent',
    'serverLabel': '📡  ທີ່ຢູ່ເຊີເວີ (Server URL) *',
    'serverHint': 'ຕົວຢ່າງ) http://192.168.1.100:3000',
    'companyLabel': '🏢  ລະຫັດບໍລິສັດ (Company Code) *',
    'employeeIdLabel': '👤  ລະຫັດພະນັກງານ (Employee ID) *',
    'employeeNameLabel': '✏  ຊື່ພະນັກງານ (Employee Name) *',
    'tokenLabel': '🔑  ໂທເຄັນ Agent *',
    'btnVerify': 'ກວດສອບ',
    'btnVerifyOk': '✔ ຢືນຢັນແລ້ວ',
    'btnVerifyFail': '✖ ລົ້ມເຫຼວ',
    'btnVerifyOffline': '⚠ ອອຟໄລນ',
    'statusServerEmpty': '⚠  ກະລຸນາປ້ອນທີ່ຢູ່ເຊີເວີກ່ອນ',
    'statusCodeEmpty': '⚠  ກະລຸນາປ້ອນລະຫັດບໍລິສັດ',
    'statusVerifying': '⏳  ກຳລັງກວດສອບກັບເຊີເວີ...',
    'statusVerified': '✅  ຢືນຢັນແລ້ວ: {cname}',
    'statusInvalid': '❌  ລະຫັດບໍລິສັດບໍ່ມີລາຍການລົງທະບຽນ',
    'statusServerErr': '⚠  ຂໍ້ຜິດພາດເຊີເວີ ({code})',
    'statusOffline': '⚠  ເຊື່ອມຕໍ່ເຊີເວີບໍ່ໄດ້ - ສາມາດບັນທຶກໃນຮູບແບບອອຟໄລນໄດ້',
    'btnSubmit': '  ບັນທຶກການຕັ້ງຄ່າ ແລະ ເລີ່ມຕົ້ນ Agent  ',
    'footerInfo': 'ການຕັ້ງຄ່າຈະຖືກບັນທຶກໃນອຸປະກອນນີ້ດ້ວຍຄວາມປອດຄວາມປອດຫະພາບ',
    'errTitle': 'ຂໍ້ຜິດພາຂອງການປ້ອນຂໍ້ມູນ',
    'errEmpty': 'ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຖືກຕ້ອງທັງໝົດ',
    'msgNotVerifiedTitle': 'ຍັງບໍ່ໄດ້ກວດສອບ',
    'msgNotVerified': "ລະຫັດບໍລິສັດ '{code}' ຍັງບໍ່ໄດ້ຮັບການຢືນຢັນຈາກເຊີເວີ\nແນະນຳໃຫ້ກົດປຸ່ມ [ກວດສອບ] ກ່ອນ\n\nຕົກລົງບັນທຶກບໍ່ກວດສອບ ແລະ ດ້ານເລີ່ມຕົ້ນປັບບາຍ ຫຼື ບໍ່?",
    'msgOfflineTitle': 'ບັນທຶກໃນຮູບແບບອອຟໄລນ',
    'msgOffline': 'ເຊື່ອມຕໍ່ເຊີເວີບໍ່ໄດ້ ຕ້ອງການບັນທຶກການຕັ້ງຄ່າໃນຮູບແບບອອຟໄລນ ຫຼື ບໍ່?\n(ຈະສິງກະເພັກອັດຕາມອັດຕະໂນມັດເມື່ອ Agent ເຊື່ອມຕໍ່ເຊີເວີໄດ້)',
    'msgConfirmTitle': 'ຢືນຢັນການເຊື່ອມຕໍ່',
    'msgConfirm': '✅  ບໍລິສັດ: {cname}\n👤  ລະຫັດພະນັກງານ: {empid}  |  ຊື່: {empname}\n📡  ເຊີເວີ: {server}\n🔑  ໂທເຄັນ: {token}\n\nເຊື່ອມຕໍ່ Agent ດ້ວຍຂໍ້ມູນຂອງເຂົ້າສຸ່ນນີ້ ຫຼື ບໍ່?',
    'msgDoneTitle': 'ຕັ້ງຄ່າສຳເລັດ',
    'msgDone': 'ບັນທຶກການຕັ້ງຄ່າເຊື່ອມຕໍ່ Agent ສຳເລັດແລ້ວ\nກຳລັງເລີ່ມຕົ້ນການກວດການກິດຈະກຳ',
    'msgSaveErrTitle': 'ຂໍ້ຜິດພາຂອງການບັນທຶກ',
    'msgSaveErr': 'ເກີດຂໍ້ຜິດພາຂອງເວລາບັນທຶກການຕັ້ງຄ່າ: {ex}',
    'langSelect': '🌐  ເລືອກພາສາ :',
  };

  String _get(String key) {
    switch (locale.languageCode) {
      case 'en': return _en[key] ?? key;
      case 'th': return _th[key] ?? _en[key] ?? key;
      case 'lo': return _lo[key] ?? _en[key] ?? key;
      case 'ko':
      default: return _ko[key] ?? key;
    }
  }

  String get setupTitle => _get('setupTitle');
  String get setupHeader => _get('setupHeader');
  String get serverLabel => _get('serverLabel');
  String get serverHint => _get('serverHint');
  String get companyLabel => _get('companyLabel');
  String get employeeIdLabel => _get('employeeIdLabel');
  String get employeeNameLabel => _get('employeeNameLabel');
  String get tokenLabel => _get('tokenLabel');
  String get btnVerify => _get('btnVerify');
  String get btnVerifyOk => _get('btnVerifyOk');
  String get btnVerifyFail => _get('btnVerifyFail');
  String get btnVerifyOffline => _get('btnVerifyOffline');
  String get statusServerEmpty => _get('statusServerEmpty');
  String get statusCodeEmpty => _get('statusCodeEmpty');
  String get statusVerifying => _get('statusVerifying');
  String get statusVerified => _get('statusVerified');
  String get statusInvalid => _get('statusInvalid');
  String get statusServerErr => _get('statusServerErr');
  String get statusOffline => _get('statusOffline');
  String get btnSubmit => _get('btnSubmit');
  String get footerInfo => _get('footerInfo');
  String get errTitle => _get('errTitle');
  String get errEmpty => _get('errEmpty');
  String get msgNotVerifiedTitle => _get('msgNotVerifiedTitle');
  String get msgNotVerified => _get('msgNotVerified');
  String get msgOfflineTitle => _get('msgOfflineTitle');
  String get msgOffline => _get('msgOffline');
  String get msgConfirmTitle => _get('msgConfirmTitle');
  String get msgConfirm => _get('msgConfirm');
  String get msgDoneTitle => _get('msgDoneTitle');
  String get msgDone => _get('msgDone');
  String get msgSaveErrTitle => _get('msgSaveErrTitle');
  String get msgSaveErr => _get('msgSaveErr');
  String get langSelect => _get('langSelect');
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['ko', 'en', 'th', 'lo'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) => Future.value(AppLocalizations(locale));

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}