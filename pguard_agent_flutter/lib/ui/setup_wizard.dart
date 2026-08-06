// lib/ui/setup_wizard.dart
// Setup wizard UI with 4-language support (ko, en, th, lo)

import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import '../core/storage/config_store.dart';
import '../core/storage/activity_buffer.dart';
import '../core/network/api_client.dart';
import '../core/monitor/activity_monitor.dart';
import '../l10n/app_localizations.dart';
import 'system_tray.dart';

class SetupWizard extends StatefulWidget {
  final ConfigStore configStore;
  final ActivityBuffer activityBuffer;
  final ApiClient apiClient;
  final ActivityMonitor activityMonitor;

  const SetupWizard({
    super.key,
    required this.configStore,
    required this.activityBuffer,
    required this.apiClient,
    required this.activityMonitor,
  });

  @override
  State<SetupWizard> createState() => _SetupWizardState();
}

class _SetupWizardState extends State<SetupWizard> {
  final _formKey = GlobalKey<FormState>();
  final _pageController = PageController();
  int _currentPage = 0;
  bool _isVerifying = false;
  bool _isVerified = false;
  String? _verifiedCompanyName;
  bool _isOfflineMode = false;
  String _selectedLanguage = 'ko';

  // 컨트롤러
  final _serverUrlController = TextEditingController();
  final _companyCodeController = TextEditingController();
  final _employeeIdController = TextEditingController();
  final _employeeNameController = TextEditingController();
  final _apiTokenController = TextEditingController();

  bool _showToken = false;

  @override
  void initState() {
    super.initState();
    _loadSavedConfig();
    _selectedLanguage = widget.configStore.language;
  }

  Future<void> _loadSavedConfig() async {
    _serverUrlController.text = widget.configStore.serverUrl;
    _companyCodeController.text = widget.configStore.companyCode;
    _employeeIdController.text = widget.configStore.employeeId;
    _employeeNameController.text = widget.configStore.employeeName;
    _apiTokenController.text = widget.configStore.apiToken;
    _selectedLanguage = widget.configStore.language;
    setState(() {});
  }

  @override
  void dispose() {
    _pageController.dispose();
    _serverUrlController.dispose();
    _companyCodeController.dispose();
    _employeeIdController.dispose();
    _employeeNameController.dispose();
    _apiTokenController.dispose();
    super.dispose();
  }

  // 다국어 텍스트 가져오기
  String _t(String key) {
    final loc = AppLocalizations.of(context);
    switch (key) {
      case 'title': return loc.setupTitle;
      case 'header': return loc.setupHeader;
      case 'serverLabel': return loc.serverLabel;
      case 'serverHint': return loc.serverHint;
      case 'companyLabel': return loc.companyLabel;
      case 'employeeIdLabel': return loc.employeeIdLabel;
      case 'employeeNameLabel': return loc.employeeNameLabel;
      case 'tokenLabel': return loc.tokenLabel;
      case 'btnVerify': return loc.btnVerify;
      case 'btnVerifyOk': return loc.btnVerifyOk;
      case 'btnVerifyFail': return loc.btnVerifyFail;
      case 'btnVerifyOffline': return loc.btnVerifyOffline;
      case 'statusServerEmpty': return loc.statusServerEmpty;
      case 'statusCodeEmpty': return loc.statusCodeEmpty;
      case 'statusVerifying': return loc.statusVerifying;
      case 'statusVerified': return loc.statusVerified;
      case 'statusInvalid': return loc.statusInvalid;
      case 'statusServerErr': return loc.statusServerErr;
      case 'statusOffline': return loc.statusOffline;
      case 'btnSubmit': return loc.btnSubmit;
      case 'footerInfo': return loc.footerInfo;
      case 'errTitle': return loc.errTitle;
      case 'errEmpty': return loc.errEmpty;
      case 'msgNotVerifiedTitle': return loc.msgNotVerifiedTitle;
      case 'msgNotVerified': return loc.msgNotVerified;
      case 'msgOfflineTitle': return loc.msgOfflineTitle;
      case 'msgOffline': return loc.msgOffline;
      case 'msgConfirmTitle': return loc.msgConfirmTitle;
      case 'msgConfirm': return loc.msgConfirm;
      case 'msgDoneTitle': return loc.msgDoneTitle;
      case 'msgDone': return loc.msgDone;
      case 'langSelect': return loc.langSelect;
      default: return key;
    }
  }

  Future<void> _verifyCompanyCode() async {
    final serverUrl = _serverUrlController.text.trim();
    final companyCode = _companyCodeController.text.trim().toUpperCase();

    if (serverUrl.isEmpty) {
      _showSnackBar(_t('statusServerEmpty'));
      return;
    }
    if (companyCode.isEmpty) {
      _showSnackBar(_t('statusCodeEmpty'));
      return;
    }

    setState(() {
      _isVerifying = true;
      _isVerified = false;
      _verifiedCompanyName = null;
    });

    // 임시로 베이스 URL 업데이트
    widget.apiClient.updateBaseUrl(serverUrl);

    final result = await widget.apiClient.verifyCompanyCode(companyCode);

    setState(() {
      _isVerifying = false;
      if (result.success) {
        _isVerified = true;
        _verifiedCompanyName = result.companyName;
        _isOfflineMode = false;
      } else {
        _isVerified = false;
        if (result.error?.contains('연결 실패') == true || 
            result.error?.contains('connection') == true) {
          _isOfflineMode = true;
        }
      }
    });
  }

  Future<void> _saveAndStart() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_isVerified && !_isOfflineMode) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: Text(_t('msgNotVerifiedTitle'), style: const TextStyle(color: Colors.white)),
          content: Text(
            _t('msgNotVerified').replaceAll('{code}', _companyCodeController.text.trim().toUpperCase()),
            style: const TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('취소', style: TextStyle(color: Colors.white70)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('계속', style: TextStyle(color: Color(0xFF4F46E5))),
            ),
          ],
        ),
      );
      if (confirm != true) return;
    }

    if (_isOfflineMode) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: Text(_t('msgOfflineTitle'), style: const TextStyle(color: Colors.white)),
          content: Text(_t('msgOffline'), style: const TextStyle(color: Colors.white70)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('취소', style: TextStyle(color: Colors.white70)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('오프라인 저장', style: TextStyle(color: Color(0xFFF59E0B))),
            ),
          ],
        ),
      );
      if (confirm != true) return;
    }

    // 최종 확인 다이얼로그
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(_t('msgConfirmTitle'), style: const TextStyle(color: Colors.white)),
        content: Text(
          _t('msgConfirm')
            .replaceAll('{cname}', _verifiedCompanyName ?? _companyCodeController.text.trim().toUpperCase())
            .replaceAll('{empid}', _employeeIdController.text.trim())
            .replaceAll('{empname}', _employeeNameController.text.trim())
            .replaceAll('{server}', _serverUrlController.text.trim())
            .replaceAll('{token}', _apiTokenController.text.isEmpty ? '미입력' : '${_apiTokenController.text.substring(0, 8)}...'),
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('취소', style: TextStyle(color: Colors.white70)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('연동 시작', style: TextStyle(color: Color(0xFF4F46E5))),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    // 저장
    try {
      await widget.configStore.saveAll(
        serverUrl: _serverUrlController.text.trim(),
        companyCode: _companyCodeController.text.trim().toUpperCase(),
        employeeId: _employeeIdController.text.trim(),
        employeeName: _employeeNameController.text.trim(),
        apiToken: _apiTokenController.text.trim(),
        language: _selectedLanguage,
      );

      // 모니터 시작
      await widget.activityMonitor.start();
      
      // 시스템 트레이 설정
      SystemTrayManager().initialize(widget.configStore, widget.activityMonitor);

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            backgroundColor: const Color(0xFF1E293B),
            title: Text(_t('msgDoneTitle'), style: const TextStyle(color: Colors.white)),
            content: Text(_t('msgDone'), style: const TextStyle(color: Colors.white70)),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  // 창 숨기기
                  windowManager.hide();
                },
                child: const Text('확인', style: TextStyle(color: Color(0xFF4F46E5))),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      _showSnackBar('${_t('msgSaveErrTitle')}: $e');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFFEF4444),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          children: [
            // 언어 선택 바
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(_t('langSelect'), style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(width: 8),
                  DropdownButton<String>(
                    value: _selectedLanguage,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white),
                    underline: const SizedBox(),
                    items: const [
                      DropdownMenuItem(value: 'ko', child: Text('한국어')),
                      DropdownMenuItem(value: 'en', child: Text('English')),
                      DropdownMenuItem(value: 'th', child: Text('ไทย')),
                      DropdownMenuItem(value: 'lo', child: Text('ລາວ')),
                    ],
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedLanguage = val);
                      }
                    },
                  ),
                ],
              ),
            ),
            // 메인 컨텐츠
            Expanded(
              child: Form(
                key: _formKey,
                child: PageView(
                  controller: _pageController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    _buildServerPage(),
                    _buildAccountPage(),
                    _buildTokenPage(),
                  ],
                ),
              ),
            ),
            // 하단 버튼
            Container(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  if (_currentPage > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _pageController.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Color(0xFF4F46E5)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('이전', style: TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold)),
                      ),
                    ),
                  if (_currentPage > 0) const SizedBox(width: 16),
                  Expanded(
                    flex: _currentPage > 0 ? 1 : 2,
                    child: ElevatedButton(
                      onPressed: _currentPage < 2
                          ? () => _pageController.nextPage(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                            )
                          : _saveAndStart,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: const Color(0xFF4F46E5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        _currentPage < 2 ? '다음' : _t('btnSubmit'),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // 푸터
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                _t('footerInfo'),
                style: const TextStyle(color: Colors.white38, fontSize: 11),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServerPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_t('header'), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(_t('serverHint'), style: const TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 32),
          
          // 서버 주소
          Text(_t('serverLabel'), style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _serverUrlController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: _t('serverHint'),
              hintStyle: const TextStyle(color: Colors.white38),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
            validator: (v) => v?.trim().isEmpty == true ? '서버 주소를 입력하세요' : null,
          ),
          const SizedBox(height: 24),

          // 회사 코드
          Text(_t('companyLabel'), style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _companyCodeController,
                  style: const TextStyle(color: Colors.white),
                  textCapitalization: TextCapitalization.characters,
                  decoration: InputDecoration(
                    hintText: 'AUTONLAO',
                    hintStyle: const TextStyle(color: Colors.white38),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  ),
                  validator: (v) => v?.trim().isEmpty == true ? '회사 코드를 입력하세요' : null,
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _isVerifying ? null : _verifyCompanyCode,
                  icon: _isVerifying
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.verified_outlined, size: 20),
                  label: Text(
                    _isVerifying ? _t('statusVerifying') : _t('btnVerify'),
                    style: const TextStyle(fontSize: 13),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isVerified ? const Color(0xFF10B981) : 
                                 _isOfflineMode ? const Color(0xFFF59E0B) : const Color(0xFF4F46E5),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // 검증 상태 표시
          if (_isVerified || _isOfflineMode)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _isVerified ? const Color(0xFF064E3B) : const Color(0xFF78350F),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    _isVerified ? Icons.check_circle : Icons.warning_amber,
                    color: _isVerified ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _isVerified 
                          ? _t('statusVerified').replaceAll('{cname}', _verifiedCompanyName ?? '')
                          : _t('statusOffline'),
                      style: TextStyle(
                        color: _isVerified ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAccountPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_t('header'), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('사원 정보를 입력해 주세요.', style: const TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 32),

          // 사원 번호
          Text(_t('employeeIdLabel'), style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _employeeIdController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: '2023001',
              hintStyle: const TextStyle(color: Colors.white38),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
            validator: (v) => v?.trim().isEmpty == true ? '사원 번호를 입력하세요' : null,
          ),
          const SizedBox(height: 24),

          // 사원 이름
          Text(_t('employeeNameLabel'), style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _employeeNameController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: '홍길동',
              hintStyle: const TextStyle(color: Colors.white38),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
            validator: (v) => v?.trim().isEmpty == true ? '사원 이름을 입력하세요' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildTokenPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_t('header'), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('대시보드에서 발급받은 연동 토큰을 입력하세요.', style: const TextStyle(color: Colors.white54, fontSize: 14)),
          const SizedBox(height: 32),

          // 토큰
          Text(_t('tokenLabel'), style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextFormField(
            controller: _apiTokenController,
            style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
            obscureText: !_showToken,
            decoration: InputDecoration(
              hintText: '토큰을 입력하세요 (선택사항)',
              hintStyle: const TextStyle(color: Colors.white38),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              suffixIcon: IconButton(
                icon: Icon(_showToken ? Icons.visibility_off : Icons.visibility, color: Colors.white54),
                onPressed: () => setState(() => _showToken = !_showToken),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.white54, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '토큰은 대시보드 설정 > 에이전트 연동 토큰에서 확인/재발급 가능합니다.',
                    style: const TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}