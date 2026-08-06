// lib/ui/idle_overlay.dart
// Idle reason input overlay widget

import 'package:flutter/material.dart';

class IdleReasonOverlay extends StatefulWidget {
  final Function(String reason, String? detail) onSubmit;
  final VoidCallback onCancel;

  const IdleReasonOverlay({
    super.key,
    required this.onSubmit,
    required this.onCancel,
  });

  static void show(BuildContext context, {
    required Function(String reason, String? detail) onSubmit,
    required VoidCallback onCancel,
  }) {
    final overlay = Overlay.of(context);
    late OverlayEntry entry;
    
    entry = OverlayEntry(
      builder: (context) => Material(
        color: Colors.transparent,
        child: _IdleReasonOverlayContent(
          onSubmit: (reason, detail) {
            onSubmit(reason, detail);
            entry.remove();
          },
          onCancel: () {
            onCancel();
            entry.remove();
          },
        ),
      ),
    );
    
    overlay.insert(entry);
  }

  @override
  State<IdleReasonOverlay> createState() => _IdleReasonOverlayState();
}

class _IdleReasonOverlayState extends State<IdleReasonOverlay> {
  @override
  Widget build(BuildContext context) {
    // This widget is never directly built - show() uses OverlayEntry
    return const SizedBox.shrink();
  }
}

class _IdleReasonOverlayContent extends StatefulWidget {
  final Function(String reason, String? detail) onSubmit;
  final VoidCallback onCancel;

  const _IdleReasonOverlayContent({
    required this.onSubmit,
    required this.onCancel,
  });

  @override
  State<_IdleReasonOverlayContent> createState() => _IdleReasonOverlayContentState();
}

class _IdleReasonOverlayContentState extends State<_IdleReasonOverlayContent>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;
  
  String _selectedReason = '';
  final _detailController = TextEditingController();
  bool _isSubmitting = false;

  final List<Map<String, String>> _reasons = [
    {'id': 'meeting', 'ko': '회의/미팅', 'en': 'Meeting', 'th': 'ประชุม', 'lo': 'ການປະທານາ'},
    {'id': 'break', 'ko': '휴식/식사', 'en': 'Break/Meal', 'th': 'พัก/ทานอาหาร', 'lo': 'ປິດ/ກິນຂໍ້ມູນ'},
    {'id': 'phone', 'ko': '전화/통화', 'en': 'Phone Call', 'th': 'โทรศัพท์', 'lo': 'ໂທລະສັບ'},
    {'id': 'away', 'ko': '자리 비움', 'en': 'Away from Desk', 'th': 'ไม่อยู่ที่โต๊ะ', 'lo': 'ອອກຈາກໂຕ'},
    {'id': 'other', 'ko': '기타', 'en': 'Other', 'th': 'อื่นๆ', 'lo': 'ອື່ນໆ'},
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutBack),
    );
    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _detailController.dispose();
    super.dispose();
  }

  String _t(String key) {
    switch (key) {
      case 'title': return '자리비움 사유 입력';
      case 'subtitle': return '잠시 자리를 비우셨군요. 사유를 선택해 주세요.';
      case 'detailLabel': return '상세 사유 (선택사항)';
      case 'detailHint': return '자유롭게 입력하세요';
      case 'btnSubmit': return '확인';
      case 'btnCancel': return '취소';
      default: return key;
    }
  }

  String _getReasonLabel(Map<String, String> reason) {
    final locale = Localizations.localeOf(context);
    return reason[locale.languageCode] ?? reason['en'] ?? reason['ko']!;
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacityAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Center(
          child: Container(
            margin: const EdgeInsets.all(24),
            constraints: const BoxConstraints(maxWidth: 400),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.5),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // 헤더
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    border: Border(
                      bottom: BorderSide(color: const Color(0xFF334155)),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4F46E5).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.schedule, color: Color(0xFF4F46E5), size: 24),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _t('title'),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _t('subtitle'),
                              style: const TextStyle(color: Colors.white54, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // 사유 선택
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '사유 선택',
                        style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _reasons.map((reason) {
                          final isSelected = _selectedReason == reason['id'];
                          return FilterChip(
                            label: Text(
                              _getReasonLabel(reason),
                              style: TextStyle(
                                color: isSelected ? Colors.white : Colors.white70,
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                              ),
                            ),
                            selected: isSelected,
                            onSelected: (selected) {
                              setState(() {
                                _selectedReason = selected ? reason['id']! : '';
                              });
                            },
                            selectedColor: const Color(0xFF4F46E5),
                            backgroundColor: const Color(0xFF334155),
                            checkmarkColor: Colors.white,
                            side: BorderSide(
                              color: isSelected ? const Color(0xFF4F46E5) : Colors.transparent,
                              width: 1.5,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 20),
                      // 상세 사유 입력
                      Text(
                        _t('detailLabel'),
                        style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _detailController,
                        style: const TextStyle(color: Colors.white),
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: _t('detailHint'),
                          hintStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.all(16),
                        ),
                      ),
                    ],
                  ),
                ),
                // 버튼 영역
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    border: Border(top: BorderSide(color: const Color(0xFF334155))),
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isSubmitting ? null : () {
                            widget.onCancel();
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: const BorderSide(color: Color(0xFF64748B)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: Text(
                            _t('btnCancel'),
                            style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _isSubmitting || _selectedReason.isEmpty ? null : () async {
                            setState(() => _isSubmitting = true);
                            widget.onSubmit(_selectedReason, _detailController.text.trim().isEmpty ? null : _detailController.text.trim());
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            backgroundColor: const Color(0xFF4F46E5),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: _isSubmitting
                              ? const SizedBox(
                                  height: 20, width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Text(
                                  _t('btnSubmit'),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}