// API URL - 현재 페이지 오리진 기준 상대경로 사용 (어떤 서버에서도 동작)
const API_BASE_URL = `${window.location.origin}/api`;

// 다국어 번역 사전
const translations = {
    ko: {
        sidebar_subtitle: "활동 모니터링 시스템",
        menu_overview: "종합 모니터링",
        menu_employees: "직원 활동 현황",
        menu_violations: "비업무 로그",
        menu_worklogs: "업무 로그",
        menu_settings: "대시보드 설정",
        header_tag: "OVERVIEW",
        header_title: "실시간 생산성 대시보드",
        header_desc: "직원들의 소프트웨어 사용 점유율과 비업무 활동 내역을 시각화합니다.",
        btn_refresh: "새로고침",
        status_polling: "실시간 폴링 ON",
        kpi_total_employees: "전체 관리 사원",
        kpi_monitoring_active: "모니터링 활성화",
        kpi_active_employees: "실시간 접속 직원",
        kpi_active_desc: "현재 PC 활동 신호 감지",
        kpi_nonwork_time: "오늘 비업무 체류 시간",
        kpi_nonwork_desc: "유튜브 / 웹툰 / 쇼핑몰 등",
        kpi_productivity: "평균 업무 집중도",
        kpi_prod_desc: "전체 근무 대비 실무 비중",
        chart_category_title: "근무 시간 구성 비율",
        chart_category_desc: "업무, 비업무, 자리비움 누적 배분율",
        legend_work: "업무 (Work)",
        legend_nonwork: "비업무 (Non-work)",
        legend_idle: "자리비움 (Idle)",
        chart_program_title: "소프트웨어 사용 점유율",
        chart_program_desc: "활성화된 소프트웨어 Top 5",
        panel_realtime_title: "실시간 PC 활동 현황",
        panel_realtime_desc: "현재 기동 중인 에이전트 신호",
        panel_leaderboard_title: "비업무 도메인 체류 순위",
        panel_leaderboard_desc: "가장 유입량이 높은 비업무 사이트",
        panel_feed_title: "활동 감지 상세 피드",
        panel_feed_desc: "에이전트로부터 수집된 세부 원시 기록",
        filter_nonwork_only: "비업무 경고만 보기",
        th_time: "시각",
        th_name: "이름 (사번)",
        th_process: "프로세스",
        th_title: "활성 창 타이틀",
        th_category: "카테고리",
        th_duration: "체류시간",
        emp_tab_title: "관리 사원 세부 현황",
        emp_tab_desc: "등록된 직원들의 최신 통신 기록 및 누적 가동 데이터",
        th_emp_id: "사원 번호",
        th_emp_name: "사원명",
        th_last_seen: "마지막 활동 통신",
        th_emp_status: "실시간 접속 여부",
        violation_tab_title: "비업무 활동 로그",
        violation_tab_desc: "비업무로 분류된 활동 로그입니다. 관리자는 업무 전환 버튼으로 카테고리를 변경할 수 있습니다.",
        worklog_tab_title: "PC 활동 업무 로그",
        worklog_tab_desc: "업무로 분류된 PC 활동 상세 내역입니다. 관리자는 비업무 전환 버튼으로 카테고리를 변경할 수 있습니다.",
        th_idle_reason: "사유",
        btn_prev: "이전",
        btn_next: "다음",
        btn_apply: "적용",
        btn_excel_download: "Excel 다운로드",
        violation_tab_desc: "유튜브, 쿠팡, 쇼핑몰, 웹툰 등 지정 비업무 사이트 검출 목록만 추출합니다.",
        th_domain: "감지 도메인",
        settings_info_title: "PGuard 모니터링 시스템 정보",
        settings_info_desc: "현재 로컬 가동 중인 시스템의 설정 사양입니다.",
        settings_title: "⚙️ 에이전트 동작 및 보안 설정",
        settings_desc: "연결된 PC 에이전트의 자리비움 기준, 감시 스캔 주기 및 백엔드 전송 주기를 통합 설정합니다.",
        label_idle_threshold: "⏱ 자리비움 감지 시간",
        desc_idle_threshold: "미입력 시 자리비움 판정 기준 (1분 ~ 60분)",
        label_scan_interval: "🔍 에이전트 감시 스캔 주기",
        desc_scan_interval: "활성 창 및 입력 상태 확인 빈도 (1초 ~ 300초)",
        label_send_interval: "📡 에이전트 서버 전송 주기",
        desc_send_interval: "수집 로그 백엔드 일괄 전송 빈도 (10초 ~ 3600초)",
        label_agent_token: "🔑 에이전트 연동 토큰",
        desc_agent_token: "에이전트 설정 GUI(또는 config.json)의 API 토큰 입력란에 붙여넣는 회사 인증 토큰입니다.",
        btn_regen_token: "토큰 재발급",
        regen_token_success: "토큰이 재발급되었습니다. 연결된 에이전트의 config.json에 반드시 반영하세요.",
        unit_min: "분",
        unit_sec: "초",
        btn_save_settings: "설정 저장",
        set_agent_interval: "에이전트 스캔 주기",
        set_send_interval: "에이전트 서버 전송 주기",
        set_server_port: "Express API 서버 포트",
        set_db_engine: "데이터베이스 엔진",
        settings_reset_title: "데이터베이스 관리 (위험 구역)",
        settings_reset_desc: "누적된 수집 로그를 제거하거나 초기화할 수 있습니다.",
        settings_reset_warning: "⚠️ 주의: 데이터베이스의 모든 PC 활동 이력 로그 및 웹 브라우저 방문 기록을 안전하게 전체 삭제합니다. 삭제된 데이터는 복구할 수 없습니다.",
        btn_reset_db: "활동 데이터베이스 전체 초기화",
        status_online: "온라인",
        status_away: "자리비움",
        category_work: "업무",
        category_nonwork: "비업무 경고",
        no_data_desc: "수집된 활동 데이터가 존재하지 않습니다. PC 에이전트를 먼저 기동해 주세요.",
        login_subtitle: "보안 모니터링 관리자 인증이 필요합니다.",
        login_company_code: "회사 연동 코드 (Company Code)",
        th_company: "회사",
        login_username: "관리자 아이디",
        login_password: "비밀번호",
        login_btn: "인증 및 로그인",
        settings_security_title: "보안 및 회사 연동 설정",
        settings_security_desc: "에이전트 연동용 회사 코드와 관리자 비밀번호를 안전하게 수정합니다.",
        label_company_code: "회사 연동 코드 (Company Code)",
        label_new_password: "새 관리자 비밀번호 (New Admin Password)",
        btn_save_settings: "설정 저장하기",
        menu_super: "회사 관리",
        menu_logout: "로그아웃",
        logout_confirm: "로그아웃 하시겠습니까?",
        super_company_title: "회사 등록 및 수정",
        super_company_desc: "새로운 회사를 등록하거나 기존 회사의 이름을 수정합니다.",
        label_super_comp_code: "회사 코드 (Company Code)",
        label_super_comp_name: "회사명 (Company Name)",
        btn_super_comp_register: "회사 등록하기",
        btn_cancel: "취소",
        super_admin_title: "회사 관리자 계정 생성",
        super_admin_desc: "특정 회사에 귀속된 독립 관리자 계정을 생성합니다.",
        label_super_admin_comp: "소속 회사 선택 (Select Company)",
        label_super_admin_id: "관리자 ID (Admin ID)",
        label_super_admin_pw: "임시 비밀번호 (Temporary Password)",
        btn_super_admin_create: "관리자 계정 생성",
        super_company_table_title: "회사 목록 관리",
        super_company_table_desc: "등록된 모든 회사 목록입니다. 삭제 시 소속 직원 및 수집 로그가 영구 삭제됩니다.",
        th_company_code: "회사 코드",
        th_company_name: "회사명",
        th_created_at: "등록일",
        th_action: "작업",
        super_admin_table_title: "회사 관리자 목록 관리",
        super_admin_table_desc: "등록된 회사별 관리자 계정 목록입니다.",
        th_super_admin_id: "관리자 ID",
        th_super_admin_comp: "소속 회사",
        btn_edit: "수정",
        btn_delete: "삭제",
        emp_select_placeholder: "분석할 사원을 목록에서 선택하거나 분석 버튼을 눌러주세요.",
        emp_stats_title: "사원별 활동 통계 분석",
        emp_prod_score: "업무 집중도 (Focus Score)",
        emp_time_alloc: "근무 시간 배분 구성",
        emp_top_software: "최다 사용 소프트웨어",
        emp_top_domains: "최다 체류 비업무 사이트",
        btn_analyze: "분석",
        category_idle: "자리비움",
        loading_stats: "통계 로딩 중...",
        no_stats_data: "수집된 데이터가 없습니다.",
        btn_export_all: "전체 요약 Excel",
        btn_export_detail: "이 직원 통계 Excel",
        menu_download: "에이전트 다운로드",
        download_title: "PGuard Agent 다운로드",
        download_desc: "직원들의 PC에 설치할 모니터링 에이전트를 다운로드하세요. 운영체제에 맞는 버전을 선택해 주십시오.",
        btn_download_win: "Windows용 다운로드",
        btn_download_mac: "Mac용 다운로드",
        err_date_required: "시작일과 종료일을 모두 선택해주세요.",
        err_date_limit: "최대 7일까지만 다운로드할 수 있습니다.",
        all_employees: "전체 직원",
        duration_total: "합계",
        duration_hours: "시간",
        duration_minutes: "분",
        duration_seconds: "초",
        duration_items: "건",
        menu_audit: "관리자 활동 로그",
        audit_title: "관리자 활동 로그",
        audit_desc: "시스템 내에서 관리자들이 수행한 모든 보안 설정 변경 및 접근 이력을 실시간으로 추적합니다.",
        label_date: "기간:",
        label_action_type: "활동 분류:",
        label_admin_user: "관리자 ID:",
        all_actions: "전체 활동",
        act_login_success: "로그인 성공",
        act_login_failure: "로그인 실패",
        act_logout: "로그아웃",
        act_company_settings: "자리비움 설정 변경",
        act_message_send: "에이전트 메시지 발송",
        act_category_update: "활동 분류 수정",
        act_reset_data: "활동 로그 초기화",
        act_sub_admin_create: "서브 관리자 생성",
        act_sub_admin_delete: "서브 관리자 삭제",
        act_company_create: "회사 등록",
        act_company_edit: "회사명 수정",
        act_company_delete: "회사 영구 삭제",
        act_admin_create: "회사 관리자 생성",
        act_admin_delete: "회사 관리자 삭제",
        act_settings_update: "관리자 정보 변경",
        search_admin_id_placeholder: "ID 검색...",
        th_timestamp: "발생 시간",
        th_admin_username: "관리자 ID",
        th_action_type: "활동 분류",
        th_details: "작업 상세 내용",
        th_ip_address: "IP 주소",
        menu_patterns: "분류 패턴 관리",
        mode_admin: "관리자 모드",
        mode_employee: "직원 모드",
        menu_approval_admin: "전자결재 관리",
        menu_approval_user: "나의 결재",
        navgrp_monitoring: "모니터링", navgrp_approval: "전자결재", navgrp_admin: "관리", menu_employee_mgmt: "직원 관리", menu_org_chart: "조직도 관리", org_desc: "그룹·팀을 트리로 구성하고 직원을 배정합니다. 전자결재 결재선과 KPI에 연동됩니다.", org_add_top: "최상위 조직 추가", org_add_child: "하위 추가", org_company_root: "회사 최상위", org_empty: "조직이 없습니다. 최상위 조직 추가로 시작하세요.", org_type_group: "그룹 (Group)", org_type_team: "팀 (Team)", org_type_group_short: "그룹", org_type_team_short: "팀", org_emp_unit: "명", org_name: "조직 이름", org_type: "유형", org_parent: "상위 조직", org_root_option: "(최상위 - 회사 직속)", org_add_title: "조직 추가", org_edit_title: "조직 수정", org_err_name: "조직 이름을 입력해 주세요.", org_confirm_delete: "이 조직을 삭제하시겠습니까? 배정된 직원은 미배정 처리됩니다.", org_delete_failed: "조직 삭제 실패: ", org_add_failed: "조직 추가 실패: ", org_update_failed: "조직 수정 실패: ", org_unassigned: "(미배정)", emp_form_org: "소속 조직 (팀/그룹)", th_emp_org: "소속 조직", emp_mgmt_desc: "직원 정보, 로그인 계정, 관리 권한을 한 곳에서 관리합니다.",
        approval_admin_title: "전자결재 관리",
        approval_admin_desc: "결재 문서, 양식(템플릿), 직원 로그인 계정, 번역 설정을 관리합니다.",
        approval_user_title: "나의 결재",
        approval_user_desc: "결재 문서를 작성하고, 내가 올리거나 결재해야 할 문서를 확인합니다.",
        approval_pill_pending: "대기 문서",
        approval_pill_all: "전체 문서",
        approval_pill_templates: "템플릿 관리",
        approval_pill_accounts: "직원 관리",
        approval_pill_settings: "결재 설정",
        approval_pill_new: "새 결재 작성",
        approval_pill_mine: "내가 올린 문서",
        approval_pill_todo: "결재할 문서",
        approval_pill_cc: "참조 문서",
        approval_coming_soon: "전자결재 기능을 준비 중입니다. (Phase 2~ 구현 예정)",
        role_normal_employee: "일반 직원",
        role_sub_admin: "서브 관리자",
        role_employee_manager: "직원 관리자",
        account_active: "활성",
        account_inactive: "비활성",
        account_create: "계정 생성",
        account_reset: "계정 재설정",
        account_disable: "로그인 해제",
        account_help: "직원 로그인 계정을 만들고, 일부 직원에게 관리 권한(서브 관리자/직원 관리자)을 부여할 수 있습니다. 최고 관리자(admin) 권한은 부여되지 않습니다.",
        account_saved: "직원 로그인 계정이 저장되었습니다.",
        account_save_failed: "계정 저장 실패: ",
        account_disable_failed: "로그인 해제 실패: ",
        role_update_failed: "권한 변경 실패: ",
        confirm_disable: "이 직원의 로그인을 비활성화하시겠습니까? (부여된 관리 권한도 함께 해제됩니다)",
        prompt_login_id: "로그인 ID를 입력하세요",
        prompt_password: "비밀번호를 입력하세요 (4자 이상)",
        err_login_id_required: "로그인 ID는 필수입니다.",
        err_password_short: "비밀번호는 최소 4자 이상이어야 합니다.",
        loading_text: "불러오는 중...",
        no_employees: "직원이 없습니다.",
        th_emp_name: "이름",
        th_emp_id: "사번",
        th_company: "회사",
        th_login_id: "로그인 ID",
        th_login_status: "로그인 상태",
        th_admin_role: "관리 권한",
        th_actions: "작업",
        emp_add: "직원 추가", emp_edit_title: "직원 정보 수정", emp_form_tags: "태그 (부서 등, 쉼표로 구분 · 선택)", emp_edit: "정보 수정", emp_delete: "삭제", th_emp_tags: "태그",
        emp_manage_help: "직원을 추가·수정·삭제하고, 로그인 계정 생성 및 관리 권한(서브 관리자/직원 관리자)을 부여할 수 있습니다. 최고 관리자(admin) 권한은 부여되지 않습니다.",
        prompt_emp_id: "사번(직원 ID)을 입력하세요", prompt_emp_name: "직원 이름을 입력하세요", prompt_emp_tags: "태그(부서 등, 쉼표 구분, 선택)",
        err_emp_id_required: "사번은 필수입니다.", err_emp_name_required: "이름은 필수입니다.",
        emp_added: "직원이 추가되었습니다.", emp_add_failed: "직원 추가 실패: ", emp_updated: "직원 정보가 수정되었습니다.", emp_update_failed: "직원 수정 실패: ",
        emp_confirm_delete: "직원을 삭제하시겠습니까? 활동 로그도 함께 삭제될 수 있습니다.", emp_delete_failed: "직원 삭제 실패: ",
        btn_edit: "수정",
        btn_delete: "삭제",
        btn_save: "저장",
        btn_cancel: "취소",
        tpl_new: "새 템플릿",
        tpl_new_title: "새 템플릿",
        tpl_edit_title: "템플릿 수정",
        tpl_list_desc: "결재 양식(템플릿)을 만들고 관리합니다. 문서 작성 시 이 양식을 선택합니다.",
        tpl_th_title: "양식명",
        tpl_th_category: "분류",
        tpl_th_fields: "입력 항목",
        tpl_th_updated: "수정일",
        tpl_fields_unit: "개 항목",
        tpl_empty: "등록된 템플릿이 없습니다.",
        tpl_fields_title: "입력 항목 (본문 필드)",
        tpl_add_field: "항목 추가",
        tpl_no_fields: "입력 항목이 없습니다. '항목 추가'로 필드를 만드세요.",
        tpl_label_ko: "라벨(한국어)",
        tpl_field_key: "키(영문 식별자, 선택)",
        tpl_field_type: "타입",
        tpl_options: "선택 옵션 (쉼표로 구분)",
        tpl_line_approval: "기본 결재선 (순차)",
        tpl_line_agreement: "기본 합의선 (병렬)",
        tpl_line_cc: "기본 참조선",
        tpl_line_empty: "지정 안 함",
        tpl_no_participants: "추가 가능한 대상 없음",
        tpl_saved: "템플릿이 저장되었습니다.",
        tpl_save_failed: "템플릿 저장 실패: ",
        tpl_delete_failed: "템플릿 삭제 실패: ",
        tpl_confirm_delete: "이 템플릿을 삭제하시겠습니까?",
        tpl_err_title: "양식명을 입력해 주세요.",
        p_admin: "관리자",
        p_employee: "직원",
        cat_general: "일반", cat_leave: "휴가", cat_expense: "경비", cat_purchase: "구매",
        cat_report: "보고", cat_hr: "인사", cat_it_request: "IT요청", cat_other: "기타",
        ftype_text: "한 줄 텍스트", ftype_textarea: "여러 줄 텍스트", ftype_number: "숫자", ftype_date: "날짜", ftype_select: "선택",
        st_draft: "임시저장", st_submitted: "제출됨", st_in_review: "결재중", st_approved: "승인완료", st_rejected: "반려", st_withdrawn: "회수",
        pr_low: "낮음", pr_normal: "보통", pr_high: "높음", pr_urgent: "긴급",
        ls_pending: "대기", ls_current: "진행중", ls_approved: "완료", ls_rejected: "반려", ls_skipped: "건너뜀",
        viz_approval: "결재선 (순차)", viz_agreement: "합의선 (병렬)", viz_cc: "참조 (읽음)",
        act_approve: "승인", act_reject: "반려", act_agree: "합의", act_withdraw: "회수", act_edit_draft: "이어서 작성", act_submit: "제출",
        act_ap_created: "문서 생성", act_ap_submitted: "제출", act_ap_approved: "승인", act_ap_rejected: "반려", act_ap_agreed: "합의", act_ap_withdrawn: "회수", act_ap_read: "열람", act_ap_updated: "수정", act_ap_completed: "최종 승인 완료",
        comment_optional: "의견 (선택)", reject_reason_ph: "반려 사유를 입력하세요", reject_reason_req: "반려 사유는 필수입니다.",
        confirm_withdraw: "이 문서를 회수하시겠습니까?", confirm_submit: "이 문서를 제출하시겠습니까?",
        doc_th_number: "문서번호", doc_th_title: "제목", doc_th_status: "상태", doc_th_drafter: "기안자", doc_th_date: "일시", doc_th_read: "열람",
        doc_empty: "문서가 없습니다.", doc_search: "제목/문서번호 검색", all_status: "전체 상태", cc_read: "읽음", cc_unread: "안읽음",
        doc_no_body: "본문 내용이 없습니다.", doc_body: "문서 본문", doc_reject_reason: "반려 사유", doc_timeline: "활동 이력",
        doc_select_template: "템플릿 선택 (또는 자유 양식)", doc_form_template: "템플릿", doc_form_priority: "우선순위", doc_free_form: "자유 양식입니다. 템플릿을 선택하면 항목이 표시됩니다.",
        doc_submit: "제출", doc_save_draft: "임시저장", doc_reset: "초기화", doc_submitted: "결재 문서가 제출되었습니다.", doc_drafted: "임시저장되었습니다.", doc_save_failed: "저장 실패: ",
        doc_err_title: "제목을 입력해 주세요.", doc_err_line: "제출하려면 결재선 또는 합의선을 1명 이상 지정해야 합니다.", act_failed: "처리 실패: ",
        approval_settings_soon: "결재 설정(번역 연동)은 Phase 6에서 제공됩니다.",
        doc_attachments: "첨부파일", doc_add_file: "파일 추가", doc_no_files: "첨부된 파일이 없습니다.",
        doc_file_hint: "파일당 최대 20MB · 문서/이미지/PDF", doc_file_pending: "저장 시 업로드",
        doc_confirm_del_file: "이 첨부파일을 삭제하시겠습니까?", doc_download_fail: "다운로드 실패: ", doc_file_fail: "첨부 실패: ",
        doc_export_excel: "Excel 내보내기",
        set_lt_url: "LibreTranslate 서버 URL", set_test: "연결 테스트", set_lt_key: "API 키 (선택)", set_targets: "번역 대상 언어",
        set_auto: "제출 시 자동 번역", set_auto_desc: "문서 제출과 동시에 자동으로 번역합니다.", set_prefix: "문서번호 접두사",
        set_testing: "테스트 중...", set_ok: "연결 성공", set_saved: "결재 설정이 저장되었습니다.", set_save_failed: "설정 저장 실패: ",
        trans_original: "원문", trans_run: "번역", trans_running: "번역 중...", trans_failed: "번역 실패: ",
        tab_patterns_title: "🧩 업무/비업무 자동 분류 패턴 관리",
        tab_patterns_desc: "특정 프로세스명, 도메인, 활성 타이틀의 키워드를 기반으로 업무/비업무 로그를 자동 분류하는 규칙을 구성합니다.",
        th_pattern_type: "패턴 유형",
        th_pattern_value: "매칭 단어",
        th_pattern_category: "지정 분류",
        option_process: "프로세스명 (EXE)",
        option_domain: "감지 도메인 (웹사이트)",
        option_title: "활성 타이틀 (창 제목)",
        btn_register: "등록",
        confirm_pattern_delete: "정말로 이 분류 패턴을 삭제하시겠습니까?",
        act_pattern_create: "분류 패턴 등록",
        act_pattern_delete: "분류 패턴 삭제",
        menu_idlelogs: "자리비움 로그",
        idlelog_tab_title: "자리비움 활동 로그",
        idlelog_tab_desc: "직원들의 자리비움 감지 내역입니다. 업무로 변경 단추를 클릭해 해당 시간대를 업무 상태로 변경할 수 있습니다.",
        btn_change_to_work: "업무 전환",
        prompt_delete_emp: "정말로 이 직원의 모든 데이터와 계정 정보를 영구 삭제하시겠습니까?\n활동 이력(로그)을 포함한 모든 데이터가 복구 불가능하게 삭제됩니다.",
        prompt_work_reason: "이 자리비움 시간을 업무 상태로 변경하시겠습니까?\n변경 사유를 입력해 주세요:",
        kpi_idle_time: "오늘 자리비움 합계시간",
        kpi_idle_desc: "에이전트 자리비움 감지 시간",
        label_emp_tags: "사원 태그",
        th_emp_tags: "태그",
        role_sub_admin: "서브 관리자",
        role_employee_manager: "직원 관리자",
        placeholder_login_company_code: "회사 코드를 입력하세요",
        placeholder_login_username: "아이디를 입력하세요",
        placeholder_login_password: "비밀번호를 입력하세요",
        login_error_msg: "아이디 또는 비밀번호가 잘못되었습니다.",
        tz_seoul: "🕒 한국 서울시간",
        tz_vientiane: "🕒 라오스 비엔티안시간",
        lbl_first_seen: "최초 접속",
        lbl_emp_id: "사번",
        btn_send_message: "메시지 전송",
        status_offline: "오프라인",
        menu_send_agent_message: "📢 에이전트 메시지 전송",
        desc_send_agent_message: "개별 직원 또는 전체 직원의 PC 화면에 팝업 메시지를 전송합니다.",
        btn_send_all_employees: "전체 직원에게 전송",
        msg_no_agents_connected: "직원 활동 현황 탭에서 에이전트가 연결되면 여기에 직원 목록이 표시됩니다.",
        btn_send: "메시지",
        msg_recipient: "수신자",
        err_enter_message: "메시지 내용을 입력해주세요.",
        btn_sending: "전송 중...",
        msg_sent_success: "메시지가 성공적으로 전송되었습니다.",
        msg_sent_all: "전체 직원에게 메시지가 전송되었습니다. (에이전트 다음 폴링 시 수신)",
        err_send_failed: "전송 오류: ",
        btn_send_submit: "전송하기",
        label_message_content: "메시지 내용",
        placeholder_message_content: "PC 화면에 표시할 메시지를 입력하세요...",
        placeholder_enter_company_code: "회사 코드를 입력하세요.",
        placeholder_new_password_help: "변경할 경우에만 입력하세요.",
        placeholder_admin_id: "관리자 아이디",
        placeholder_temp_password: "초기 비밀번호",
        placeholder_managed_tags: "관리할 사원 태그 (쉼표로 구분)",
        confirm_delete_subadmin: "정말 이 서브 관리자를 삭제하시겠습니까?",
        download_win_desc: "Windows 10/11 이상 환경을 지원합니다. 더블 클릭하여 설치 없이 즉시 실행할 수 있습니다.",
        download_mac_desc: "macOS 환경을 지원합니다. 다운로드 후 실행하면 자동으로 설치 및 백그라운드 등록됩니다."
    },
    en: {
        sidebar_subtitle: "Activity Monitoring System",
        menu_overview: "Dashboard Overview",
        menu_employees: "Employee Status",
        menu_violations: "Non-Work Logs",
        menu_worklogs: "Work Logs",
        menu_settings: "Dashboard Settings",
        header_tag: "OVERVIEW",
        header_title: "Real-time Productivity Dashboard",
        header_desc: "Visualizes employee software utilization share and non-work activities.",
        btn_refresh: "Refresh",
        status_polling: "Real-time Polling ON",
        kpi_total_employees: "Total Monitored Employees",
        kpi_monitoring_active: "Monitoring Active",
        kpi_active_employees: "Real-time Online Employees",
        kpi_active_desc: "Active mouse/keyboard signal detected",
        kpi_nonwork_time: "Today's Non-work Duration",
        kpi_nonwork_desc: "YouTube / Webtoon / Shopping malls etc.",
        kpi_productivity: "Average Focus Score",
        kpi_prod_desc: "Core work ratio out of total hours",
        chart_category_title: "Time Allocation Breakdown",
        chart_category_desc: "Work, Non-work, and Idle cumulative shares",
        legend_work: "Work",
        legend_nonwork: "Non-work",
        legend_idle: "Idle",
        chart_program_title: "Software Usage Share",
        chart_program_desc: "Top 5 most active desktop programs",
        panel_realtime_title: "Real-time PC Activity Feed",
        panel_realtime_desc: "Currently running agent signals",
        panel_leaderboard_title: "Top Non-work Sites",
        panel_leaderboard_desc: "Highest traffic non-work domains",
        panel_feed_title: "Detailed Activity Feed",
        panel_feed_desc: "Raw logs captured from local PC agents",
        filter_nonwork_only: "Show Warnings Only",
        th_time: "Time",
        th_name: "Name (EMP ID)",
        th_process: "Process",
        th_title: "Active Window Title",
        th_category: "Category",
        th_duration: "Duration",
        emp_tab_title: "Monitored Employees Overview",
        emp_tab_desc: "Latest connection logs and cumulative telemetry of registered staff",
        th_emp_id: "Employee ID",
        th_emp_name: "Employee Name",
        th_last_seen: "Last Active Signal",
        th_emp_status: "Connection Status",
        violation_tab_title: "Non-Work Activity Logs",
        violation_tab_desc: "Logs classified as non-work. Admins can toggle categories with the button.",
        worklog_tab_title: "PC Work Activity Logs",
        worklog_tab_desc: "Detailed PC activity logs classified as work. Admins can toggle to non-work.",
        th_idle_reason: "Reason",
        btn_prev: "Prev",
        btn_next: "Next",
        btn_apply: "Apply",
        btn_excel_download: "Excel Download",
        th_domain: "Detected Domain",
        settings_info_title: "PGuard System Specifications",
        settings_info_desc: "Core parameters of the currently running system.",
        settings_title: "⚙️ Agent Operation & Security Settings",
        settings_desc: "Configure the idle threshold, active window scan interval, and data transmission interval for connected agents.",
        label_idle_threshold: "⏱ Away Detection Threshold",
        desc_idle_threshold: "Idle time threshold before away state is detected (1 min ~ 60 min)",
        label_scan_interval: "🔍 Agent Active Scan Interval",
        desc_scan_interval: "Frequency of monitoring active windows and keyboard/mouse states (1 sec ~ 300 sec)",
        label_send_interval: "📡 Agent Server Sync Interval",
        desc_send_interval: "Frequency of bulk uploading collected activity logs to backend (10 sec ~ 3600 sec)",
        label_agent_token: "🔑 Agent API Token",
        desc_agent_token: "Company authentication token to paste into the agent setup GUI (or config.json) API token field.",
        btn_regen_token: "Regenerate Token",
        regen_token_success: "Token has been regenerated. Update config.json on all connected agents.",
        unit_min: "min",
        unit_sec: "sec",
        btn_save_settings: "Save Settings",
        set_agent_interval: "Agent Scan Interval",
        set_send_interval: "Agent Sync Interval",
        set_server_port: "Express API Port",
        set_db_engine: "Database Engine",
        settings_reset_title: "Database Management (Danger Zone)",
        settings_reset_desc: "Purge or completely reset accumulated tracking logs.",
        settings_reset_warning: "⚠️ WARNING: This will permanently delete all tracking history, desktop logs, and domain activities. This action is irreversible.",
        btn_reset_db: "Completely Factory Reset Database",
        status_online: "Online",
        status_away: "Away",
        category_work: "Work",
        category_nonwork: "Non-work Warning",
        no_data_desc: "No activity data collected yet. Please launch the desktop PC Agent first.",
        login_subtitle: "Admin authentication required for security monitoring.",
        login_company_code: "Company Code",
        th_company: "Company",
        login_username: "Admin Username",
        login_password: "Password",
        login_btn: "Authenticate & Log In",
                settings_security_title: "Security & Association Settings",
        settings_security_title_self: "Change My Password",
        settings_security_desc: "Safely modify the company code for agent linkage and admin password.",
        settings_security_desc_self: "Safely change your admin account password.",
        label_company_code: "Company Code",
        label_new_password: "New Admin Password",
        menu_super: "Company Management",
        menu_logout: "Log Out",
        logout_confirm: "Are you sure you want to log out?",
        super_company_title: "Register & Edit Company",
        super_company_desc: "Register a new company or update the name of an existing company.",
        label_super_comp_code: "Company Code",
        label_super_comp_name: "Company Name",
        btn_super_comp_register: "Register Company",
        btn_cancel: "Cancel",
        super_admin_title: "Create Company Admin Account",
        super_admin_desc: "Create an independent admin account belonging to a specific company.",
        label_super_admin_comp: "Select Company",
        label_super_admin_id: "Admin ID",
        label_super_admin_pw: "Temporary Password",
        btn_super_admin_create: "Create Admin Account",
        super_company_table_title: "Company List Management",
        super_company_table_desc: "List of all registered companies. Deletion permanently erases employees and tracking logs.",
        th_company_code: "Company Code",
        th_company_name: "Company Name",
        th_created_at: "Registered Date",
        th_action: "Actions",
        super_admin_table_title: "Company Admin Account Management",
        super_admin_table_desc: "List of admin accounts by registered company.",
        th_super_admin_id: "Admin ID",
        th_super_admin_comp: "Belongs To",
        btn_edit: "Edit",
        btn_delete: "Delete",
        emp_select_placeholder: "Please select an employee from the list or click the Analyze button.",
        emp_stats_title: "Employee Activity Stats Analysis",
        emp_prod_score: "Productivity Focus Score",
        emp_time_alloc: "Time Allocation Breakdown",
        emp_top_software: "Top Software Used",
        emp_top_domains: "Top Non-work Domains Visited",
        btn_analyze: "Analyze",
        category_idle: "Idle",
        loading_stats: "Loading stats...",
        no_stats_data: "No data collected yet.",
        btn_export_all: "Export All (Excel)",
        btn_export_detail: "Export Stats (Excel)",
        menu_download: "Agent Download",
        download_title: "Download PGuard Agent",
        download_desc: "Download the monitoring agent to install on employee PCs. Please select the correct version for your OS.",
        btn_download_win: "Download for Windows",
        btn_download_mac: "Download for Mac",
        err_date_required: "Please select both start and end dates.",
        err_date_limit: "You can download up to 7 days maximum.",
        all_employees: "All Employees",
        duration_total: "Total",
        duration_hours: "h",
        duration_minutes: "m",
        duration_seconds: "s",
        duration_items: "items",
        menu_audit: "Admin Audit Logs",
        audit_title: "Admin Audit Logs",
        audit_desc: "Track all security settings changes and access histories performed by administrators within the system in real time.",
        label_date: "Period:",
        label_action_type: "Action Type:",
        label_admin_user: "Admin ID:",
        all_actions: "All Actions",
        act_login_success: "Login Success",
        act_login_failure: "Login Failure",
        act_logout: "Logout",
        act_company_settings: "Idle Settings Changed",
        act_message_send: "Message Sent",
        act_category_update: "Category Modified",
        act_reset_data: "Logs Reset",
        act_sub_admin_create: "Sub-Admin Created",
        act_sub_admin_delete: "Sub-Admin Deleted",
        act_company_create: "Company Registered",
        act_company_edit: "Company Modified",
        act_company_delete: "Company Deleted",
        act_admin_create: "Admin Created",
        act_admin_delete: "Admin Deleted",
        act_settings_update: "Admin Info Changed",
        search_admin_id_placeholder: "Search ID...",
        th_timestamp: "Timestamp",
        th_admin_username: "Admin ID",
        th_action_type: "Action Type",
        th_details: "Action Details",
        th_ip_address: "IP Address",
        menu_patterns: "Pattern Management",
        mode_admin: "Admin Mode",
        mode_employee: "Employee Mode",
        menu_approval_admin: "Approval Admin",
        menu_approval_user: "My Approvals",
        navgrp_monitoring: "Monitoring", navgrp_approval: "Approval", navgrp_admin: "Admin", menu_employee_mgmt: "Employees", menu_org_chart: "Org Chart", org_desc: "Build a tree of groups/teams and assign employees. Links to approval lines and KPI.", org_add_top: "Add Top-level Unit", org_add_child: "Add Child", org_company_root: "Company Root", org_empty: "No units yet. Start with Add Top-level Unit.", org_type_group: "Group", org_type_team: "Team", org_type_group_short: "Group", org_type_team_short: "Team", org_emp_unit: "", org_name: "Unit Name", org_type: "Type", org_parent: "Parent Unit", org_root_option: "(Top-level - under company)", org_add_title: "Add Unit", org_edit_title: "Edit Unit", org_err_name: "Please enter a unit name.", org_confirm_delete: "Delete this unit? Assigned employees become unassigned.", org_delete_failed: "Failed to delete unit: ", org_add_failed: "Failed to add unit: ", org_update_failed: "Failed to update unit: ", org_unassigned: "(Unassigned)", emp_form_org: "Organization (Team/Group)", th_emp_org: "Organization", emp_mgmt_desc: "Manage employee info, login accounts, and privileges in one place.",
        approval_admin_title: "Approval Administration",
        approval_admin_desc: "Manage approval documents, templates, employee login accounts, and translation settings.",
        approval_user_title: "My Approvals",
        approval_user_desc: "Create approval documents and track those you submitted or need to approve.",
        approval_pill_pending: "Pending",
        approval_pill_all: "All Documents",
        approval_pill_templates: "Templates",
        approval_pill_accounts: "Employees",
        approval_pill_settings: "Settings",
        approval_pill_new: "New Document",
        approval_pill_mine: "My Submissions",
        approval_pill_todo: "To Approve",
        approval_pill_cc: "CC'd Documents",
        approval_coming_soon: "Electronic approval is under construction. (Coming in Phase 2+)",
        role_normal_employee: "Employee",
        role_sub_admin: "Sub Admin",
        role_employee_manager: "Employee Manager",
        account_active: "Active",
        account_inactive: "Inactive",
        account_create: "Create Account",
        account_reset: "Reset Account",
        account_disable: "Disable Login",
        account_help: "Create employee login accounts and grant management privileges (Sub Admin / Employee Manager) to selected employees. The top admin role is never granted.",
        account_saved: "Employee login account saved.",
        account_save_failed: "Failed to save account: ",
        account_disable_failed: "Failed to disable login: ",
        role_update_failed: "Failed to update role: ",
        confirm_disable: "Disable this employee's login? (Any granted management privileges will also be revoked)",
        prompt_login_id: "Enter login ID",
        prompt_password: "Enter password (min 4 chars)",
        err_login_id_required: "Login ID is required.",
        err_password_short: "Password must be at least 4 characters.",
        loading_text: "Loading...",
        no_employees: "No employees.",
        th_emp_name: "Name",
        th_emp_id: "Emp. ID",
        th_company: "Company",
        th_login_id: "Login ID",
        th_login_status: "Login Status",
        th_admin_role: "Privilege",
        th_actions: "Actions",
        emp_add: "Add Employee", emp_edit_title: "Edit Employee", emp_form_tags: "Tags (dept, comma-separated · optional)", emp_edit: "Edit", emp_delete: "Delete", th_emp_tags: "Tags",
        emp_manage_help: "Add, edit, and delete employees, create login accounts, and grant management roles (Sub Admin / Employee Manager). The top admin role is never granted.",
        prompt_emp_id: "Enter employee ID", prompt_emp_name: "Enter employee name", prompt_emp_tags: "Tags (dept, comma-separated, optional)",
        err_emp_id_required: "Employee ID is required.", err_emp_name_required: "Name is required.",
        emp_added: "Employee added.", emp_add_failed: "Failed to add employee: ", emp_updated: "Employee updated.", emp_update_failed: "Failed to update employee: ",
        emp_confirm_delete: "Delete this employee? Activity logs may also be removed.", emp_delete_failed: "Failed to delete employee: ",
        btn_edit: "Edit",
        btn_delete: "Delete",
        btn_save: "Save",
        btn_cancel: "Cancel",
        tpl_new: "New Template",
        tpl_new_title: "New Template",
        tpl_edit_title: "Edit Template",
        tpl_list_desc: "Create and manage approval form templates. Users pick one when drafting a document.",
        tpl_th_title: "Form Name",
        tpl_th_category: "Category",
        tpl_th_fields: "Fields",
        tpl_th_updated: "Updated",
        tpl_fields_unit: "fields",
        tpl_empty: "No templates yet.",
        tpl_fields_title: "Input Fields (Body)",
        tpl_add_field: "Add Field",
        tpl_no_fields: "No fields. Use 'Add Field' to create one.",
        tpl_label_ko: "Label (Korean)",
        tpl_field_key: "Key (identifier, optional)",
        tpl_field_type: "Type",
        tpl_options: "Options (comma-separated)",
        tpl_line_approval: "Default Approval Line (sequential)",
        tpl_line_agreement: "Default Agreement Line (parallel)",
        tpl_line_cc: "Default CC Line",
        tpl_line_empty: "Not set",
        tpl_no_participants: "No available targets",
        tpl_saved: "Template saved.",
        tpl_save_failed: "Failed to save template: ",
        tpl_delete_failed: "Failed to delete template: ",
        tpl_confirm_delete: "Delete this template?",
        tpl_err_title: "Please enter a form name.",
        p_admin: "Admin",
        p_employee: "Employee",
        cat_general: "General", cat_leave: "Leave", cat_expense: "Expense", cat_purchase: "Purchase",
        cat_report: "Report", cat_hr: "HR", cat_it_request: "IT Request", cat_other: "Other",
        ftype_text: "Text", ftype_textarea: "Textarea", ftype_number: "Number", ftype_date: "Date", ftype_select: "Select",
        st_draft: "Draft", st_submitted: "Submitted", st_in_review: "In Review", st_approved: "Approved", st_rejected: "Rejected", st_withdrawn: "Withdrawn",
        pr_low: "Low", pr_normal: "Normal", pr_high: "High", pr_urgent: "Urgent",
        ls_pending: "Pending", ls_current: "In Progress", ls_approved: "Done", ls_rejected: "Rejected", ls_skipped: "Skipped",
        viz_approval: "Approval Line (sequential)", viz_agreement: "Agreement Line (parallel)", viz_cc: "CC (read)",
        act_approve: "Approve", act_reject: "Reject", act_agree: "Agree", act_withdraw: "Withdraw", act_edit_draft: "Continue Editing", act_submit: "Submit",
        act_ap_created: "Created", act_ap_submitted: "Submitted", act_ap_approved: "Approved", act_ap_rejected: "Rejected", act_ap_agreed: "Agreed", act_ap_withdrawn: "Withdrawn", act_ap_read: "Viewed", act_ap_updated: "Updated", act_ap_completed: "Final approval complete",
        comment_optional: "Comment (optional)", reject_reason_ph: "Enter rejection reason", reject_reason_req: "Rejection reason is required.",
        confirm_withdraw: "Withdraw this document?", confirm_submit: "Submit this document?",
        doc_th_number: "Doc No.", doc_th_title: "Title", doc_th_status: "Status", doc_th_drafter: "Drafter", doc_th_date: "Date", doc_th_read: "Read",
        doc_empty: "No documents.", doc_search: "Search title/doc no.", all_status: "All statuses", cc_read: "Read", cc_unread: "Unread",
        doc_no_body: "No body content.", doc_body: "Document Body", doc_reject_reason: "Rejection Reason", doc_timeline: "Activity Log",
        doc_select_template: "Select template (or free form)", doc_form_template: "Template", doc_form_priority: "Priority", doc_free_form: "Free form. Select a template to show fields.",
        doc_submit: "Submit", doc_save_draft: "Save Draft", doc_reset: "Reset", doc_submitted: "Document submitted.", doc_drafted: "Saved as draft.", doc_save_failed: "Save failed: ",
        doc_err_title: "Please enter a title.", doc_err_line: "To submit, add at least one approver or agreement participant.", act_failed: "Action failed: ",
        approval_settings_soon: "Approval settings (translation) come in Phase 6.",
        doc_attachments: "Attachments", doc_add_file: "Add File", doc_no_files: "No attachments.",
        doc_file_hint: "Max 20MB per file · docs/images/PDF", doc_file_pending: "uploads on save",
        doc_confirm_del_file: "Delete this attachment?", doc_download_fail: "Download failed: ", doc_file_fail: "Attach failed: ",
        doc_export_excel: "Export Excel",
        set_lt_url: "LibreTranslate Server URL", set_test: "Test", set_lt_key: "API Key (optional)", set_targets: "Target Languages",
        set_auto: "Auto-translate on submit", set_auto_desc: "Translate automatically when a document is submitted.", set_prefix: "Doc Number Prefix",
        set_testing: "Testing...", set_ok: "Connected", set_saved: "Approval settings saved.", set_save_failed: "Failed to save settings: ",
        trans_original: "Original", trans_run: "Translate", trans_running: "Translating...", trans_failed: "Translation failed: ",
        tab_patterns_title: "🧩 Auto-Classification Patterns",
        tab_patterns_desc: "Configure classification rules to automatically divide logs into work or non-work based on processes, domains, or window titles.",
        th_pattern_type: "Pattern Type",
        th_pattern_value: "Match Word",
        th_pattern_category: "Classification",
        option_process: "Process Name (EXE)",
        option_domain: "Detected Domain (Website)",
        option_title: "Active Title (Window Title)",
        btn_register: "Register",
        confirm_pattern_delete: "Are you sure you want to delete this classification pattern?",
        act_pattern_create: "Classification Pattern Registered",
        act_pattern_delete: "Classification Pattern Deleted",
        menu_idlelogs: "Away Logs",
        idlelog_tab_title: "Away Activity Logs",
        idlelog_tab_desc: "Detection history of employee away times. Click the 'Change to Work' button to reclassify a time period as work.",
        btn_change_to_work: "Change to Work",
        prompt_delete_emp: "Are you sure you want to permanently delete this employee's account and all data?\nAll data, including their activity history (logs), will be irreversibly deleted.",
        prompt_work_reason: "Do you want to change this away time to work state?\nPlease enter the reason for this change:",
        kpi_idle_time: "Today's Total Away Time",
        kpi_idle_desc: "Agent away detection time",
        label_emp_tags: "Employee Tags",
        th_emp_tags: "Tags",
        role_sub_admin: "Sub-admin",
        role_employee_manager: "Employee Manager",
        placeholder_login_company_code: "Enter company code",
        placeholder_login_username: "Enter admin username",
        placeholder_login_password: "Enter password",
        login_error_msg: "Invalid username or password.",
        tz_seoul: "🕒 Korea/Seoul Time",
        tz_vientiane: "🕒 Laos/Vientiane Time",
        lbl_first_seen: "First Connection",
        lbl_emp_id: "Employee ID",
        btn_send_message: "Send Message",
        status_offline: "Offline",
        menu_send_agent_message: "📢 Send Agent Message",
        desc_send_agent_message: "Send popup messages to individual or all employee PC screens.",
        btn_send_all_employees: "Send to All Employees",
        msg_no_agents_connected: "When agents connect in the Employee Status tab, the list will appear here.",
        btn_send: "Message",
        msg_recipient: "Recipient",
        err_enter_message: "Please enter the message content.",
        btn_sending: "Sending...",
        msg_sent_success: "Message sent successfully.",
        msg_sent_all: "Message sent to all employees. (Will be received on next agent poll)",
        err_send_failed: "Sending error: ",
        btn_send_submit: "Send",
        label_message_content: "Message Content",
        placeholder_message_content: "Enter the message to display on the PC screen...",
        placeholder_enter_company_code: "Enter company code.",
        placeholder_new_password_help: "Enter only if you want to change it.",
        placeholder_admin_id: "Admin ID",
        placeholder_temp_password: "Temporary Password",
        placeholder_managed_tags: "Employee tags to manage (separated by comma)",
        confirm_delete_subadmin: "Are you sure you want to delete this sub-admin?",
        download_win_desc: "Supports Windows 10/11 or higher. Double-click to run immediately without installation.",
        download_mac_desc: "Supports macOS environment. Double-click after download to automatically install and register daemon."
    },
    th: {
        sidebar_subtitle: "ระบบติดตามกิจกรรม",
        menu_overview: "ภาพรวมแดชบอร์ด",
        menu_employees: "สถานะพนักงาน",
        menu_violations: "บันทึกการละเมิดนอกงาน",
        menu_worklogs: "บันทึกการทำงาน",
        menu_settings: "การตั้งค่าแดชบอร์ด",
        header_tag: "OVERVIEW",
        header_title: "แดชบอร์ดประสิทธิภาพเรียลไทม์",
        header_desc: "แสดงภาพการใช้งานซอฟต์แวร์ของพนักงานและบันทึกกิจกรรมนอกเหนือจากงาน",
        btn_refresh: "รีเฟรช",
        status_polling: "ระบบโพลเรียลไทม์ เปิด",
        kpi_total_employees: "พนักงานที่ดูแลทั้งหมด",
        kpi_monitoring_active: "เปิดใช้งานระบบการติดตาม",
        kpi_active_employees: "พนักงานที่ออนไลน์ขณะนี้",
        kpi_active_desc: "ตรวจพบสัญญาณการใช้งานเมาส์/คีย์บอร์ด",
        kpi_nonwork_time: "เวลาเข้าเว็บนอกงานวันนี้",
        kpi_nonwork_desc: "YouTube / เว็บตูน / แหล่งช็อปปิ้ง ฯลฯ",
        kpi_productivity: "ระดับความจดจ่อเฉลี่ย",
        kpi_prod_desc: "สัดส่วนงานจริงเมื่อเทียบกับเวลาทำงานทั้งหมด",
        chart_category_title: "สัดส่วนการแบ่งเวลาทำงาน",
        chart_category_desc: "อัตราส่วนสะสมของ งาน, นอกงาน, และการไม่อยู่หน้าจอ",
        legend_work: "งาน (Work)",
        legend_nonwork: "นอกงาน (Non-work)",
        legend_idle: "ไม่อยู่หน้าจอ (Idle)",
        chart_program_title: "ส่วนแบ่งการใช้งานซอฟต์แวร์",
        chart_program_desc: "5 อันดับซอฟต์แวร์ที่มีการใช้งานสูงสุด",
        panel_realtime_title: "สถานะกิจกรรมพีซีเรียลไทม์",
        panel_realtime_desc: "สัญญาณจากเอเจนต์ที่กำลังทำงานอยู่ขณะนี้",
        panel_leaderboard_title: "อันดับเว็บไซต์นอกงาน",
        panel_leaderboard_desc: "โดเมนนอกงานที่มีการเข้าถึงสูงสุด",
        panel_feed_title: "ฟีดบันทึกกิจกรรมโดยละเอียด",
        panel_feed_desc: "บันทึกข้อมูลดิบที่รวบรวมจากเอเจนต์พีซีในเครื่อง",
        filter_nonwork_only: "แสดงเฉพาะการแจ้งเตือนนอกงาน",
        th_time: "เวลา",
        th_name: "ชื่อ (รหัสพนักงาน)",
        th_process: "โปรเซส",
        th_title: "หัวข้อหน้าต่างที่เปิดอยู่",
        th_category: "หมวดหมู่",
        th_duration: "ระยะเวลา",
        emp_tab_title: "ภาพรวมโดยละเอียดของพนักงานที่ได้รับการดูแล",
        emp_tab_desc: "บันทึกการเชื่อมต่อล่าสุดและข้อมูลสะสมของพนักงานที่ลงทะเบียนไว้",
        th_emp_id: "รหัสพนักงาน",
        th_emp_name: "ชื่อพนักงาน",
        th_last_seen: "สัญญาณความเคลื่อนไหวล่าสุด",
        th_emp_status: "สถานะการเชื่อมต่อ",
        violation_tab_title: "บันทึกกิจกรรมนอกงาน",
        violation_tab_desc: "บันทึกกิจกรรมที่จัดว่านอกงาน ผู้ดูแลเปลี่ยนหมวดหมู่ด้วยปุ่มได้",
        worklog_tab_title: "บันทึกกิจกรรมทำงาน",
        worklog_tab_desc: "บันทึกกิจกรรมที่จัดว่างาน ผู้ดูแลเปลี่ยนเป็นนอกงานได้",
        th_idle_reason: "เหตุผล",
        btn_prev: "ก่อนหน้า",
        btn_next: "ถัดไป",
        btn_apply: "นำไปใช้",
        btn_excel_download: "ดาวน์โหลด Excel",
        violation_tab_desc: "กรองและแสดงเฉพาะบันทึกที่มีเว็บไซต์ที่ถูกขึ้นบัญชีดำ",
        th_domain: "โดเมนที่ตรวจพบ",
        settings_info_title: "ข้อมูลสเปกของระบบ PGuard",
        settings_info_desc: "พารามิเตอร์หลักของระบบที่กำลังทำงานอยู่ปัจจุบัน",
        settings_title: "⚙️ การตั้งค่าการทำงานและความปลอดภัยของเอเจนต์",
        settings_desc: "กำหนดเกณฑ์เวลาไม่อยู่หน้าจอ ความถี่ในการสแกนหน้าต่าง และความถี่ในการส่งข้อมูลสำหรับเอเจนต์ที่เชื่อมต่ออยู่",
        label_idle_threshold: "⏱ เกณฑ์เวลาไม่อยู่หน้าจอ",
        desc_idle_threshold: "เกณฑ์เวลาที่ไม่มีการป้อนข้อมูลก่อนที่จะถือว่าไม่อยู่หน้าจอ (1 นาที ~ 60 นาที)",
        label_scan_interval: "🔍 ความถี่ในการสแกนกิจกรรมเอเจนต์",
        desc_scan_interval: "ความถี่ในการตรวจจับหน้าต่างที่ใช้งานและสถานะแป้นพิมพ์/เมาส์ (1 วินาที ~ 300 วินาที)",
        label_send_interval: "📡 ความถี่ในการส่งข้อมูลไปยังเซิร์ฟเวอร์",
        desc_send_interval: "ความถี่ในการส่งบันทึกกิจกรรมสะสมไปยังแบັກเอนด์ (10 วินาที ~ 3600 วินาที)",
        label_agent_token: "🔑 โทเค็นเชื่อมต่อเอเจนต์",
        desc_agent_token: "โทเค็นยืนยันตัวตนของบริษัทที่ต้องวางในช่อง API Token ใน GUI ตั้งค่าเอเจนต์ (หรือ config.json)",
        btn_regen_token: "ออกโทเค็นใหม่",
        regen_token_success: "ออกโทเค็นใหม่แล้ว โปรดอัปเดต config.json ในเอเจนต์ที่เชื่อมต่อทั้งหมด",
        unit_min: "นาที",
        unit_sec: "วินาที",
        btn_save_settings: "บันทึกการตั้งค่า",
        set_agent_interval: "ความถี่ในการสแกนของเอเจนต์",
        set_send_interval: "ความถี่ในการส่งข้อมูลของเอเจนต์",
        set_server_port: "พอร์ต API ของ Express",
        set_db_engine: "เอนจินฐานข้อมูล",
        settings_reset_title: "การจัดการฐานข้อมูล (พื้นที่อันตราย)",
        settings_reset_desc: "ลบหรือล้างฐานข้อมูลประวัติการติดตามกิจกรรมทั้งหมด",
        settings_reset_warning: "⚠️ คำเตือน: การดำเนินการนี้จะลบประวัติการติดตามกิจกรรม บันทึกพีซี และโดเมนทั้งหมดอย่างถาวร ไม่สามารถย้อนคืนค่าข้อมูลได้",
        btn_reset_db: "รีเซ็ตฐานข้อมูลเป็นค่าเริ่มต้นทั้งหมด",
        status_online: "ออนไลน์",
        status_away: "ไม่อยู่หน้าจอ",
        category_work: "งาน",
        category_nonwork: "คำเตือนนอกงาน",
        no_data_desc: "ยังไม่มีข้อมูลกิจกรรมสะสม กรุณาเปิดใช้งานเอเจนต์พีซีก่อน",
        login_subtitle: "จำเป็นต้องตรวจสอบสิทธิ์ผู้ดูแลระบบเพื่อความปลอดภัย",
        login_company_code: "รหัสบริษัท (Company Code)",
        th_company: "บริษัท",
        login_username: "รหัสผู้ดูแลระบบ",
        login_password: "รหัสผ่าน",
        login_btn: "ตรวจสอบสิทธิ์และเข้าสู่ระบบ",
        settings_security_title: "การตั้งค่าความปลอดภัยและการเชื่อมต่อบริษัท",
        settings_security_desc: "แก้ไขรหัสบริษัทเพื่อเชื่อมต่อเอเจนต์และรหัสผ่านผู้ดูแลระบบอย่างปลอดภัย",
        label_company_code: "รหัสบริษัท (Company Code)",
        label_new_password: "รหัสผ่านใหม่ผู้ดูแลระบบ",
        btn_save_settings: "บันทึกการตั้งค่า",
        menu_super: "การจัดการบริษัท",
        menu_logout: "ออกจากระบบ",
        logout_confirm: "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
        super_company_title: "ลงทะเบียนและแก้ไขบริษัท",
        super_company_desc: "ลงทะเบียนบริษัทใหม่หรืออัปเดตชื่อบริษัทที่มีอยู่",
        label_super_comp_code: "รหัสบริษัท",
        label_super_comp_name: "ชื่อบริษัท",
        btn_super_comp_register: "ลงทะเบียนบริษัท",
        btn_cancel: "ยกเลิก",
        super_admin_title: "สร้างบัญชีผู้ดูแลระบบบริษัท",
        super_admin_desc: "สร้างบัญชีผู้ดูแลระบบอิสระที่เป็นของบริษัทเฉพาะ",
        label_super_admin_comp: "เลือกบริษัท",
        label_super_admin_id: "รหัสผู้ดูแลระบบ",
        label_super_admin_pw: "รหัสผ่านชั่วคราว",
        btn_super_admin_create: "สร้างบัญชีผู้ดูแลระบบ",
        super_company_table_title: "การจัดการรายชื่อบริษัท",
        super_company_table_desc: "รายชื่อบริษัทที่ลงทะเบียนทั้งหมด การลบจะลบพนักงานและบันทึกการติดตามอย่างถาวร",
        th_company_code: "รหัสบริษัท",
        th_company_name: "ชื่อบริษัท",
        th_created_at: "วันที่ลงทะเบียน",
        th_action: "การดำเนินการ",
        super_admin_table_title: "การจัดการบัญชีผู้ดูแลระบบบริษัท",
        super_admin_table_desc: "รายชื่อบัญชีผู้ดูแลระบบตามบริษัทที่ลงทะเบียน",
        th_super_admin_id: "รหัสผู้ดูแลระบบ",
        th_super_admin_comp: "สังกัดบริษัท",
        btn_edit: "แก้ไข",
        btn_delete: "ลบ",
        emp_select_placeholder: "โปรดเลือกพนักงานจากรายการหรือคลิกปุ่มวิเคราะห์",
        emp_stats_title: "การวิเคราะห์สถิติกิจกรรมพนักงาน",
        emp_prod_score: "ระดับความจดจ่อ (Focus Score)",
        emp_time_alloc: "สัดส่วนการแบ่งเวลาทำงาน",
        emp_top_software: "ซอฟต์แวร์ที่ใช้งานสูงสุด",
        emp_top_domains: "โดเมนนอกงานที่มีการเข้าถึงสูงสุด",
        th_action: "การดำเนินการ",
        btn_analyze: "วิเคราะห์",
        category_idle: "ไม่อยู่หน้าจอ",
        loading_stats: "กำลังโหลดสถิติ...",
        no_stats_data: "ยังไม่มีข้อมูลที่รวบรวม",
        btn_export_all: "ส่งออกสรุปทั้งหมด (Excel)",
        btn_export_detail: "ส่งออกสถิติของพนักงานนี้ (Excel)",
        menu_download: "ดาวน์โหลดตัวแทน",
        download_title: "ดาวน์โหลด PGuard Agent",
        download_desc: "ดาวน์โหลดตัวแทนการตรวจสอบเพื่อติดตั้งบนพีซีของพนักงาน โปรดเลือกรุ่นที่ถูกต้องสำหรับระบบปฏิบัติการของคุณ",
        btn_download_win: "ดาวน์โหลดสำหรับ Windows",
        btn_download_mac: "ดาวน์โหลดสำหรับ Mac",
        err_date_required: "กรุณาเลือกทั้งวันที่เริ่มต้นและสิ้นสุด",
        err_date_limit: "คุณสามารถดาวน์โหลดได้สูงสุด 7 วันเท่านั้น",
        all_employees: "พนักงานทั้งหมด",
        duration_total: "รวม",
        duration_hours: "ชม.",
        duration_minutes: "นาที",
        duration_seconds: "วินาที",
        duration_items: "รายการ",
        menu_audit: "บันทึกกิจกรรมผู้ดูแลระบบ",
        audit_title: "บันทึกกิจกรรมผู้ดูแลระบบ",
        audit_desc: "ติดตามการเปลี่ยนแปลงการตั้งค่าความปลอดภัยและประวัติการเข้าใช้ทั้งหมดที่ดำเนินการโดยผู้ดูแลระบบแบบเรียลไทม์",
        label_date: "ระยะเวลา:",
        label_action_type: "ประเภทกิจกรรม:",
        label_admin_user: "ID ผู้ดูแลระบบ:",
        all_actions: "กิจกรรมทั้งหมด",
        act_login_success: "เข้าสู่ระบบสำเร็จ",
        act_login_failure: "เข้าสู่ระบบล้มเหลว",
        act_logout: "ออกจากระบบ",
        act_company_settings: "เปลี่ยนค่าเวลาไม่อยู่",
        act_message_send: "ส่งข้อความหาเอเจนต์",
        act_category_update: "แก้ไขประเภทกิจกรรม",
        act_reset_data: "ล้างข้อมูลบันทึกกิจกรรม",
        act_sub_admin_create: "สร้างผู้ดูแลระบบย่อย",
        act_sub_admin_delete: "ลบผู้ดูแลระบบย่อย",
        act_company_create: "ลงทะเบียนบริษัท",
        act_company_edit: "แก้ไขชื่อบริษัท",
        act_company_delete: "ลบบริษัทถาวร",
        act_admin_create: "สร้างผู้ดูแลระบบบริษัท",
        act_admin_delete: "ลบผู้ดูแลระบบบริษัท",
        act_settings_update: "เปลี่ยนข้อมูลผู้ดูแลระบบ",
        search_admin_id_placeholder: "ค้นหา ID...",
        th_timestamp: "เวลาที่เกิด",
        th_admin_username: "ID ผู้ดูแลระบบ",
        th_action_type: "ประเภทกิจกรรม",
        th_details: "รายละเอียดการทำงาน",
        th_ip_address: "ที่อยู่ IP",
        menu_patterns: "การจัดการรูปแบบ",
        mode_admin: "โหมดผู้ดูแล",
        mode_employee: "โหมดพนักงาน",
        menu_approval_admin: "จัดการอนุมัติ",
        menu_approval_user: "การอนุมัติของฉัน",
        navgrp_monitoring: "การติดตาม", navgrp_approval: "การอนุมัติ", navgrp_admin: "จัดการ", menu_employee_mgmt: "จัดการพนักงาน", menu_org_chart: "ผังองค์กร", org_desc: "สร้างต้นไม้กลุ่ม/ทีมและมอบหมายพนักงาน เชื่อมกับสายอนุมัติและ KPI", org_add_top: "เพิ่มหน่วยระดับบนสุด", org_add_child: "เพิ่มหน่วยย่อย", org_company_root: "ระดับบริษัท", org_empty: "ยังไม่มีหน่วยงาน เริ่มด้วยเพิ่มหน่วยระดับบนสุด", org_type_group: "กลุ่ม", org_type_team: "ทีม", org_type_group_short: "กลุ่ม", org_type_team_short: "ทีม", org_emp_unit: "คน", org_name: "ชื่อหน่วยงาน", org_type: "ประเภท", org_parent: "หน่วยงานแม่", org_root_option: "(ระดับบนสุด - ขึ้นตรงบริษัท)", org_add_title: "เพิ่มหน่วยงาน", org_edit_title: "แก้ไขหน่วยงาน", org_err_name: "กรุณากรอกชื่อหน่วยงาน", org_confirm_delete: "ลบหน่วยงานนี้หรือไม่? พนักงานที่มอบหมายจะกลายเป็นไม่ได้มอบหมาย", org_delete_failed: "ลบหน่วยงานไม่สำเร็จ: ", org_add_failed: "เพิ่มหน่วยงานไม่สำเร็จ: ", org_update_failed: "แก้ไขหน่วยงานไม่สำเร็จ: ", org_unassigned: "(ไม่ได้มอบหมาย)", emp_form_org: "องค์กร (ทีม/กลุ่ม)", th_emp_org: "องค์กร", emp_mgmt_desc: "จัดการข้อมูลพนักงาน บัญชีเข้าสู่ระบบ และสิทธิ์ในที่เดียว",
        approval_admin_title: "การจัดการเอกสารอนุมัติ",
        approval_admin_desc: "จัดการเอกสารอนุมัติ แม่แบบ บัญชีเข้าสู่ระบบพนักงาน และการตั้งค่าการแปล",
        approval_user_title: "การอนุมัติของฉัน",
        approval_user_desc: "สร้างเอกสารอนุมัติและติดตามเอกสารที่คุณส่งหรือต้องอนุมัติ",
        approval_pill_pending: "รอดำเนินการ",
        approval_pill_all: "เอกสารทั้งหมด",
        approval_pill_templates: "แม่แบบ",
        approval_pill_accounts: "จัดการพนักงาน",
        approval_pill_settings: "ตั้งค่า",
        approval_pill_new: "สร้างเอกสารใหม่",
        approval_pill_mine: "เอกสารที่ฉันส่ง",
        approval_pill_todo: "รออนุมัติ",
        approval_pill_cc: "เอกสารอ้างอิง",
        approval_coming_soon: "ระบบอนุมัติอิเล็กทรอนิกส์กำลังอยู่ระหว่างการพัฒนา (เร็วๆ นี้ใน Phase 2+)",
        role_normal_employee: "พนักงาน",
        role_sub_admin: "ผู้ดูแลรอง",
        role_employee_manager: "ผู้จัดการพนักงาน",
        account_active: "ใช้งาน",
        account_inactive: "ปิดใช้งาน",
        account_create: "สร้างบัญชี",
        account_reset: "รีเซ็ตบัญชี",
        account_disable: "ปิดการเข้าสู่ระบบ",
        account_help: "สร้างบัญชีเข้าสู่ระบบของพนักงานและมอบสิทธิ์การจัดการ (ผู้ดูแลรอง / ผู้จัดการพนักงาน) ให้พนักงานที่เลือก สิทธิ์ผู้ดูแลสูงสุดจะไม่ถูกมอบให้",
        account_saved: "บันทึกบัญชีเข้าสู่ระบบของพนักงานแล้ว",
        account_save_failed: "บันทึกบัญชีไม่สำเร็จ: ",
        account_disable_failed: "ปิดการเข้าสู่ระบบไม่สำเร็จ: ",
        role_update_failed: "อัปเดตสิทธิ์ไม่สำเร็จ: ",
        confirm_disable: "ปิดการเข้าสู่ระบบของพนักงานนี้หรือไม่? (สิทธิ์การจัดการที่มอบไว้จะถูกเพิกถอนด้วย)",
        prompt_login_id: "กรอกรหัสเข้าสู่ระบบ",
        prompt_password: "กรอกรหัสผ่าน (อย่างน้อย 4 ตัว)",
        err_login_id_required: "จำเป็นต้องมีรหัสเข้าสู่ระบบ",
        err_password_short: "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร",
        loading_text: "กำลังโหลด...",
        no_employees: "ไม่มีพนักงาน",
        th_emp_name: "ชื่อ",
        th_emp_id: "รหัสพนักงาน",
        th_company: "บริษัท",
        th_login_id: "รหัสเข้าสู่ระบบ",
        th_login_status: "สถานะเข้าสู่ระบบ",
        th_admin_role: "สิทธิ์",
        th_actions: "การดำเนินการ",
        emp_add: "เพิ่มพนักงาน", emp_edit_title: "แก้ไขข้อมูลพนักงาน", emp_form_tags: "แท็ก (แผนก, คั่นด้วยจุลภาค · ไม่บังคับ)", emp_edit: "แก้ไข", emp_delete: "ลบ", th_emp_tags: "แท็ก",
        emp_manage_help: "เพิ่ม แก้ไข ลบพนักงาน สร้างบัญชีเข้าสู่ระบบ และมอบสิทธิ์การจัดการ (ผู้ดูแลรอง/ผู้จัดการพนักงาน) สิทธิ์ผู้ดูแลสูงสุดจะไม่ถูกมอบให้",
        prompt_emp_id: "กรอกรหัสพนักงาน", prompt_emp_name: "กรอกชื่อพนักงาน", prompt_emp_tags: "แท็ก (แผนก, คั่นด้วยจุลภาค, ไม่บังคับ)",
        err_emp_id_required: "จำเป็นต้องมีรหัสพนักงาน", err_emp_name_required: "จำเป็นต้องมีชื่อ",
        emp_added: "เพิ่มพนักงานแล้ว", emp_add_failed: "เพิ่มพนักงานไม่สำเร็จ: ", emp_updated: "อัปเดตพนักงานแล้ว", emp_update_failed: "อัปเดตพนักงานไม่สำเร็จ: ",
        emp_confirm_delete: "ลบพนักงานนี้หรือไม่? บันทึกกิจกรรมอาจถูกลบด้วย", emp_delete_failed: "ลบพนักงานไม่สำเร็จ: ",
        btn_edit: "แก้ไข",
        btn_delete: "ลบ",
        btn_save: "บันทึก",
        btn_cancel: "ยกเลิก",
        tpl_new: "แม่แบบใหม่",
        tpl_new_title: "แม่แบบใหม่",
        tpl_edit_title: "แก้ไขแม่แบบ",
        tpl_list_desc: "สร้างและจัดการแม่แบบแบบฟอร์มอนุมัติ ผู้ใช้เลือกแม่แบบเมื่อร่างเอกสาร",
        tpl_th_title: "ชื่อแบบฟอร์ม",
        tpl_th_category: "หมวดหมู่",
        tpl_th_fields: "ช่องข้อมูล",
        tpl_th_updated: "อัปเดต",
        tpl_fields_unit: "ช่อง",
        tpl_empty: "ยังไม่มีแม่แบบ",
        tpl_fields_title: "ช่องกรอกข้อมูล (เนื้อหา)",
        tpl_add_field: "เพิ่มช่อง",
        tpl_no_fields: "ไม่มีช่องข้อมูล กด 'เพิ่มช่อง' เพื่อสร้าง",
        tpl_label_ko: "ป้ายกำกับ (เกาหลี)",
        tpl_field_key: "คีย์ (ตัวระบุ, ไม่บังคับ)",
        tpl_field_type: "ประเภท",
        tpl_options: "ตัวเลือก (คั่นด้วยจุลภาค)",
        tpl_line_approval: "สายอนุมัติเริ่มต้น (ตามลำดับ)",
        tpl_line_agreement: "สายเห็นชอบเริ่มต้น (ขนาน)",
        tpl_line_cc: "สายอ้างอิงเริ่มต้น",
        tpl_line_empty: "ไม่ได้กำหนด",
        tpl_no_participants: "ไม่มีเป้าหมายที่เพิ่มได้",
        tpl_saved: "บันทึกแม่แบบแล้ว",
        tpl_save_failed: "บันทึกแม่แบบไม่สำเร็จ: ",
        tpl_delete_failed: "ลบแม่แบบไม่สำเร็จ: ",
        tpl_confirm_delete: "ลบแม่แบบนี้หรือไม่?",
        tpl_err_title: "กรุณากรอกชื่อแบบฟอร์ม",
        p_admin: "ผู้ดูแล",
        p_employee: "พนักงาน",
        cat_general: "ทั่วไป", cat_leave: "ลา", cat_expense: "ค่าใช้จ่าย", cat_purchase: "จัดซื้อ",
        cat_report: "รายงาน", cat_hr: "บุคคล", cat_it_request: "คำขอไอที", cat_other: "อื่นๆ",
        ftype_text: "ข้อความบรรทัดเดียว", ftype_textarea: "ข้อความหลายบรรทัด", ftype_number: "ตัวเลข", ftype_date: "วันที่", ftype_select: "ตัวเลือก",
        st_draft: "ฉบับร่าง", st_submitted: "ส่งแล้ว", st_in_review: "กำลังอนุมัติ", st_approved: "อนุมัติแล้ว", st_rejected: "ปฏิเสธ", st_withdrawn: "ถอนคืน",
        pr_low: "ต่ำ", pr_normal: "ปกติ", pr_high: "สูง", pr_urgent: "ด่วน",
        ls_pending: "รอ", ls_current: "กำลังดำเนินการ", ls_approved: "เสร็จ", ls_rejected: "ปฏิเสธ", ls_skipped: "ข้าม",
        viz_approval: "สายอนุมัติ (ตามลำดับ)", viz_agreement: "สายเห็นชอบ (ขนาน)", viz_cc: "อ้างอิง (อ่าน)",
        act_approve: "อนุมัติ", act_reject: "ปฏิเสธ", act_agree: "เห็นชอบ", act_withdraw: "ถอนคืน", act_edit_draft: "แก้ไขต่อ", act_submit: "ส่ง",
        act_ap_created: "สร้างเอกสาร", act_ap_submitted: "ส่ง", act_ap_approved: "อนุมัติ", act_ap_rejected: "ปฏิเสธ", act_ap_agreed: "เห็นชอบ", act_ap_withdrawn: "ถอนคืน", act_ap_read: "เปิดอ่าน", act_ap_updated: "แก้ไข", act_ap_completed: "อนุมัติขั้นสุดท้ายเสร็จ",
        comment_optional: "ความเห็น (ไม่บังคับ)", reject_reason_ph: "กรอกเหตุผลการปฏิเสธ", reject_reason_req: "ต้องระบุเหตุผลการปฏิเสธ",
        confirm_withdraw: "ถอนคืนเอกสารนี้หรือไม่?", confirm_submit: "ส่งเอกสารนี้หรือไม่?",
        doc_th_number: "เลขที่", doc_th_title: "หัวข้อ", doc_th_status: "สถานะ", doc_th_drafter: "ผู้ร่าง", doc_th_date: "วันที่", doc_th_read: "อ่าน",
        doc_empty: "ไม่มีเอกสาร", doc_search: "ค้นหาหัวข้อ/เลขที่", all_status: "ทุกสถานะ", cc_read: "อ่านแล้ว", cc_unread: "ยังไม่อ่าน",
        doc_no_body: "ไม่มีเนื้อหา", doc_body: "เนื้อหาเอกสาร", doc_reject_reason: "เหตุผลการปฏิเสธ", doc_timeline: "ประวัติกิจกรรม",
        doc_select_template: "เลือกแม่แบบ (หรือฟอร์มอิสระ)", doc_form_template: "แม่แบบ", doc_form_priority: "ความสำคัญ", doc_free_form: "ฟอร์มอิสระ เลือกแม่แบบเพื่อแสดงช่องข้อมูล",
        doc_submit: "ส่ง", doc_save_draft: "บันทึกร่าง", doc_reset: "รีเซ็ต", doc_submitted: "ส่งเอกสารแล้ว", doc_drafted: "บันทึกเป็นร่างแล้ว", doc_save_failed: "บันทึกไม่สำเร็จ: ",
        doc_err_title: "กรุณากรอกหัวข้อ", doc_err_line: "ต้องเพิ่มผู้อนุมัติหรือผู้เห็นชอบอย่างน้อย 1 คนเพื่อส่ง", act_failed: "ดำเนินการไม่สำเร็จ: ",
        approval_settings_soon: "การตั้งค่าอนุมัติ (การแปล) จะมาใน Phase 6",
        doc_attachments: "ไฟล์แนบ", doc_add_file: "เพิ่มไฟล์", doc_no_files: "ไม่มีไฟล์แนบ",
        doc_file_hint: "สูงสุด 20MB ต่อไฟล์ · เอกสาร/รูปภาพ/PDF", doc_file_pending: "อัปโหลดเมื่อบันทึก",
        doc_confirm_del_file: "ลบไฟล์แนบนี้หรือไม่?", doc_download_fail: "ดาวน์โหลดไม่สำเร็จ: ", doc_file_fail: "แนบไฟล์ไม่สำเร็จ: ",
        doc_export_excel: "ส่งออก Excel",
        set_lt_url: "URL เซิร์ฟเวอร์ LibreTranslate", set_test: "ทดสอบการเชื่อมต่อ", set_lt_key: "API Key (ไม่บังคับ)", set_targets: "ภาษาปลายทาง",
        set_auto: "แปลอัตโนมัติเมื่อส่ง", set_auto_desc: "แปลโดยอัตโนมัติเมื่อส่งเอกสาร", set_prefix: "คำนำหน้าเลขที่เอกสาร",
        set_testing: "กำลังทดสอบ...", set_ok: "เชื่อมต่อสำเร็จ", set_saved: "บันทึกการตั้งค่าแล้ว", set_save_failed: "บันทึกการตั้งค่าไม่สำเร็จ: ",
        trans_original: "ต้นฉบับ", trans_run: "แปล", trans_running: "กำลังแปล...", trans_failed: "แปลไม่สำเร็จ: ",
        tab_patterns_title: "🧩 การจัดการรูปแบบการจัดหมวดหมู่อัตโนมัติ",
        tab_patterns_desc: "กำหนดกฎเพื่อแยกบันทึกเป็นเรื่องงานหรือนอกงานโดยอัตโนมัติตามชื่อกระบวนการ โดเมน หรือชื่อหน้าต่าง",
        th_pattern_type: "ประเภทรูปแบบ",
        th_pattern_value: "คำที่จับคู่",
        th_pattern_category: "การจัดหมวดหมู่",
        option_process: "ชื่อกระบวนการ (EXE)",
        option_domain: "โดเมนที่ตรวจพบ (เว็บไซต์)",
        option_title: "ชื่อหน้าต่างที่ใช้งาน",
        btn_register: "ลงทะเบียน",
        confirm_pattern_delete: "คุณแน่ใจหรือไม่ว่าต้องการลบรูปแบบการจัดหมวดหมู่นี้?",
        act_pattern_create: "ลงทะเบียนรูปแบบการจัดหมวดหมู่",
        act_pattern_delete: "ลบรูปแบบการจัดหมวดหมู่",
        menu_idlelogs: "บันทึกเวลาที่ไม่อยู่",
        idlelog_tab_title: "บันทึกกิจกรรมการไม่อยู่",
        idlelog_tab_desc: "ประวัติการไม่อยู่ของพนักงาน คลิกปุ่ม 'เปลี่ยนเป็นงาน' เพื่อเปลี่ยนสถานะเวลาช่วงนั้นเป็นการทำงาน",
        btn_change_to_work: "เปลี่ยนเป็นงาน",
        prompt_delete_emp: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลบัญชีของพนักงานรายนี้ทั้งหมดเป็นการถาวร?\nข้อมูลทั้งหมดรวมถึงประวัติกิจกรรม (ล็อก) จะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้",
        prompt_work_reason: "คุณต้องการเปลี่ยนช่วงเวลาที่ไมู่อยู่นี้เป็นสถานะทำงานหรือไม่?\nกรุณากรอกเหตุผลในการเปลี่ยนสถานะ:",
        kpi_idle_time: "เวลาที่ไม่อยู่รวมวันนี้",
        kpi_idle_desc: "เวลาตรวจจับการไม่อยู่ของเอเจนต์",
        label_emp_tags: "แท็กพนักงาน",
        th_emp_tags: "แท็ก",
        role_sub_admin: "ผู้ดูแลระบบย่อย",
        role_employee_manager: "ผู้จัดการพนักงาน",
        placeholder_login_company_code: "กรอกรหัสบริษัท",
        placeholder_login_username: "กรอกชื่อผู้ใช้",
        placeholder_login_password: "กรอกรหัสผ่าน",
        login_error_msg: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        tz_seoul: "🕒 เวลาเกาหลี/โซล",
        tz_vientiane: "🕒 เวลาลาว/เวียงจันทน์",
        lbl_first_seen: "เข้าสู่ระบบครั้งแรก",
        lbl_emp_id: "รหัสพนักงาน",
        btn_send_message: "ส่งข้อความ",
        status_offline: "ออฟไลน์",
        menu_send_agent_message: "📢 ส่งข้อความถึงเอเจนต์",
        desc_send_agent_message: "ส่งข้อความป๊อปอัปไปยังหน้าจอพีซีของพนักงานแต่ละคนหรือทั้งหมด",
        btn_send_all_employees: "ส่งให้พนักงานทั้งหมด",
        msg_no_agents_connected: "เมื่อเอเจนต์เชื่อมต่อในแท็บสถานะพนักงาน รายชื่อจะแสดงที่นี่",
        btn_send: "ข้อความ",
        msg_recipient: "ผู้รับ",
        err_enter_message: "กรุณากรอกข้อความ",
        btn_sending: "กำลังส่ง...",
        msg_sent_success: "ส่งข้อความสำเร็จแล้ว",
        msg_sent_all: "ส่งข้อความถึงพนักงานทุกคนแล้ว (จะได้รับเมื่อเอเจนต์โพลครั้งถัดไป)",
        err_send_failed: "ข้อผิดพลาดในการส่ง: ",
        btn_send_submit: "ส่ง",
        label_message_content: "เนื้อหาข้อความ",
        placeholder_message_content: "ป้อนข้อความที่จะแสดงบนหน้าจอพีซี...",
        placeholder_enter_company_code: "กรอกรหัสบริษัท",
        placeholder_new_password_help: "กรอกเฉพาะกรณีที่ต้องการเปลี่ยนเท่านั้น",
        placeholder_admin_id: "ไอดีผู้ดูแลระบบ",
        placeholder_temp_password: "รหัสผ่านชั่วคราว",
        placeholder_managed_tags: "แท็กพนักงานที่จะดูแล (แยกด้วยจุลภาค)",
        confirm_delete_subadmin: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ดูแลระบบย่อยนี้?",
        download_win_desc: "รองรับ Windows 10/11 ขึ้นไป ดับเบิ้ลคลิกเพื่อรันได้ทันทีโดยไม่ต้องติดตั้ง",
        download_mac_desc: "รองรับสภาพแวดล้อม macOS ดับเบิ้ลคลิกหลังจากดาวน์โหลดเพื่อติดตั้งและลงทะเบียนเบื้องหลังโดยอัตโนมัติ"
    },
    lo: {
        sidebar_subtitle: "ລະບົບຕິດຕາມກິດຈະກຳ",
        menu_overview: "ພາບລວມແຜງຄວບຄຸມ",
        menu_employees: "ສະຖານະພະນັກງານ",
        menu_violations: "ບັນທຶກການລະເມີດນອກວຽກ",
        menu_worklogs: "ບັນທຶກການເຮັດວຽກ",
        menu_settings: "ການຕັ້ງຄ່າແຜງຄວບຄຸມ",
        header_tag: "OVERVIEW",
        header_title: "ແຜງຄວບຄຸມປະສິດທິພາບແບບສົດໆ",
        header_desc: "ສະແດງພາບການນຳໃຊ້ຊອບແວຂອງພະນັກງານ ແລະ ບັນທຶກກິດຈະກຳນອກວຽກ.",
        btn_refresh: "ໂຫຼດໃໝ່",
        status_polling: "ລະບົບໂພລແບບສົດໆ ເປີດ",
        kpi_total_employees: "ພະນັກງານທັງໝົດທີ່ຕິດຕາມ",
        kpi_monitoring_active: "ເປີດໃຊ້ລະບົບຕິດຕາມ",
        kpi_active_employees: "ພະນັກງານທີ່ອອນລາຍຕອນນີ້",
        kpi_active_desc: "ກວດພົບການເຄື່ອນໄຫວເມົາສ໌/ຄີບອດ",
        kpi_nonwork_time: "ເວລາເຂົ້າເວັບນອກວຽກມື້ນີ້",
        kpi_nonwork_desc: "YouTube / ເວັບຕູນ / ແຫຼ່ງຊັອບປິ້ງ ແລະ ອື່ນໆ.",
        kpi_productivity: "ຄະແນນຄວາມຕັ້ງໃຈສະເລ່ຍ",
        kpi_prod_desc: "ອັດຕາສ່ວນວຽກຕົວຈິງທຽບກັບເວລາທັງໝົດ",
        chart_category_title: "ອັດຕາສ່ວນການແບ່ງເວລາເຮັດວຽກ",
        chart_category_desc: "ສ່ວນແບ່ງສະສົມຂອງ ວຽກ, ນອກວຽກ, ແລະ ການບໍ່ຢູ່ໜ້າຈໍ",
        legend_work: "ວຽກ (Work)",
        legend_nonwork: "ນອກວຽກ (Non-work)",
        legend_idle: "ບໍ່ຢູ່ໜ້າຈໍ (Idle)",
        chart_program_title: "ສ່ວນແບ່ງການນຳໃຊ້ຊອບແວ",
        chart_program_desc: "5 ອັນດັບຊອບແວທີ່ມີການນຳໃຊ້ສູງສຸດ",
        panel_realtime_title: "ສະຖານະກິດຈະກຳພີຊີແບບສົດໆ",
        panel_realtime_desc: "ສັນຍານຈາກເອເຈນທີ່ກຳລັງເຮັດວຽກຢູ່ຕອນນີ້",
        panel_leaderboard_title: "ອັນດັບເວັບໄຊນອກວຽກ",
        panel_leaderboard_desc: "ໂດເມນນອກວຽກທີ່ມີການເຂົ້າເຖິງສູງສຸດ",
        panel_feed_title: "ຟີດບັນທຶກກິດຈະກຳໂດຍລະອຽດ",
        panel_feed_desc: "ບັນທຶກຂໍ້ມູນດິບທີ່ເກັບກຳມາຈາກເອເຈນພີຊີໃນເຄື່ອງ",
        filter_nonwork_only: "ສະແດงສະເພາະການແຈ້ງເຕືອນນອກວຽກ",
        th_time: "ເວລາ",
        th_name: "ຊື່ (ລະຫັດພະນັກງານ)",
        th_process: "ໂປຣເຊສ",
        th_title: "ຫົວຂໍ້ໜ້າຕ່າງທີ່ເປີດຢູ່",
        th_category: "ໝວດໝູ່",
        th_duration: "ໄລຍະເວລາ",
        emp_tab_title: "ພາບລວມໂດຍລະອຽດຂອງພະນັກງານທີ່ໄດ້ຮັບການເບິ່ງແຍງ",
        emp_tab_desc: "ບັນທຶກການເຊື່ອມຕໍ່ຫຼ້າສຸດ ແລະ ຂໍ້ມູນສະສົມຂອງພະນັກງານທີ່ລົງທະບຽນໄວ້",
        th_emp_id: "ລະຫັດພະນັກງານ",
        th_emp_name: "ຊື່ພະນັກງານ",
        th_last_seen: "ສັນຍານຄວາມເຄື່ອນໄຫວຫຼ້າສຸດ",
        th_emp_status: "ສະຖານະການເຊື່ອມຕໍ່",
        violation_tab_title: "ບັນທຶກກິດຈະກຳນອກວຽກ",
        violation_tab_desc: "ບັນທຶກກິດຈະກຳທີ່ຈຳແນກວ່ານອກວຽກ ຜູ້ດູແລເປລີ່ນຫມວດຫມູ່ໄດ້",
        worklog_tab_title: "ບັນທຶກກິດຈະກຳວຽກ",
        worklog_tab_desc: "ບັນທຶກກິດຈະກຳທີ່ຈຳແນກວ່າວຽກ ຜູ້ດູແລເປລີ່ນເປັນນອກວຽກໄດ້",
        th_idle_reason: "ເຫດຜົນ",
        btn_prev: "ກໍນໜ້າ",
        btn_next: "ຖັດໄປ",
        btn_apply: "ໃຊ້",
        btn_excel_download: "ດາວໂຫລດ Excel",
        violation_tab_desc: "ກັ່ນຕອງ ແລະ ສະແດງສະເພາະບັນທຶກທີ່ມີເວັບໄຊທີ່ຖືກຂຶ້ນບັນຊີດຳ",
        th_domain: "ໂດເມນທີ່ກວດພົບ",
        settings_info_title: "ຂໍ້ມູນສະເປກຂອງລະບົບ PGuard",
        settings_info_desc: "ຄ່າຫຼັກຂອງລະບົບທີ່ກຳລັງເຮັດວຽກຢູ່ປະຈຸບັນ",
        settings_title: "⚙️ ການຕັ້ງຄ່າການເຮັດວຽກ ແລະ ຄວາມປອດໄພຂອງເອເຈນ",
        settings_desc: "ກຳນົດເກນເວລາບໍ່ຢູ່ໜ້າຈໍ, ຄວາມຖີ່ໃນການສະແກນ ແລະ ຄວາມຖີ່ໃນການສົ່ງຂໍ້ມູນຂອງເອເຈນທີ່ເຊື່ອມຕໍ່",
        label_idle_threshold: "⏱ ເກນເວລາບໍ່ຢູ່ໜ້າຈໍ",
        desc_idle_threshold: "ເກນເວລາທີ່ບໍ່ມີການປ້ອນຂໍ້ມູນກ່ອນທີ່ຈະຖືວ່າບໍ່ຢູ່ໜ້າຈໍ (1 ນາທີ ~ 60 ນາທີ)",
        label_scan_interval: "🔍 ຄວາມຖີ່ໃນການສະແກນກິດຈະກຳເອເຈນ",
        desc_scan_interval: "... ຄວາມຖີ່ໃນການກວດຈັບໜ້າຕ່າງທີ່ໃຊ້ງານ ແລະ ສະຖານະແປ້ນພິມ/ເມົາສ໌ (1 ວິນາທີ ~ 300 ວິນາທີ)",
        label_send_interval: "📡 ຄວາມຖີ່ໃນການສົ່ງຂໍ້ມູນໄປຍັງເຊີເວີ",
        desc_send_interval: "ຄວາມຖີ່ໃນການສົ່ງບັນທຶກກິດຈະກຳສະສົມໄປຍັງແບັກເອນ (10 ວິນາທີ ~ 3600 ວິນາທີ)",
        label_agent_token: "🔑 ໂທເຄັນເຊື່ອມຕໍ່ເອເຈນ",
        desc_agent_token: "ໂທເຄັນຢືນຢັນຕົວຕົນຂອງບໍລິສັດ ທີ່ຕ້ອງວາງໃສ່ຊ່ອງ API Token ໃນ GUI ຕັ້ງຄ່າເອເຈນ (ຫຼື config.json)",
        btn_regen_token: "ອອກໂທເຄັນໃໝ່",
        regen_token_success: "ອອກໂທເຄັນໃໝ່ສຳເລັດ ກະລຸນາອັບເດດ config.json ໃນເອເຈນທີ່ເຊື່ອມຕໍ່ທັງໝົດ",
        unit_min: "ນາທີ",
        unit_sec: "ວິນາທີ",
        btn_save_settings: "ບັນທຶກການຕັ້ງຄ່າ",
        set_agent_interval: "ຄວາມຖີ່ໃນການສະແກນຂອງເອເຈນ",
        set_send_interval: "ຄວາມຖີ່ໃນການສົ່ງຂໍ້ມູນຂອງເອເຈນ",
        set_server_port: "ພອດ API ຂອງ Express",
        set_db_engine: "ເຄື່ອງຈັກຖານຂໍ້ມູນ",
        settings_reset_title: "ການຈັດການຖານຂໍ້ມູນ (ພື້ນທີ່ອັນຕະລາຍ)",
        settings_reset_desc: "ລຶບ ຫຼື ລ້າງຖານຂໍ້ມູນປະຫວັດການຕິດຕາມກິດຈະກຳທັງໝົດ",
        settings_reset_warning: "⚠️ ຄຳເຕືອນ: ການດຳເນີນການນີ້ຈະລຶບປະຫວັດການຕິດຕາມກິດຈະກຳ, ບັນທຶກພີຊີ ແລະ ໂດເມນທັງໝົດຢ່າງຖາວອນ ບໍ່ສາມາດກູ້ຄືນຂໍ້ມູນໄດ້",
        btn_reset_db: "ຣີເຊັດຖານຂໍ້ມູນເປັນຄ່າເລີ່ມຕົ້ນທັງໝົດ",
        status_online: "ອອນລາຍ",
        status_away: "ບໍ່ຢູ່ໜ້າຈໍ",
        category_work: "ວຽກ",
        category_nonwork: "ຄຳເຕືອນນອກວຽກ",
        no_data_desc: "ຍັງບໍ່ມີຂໍ້ມູນກິດຈະກຳສະສົມ ກະລຸນาເປີດໃຊ້ງານເອເຈນພີຊີກ່ອນ",
        login_subtitle: "ຈຳເປັນຕ້ອງມີການຢືນຢันຕົວຕົນຜູ້ດູແລລະບົບເພື່ອຄວາມປອດໄພ",

        login_company_code: "ລະຫັດບໍລິສັດ (Company Code)",
        th_company: "ບໍລິສັດ",
        login_username: "ຊື່ຜູ້ดູແລລະບົບ",
        login_password: "ລະຫັດຜ່ານ",
        login_btn: "ຢືນຢັນຕົວຕົນ ແລະ ເຂົ້າສູ່ລະບົບ",
        settings_security_title: "ການຕັ້ງຄ່າຄວາມປອດໄພ ແລະ ການເຊື່ອມຕໍ່ບໍລິສັດ",
        settings_security_desc: "ແກ້ໄຂລະຫັດບໍລິສັດເພື່ອເຊື່ອມຕໍ່ເອເຈນ ແລະ ລະຫັດຜ່ານຜູ້ດູແລລະບົບຢ່າງປອດໄພ",
        label_company_code: "ລະຫັດບໍລິສັດ (Company Code)",
        label_new_password: "ລະຫັດຜ່ານໃໝ່ຜູ້ດູແລລະບົບ",
        btn_save_settings: "ບັນທຶກການຕັ້ງຄ່າ",
        menu_super: "ການຈັດການບໍລິສັດ",
        menu_logout: "ອອກຈາກລະບົບ",
        logout_confirm: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບ?",
        super_company_title: "ລົງທະບຽນ ແລະ ແກ້ໄຂບໍລິສັດ",
        super_company_desc: "ລົງທະບຽນບໍລິສັດໃໝ່ ຫຼື ອັບເດດຊື່ບໍລິສັດທີ່ມີຢູ່",
        label_super_comp_code: "ລະຫັດບໍລິສັດ",
        label_super_comp_name: "ຊື່ບໍລິສັດ",
        btn_super_comp_register: "ລົງທະບຽนບໍລິສັດ",
        btn_cancel: "ຍົກເລີກ",
        super_admin_title: "ສ້າງບັນຊີຜູ້ດູແລລະບົບບໍລິສັດ",
        super_admin_desc: "ສ້າງບັນຊີຜູ້ດູແລລະບົບເອກະລາດທີ່ເປັນຂອງບໍລິສັດສະເພາະ",
        label_super_admin_comp: "ເລືອກບໍລິສັດ",
        label_super_admin_id: "ລະຫັດຜູ້ດູແລລະບົບ",
        label_super_admin_pw: "ລະຫັດຜ່ານໃໝ່",
        btn_super_admin_create: "ສ້າງບັນຊີຜູ້ດູແລລະບົບ",
        super_company_table_title: "ການຈັດການລາຍຊື່ບໍລິສັດ",
        super_company_table_desc: "ລາຍຊື່ບໍລິສັດທີ່ລົງທະບຽນທັງໝົດ. ການລຶບຈະລຶບພະນັກງານ ແລະ ບັນທຶກການຕິດຕາມຢ່າງຖາວອນ",
        th_company_code: "ລະຫັດບໍລິສັດ",
        th_company_name: "ຊື່ບໍລິສັດ",
        th_created_at: "ວັນທີລົງທະບຽນ",
        th_action: "ການດຳເນີນການ",
        super_admin_table_title: "ການຈັດການບັນຊີຜູ້ດູແລລະບົບບໍລິສັດ",
        super_admin_table_desc: "ລາຍຊື່ບັນຊີຜູ້ດູແລລະບົບຕາມບໍລິສັດທີ່ລົງທະບຽນ",
        th_super_admin_id: "ລະຫັດຜູ້ດູແລລະບົບ",
        th_super_admin_comp: "ສັງກັດບໍລິສັດ",
        emp_select_placeholder: "ກະລຸນາເລືອກພະນັກງານຈາກລາຍຊື່ ຫຼື ຄລິກປຸ່ມວິເຄາະ",
        emp_stats_title: "ການວິເຄາະສະຖິຕິກິດຈະກຳພະນັກງານ",
        emp_prod_score: "ລະດັບຄວາມຕັ້ງໃຈ (Focus Score)",
        emp_time_alloc: "ອັດຕาສ່ວນການແບ່ງເວລາເຮັດວຽກ",
        emp_top_software: "ໂປຣແກຣມທີ່ນຳໃຊ້ສູງສຸດ",
        emp_top_domains: "ໂດເມນນອກວຽກທີ່ມີການເຂົ້າເຖິງສູງສຸດ",
        th_action: "ການດຳເນີນການ",
        btn_analyze: "ວິເຄາະ",
        btn_edit: "ແກ້ໄຂ",
        btn_delete: "ລຶບ",
        category_idle: "ບໍ່ຢູ່ໜ້າຈໍ",
        loading_stats: "ກຳລັງໂຫຼດສະຖິຕິ...",
        no_stats_data: "ຍັງບໍ່ມີຂໍ້ມູນທີ່ເກັບກຳ",
        btn_export_all: "ສົ່ງອອກສະຫຼຸບທັງໝົດ (Excel)",
        btn_export_detail: "ສົ່ງອອກສະຖິຕິຂອງພະນັກງານນີ້ (Excel)",
        menu_download: "ດາວໂຫລດຕົວແທນ",
        download_title: "ດາວໂຫລດ PGuard Agent",
        download_desc: "ດາວໂຫລດຕົວແທນການຕິດຕາມເພື່ອນຳໃຊ້ກັບເຄື່ອງຄອມພິວເຕີຂອງພະນັກງານ. ກະລຸນາເລືອກລຸ້ນທີ່ຖືກຕ້ອງສຳລັບລະບົບປະຕິບັດການຂອງທ່ານ.",
        btn_download_win: "ດາວໂຫລດສຳລັບ Windows",
        btn_download_mac: "ດາວໂຫລດສຳລັບ Mac",
        err_date_required: "ກະລຸນາເລືອກທັງວັນທີເລີ່ມຕົ້ນ ແລະ ສິ້ນສຸດ.",
        err_date_limit: "ທ່ານສາມາດດາວໂຫລດໄດ້ສູງສຸດ 7 ມື້ເທົ່ານັ້ນ.",
        all_employees: "ພະນັກງານທັງໝົດ",
        duration_total: "ລວມ",
        duration_hours: "ຊມ.",
        duration_minutes: "ນາທີ",
        duration_seconds: "ວິນາທີ",
        duration_items: "ລາຍການ",
        menu_audit: "ປະຫວັດການເຄື່ອນໄຫວຜູ້ດູແລ",
        audit_title: "ປະຫວັດການເຄື່ອນໄຫວຜູ້ດູແລ",
        audit_desc: "ຕິດຕາມການປ່ຽນແປງການຕັ້ງຄ່າຄວາມປອດໄພ ແລະ ປະຫວັດການເຂົ້າໃຊ້ທັງໝົດທີ່ດຳເນີນການໂດຍຜູ້ດູແລລະບົບແບບຮຽວທາມ",
        label_date: "ໄລຍะເວລາ:",
        label_action_type: "ປະເພດການເຄື່ອນໄຫວ:",
        label_admin_user: "ID ຜູ້ດູແລ:",
        all_actions: "ການເຄື່ອນໄຫວທັງໝົດ",
        act_login_success: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
        act_login_failure: "ເຂົ້າສູ່ລະບົບລົ້ມເຫຼວ",
        act_logout: "ອອກຈາກລະບົບ",
        act_company_settings: "ປ່ຽນແປງຄ່າເວລາບໍ່ຢູ່",
        act_message_send: "ສົ່ງຂໍ້ຄວາມຫາເອເຈນ",
        act_category_update: "ແກ້ໄຂປະເພດກິດຈະກຳ",
        act_reset_data: "ລ້າງຂໍ້ມູນປະຫວັດກິດຈະກຳ",
        act_sub_admin_create: "ສ້າງຜູ້ດູແລລະບົບຍ່ອຍ",
        act_sub_admin_delete: "ລຶບຜູ້ດູແລລະບົບຍ່ອຍ",
        act_company_create: "ລົງທະບຽນບໍລິສັດ",
        act_company_edit: "ແກ້ໄຂຊື່ບໍລິສັດ",
        act_company_delete: "ລຶບບໍລິສັດຖາວອນ",
        act_admin_create: "ສ້າງຜູ້ດູແລບໍລິສັດ",
        act_admin_delete: "ລຶບຜູ້ດູແລບໍລິສັດ",
        act_settings_update: "ປ່ຽນແປງຂໍ້ມູນຜູ້ດູແລ",
        search_admin_id_placeholder: "ຄົ້ນຫາ ID...",
        th_timestamp: "ເວລາທີ່ເກີດ",
        th_admin_username: "ID ຜູ້ດູແລ",
        th_action_type: "ປະເພດການເຄື່ອນໄຫວ",
        th_details: "ລາຍລະອຽດການເຮັດວຽກ",
        th_ip_address: "ທີ່ຢູ່ IP",
        menu_patterns: "ການຈັດການຮູບແບບ",
        mode_admin: "ໂໝດຜູ້ດູແລ",
        mode_employee: "ໂໝດພະນັກງານ",
        menu_approval_admin: "ຈັດການການອະນຸມັດ",
        menu_approval_user: "ການອະນຸມັດຂອງຂ້ອຍ",
        navgrp_monitoring: "ການຕິດຕາມ", navgrp_approval: "ການອະນຸມັດ", navgrp_admin: "ຈັດການ", menu_employee_mgmt: "ຈັດການພະນັກງານ", menu_org_chart: "ຜັງອົງກອນ", org_desc: "ສ້າງໂຄງສ້າງກຸ່ມ/ທີມ ແລະ ມອບໝາຍພະນັກງານ. ເຊື່ອມກັບສາຍອະນຸມັດ ແລະ KPI.", org_add_top: "ເພີ່ມໜ່ວຍລະດັບສູງສຸດ", org_add_child: "ເພີ່ມໜ່ວຍຍ່ອຍ", org_company_root: "ລະດັບບໍລິສັດ", org_empty: "ຍັງບໍ່ມີໜ່ວຍງານ. ເລີ່ມດ້ວຍເພີ່ມໜ່ວຍລະດັບສູງສຸດ.", org_type_group: "ກຸ່ມ", org_type_team: "ທີມ", org_type_group_short: "ກຸ່ມ", org_type_team_short: "ທີມ", org_emp_unit: "ຄົນ", org_name: "ຊື່ໜ່ວຍງານ", org_type: "ປະເພດ", org_parent: "ໜ່ວຍງານແມ່", org_root_option: "(ລະດັບສູງສຸດ - ຂຶ້ນກັບບໍລິສັດ)", org_add_title: "ເພີ່ມໜ່ວຍງານ", org_edit_title: "ແກ້ໄຂໜ່ວຍງານ", org_err_name: "ກະລຸນາປ້ອນຊື່ໜ່ວຍງານ", org_confirm_delete: "ລຶບໜ່ວຍງານນີ້ບໍ? ພະນັກງານທີ່ມອບໝາຍຈະກາຍເປັນບໍ່ໄດ້ມອບໝາຍ.", org_delete_failed: "ລຶບໜ່ວຍງານບໍ່ສຳເລັດ: ", org_add_failed: "ເພີ່ມໜ່ວຍງານບໍ່ສຳເລັດ: ", org_update_failed: "ແກ້ໄຂໜ່ວຍງານບໍ່ສຳເລັດ: ", org_unassigned: "(ບໍ່ໄດ້ມອບໝາຍ)", emp_form_org: "ອົງກອນ (ທີມ/ກຸ່ມ)", th_emp_org: "ອົງກອນ", emp_mgmt_desc: "ຈັດການຂໍ້ມູນພະນັກງານ, ບັນຊີເຂົ້າສູ່ລະບົບ ແລະ ສິດ ໃນບ່ອນດຽວ.",
        approval_admin_title: "ການຈັດການເອກະສານອະນຸມັດ",
        approval_admin_desc: "ຈັດການເອກະສານອະນຸມັດ, ແມ່ແບບ, ບັນຊີເຂົ້າສູ່ລະບົບພະນັກງານ ແລະ ການຕັ້ງຄ່າການແປ.",
        approval_user_title: "ການອະນຸມັດຂອງຂ້ອຍ",
        approval_user_desc: "ສ້າງເອກະສານອະນຸມັດ ແລະ ຕິດຕາມເອກະສານທີ່ທ່ານສົ່ງ ຫຼື ຕ້ອງອະນຸມັດ.",
        approval_pill_pending: "ລໍຖ້າດຳເນີນການ",
        approval_pill_all: "ເອກະສານທັງໝົດ",
        approval_pill_templates: "ແມ່ແບບ",
        approval_pill_accounts: "ຈັດການພະນັກງານ",
        approval_pill_settings: "ຕັ້ງຄ່າ",
        approval_pill_new: "ສ້າງເອກະສານໃໝ່",
        approval_pill_mine: "ເອກະສານທີ່ຂ້ອຍສົ່ງ",
        approval_pill_todo: "ລໍຖ້າອະນຸມັດ",
        approval_pill_cc: "ເອກະສານອ້າງອີງ",
        approval_coming_soon: "ລະບົບອະນຸມັດອິເລັກໂທຣນິກກຳລັງພັດທະນາ (ຈະມາໃນ Phase 2+)",
        role_normal_employee: "ພະນັກງານ",
        role_sub_admin: "ຜູ້ດູແລຮອງ",
        role_employee_manager: "ຜູ້ຈັດການພະນັກງານ",
        account_active: "ໃຊ້ງານ",
        account_inactive: "ປິດໃຊ້ງານ",
        account_create: "ສ້າງບັນຊີ",
        account_reset: "ຣີເຊັດບັນຊີ",
        account_disable: "ປິດການເຂົ້າສູ່ລະບົບ",
        account_help: "ສ້າງບັນຊີເຂົ້າສູ່ລະບົບຂອງພະນັກງານ ແລະ ມອບສິດການຈັດການ (ຜູ້ດູແລຮອງ / ຜູ້ຈັດການພະນັກງານ) ໃຫ້ພະນັກງານທີ່ເລືອກ. ສິດຜູ້ດູແລສູງສຸດຈະບໍ່ຖືກມອບໃຫ້.",
        account_saved: "ບັນທຶກບັນຊີເຂົ້າສູ່ລະບົບຂອງພະນັກງານແລ້ວ.",
        account_save_failed: "ບັນທຶກບັນຊີບໍ່ສຳເລັດ: ",
        account_disable_failed: "ປິດການເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ: ",
        role_update_failed: "ອັບເດດສິດບໍ່ສຳເລັດ: ",
        confirm_disable: "ປິດການເຂົ້າສູ່ລະບົບຂອງພະນັກງານນີ້ບໍ? (ສິດການຈັດການທີ່ມອບໄວ້ຈະຖືກຍົກເລີກນຳ)",
        prompt_login_id: "ປ້ອນ ID ເຂົ້າສູ່ລະບົບ",
        prompt_password: "ປ້ອນລະຫັດຜ່ານ (ຢ່າງໜ້ອຍ 4 ຕົວ)",
        err_login_id_required: "ຕ້ອງມີ ID ເຂົ້າສູ່ລະບົບ.",
        err_password_short: "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 4 ຕົວອັກສอນ.",
        loading_text: "ກຳລັງໂຫລດ...",
        no_employees: "ບໍ່ມີພະນັກງານ.",
        th_emp_name: "ຊື່",
        th_emp_id: "ລະຫັດພະນັກງານ",
        th_company: "ບໍລິສັດ",
        th_login_id: "ID ເຂົ້າສູ່ລະບົບ",
        th_login_status: "ສະຖານະເຂົ້າສູ່ລະບົບ",
        th_admin_role: "ສິດ",
        th_actions: "ການດຳເນີນການ",
        emp_add: "ເພີ່ມພະນັກງານ", emp_edit_title: "ແກ້ໄຂຂໍ້ມູນພະນັກງານ", emp_form_tags: "ແທັກ (ພະແນກ, ຄັ່ນດ້ວຍຈຸດ · ທາງເລືອກ)", emp_edit: "ແກ້ໄຂ", emp_delete: "ລຶບ", th_emp_tags: "ແທັກ",
        emp_manage_help: "ເພີ່ມ, ແກ້ໄຂ, ລຶບພະນັກງານ, ສ້າງບັນຊີເຂົ້າສູ່ລະບົບ ແລະ ມອບສິດການຈັດການ (ຜູ້ດູແລຮອງ/ຜູ້ຈັດການພະນັກງານ). ສິດຜູ້ດູແລສູງສຸດຈະບໍ່ຖືກມອບໃຫ້.",
        prompt_emp_id: "ປ້ອນລະຫັດພະນັກງານ", prompt_emp_name: "ປ້ອນຊື່ພະນັກງານ", prompt_emp_tags: "ແທັກ (ພະແນກ, ຄັ່ນດ້ວຍຈຸດ, ທາງເລືອກ)",
        err_emp_id_required: "ຕ້ອງມີລະຫັດພະນັກງານ", err_emp_name_required: "ຕ້ອງມີຊື່",
        emp_added: "ເພີ່ມພະນັກງານແລ້ວ", emp_add_failed: "ເພີ່ມພະນັກງານບໍ່ສຳເລັດ: ", emp_updated: "ອັບເດດພະນັກງານແລ້ວ", emp_update_failed: "ອັບເດດພະນັກງານບໍ່ສຳເລັດ: ",
        emp_confirm_delete: "ລຶບພະນັກງານນີ້ບໍ? ບັນທຶກກິດຈະກຳອາດຖືກລຶບນຳ", emp_delete_failed: "ລຶບພະນັກງານບໍ່ສຳເລັດ: ",
        btn_edit: "ແກ້ໄຂ",
        btn_delete: "ລຶບ",
        btn_save: "ບັນທຶກ",
        btn_cancel: "ຍົກເລີກ",
        tpl_new: "ແມ່ແບບໃໝ່",
        tpl_new_title: "ແມ່ແບບໃໝ່",
        tpl_edit_title: "ແກ້ໄຂແມ່ແບບ",
        tpl_list_desc: "ສ້າງ ແລະ ຈັດການແມ່ແບບຟອມອະນຸມັດ. ຜູ້ໃຊ້ເລືອກແມ່ແບບເມື່ອຮ່າງເອກະສານ.",
        tpl_th_title: "ຊື່ຟອມ",
        tpl_th_category: "ໝວດ",
        tpl_th_fields: "ຊ່ອງຂໍ້ມູນ",
        tpl_th_updated: "ອັບເດດ",
        tpl_fields_unit: "ຊ່ອງ",
        tpl_empty: "ຍັງບໍ່ມີແມ່ແບບ.",
        tpl_fields_title: "ຊ່ອງປ້ອນຂໍ້ມູນ (ເນື້ອໃນ)",
        tpl_add_field: "ເພີ່ມຊ່ອງ",
        tpl_no_fields: "ບໍ່ມີຊ່ອງຂໍ້ມູນ. ກົດ 'ເພີ່ມຊ່ອງ' ເພື່ອສ້າງ.",
        tpl_label_ko: "ປ້າຍກຳກັບ (ເກົາຫລີ)",
        tpl_field_key: "ຄີ (ຕົວລະບຸ, ທາງເລືອກ)",
        tpl_field_type: "ປະເພດ",
        tpl_options: "ຕົວເລືອກ (ຄັ່ນດ້ວຍຈຸດ)",
        tpl_line_approval: "ສາຍອະນຸມັດເລີ່ມຕົ້ນ (ຕາມລຳດັບ)",
        tpl_line_agreement: "ສາຍເຫັນດີເລີ່ມຕົ້ນ (ຂະໜານ)",
        tpl_line_cc: "ສາຍອ້າງອີງເລີ່ມຕົ້ນ",
        tpl_line_empty: "ບໍ່ໄດ້ກຳນົດ",
        tpl_no_participants: "ບໍ່ມີເປົ້າໝາຍທີ່ເພີ່ມໄດ້",
        tpl_saved: "ບັນທຶກແມ່ແບບແລ້ວ.",
        tpl_save_failed: "ບັນທຶກແມ່ແບບບໍ່ສຳເລັດ: ",
        tpl_delete_failed: "ລຶບແມ່ແບບບໍ່ສຳເລັດ: ",
        tpl_confirm_delete: "ລຶບແມ່ແບບນີ້ບໍ?",
        tpl_err_title: "ກະລຸນາປ້ອນຊື່ຟອມ.",
        p_admin: "ຜູ້ດູແລ",
        p_employee: "ພະນັກງານ",
        cat_general: "ທົ່ວໄປ", cat_leave: "ລາພັກ", cat_expense: "ຄ່າໃຊ້ຈ່າຍ", cat_purchase: "ຈັດຊື້",
        cat_report: "ລາຍງານ", cat_hr: "ບຸກຄະລາກອນ", cat_it_request: "ຄຳຂໍ IT", cat_other: "ອື່ນໆ",
        ftype_text: "ຂໍ້ຄວາມແຖວດຽວ", ftype_textarea: "ຂໍ້ຄວາມຫລາຍແຖວ", ftype_number: "ຕົວເລກ", ftype_date: "ວັນທີ", ftype_select: "ຕົວເລືອກ",
        st_draft: "ຮ່າງ", st_submitted: "ສົ່ງແລ້ວ", st_in_review: "ກຳລັງອະນຸມັດ", st_approved: "ອະນຸມັດແລ້ວ", st_rejected: "ປະຕິເສດ", st_withdrawn: "ຖອນຄືນ",
        pr_low: "ຕ່ຳ", pr_normal: "ປົກກະຕິ", pr_high: "ສູງ", pr_urgent: "ດ່ວນ",
        ls_pending: "ລໍຖ້າ", ls_current: "ກຳລັງດຳເນີນ", ls_approved: "ສຳເລັດ", ls_rejected: "ປະຕິເສດ", ls_skipped: "ຂ້າມ",
        viz_approval: "ສາຍອະນຸມັດ (ຕາມລຳດັບ)", viz_agreement: "ສາຍເຫັນດີ (ຂະໜານ)", viz_cc: "ອ້າງອີງ (ອ່ານ)",
        act_approve: "ອະນຸມັດ", act_reject: "ປະຕິເສດ", act_agree: "ເຫັນດີ", act_withdraw: "ຖອນຄືນ", act_edit_draft: "ແກ້ໄຂຕໍ່", act_submit: "ສົ່ງ",
        act_ap_created: "ສ້າງເອກະສານ", act_ap_submitted: "ສົ່ງ", act_ap_approved: "ອະນຸມັດ", act_ap_rejected: "ປະຕິເສດ", act_ap_agreed: "ເຫັນດີ", act_ap_withdrawn: "ຖອນຄືນ", act_ap_read: "ເປີດອ່ານ", act_ap_updated: "ແກ້ໄຂ", act_ap_completed: "ອະນຸມັດຂັ້ນສຸດທ້າຍສຳເລັດ",
        comment_optional: "ຄຳເຫັນ (ທາງເລືອກ)", reject_reason_ph: "ປ້ອນເຫດຜົນການປະຕິເສດ", reject_reason_req: "ຕ້ອງລະບຸເຫດຜົນການປະຕິເສດ",
        confirm_withdraw: "ຖອນຄືນເອກະສານນີ້ບໍ?", confirm_submit: "ສົ່ງເອກະສານນີ້ບໍ?",
        doc_th_number: "ເລກທີ", doc_th_title: "ຫົວຂໍ້", doc_th_status: "ສະຖານະ", doc_th_drafter: "ຜູ້ຮ່າງ", doc_th_date: "ວັນທີ", doc_th_read: "ອ່ານ",
        doc_empty: "ບໍ່ມີເອກະສານ", doc_search: "ຄົ້ນຫາຫົວຂໍ້/ເລກທີ", all_status: "ທຸກສະຖານະ", cc_read: "ອ່ານແລ້ວ", cc_unread: "ຍັງບໍ່ອ່ານ",
        doc_no_body: "ບໍ່ມີເນື້ອໃນ", doc_body: "ເນື້ອໃນເອກະສານ", doc_reject_reason: "ເຫດຜົນການປະຕິເສດ", doc_timeline: "ປະຫວັດກິດຈະກຳ",
        doc_select_template: "ເລືອກແມ່ແບບ (ຫຼື ຟອມອິດສະຫຼະ)", doc_form_template: "ແມ່ແບບ", doc_form_priority: "ຄວາມສຳຄັນ", doc_free_form: "ຟອມອິດສະຫຼະ ເລືອກແມ່ແບບເພື່ອສະແດງຊ່ອງຂໍ້ມູນ",
        doc_submit: "ສົ່ງ", doc_save_draft: "ບັນທຶກຮ່າງ", doc_reset: "ຣີເຊັດ", doc_submitted: "ສົ່ງເອກະສານແລ້ວ", doc_drafted: "ບັນທຶກເປັນຮ່າງແລ້ວ", doc_save_failed: "ບັນທຶກບໍ່ສຳເລັດ: ",
        doc_err_title: "ກະລຸນາປ້ອນຫົວຂໍ້", doc_err_line: "ຕ້ອງເພີ່ມຜູ້ອະນຸມັດ ຫຼື ຜູ້ເຫັນດີຢ່າງໜ້ອຍ 1 ຄົນເພື່ອສົ່ງ", act_failed: "ດຳເນີນການບໍ່ສຳເລັດ: ",
        approval_settings_soon: "ການຕັ້ງຄ່າອະນຸມັດ (ການແປ) ຈະມາໃນ Phase 6",
        doc_attachments: "ໄຟລ໌ແນບ", doc_add_file: "ເພີ່ມໄຟລ໌", doc_no_files: "ບໍ່ມີໄຟລ໌ແນບ",
        doc_file_hint: "ສູງສຸດ 20MB ຕໍ່ໄຟລ໌ · ເອກະສານ/ຮູບ/PDF", doc_file_pending: "ອັບໂຫລດເມື່ອບັນທຶກ",
        doc_confirm_del_file: "ລຶບໄຟລ໌ແນບນີ້ບໍ?", doc_download_fail: "ດາວໂຫລດບໍ່ສຳເລັດ: ", doc_file_fail: "ແນບໄຟລ໌ບໍ່ສຳເລັດ: ",
        doc_export_excel: "ສົ່ງອອກ Excel",
        set_lt_url: "URL ເຊີບເວີ LibreTranslate", set_test: "ທົດສອບການເຊື່ອມຕໍ່", set_lt_key: "API Key (ທາງເລືອກ)", set_targets: "ພາສາປາຍທາງ",
        set_auto: "ແປອັດຕະໂນມັດເມື່ອສົ່ງ", set_auto_desc: "ແປໂດຍອັດຕະໂນມັດເມື່ອສົ່ງເອກະສານ", set_prefix: "ຄຳນຳໜ້າເລກທີເອກະສານ",
        set_testing: "ກຳລັງທົດສອບ...", set_ok: "ເຊື່ອມຕໍ່ສຳເລັດ", set_saved: "ບັນທຶກການຕັ້ງຄ່າແລ້ວ", set_save_failed: "ບັນທຶກການຕັ້ງຄ່າບໍ່ສຳເລັດ: ",
        trans_original: "ຕົ້ນສະບັບ", trans_run: "ແປ", trans_running: "ກຳລັງແປ...", trans_failed: "ແປບໍ່ສຳເລັດ: ",
        tab_patterns_title: "🧩 ການຈັດການຮູບແບບການຈັດໝວດໝູ່ອັດຕະໂນມັດ",
        tab_patterns_desc: "ກຳນົດກົດເກນເພື່ອແຍກບັນທຶກເປັນວຽກ ຫຼື ນອກວຽກໂດຍອັດຕະໂນມັດ ໂດຍອີງຕາມຊື່ຂະບວນການ, ໂດເມນ ຫຼື ຊື່ໜ້າຕ່າງ.",
        th_pattern_type: "ປະເພດຮູບແບບ",
        th_pattern_value: "ຄຳສັບທີ່ກົງກັນ",
        th_pattern_category: "ການຈັດໝວດໝູ່",
        option_process: "ຊື່ຂະບວນການ (EXE)",
        option_domain: "ໂດເມນທີ່ກວດພົບ (ເວັບໄຊ)",
        option_title: "ຊື່ໜ້າຕ່າງທີ່ໃຊ້ງານ",
        btn_register: "ລົງທະບຽນ",
        confirm_pattern_delete: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຮູບແບບການຈັດໝວດໝູ່ນີ້?",
        act_pattern_create: "ລົງທະບຽນຮູບແບບການຈັດໝວດໝູ່",
        act_pattern_delete: "ລຶບຮູບແບບການຈັດໝວດໝູ່",
        menu_idlelogs: "ບັນທຶກເວລາທີ່ບໍ່ຢູ່",
        idlelog_tab_title: "ບັນທຶກກິດຈະກຳການບໍ່ຢູ່",
        idlelog_tab_desc: "ປະຫວັດການບໍ່ຢູ່ຂອງພະນັກງານ. ຄລິກປຸ່ມ 'ປ່ຽນເປັນວຽກ' ເພື່ອປ່ຽນສະຖານະເວລາຊ່ວງນັ້ນເປັນການເຮັດວຽກ.",
        btn_change_to_work: "ປ່ຽນເປັນວຽກ",
        prompt_delete_emp: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຂໍ້ມູນບັນຊີຂອງພະນັກງານຄົນນີ້ທັງໝົດແບບຖາວອນ?\nຂໍ້ມູນທັງໝົດລວມທັງປະຫວັດກິດຈະກຳ (ລັອກ) ຈະຖືກລົບແບບຖາວອນແລະບໍ່ສາມາດກູ້ຄືນໄດ້",
        prompt_work_reason: "ທ່ານຕ້ອງການປ່ຽນຊ່ວງເວລາທີ່ບໍ່ຢູ່ນີ້ເປັນສະຖານະເຮັດວຽກບໍ່?\nກະລຸນາປ້ອນເຫດຜົນໃນການປ່ຽນສະຖານະ:",
        kpi_idle_time: "ເວລາທີ່ບໍ່ຢູ່ທັງໝົດມື້ນີ້",
        kpi_idle_desc: "ເວລາທຳການກວດຈับການບໍ່ຢູ່ຂອງເອເຈນ",
        label_emp_tags: "ແທັກພະນັກງານ",
        th_emp_tags: "ແທັກ",
        role_sub_admin: "ຜູ້ດູແລລະບົບຍ່ອຍ",
        role_employee_manager: "ຜູ້ຈັດການພະນັກງານ",
        placeholder_login_company_code: "ປ້ອນລະຫັດບໍລິສັດ",
        placeholder_login_username: "ປ້ອນຊື່ຜູ້ໃຊ້",
        placeholder_login_password: "ປ້ອນລະຫັດຜ່ານ",
        login_error_msg: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
        tz_seoul: "🕒 ເວລາເກົາຫຼີ/ໂຊລ",
        tz_vientiane: "🕒 ເວລາລາວ/ວຽງຈັນ",
        lbl_first_seen: "ເຂົ້າລະບົບຄັ້ງທຳອິດ",
        lbl_emp_id: "ລະຫັດພະນັກງານ",
        btn_send_message: "ສົ່ງຂໍ້ຄວາມ",
        status_offline: "ອອຟລາຍ",
        menu_send_agent_message: "📢 ສົ່ງຂໍ້ຄວາມຫາເອເຈນ",
        desc_send_agent_message: "ສົ່ງຂໍ້ຄວາມປັອບອັບຫາໜ້າຈໍພີຊີຂອງພະນັກງານແຕ່ລະຄົນ ຫຼື ທັງໝົດ.",
        btn_send_all_employees: "ສົ່ງຫາພະນັກງານທັງໝົດ",
        msg_no_agents_connected: "ເມື່ອເອເຈນເຊື່ອມຕໍ່ໃນແທັບສະຖານະພະນັກງານ, ລາຍຊື່ຈະສະແດງຢູ່ບ່ອນນີ້.",
        btn_send: "ຂໍ້ຄວາມ",
        msg_recipient: "ຜູ້ຮັບ",
        err_enter_message: "ກະລຸນາປ້ອນຂໍ້ຄວາມ.",
        btn_sending: "ກຳລັງສົ່ງ...",
        msg_sent_success: "ສົ່ງຂໍ້ຄວາມສຳເລັດແລ້ວ.",
        msg_sent_all: "ສົ່ງຂໍ້ຄວາມຫາພະນັກງານທັງໝົດແລ້ວ. (ຈະໄດ້ຮັບເມື່ອເອເຈນໂພລຄັ້ງຕໍ່ໄປ)",
        err_send_failed: "ຂໍ້ຜິດພາດໃນການສົ່ງ: ",
        btn_send_submit: "ສົ່ງ",
        label_message_content: "ເນື້ອຫາຂໍ້ຄວາມ",
        placeholder_message_content: "ປ້ອນຂໍ້ຄວາມທີ່ຈະສະແດງເທິງໜ້າຈໍພີຊີ...",
        placeholder_enter_company_code: "ປ້ອນລະຫັດບໍລິສັດ.",
        placeholder_new_password_help: "ປ້ອນສະເພาະກໍລະນີທີ່ຕ້ອງການປ່ຽນເທົ່ານັ້ນ.",
        placeholder_admin_id: "ໄອດີຜູ້ດູແລລະບົບ",
        placeholder_temp_password: "ລະຫັດຜ່ານຊົ່ວຄາວ",
        placeholder_managed_tags: "ແທັກພະນັກງານທີ່ຈະດູແລ (ແຍກດ້ວຍຈຸດ)",
        confirm_delete_subadmin: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຜູ້ດູແลລະບົບຍ່ອຍນີ້?",
        download_win_desc: "ຮອງຮັບ Windows 10/11 ຂຶ້ນໄປ. ດັບເບິ້ລຄລິກເພື່ອເປີດໃຊ້ງານທັນທີໂດຍບໍ່ຕ້ອງຕິດຕັ້ງ.",
        download_mac_desc: "ຮອງຮັບລະບົບ macOS. ດາວໂຫຼດແລ້ວດັບເບິ້ລຄລິກເພື່ອຕິດຕັ້ງ ແລະ ລົງທະບຽນເບື້ອງຫຼັງອັດຕະໂນມັດ."
    }
};

// 전역 상태 변수
let currentLang = localStorage.getItem("pguard_lang") || "ko";
let currentTz = localStorage.getItem("pguard_timezone") || "Asia/Seoul";
let activeTab = "tab-overview";
let categoryChart = null;
let programChart = null;
let currentEmployeeStats = null;
let currentTheme = localStorage.getItem("pguard_theme") || "dark";

function updateTenantUI() {
    const companyCode = localStorage.getItem("pguard_company_code") || "";
    const isSuperAdmin = companyCode === "auton";
    const role = localStorage.getItem("pguard_admin_role") || "admin";
    const isEmployee = role === "employee";
    const mode = getAppMode();

    // 모드 전환기: 관리자(비직원)에게만 표시
    const modeSwitcher = document.getElementById("modeSwitcher");
    if (modeSwitcher) {
        modeSwitcher.classList.toggle("hidden", isEmployee);
        const adminBtn = document.getElementById("modeAdminBtn");
        const empBtn = document.getElementById("modeEmployeeBtn");
        if (adminBtn && empBtn) {
            const activeCls = ["bg-indigo-600", "text-white"];
            const idleCls = ["text-slate-400", "hover:text-white"];
            if (mode === "employee") {
                empBtn.classList.add(...activeCls); empBtn.classList.remove(...idleCls);
                adminBtn.classList.remove(...activeCls); adminBtn.classList.add(...idleCls);
            } else {
                adminBtn.classList.add(...activeCls); adminBtn.classList.remove(...idleCls);
                empBtn.classList.remove(...activeCls); empBtn.classList.add(...idleCls);
            }
        }
    }

    // Update company badge in header (단일 회사 운영: 회사 코드 미표시, 통합관리자만 배지 노출)
    const companyBadge = document.getElementById("companyBadge");
    if (companyBadge) {
        if (isSuperAdmin) {
            companyBadge.textContent = "SUPER ADMIN";
            companyBadge.classList.remove("hidden");
        } else {
            companyBadge.classList.add("hidden");
        }
    }
    
    // Show/Hide Company columns in tables
    const colCompanyElements = document.querySelectorAll(".col-company");
    colCompanyElements.forEach(el => {
        if (isSuperAdmin) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    });

    // Show/Hide Super Admin Tab Button in Sidebar
    const btnSuper = document.getElementById("btn-super");
    if (btnSuper) {
        if (isSuperAdmin) {
            btnSuper.classList.remove("hidden");
        } else {
            btnSuper.classList.add("hidden");
        }
    }

    const dbResetPanel = document.getElementById("dbResetPanel");
    if (dbResetPanel) {
        if (role === "sub_admin" || role === "employee_manager") dbResetPanel.classList.add("hidden");
        else dbResetPanel.classList.remove("hidden");
    }

    const subAdminPanel = document.getElementById("subAdminPanel");
    if (subAdminPanel) {
        if (role === "employee_manager") {
            subAdminPanel.classList.add("hidden");
        } else {
            subAdminPanel.classList.remove("hidden");
            const subAdminRoleSelect = document.getElementById("subAdminRole");
            const subAdminTagsContainer = document.getElementById("subAdminTagsContainer");
            if (subAdminRoleSelect) {
                const subAdminOpt = subAdminRoleSelect.querySelector('option[value="sub_admin"]');
                if (role === "sub_admin") {
                    if (subAdminOpt) subAdminOpt.style.display = "none";
                    subAdminRoleSelect.value = "employee_manager";
                    if (subAdminTagsContainer) subAdminTagsContainer.classList.remove("hidden");
                } else {
                    if (subAdminOpt) subAdminOpt.style.display = "";
                    subAdminRoleSelect.value = "sub_admin";
                    if (subAdminTagsContainer) subAdminTagsContainer.classList.add("hidden");
                }
            }
        }
    }

    // Hide Classification Patterns menu in sidebar for employee_manager
    const btnPatterns = document.getElementById("btn-patterns");
    if (btnPatterns) {
        if (role === "employee_manager") btnPatterns.classList.add("hidden");
        else btnPatterns.classList.remove("hidden");
    }

    // Hide Agent settings panel in Settings tab for employee_manager
    const idleSettingsPanel = document.getElementById("idleSettingsPanel");
    if (idleSettingsPanel) {
        if (role === "employee_manager") idleSettingsPanel.classList.add("hidden");
        else idleSettingsPanel.classList.remove("hidden");
    }

    // Handle Security settings panel
    const securitySettingsPanel = document.getElementById("securitySettingsPanel");
    if (securitySettingsPanel) {
        securitySettingsPanel.classList.remove("hidden");
        const settingCompanyCodeContainer = document.getElementById("settingCompanyCode")?.parentElement;
        const securityTitle = document.querySelector("#securitySettingsPanel h4");
        const securityDesc = document.querySelector("#securitySettingsPanel p");
        
        if (!isSuperAdmin) {
            // 단일 회사 운영: 회사 코드 입력란 숨김 (통합관리자만 노출)
            if (settingCompanyCodeContainer) settingCompanyCodeContainer.classList.add("hidden");
            if (securityTitle) {
                securityTitle.setAttribute("data-i18n", "settings_security_title_self");
                if (currentLang === 'ko') securityTitle.textContent = translations.ko.settings_security_title_self;
                else if (currentLang === 'en') securityTitle.textContent = translations.en.settings_security_title_self;
                else if (currentLang === 'th') securityTitle.textContent = translations.th.settings_security_title_self;
                else if (currentLang === 'lo') securityTitle.textContent = translations.lo.settings_security_title_self;
            }
            if (securityDesc) {
                securityDesc.setAttribute("data-i18n", "settings_security_desc_self");
                if (currentLang === 'ko') securityDesc.textContent = translations.ko.settings_security_desc_self;
                else if (currentLang === 'en') securityDesc.textContent = translations.en.settings_security_desc_self;
                else if (currentLang === 'th') securityDesc.textContent = translations.th.settings_security_desc_self;
                else if (currentLang === 'lo') securityDesc.textContent = translations.lo.settings_security_desc_self;
            }
        } else {
            if (settingCompanyCodeContainer) settingCompanyCodeContainer.classList.remove("hidden");
            if (securityTitle) {
                securityTitle.setAttribute("data-i18n", "settings_security_title");
                if (currentLang === 'ko') securityTitle.textContent = translations.ko.settings_security_title;
                else if (currentLang === 'en') securityTitle.textContent = translations.en.settings_security_title;
                else if (currentLang === 'th') securityTitle.textContent = translations.th.settings_security_title;
                else if (currentLang === 'lo') securityTitle.textContent = translations.lo.settings_security_title;
            }
            if (securityDesc) {
                securityDesc.setAttribute("data-i18n", "settings_security_desc");
                if (currentLang === 'ko') securityDesc.textContent = translations.ko.settings_security_desc;
                else if (currentLang === 'en') securityDesc.textContent = translations.en.settings_security_desc;
                else if (currentLang === 'th') securityDesc.textContent = translations.th.settings_security_desc;
                else if (currentLang === 'lo') securityDesc.textContent = translations.lo.settings_security_desc;
            }
        }
    }

    // ── 모드 + 역할 기반 사이드바 메뉴 가시성 ──
    // 각 사이드바 버튼을 현재 모드/역할에 맞춰 표시/숨김 처리
    const sidebarMenu = document.getElementById("sidebarMenu");
    if (sidebarMenu) {
        sidebarMenu.querySelectorAll("button[data-target]").forEach(btn => {
            const target = btn.getAttribute("data-target");
            const isEmployeeTab = EMPLOYEE_MODE_TABS.includes(target);
            let visible;

            if (mode === "employee") {
                // 직원 모드: 직원 전용 탭만 표시
                visible = isEmployeeTab || BOTH_MODE_TABS.includes(target);
            } else {
                // 관리자 모드: 직원 전용 탭을 제외한 관리자 탭 표시 + 역할별 제한 적용
                visible = !isEmployeeTab;
                if (target === "tab-super" && !isSuperAdmin) visible = false;
                if (target === "tab-patterns" && role === "employee_manager") visible = false;
                if (target === "tab-approval-admin" && role === "employee_manager") visible = false;
                if (target === "tab-employee-mgmt" && role === "employee_manager") visible = false;
                if (target === "tab-org-chart" && role === "employee_manager") visible = false;
            }
            btn.classList.toggle("hidden", !visible);
        });
    }

    updateNavGroups();
}

// ── 사이드바 그룹 아코디언 (유형별 토글) ──
function getCollapsedGroups() {
    try { return JSON.parse(localStorage.getItem("pguard_nav_collapsed") || "[]"); } catch (e) { return []; }
}
function setGroupCollapsed(group, collapsed) {
    let arr = getCollapsedGroups().filter(g => g !== group);
    if (collapsed) arr.push(group);
    localStorage.setItem("pguard_nav_collapsed", JSON.stringify(arr));
}
function applyGroupCollapsedState(group) {
    const items = document.querySelector(`[data-group-items="${group}"]`);
    const header = document.querySelector(`[data-group-toggle="${group}"]`);
    if (!items || !header) return;
    const collapsed = getCollapsedGroups().includes(group);
    items.classList.toggle("hidden", collapsed);
    const chev = header.querySelector(".nav-chevron");
    if (chev) chev.style.transform = collapsed ? "rotate(-90deg)" : "";
}
function bindNavGroups() {
    document.querySelectorAll("[data-group-toggle]").forEach(header => {
        if (header.dataset.bound === "1") return;
        header.dataset.bound = "1";
        header.addEventListener("click", () => {
            const group = header.getAttribute("data-group-toggle");
            setGroupCollapsed(group, !getCollapsedGroups().includes(group));
            applyGroupCollapsedState(group);
        });
    });
    document.querySelectorAll("[data-group-toggle]").forEach(h => applyGroupCollapsedState(h.getAttribute("data-group-toggle")));
}
// 그룹 내 표시 가능한 메뉴가 하나도 없으면 그룹 헤더까지 숨김
function updateNavGroups() {
    document.querySelectorAll(".nav-group").forEach(grp => {
        const btns = grp.querySelectorAll("button[data-target]");
        const anyVisible = Array.from(btns).some(b => !b.classList.contains("hidden"));
        grp.classList.toggle("hidden", !anyVisible);
    });
}

// ── 애플리케이션 모드 (관리자 모드 / 직원 모드) ──
// 직원 모드 전용 탭 목록 (그 외 모든 탭은 관리자 모드 전용)
const EMPLOYEE_MODE_TABS = ['tab-approval-user'];
// 두 모드 모두에서 보이는 공통 탭 (관리자·직원 공용)
const BOTH_MODE_TABS = ['tab-download'];

// 현재 활성 모드 반환. 직원(role=employee)은 항상 employee 모드로 고정.
function getAppMode() {
    const role = localStorage.getItem("pguard_admin_role") || "admin";
    if (role === "employee") return "employee";
    return localStorage.getItem("pguard_app_mode") || "admin";
}

// 관리자가 관리자 모드 ↔ 직원 모드를 전환
function switchAppMode(mode) {
    const role = localStorage.getItem("pguard_admin_role") || "admin";
    if (role === "employee") mode = "employee"; // 직원은 전환 불가
    localStorage.setItem("pguard_app_mode", mode);
    updateTenantUI();
    // 모드에 맞는 기본 탭으로 이동
    if (mode === "employee") {
        switchTab("tab-approval-user");
    } else {
        switchTab("tab-overview");
    }
}

// 인증 관련 도우미 함수 및 Overlay 제어
function showLoginOverlay() {
    const overlay = document.getElementById("loginOverlay");
    const card = document.getElementById("loginCard");
    if (!overlay || !card) return;
    overlay.classList.remove("hidden");
    // Force reflow
    overlay.offsetHeight;
    card.classList.remove("scale-95", "opacity-0");
    card.classList.add("scale-100", "opacity-100");
}

function hideLoginOverlay() {
    const overlay = document.getElementById("loginOverlay");
    const card = document.getElementById("loginCard");
    if (!overlay || !card) return;
    card.classList.remove("scale-100", "opacity-100");
    card.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
        overlay.classList.add("hidden");
    }, 300);
}

async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem("pguard_token");
    if (!token) {
        showLoginOverlay();
        throw new Error("No admin token found");
    }

    if (!options.headers) {
        options.headers = {};
    }
    options.headers["Authorization"] = `Bearer ${token}`;

    const urlObj = new URL(url, window.location.origin);
    if (typeof currentTz !== 'undefined') {
        urlObj.searchParams.set("tz", currentTz);
    }

    const response = await fetch(urlObj.toString(), options);
    if (response.status === 401) {
        localStorage.removeItem("pguard_token");
        showLoginOverlay();
        throw new Error("Session expired");
    }
    return response;
}

// ------------------------------------------------------------------
// 초기 가동 (DOMContentLoaded)
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // 1. 다국어 선택기 및 초기화
    const langSelector = document.getElementById("langSelector");
    const loginLangSelector = document.getElementById("loginLangSelector");

    if (langSelector) langSelector.value = currentLang;
    if (loginLangSelector) loginLangSelector.value = currentLang;
    changeLanguage(currentLang);
    updateTenantUI();

    // 테마 초기화
    if (currentTheme === "light") {
        document.body.classList.add("light-theme");
        const sun = document.getElementById("themeSunIcon");
        const moon = document.getElementById("themeMoonIcon");
        if (sun) sun.classList.remove("hidden");
        if (moon) moon.classList.add("hidden");
    } else {
        document.body.classList.remove("light-theme");
        const sun = document.getElementById("themeSunIcon");
        const moon = document.getElementById("themeMoonIcon");
        if (sun) sun.classList.add("hidden");
        if (moon) moon.classList.remove("hidden");
    }

    // 테마 토글 버튼 이벤트 바인딩
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const body = document.body;
            const sun = document.getElementById("themeSunIcon");
            const moon = document.getElementById("themeMoonIcon");
            
            if (body.classList.contains("light-theme")) {
                body.classList.remove("light-theme");
                currentTheme = "dark";
                if (sun) sun.classList.add("hidden");
                if (moon) moon.classList.remove("hidden");
            } else {
                body.classList.add("light-theme");
                currentTheme = "light";
                if (sun) sun.classList.remove("hidden");
                if (moon) moon.classList.add("hidden");
            }
            localStorage.setItem("pguard_theme", currentTheme);
            updateChartTheme(currentTheme === "light");
        });
    }

    if (langSelector) {
        langSelector.addEventListener("change", (e) => {
            currentLang = e.target.value;
            localStorage.setItem("pguard_lang", currentLang);
            if (loginLangSelector) loginLangSelector.value = currentLang; // 양방향 동기화
            changeLanguage(currentLang);
            populateEmployeeDropdowns();
            fetchCurrentTab(); // 언어 변경 시 현재 탭의 데이터 리렌더링
        });
    }

    const tzSelector = document.getElementById("tzSelector");
    if (tzSelector) {
        tzSelector.value = currentTz;
        tzSelector.addEventListener("change", (e) => {
            currentTz = e.target.value;
            localStorage.setItem("pguard_timezone", currentTz);
            fetchCurrentTab(); // 타임존 변경 시 현재 탭 리렌더링
        });
    }

    if (loginLangSelector) {
        loginLangSelector.addEventListener("change", (e) => {
            currentLang = e.target.value;
            localStorage.setItem("pguard_lang", currentLang);
            if (langSelector) langSelector.value = currentLang; // 양방향 동기화
            changeLanguage(currentLang);
            populateEmployeeDropdowns();
            fetchCurrentTab(); // 언어 변경 시 현재 탭의 데이터 리렌더링
        });
    }

    // 2. 탭 전환 이벤트 바인딩
    const sidebarButtons = document.querySelectorAll("#sidebarMenu button[data-target]");
    sidebarButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const target = btn.getAttribute("data-target");
            switchTab(target);
        });
    });

    // 2.5 사이드바 그룹 아코디언 토글 바인딩
    bindNavGroups();

    // 3. 차트 초기화 및 초기 데이터 로드
    initCharts();
    updateTenantUI();
    // 로그인 상태이고 직원 모드면 '나의 결재' 탭으로 시작
    if (localStorage.getItem("pguard_token") && getAppMode() === "employee") {
        switchTab("tab-approval-user");
    } else {
        fetchCurrentTab();
    }
    populateEmployeeDropdowns();

    // 10초 실시간 폴링 가동 (결재 탭은 폼/입력 보존을 위해 자동 재렌더 제외, 배지만 갱신)
    setInterval(() => {
        if (typeof refreshPendingBadge === "function") refreshPendingBadge();
        if (activeTab === "tab-approval-user" || activeTab === "tab-approval-admin") return;
        fetchCurrentTab();
    }, 10000);

    // 새로고침 버튼 이벤트
    const refreshBtn = document.getElementById("refreshBtn");
    refreshBtn.addEventListener("click", () => {
        const icon = refreshBtn.querySelector("i");
        if (icon) icon.classList.add("animate-spin");
        fetchCurrentTab().finally(() => {
            setTimeout(() => {
                if (icon) icon.classList.remove("animate-spin");
            }, 600);
        });
    });

    // 상세 피드 비업무 위반 필터 이벤트 제거됨

    const btnPrevLogPage = document.getElementById("btnPrevLogPage");
    if (btnPrevLogPage) {
        btnPrevLogPage.addEventListener("click", () => {
            if (currentLogPage > 1) {
                currentLogPage--;
                renderLogsPage();
            }
        });
    }

    const btnNextLogPage = document.getElementById("btnNextLogPage");
    if (btnNextLogPage) {
        btnNextLogPage.addEventListener("click", () => {
            const totalPages = Math.ceil(cachedLogs.length / LOGS_PER_PAGE);
            if (currentLogPage < totalPages) {
                currentLogPage++;
                renderLogsPage();
            }
        });
    }

    // 비업무 로그 페이지네이션
    const btnPrevViolPage = document.getElementById("btnPrevViolPage");
    if (btnPrevViolPage) {
        btnPrevViolPage.addEventListener("click", () => {
            if (violCurrentPage > 1) { violCurrentPage--; renderViolationPage(); }
        });
    }
    const btnNextViolPage = document.getElementById("btnNextViolPage");
    if (btnNextViolPage) {
        btnNextViolPage.addEventListener("click", () => {
            const totalPages = Math.ceil(violCachedLogs.length / LOGS_TAB_PER_PAGE);
            if (violCurrentPage < totalPages) { violCurrentPage++; renderViolationPage(); }
        });
    }

    // 업무 로그 페이지네이션
    const btnPrevWorkPage = document.getElementById("btnPrevWorkPage");
    if (btnPrevWorkPage) {
        btnPrevWorkPage.addEventListener("click", () => {
            if (workCurrentPage > 1) { workCurrentPage--; renderWorkLogPage(); }
        });
    }
    const btnNextWorkPage = document.getElementById("btnNextWorkPage");
    if (btnNextWorkPage) {
        btnNextWorkPage.addEventListener("click", () => {
            const totalPages = Math.ceil(workCachedLogs.length / LOGS_TAB_PER_PAGE);
            if (workCurrentPage < totalPages) { workCurrentPage++; renderWorkLogPage(); }
        });
    }

    // 자리비움 로그 페이지네이션
    const btnPrevIdlePage = document.getElementById("btnPrevIdlePage");
    if (btnPrevIdlePage) {
        btnPrevIdlePage.addEventListener("click", () => {
            if (idleCurrentPage > 1) { idleCurrentPage--; renderIdleLogPage(); }
        });
    }
    const btnNextIdlePage = document.getElementById("btnNextIdlePage");
    if (btnNextIdlePage) {
        btnNextIdlePage.addEventListener("click", () => {
            const totalPages = Math.ceil(idleCachedLogs.length / LOGS_TAB_PER_PAGE);
            if (idleCurrentPage < totalPages) { idleCurrentPage++; renderIdleLogPage(); }
        });
    }

    // 데이터베이스 초기화(리셋) 이벤트 바인딩
    const resetDbBtn = document.getElementById("resetDbBtn");
    if (resetDbBtn) {
        resetDbBtn.addEventListener("click", handleDatabaseReset);
    }

    // 엑셀 내보내기 이벤트 바인딩
    const btnExportAll = document.getElementById("btnExportAll");
    if (btnExportAll) {
        btnExportAll.addEventListener("click", exportAllEmployeesToExcel);
    }
    const btnExportDetail = document.getElementById("btnExportDetail");
    if (btnExportDetail) {
        btnExportDetail.addEventListener("click", exportEmployeeDetailToExcel);
    }

    const btnSaveEmpTags = document.getElementById("btnSaveEmpTags");
    if (btnSaveEmpTags) {
        btnSaveEmpTags.addEventListener("click", async () => {
            if (!currentEmployeeStats) return;
            const empId = currentEmployeeStats.employee_id;
            const tagsInput = document.getElementById("editEmpTags").value;
            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/admin/employees/${empId}/tags`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tags: tagsInput })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "태그 저장 실패");
                }
                alert(currentLang === 'ko' ? "태그가 저장되었습니다." : "Tags saved successfully.");
                fetchEmployeeTab();
            } catch (err) {
                alert(err.message);
            }
        });
    }

    const subAdminRole = document.getElementById("subAdminRole");
    const subAdminTagsContainer = document.getElementById("subAdminTagsContainer");
    if (subAdminRole && subAdminTagsContainer) {
        subAdminRole.addEventListener("change", (e) => {
            if (e.target.value === "employee_manager") {
                subAdminTagsContainer.classList.remove("hidden");
            } else {
                subAdminTagsContainer.classList.add("hidden");
            }
        });
    }

    // 비업무 로그 날짜 + 직원 필터 적용
    const btnApplyViolFilter = document.getElementById("btnApplyViolFilter");
    if (btnApplyViolFilter) {
        btnApplyViolFilter.addEventListener("click", () => {
            const s = document.getElementById("violStartDate")?.value || null;
            const e = document.getElementById("violEndDate")?.value || null;
            const empId = document.getElementById("violEmployeeSelect")?.value || null;
            if (!validateDateRange(s, e)) return;
            fetchViolationTab(s, e, empId);
        });
    }
    const btnExportViolExcel = document.getElementById("btnExportViolExcel");
    if (btnExportViolExcel) {
        btnExportViolExcel.addEventListener("click", () => exportLogTabToExcel("non-work"));
    }

    // 업무 로그 날짜 + 직원 필터 적용
    const btnApplyWorkFilter = document.getElementById("btnApplyWorkFilter");
    if (btnApplyWorkFilter) {
        btnApplyWorkFilter.addEventListener("click", () => {
            const s = document.getElementById("workStartDate")?.value || null;
            const e = document.getElementById("workEndDate")?.value || null;
            const empId = document.getElementById("workEmployeeSelect")?.value || null;
            if (!validateDateRange(s, e)) return;
            fetchWorkLogTab(s, e, empId);
        });
    }
    const btnExportWorkExcel = document.getElementById("btnExportWorkExcel");
    if (btnExportWorkExcel) {
        btnExportWorkExcel.addEventListener("click", () => exportLogTabToExcel("work"));
    }

    // 자리비움 로그 날짜 + 직원 필터 적용
    const btnApplyIdleFilter = document.getElementById("btnApplyIdleFilter");
    if (btnApplyIdleFilter) {
        btnApplyIdleFilter.addEventListener("click", () => {
            const s = document.getElementById("idleStartDate")?.value || null;
            const e = document.getElementById("idleEndDate")?.value || null;
            const empId = document.getElementById("idleEmployeeSelect")?.value || null;
            if (!validateDateRange(s, e)) return;
            fetchIdleLogsTab(s, e, empId);
        });
    }
    const btnExportIdleExcel = document.getElementById("btnExportIdleExcel");
    if (btnExportIdleExcel) {
        btnExportIdleExcel.addEventListener("click", () => exportLogTabToExcel("idle"));
    }

    // ── 자리비움 시간 슬라이더
    const slider = document.getElementById("idleThresholdSlider");
    const display = document.getElementById("idleThresholdDisplay");
    if (slider && display) {
        slider.addEventListener("input", () => {
            display.textContent = slider.value;
        });
    }

    // ── 스캔 주기 슬라이더
    const scanSlider = document.getElementById("agentScanSlider");
    const scanDisplay = document.getElementById("agentScanDisplay");
    if (scanSlider && scanDisplay) {
        scanSlider.addEventListener("input", () => {
            scanDisplay.textContent = scanSlider.value;
        });
    }

    // ── 전송 주기 슬라이더
    const sendSlider = document.getElementById("agentSendSlider");
    const sendDisplay = document.getElementById("agentSendDisplay");
    if (sendSlider && sendDisplay) {
        sendSlider.addEventListener("input", () => {
            sendDisplay.textContent = sendSlider.value;
        });
    }

    // ── 자리비움 시간 저장 버튼
    const btnSaveIdle = document.getElementById("btnSaveIdleThreshold");
    if (btnSaveIdle) {
        btnSaveIdle.addEventListener("click", saveIdleThreshold);
    }

    // ── 에이전트 연동 토큰 표시/숨기기
    const btnToggleToken = document.getElementById("btnToggleTokenVisible");
    if (btnToggleToken) {
        btnToggleToken.addEventListener("click", () => {
            const tokenInput = document.getElementById("agentApiTokenInput");
            if (!tokenInput) return;
            const masked = tokenInput.type === "password";
            tokenInput.type = masked ? "text" : "password";
            btnToggleToken.innerHTML = masked
                ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
                : '<i data-lucide="eye" class="w-4 h-4"></i>';
            lucide.createIcons();
        });
    }

    // ── 에이전트 연동 토큰 재발급
    const btnRegenToken = document.getElementById("btnRegenToken");
    if (btnRegenToken) {
        btnRegenToken.addEventListener("click", async () => {
            if (!confirm(translations[currentLang].regen_token_success)) return;
            btnRegenToken.disabled = true;
            try {
                const idleSlider = document.getElementById('idleThresholdSlider');
                const scanSlider = document.getElementById('agentScanSlider');
                const sendSlider = document.getElementById('agentSendSlider');
                const resp = await authenticatedFetch(`${API_BASE_URL}/admin/company-settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idle_threshold_seconds: (parseInt(idleSlider?.value, 10) || 10) * 60,
                        agent_scan_interval_seconds: parseInt(scanSlider?.value, 10) || 2,
                        agent_send_interval_seconds: parseInt(sendSlider?.value, 10) || 600,
                        regenerate_token: true
                    })
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || '재발급 실패');
                const tokenInput = document.getElementById('agentApiTokenInput');
                if (tokenInput && data.api_token) {
                    tokenInput.value = data.api_token;
                    tokenInput.dataset.token = data.api_token;
                    tokenInput.type = 'password';
                }
                const msgEl = document.getElementById('idleSettingMsg');
                if (msgEl) {
                    msgEl.textContent = '✅ ' + (translations[currentLang].regen_token_success || '토큰이 재발급되었습니다.');
                    msgEl.className = 'text-xs mt-3 text-emerald-400';
                    msgEl.classList.remove('hidden');
                    setTimeout(() => msgEl.classList.add('hidden'), 6000);
                }
            } catch (err) {
                const msgEl = document.getElementById('idleSettingMsg');
                if (msgEl) {
                    msgEl.textContent = '❌ ' + err.message;
                    msgEl.className = 'text-xs mt-3 text-rose-400';
                    msgEl.classList.remove('hidden');
                }
            } finally {
                btnRegenToken.disabled = false;
            }
        });
    }

    // ── 전체 직원 메시지 전송 버튼
    const btnSendAll = document.getElementById("btnSendMessageAll");
    if (btnSendAll) {
        btnSendAll.addEventListener("click", () => openMsgModal(null, "전체 직원"));
    }

    // ── 메시지 모달 닫기
    document.getElementById("btnCloseMsgModal")?.addEventListener("click", closeMsgModal);
    document.getElementById("btnCancelMsg")?.addEventListener("click", closeMsgModal);
    document.getElementById("msgModal")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("msgModal")) closeMsgModal();
    });

    // ── 메시지 전송 버튼
    document.getElementById("btnSendMsg")?.addEventListener("click", sendAgentMessage);

    // ── 설정 탭 진입 시 자리비움 설정 및 직원 카드 로드
    document.querySelectorAll("#sidebarMenu button[data-target='tab-settings']").forEach(btn => {
        btn.addEventListener("click", () => {
            loadIdleThreshold();
            renderMessageEmpCards();
        });
    });

    // ── 관리자 활동 로그 탭 진입 시 초기 데이터 로드
    document.querySelectorAll("#sidebarMenu button[data-target='tab-audit']").forEach(btn => {
        btn.addEventListener("click", () => {
            fetchAuditTab(1);
        });
    });

    // ── 관리자 활동 로그 필터 적용 버튼
    const btnApplyAuditFilter = document.getElementById("btnApplyAuditFilter");
    if (btnApplyAuditFilter) {
        btnApplyAuditFilter.addEventListener("click", () => {
            const s = document.getElementById("auditStartDate")?.value || null;
            const e = document.getElementById("auditEndDate")?.value || null;
            if (s && e) {
                const sDate = new Date(s);
                const eDate = new Date(e);
                if (eDate < sDate) {
                    alert(currentLang === 'ko' ? "종료일은 시작일보다 이전일 수 없습니다." : "End date cannot be earlier than start date.");
                    return;
                }
            }
            fetchAuditTab(1);
        });
    }

    // ── 관리자 활동 로그 페이지네이션
    const btnPrevAuditPage = document.getElementById("btnPrevAuditPage");
    if (btnPrevAuditPage) {
        btnPrevAuditPage.addEventListener("click", () => {
            if (auditCurrentPage > 1) {
                fetchAuditTab(auditCurrentPage - 1);
            }
        });
    }

    const btnNextAuditPage = document.getElementById("btnNextAuditPage");
    if (btnNextAuditPage) {
        btnNextAuditPage.addEventListener("click", () => {
            if (auditCurrentPage < (auditPagination.pages || 1)) {
                fetchAuditTab(auditCurrentPage + 1);
            }
        });
    }

    // 4. 로그인 체크
    const token = localStorage.getItem("pguard_token");
    if (!token) {
        showLoginOverlay();
    }

    // 5. 로그인 폼 제출 이벤트 바인딩
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;
            // 단일 회사 운영: 회사 코드는 선택 입력 (아이디로 자동 판별)
            const company_code = document.getElementById("loginCompanyCode")?.value.trim() || "";
            const errorDiv = document.getElementById("loginError");
            const errorMsg = document.getElementById("loginErrorMsg");

            errorDiv.classList.add("hidden");

            try {
                // 통합 로그인: 먼저 관리자 로그인 시도, 실패하면 직원 로그인으로 폴백
                let data = null;
                let lastError = "로그인 실패";

                const adminResp = await fetch(`${API_BASE_URL}/admin/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, password, company_code })
                });

                if (adminResp.ok) {
                    data = await adminResp.json();
                } else {
                    const adminErr = await adminResp.json().catch(() => ({}));
                    lastError = adminErr.error || lastError;

                    // 직원 로그인 폴백
                    const empResp = await fetch(`${API_BASE_URL}/employee/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ login_id: id, password, company_code })
                    });
                    if (empResp.ok) {
                        data = await empResp.json();
                    } else {
                        const empErr = await empResp.json().catch(() => ({}));
                        // 관리자/직원 어느 쪽으로도 로그인 불가
                        lastError = empErr.error || lastError;
                    }
                }

                if (!data || !data.success || !data.token) {
                    throw new Error(lastError);
                }

                localStorage.setItem("pguard_token", data.token);
                localStorage.setItem("pguard_company_code", data.company_code);
                localStorage.setItem("pguard_admin_role", data.role || "admin");
                if (data.employee_id) localStorage.setItem("pguard_employee_id", data.employee_id);
                if (data.employee_name) localStorage.setItem("pguard_employee_name", data.employee_name);
                // 로그인 시 기본 모드: 직원은 employee, 관리자는 admin
                localStorage.setItem("pguard_app_mode", data.role === "employee" ? "employee" : "admin");

                document.getElementById("loginUsername").value = "";
                document.getElementById("loginPassword").value = "";
                document.getElementById("loginCompanyCode").value = "";

                hideLoginOverlay();

                updateTenantUI();
                // 모드에 맞는 기본 탭으로 이동 후 데이터 로딩
                if (getAppMode() === "employee") {
                    switchTab("tab-approval-user");
                } else {
                    fetchCurrentTab();
                }
            } catch (err) {
                errorMsg.textContent = err.message;
                errorDiv.classList.remove("hidden");
            }
        });
    }

    // 6. 보안 설정 변경 폼 이벤트 바인딩
    const securitySettingsForm = document.getElementById("securitySettingsForm");
    if (securitySettingsForm) {
        securitySettingsForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            // 단일 회사 운영: 입력란이 숨겨진 경우 로그인된 회사 코드를 자동 사용
            const companyCode = (document.getElementById("settingCompanyCode").value.trim())
                || (localStorage.getItem("pguard_company_code") || "").trim();
            const newPassword = document.getElementById("settingNewPassword").value.trim();

            if (!companyCode) {
                alert(currentLang === "ko" ? "회사 코드는 필수 입력 사항입니다." : "Company Code is required.");
                return;
            }

            const payload = { company_code: companyCode };
            if (newPassword) {
                payload.new_password = newPassword;
            }

            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "설정 저장 실패");
                }

                const data = await response.json();
                if (data.success) {
                    alert(currentLang === "ko" ? "설정이 성공적으로 저장되었습니다." : "Settings saved successfully.");
                    document.getElementById("settingNewPassword").value = "";
                }
            } catch (err) {
                alert((currentLang === "ko" ? "설정 저장 중 오류가 발생했습니다: " : "Error saving settings: ") + err.message);
            }
        });
    }

    // 6.5 서브 관리자 폼 이벤트 바인딩
    const subAdminForm = document.getElementById("subAdminForm");
    if (subAdminForm) {
        subAdminForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const adminId = document.getElementById("subAdminId").value.trim();
            const adminPassword = document.getElementById("subAdminPassword").value.trim();
            const adminRoleSelect = document.getElementById("subAdminRole");
            const adminRole = adminRoleSelect ? adminRoleSelect.value : "sub_admin";
            const adminTags = document.getElementById("subAdminTags") ? document.getElementById("subAdminTags").value.trim() : "";

            if (!adminId || !adminPassword) return;

            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/admin/sub_admins`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ admin_id: adminId, password: adminPassword, role: adminRole, tags: adminTags })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "관리자 생성 실패");
                }

                document.getElementById("subAdminId").value = "";
                document.getElementById("subAdminPassword").value = "";
                if (document.getElementById("subAdminTags")) {
                    document.getElementById("subAdminTags").value = "";
                }
                const loggedInRole = localStorage.getItem("pguard_admin_role") || "admin";
                if (adminRoleSelect) {
                    adminRoleSelect.value = loggedInRole === "sub_admin" ? "employee_manager" : "sub_admin";
                }
                const subAdminTagsContainer = document.getElementById("subAdminTagsContainer");
                if (subAdminTagsContainer) {
                    if (loggedInRole === "sub_admin") {
                        subAdminTagsContainer.classList.remove("hidden");
                    } else {
                        subAdminTagsContainer.classList.add("hidden");
                    }
                }
                alert(currentLang === "ko" ? "계정이 추가되었습니다." : "Account added.");
                fetchSubAdmins();
            } catch (err) {
                alert((currentLang === "ko" ? "오류 발생: " : "Error: ") + err.message);
            }
        });
    }

    // 7. 통합관리자(Super Admin) 폼 이벤트 바인딩
    const companyForm = document.getElementById("companyForm");
    if (companyForm) {
        companyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const code = document.getElementById("superCompCode").value.trim();
            const name = document.getElementById("superCompName").value.trim();

            if (!code || !name) return;

            try {
                let response;
                if (editCompanyCode) {
                    // 수정 (PUT)
                    response = await authenticatedFetch(`${API_BASE_URL}/super/companies/${editCompanyCode}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ company_name: name })
                    });
                } else {
                    // 등록 (POST)
                    response = await authenticatedFetch(`${API_BASE_URL}/super/companies`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ company_code: code, company_name: name })
                    });
                }

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "처리 실패");
                }

                const data = await response.json();
                if (data.success) {
                    alert(currentLang === 'ko' 
                        ? (editCompanyCode ? "회사 정보가 수정되었습니다." : "새 회사가 성공적으로 등록되었습니다.") 
                        : "Company successfully processed.");
                    resetCompanyForm();
                    await fetchSuperTab();
                }
            } catch (err) {
                alert((currentLang === 'ko' ? "처리 중 오류 발생: " : "Processing failed: ") + err.message);
            }
        });
    }

    const btnCompanyCancel = document.getElementById("btnCompanyCancel");
    if (btnCompanyCancel) {
        btnCompanyCancel.addEventListener("click", () => {
            resetCompanyForm();
        });
    }

    const superAdminForm = document.getElementById("superAdminForm");
    if (superAdminForm) {
        superAdminForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const company_code = document.getElementById("superAdminComp").value;
            const admin_id = document.getElementById("superAdminId").value.trim();
            const password = document.getElementById("superAdminPw").value;

            if (!company_code || !admin_id || !password) return;

            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/super/admins`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ admin_id, password, company_code })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "계정 생성 실패");
                }

                const data = await response.json();
                if (data.success) {
                    alert(currentLang === 'ko' ? "관리자 계정이 성공적으로 생성되었습니다." : "Admin account successfully created.");
                    document.getElementById("superAdminId").value = "";
                    document.getElementById("superAdminPw").value = "";
                    await fetchSuperTab();
                }
            } catch (err) {
                alert((currentLang === 'ko' ? "계정 생성 실패: " : "Account creation failed: ") + err.message);
            }
        });
    }

    // 7b. 분류 패턴 등록 폼 이벤트 바인딩
    const formAddPattern = document.getElementById("formAddPattern");
    if (formAddPattern) {
        formAddPattern.addEventListener("submit", async (e) => {
            e.preventDefault();
            const pattern_type = document.getElementById("patternType").value;
            const pattern_value = document.getElementById("patternValue").value.trim();
            const category = document.getElementById("patternCategory").value;

            if (!pattern_type || !pattern_value || !category) {
                alert(currentLang === 'ko' ? "모든 필드를 입력해 주세요." : "Please fill in all fields.");
                return;
            }

            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/admin/patterns`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pattern_type, pattern_value, category })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "등록 실패");
                }

                const data = await response.json();
                if (data.success) {
                    alert(currentLang === 'ko' ? "패턴이 등록되었습니다." : "Pattern registered successfully.");
                    document.getElementById("patternValue").value = "";
                    await fetchPatternsTab();
                }
            } catch (err) {
                alert((currentLang === 'ko' ? "패턴 등록 실패: " : "Failed to register pattern: ") + err.message);
            }
        });
    }

    // 8. 로그아웃 버튼 이벤트 바인딩
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            const dict = translations[currentLang] || translations["ko"];
            if (confirm(dict.logout_confirm)) {
                const token = localStorage.getItem("pguard_token");
                const isEmployee = (localStorage.getItem("pguard_admin_role") || "admin") === "employee";
                if (token) {
                    try {
                        await fetch(`${API_BASE_URL}/${isEmployee ? "employee" : "admin"}/logout`, {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                    } catch (e) {
                        console.error("Logout API request failed:", e);
                    }
                }
                localStorage.removeItem("pguard_token");
                localStorage.removeItem("pguard_company_code");
                localStorage.removeItem("pguard_admin_role");
                localStorage.removeItem("pguard_app_mode");
                localStorage.removeItem("pguard_employee_id");
                localStorage.removeItem("pguard_employee_name");
                showLoginOverlay();
                updateTenantUI();
                switchTab("tab-overview");
            }
        });
    }
});

// ------------------------------------------------------------------
// 탭 전환 코어 함수
// ------------------------------------------------------------------
function switchTab(targetTabId) {
    activeTab = targetTabId;

    // 1. 모든 탭 숨기기
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach(content => content.classList.add("hidden"));

    // 2. 선택한 탭 보이기
    const activeTabContent = document.getElementById(targetTabId);
    if (activeTabContent) activeTabContent.classList.remove("hidden");

    // 3. 사이드바 버튼 클래스 하이라이팅 제어 (모드/역할 가시성 포함)
    const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";
    const role = localStorage.getItem("pguard_admin_role") || "admin";
    const mode = getAppMode();
    const sidebarButtons = document.querySelectorAll("#sidebarMenu button[data-target]");
    sidebarButtons.forEach(btn => {
        const target = btn.getAttribute("data-target");
        const isEmployeeTab = EMPLOYEE_MODE_TABS.includes(target);

        // 현재 모드/역할에서 이 버튼이 보여야 하는지 판단
        let visible;
        if (mode === "employee") {
            visible = isEmployeeTab;
        } else {
            visible = !isEmployeeTab;
            if (target === "tab-super" && !isSuperAdmin) visible = false;
            if (target === "tab-patterns" && role === "employee_manager") visible = false;
            if (target === "tab-approval-admin" && role === "employee_manager") visible = false;
        }

        const hiddenSuffix = visible ? "" : " hidden";

        if (target === targetTabId) {
            btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-white font-medium transition duration-300" + hiddenSuffix;
            const icon = btn.querySelector("i");
            if (icon) icon.className = "w-5 h-5 text-indigo-400";
        } else {
            btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition duration-300" + hiddenSuffix;
            const icon = btn.querySelector("i");
            if (icon) icon.className = "w-5 h-5";
        }
    });

    // 3.5 활성 탭이 속한 그룹은 펼치고, 빈 그룹은 숨김
    const activeBtn = document.querySelector(`#sidebarMenu button[data-target="${targetTabId}"]`);
    const grpEl = activeBtn ? activeBtn.closest(".nav-group") : null;
    if (grpEl) {
        const g = grpEl.getAttribute("data-group");
        if (getCollapsedGroups().includes(g)) { setGroupCollapsed(g, false); applyGroupCollapsedState(g); }
    }
    updateNavGroups();

    // 4. 아이콘 다시 렌더링 (클래스 동적 변경 시 필요)
    lucide.createIcons();

    // 5. 헤더 다국어 타이틀 및 정보 변경
    const headerTitle = document.getElementById("headerTitle");
    const headerDesc = document.getElementById("headerDesc");
    const headerTag = document.querySelector("header span.tracking-widest");

    if (targetTabId === "tab-overview") {
        headerTag.setAttribute("data-i18n", "header_tag");
        headerTitle.setAttribute("data-i18n", "header_title");
        headerDesc.setAttribute("data-i18n", "header_desc");
    } else if (targetTabId === "tab-employees") {
        headerTag.textContent = "EMPLOYEES";
        headerTitle.setAttribute("data-i18n", "menu_employees");
        headerDesc.setAttribute("data-i18n", "emp_tab_desc");
    } else if (targetTabId === "tab-violations") {
        headerTag.textContent = "NON-WORK LOGS";
        headerTitle.setAttribute("data-i18n", "menu_violations");
        headerDesc.setAttribute("data-i18n", "violation_tab_desc");
    } else if (targetTabId === "tab-worklogs") {
        headerTag.textContent = "WORK LOGS";
        headerTitle.setAttribute("data-i18n", "menu_worklogs");
        headerDesc.setAttribute("data-i18n", "worklog_tab_desc");
    } else if (targetTabId === "tab-idle-logs") {
        headerTag.textContent = "AWAY LOGS";
        headerTitle.setAttribute("data-i18n", "menu_idlelogs");
        headerDesc.setAttribute("data-i18n", "idlelog_tab_desc");
    } else if (targetTabId === "tab-settings") {
        headerTag.textContent = "SYSTEM SETTINGS";
        headerTitle.setAttribute("data-i18n", "menu_settings");
        headerDesc.setAttribute("data-i18n", "settings_info_desc");
    } else if (targetTabId === "tab-super") {
        headerTag.textContent = "SUPER ADMIN";
        headerTitle.setAttribute("data-i18n", "menu_super");
        headerDesc.setAttribute("data-i18n", "super_company_desc");
    } else if (targetTabId === "tab-audit") {
        headerTag.textContent = "ADMIN AUDIT LOGS";
        headerTitle.setAttribute("data-i18n", "menu_audit");
        headerDesc.setAttribute("data-i18n", "audit_desc");
    } else if (targetTabId === "tab-patterns") {
        headerTag.textContent = "CLASSIFICATION PATTERNS";
        headerTitle.setAttribute("data-i18n", "menu_patterns");
        headerDesc.setAttribute("data-i18n", "tab_patterns_desc");
    } else if (targetTabId === "tab-approval-admin") {
        headerTag.textContent = "APPROVAL ADMIN";
        headerTitle.setAttribute("data-i18n", "approval_admin_title");
        headerDesc.setAttribute("data-i18n", "approval_admin_desc");
    } else if (targetTabId === "tab-approval-user") {
        headerTag.textContent = "MY APPROVALS";
        headerTitle.setAttribute("data-i18n", "approval_user_title");
        headerDesc.setAttribute("data-i18n", "approval_user_desc");
    } else if (targetTabId === "tab-employee-mgmt") {
        headerTag.textContent = "EMPLOYEE MGMT";
        headerTitle.setAttribute("data-i18n", "menu_employee_mgmt");
        headerDesc.setAttribute("data-i18n", "emp_mgmt_desc");
    } else if (targetTabId === "tab-org-chart") {
        headerTag.textContent = "ORG CHART";
        headerTitle.setAttribute("data-i18n", "menu_org_chart");
        headerDesc.setAttribute("data-i18n", "org_desc");
    }

    changeLanguage(currentLang); // 동적으로 할당된 data-i18n 바로 번역 적용
    fetchCurrentTab(); // 새로 켜진 탭 데이터 로드
}

function getLocale(lang) {
    const map = {
        'ko': 'ko-KR',
        'en': 'en-US',
        'th': 'th-TH',
        'lo': 'th-TH' // 라오스 언어 선택 시 날짜 형식을 태국(th-TH)과 동일하게 적용
    };
    return map[lang] || 'en-US';
}

function updateTodayDate() {
    const dateTextEl = document.getElementById("currentDateText");
    if (!dateTextEl) return;
    
    const now = new Date();
    const locale = getLocale(currentLang);
    
    // 언어별 포맷팅 옵션
    let options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    if (currentLang === 'ko') {
        options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
    }
    
    let dateStr = now.toLocaleDateString(locale, options);
    
    // 한국어의 경우 '2026. 05. 26. (화)' 형태로 깔끔하게 보정
    if (currentLang === 'ko') {
        dateStr = dateStr.replace(/\. \(/g, ' (');
    }
    
    dateTextEl.textContent = dateStr;
}

// ------------------------------------------------------------------
// 다국어 치환 핵심 엔진
// ------------------------------------------------------------------
function changeLanguage(lang) {
    const dict = translations[lang] || translations["ko"];
    
    document.documentElement.lang = getLocale(lang);

    // data-i18n 속성이 부여된 모든 텍스트 변경
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // data-i18n-placeholder 속성이 부여된 모든 입력창 번역 변경
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key]) {
            el.setAttribute("placeholder", dict[key]);
        }
    });

    // 오늘 날짜 갱신 추가
    updateTodayDate();
}

// ------------------------------------------------------------------
// 현재 활성화된 탭의 API 분기 호출
// ------------------------------------------------------------------
async function fetchCurrentTab() {
    updateTenantUI();
    if (typeof refreshPendingBadge === "function") refreshPendingBadge();
    if (activeTab === "tab-overview") {
        await fetchDashboardData();
    } else if (activeTab === "tab-employees") {
        await fetchEmployeeTab();
    } else if (activeTab === "tab-violations") {
        await fetchViolationTab();
    } else if (activeTab === "tab-worklogs") {
        await fetchWorkLogTab();
    } else if (activeTab === "tab-idle-logs") {
        await fetchIdleLogsTab();
    } else if (activeTab === "tab-settings") {
        await fetchSettingsTab();
    } else if (activeTab === "tab-super") {
        await fetchSuperTab();
    } else if (activeTab === "tab-audit") {
        await fetchAuditTab();
    } else if (activeTab === "tab-patterns") {
        await fetchPatternsTab();
    } else if (activeTab === "tab-approval-admin") {
        await fetchApprovalAdminTab();
    } else if (activeTab === "tab-approval-user") {
        await fetchApprovalUserTab();
    } else if (activeTab === "tab-employee-mgmt") {
        fetchEmployeeMgmtTab();
    } else if (activeTab === "tab-org-chart") {
        fetchOrgChartTab();
    }
}

async function fetchSettingsTab() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/settings`);
        if (!response.ok) throw new Error("Settings fetch failed");
        const data = await response.json();
        const inputCompanyCode = document.getElementById("settingCompanyCode");
        if (inputCompanyCode) {
            inputCompanyCode.value = data.company_code || "";
            
            // Disable company code editing for non-auton administrators
            const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";
            if (!isSuperAdmin) {
                inputCompanyCode.disabled = true;
                inputCompanyCode.classList.add("opacity-60", "cursor-not-allowed");
            } else {
                inputCompanyCode.disabled = false;
                inputCompanyCode.classList.remove("opacity-60", "cursor-not-allowed");
            }
        }
        
        const role = localStorage.getItem("pguard_admin_role") || "admin";
        if (role === "admin") {
            await fetchSubAdmins();
        }
    } catch (err) {
        console.error("Failed to load settings:", err);
    }
}

// ------------------------------------------------------------------
// Chart.js 초기화
// ------------------------------------------------------------------
function initCharts() {
    const dict = translations[currentLang];
    
    // 1. 카테고리 비율 도넛 차트
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: [dict.legend_work, dict.legend_nonwork, dict.legend_idle],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#6366F1', '#F43F5E', '#F59E0B'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            cutout: '75%'
        }
    });

    // 2. 프로그램 가로 바 차트
    const ctxProg = document.getElementById('programChart').getContext('2d');
    programChart = new Chart(ctxProg, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                borderRadius: 8,
                borderWidth: 0,
                barThickness: 16
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94A3B8', font: { family: 'Inter' } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#F3F4F6', font: { family: 'Inter', weight: 'bold' } }
                }
            }
        }
    });

    // 테마 설정에 따른 차트 라벨 색상 반영
    updateChartTheme(currentTheme === "light");
}

// 차트 테마 업데이트 유틸리티
function updateChartTheme(isLight) {
    if (!programChart) return;
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
    const xTickColor = isLight ? '#475569' : '#94A3B8';
    const yTickColor = isLight ? '#0F172A' : '#F3F4F6';

    programChart.options.scales.x.grid.color = gridColor;
    programChart.options.scales.x.ticks.color = xTickColor;
    programChart.options.scales.y.ticks.color = yTickColor;
    programChart.update();
}

// ------------------------------------------------------------------
// 종합 모니터링 탭 - 데이터 가져오기 및 통계 바인딩
// ------------------------------------------------------------------
async function fetchDashboardData() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/stats?tz=${currentTz}`);
        if (!response.ok) throw new Error("API stats 로딩 실패");
        
        const data = await response.json();
        
        // 1. KPI 바인딩
        updateSummaryKPIs(data);
        
        // 2. 카테고리 차트 갱신
        updateCategoryChart(data.categoryDist);

        // 3. 프로그램 차트 갱신
        updateProgramChart(data.programs);

        // 4. 실시간 활성 사용자 리스트
        updateRealtimeUsers(data.employees);

        // 5. 비업무 도메인 리더보드
        updateLeaderboard(data.nonWorkDomains);

        // 6. 하단 원시 로그 로드
        await fetchLogs();

    } catch (err) {
        console.error("종합 모니터링 데이터 패칭 실패:", err);
    }
}

function updateSummaryKPIs(data) {
    const totalEmp = data.employees ? data.employees.length : 0;
    const activeEmp = data.employees ? data.employees.filter(e => e.status === 'active').length : 0;
    
    // 오늘 비업무 시간(초) -> 시간/분 단위로 가독성 있게 치환
    const nonWorkSeconds = data.categoryDist['non-work'] || 0;
    const nonWorkMin = Math.round(nonWorkSeconds / 60);

    // 업무 생산성 (순수 업무 / (업무+비업무))
    const workSec = data.categoryDist.work || 0;
    const nonWorkSec = data.categoryDist['non-work'] || 0;
    const totalSec = workSec + nonWorkSec;
    const prodPercent = totalSec > 0 ? ((workSec / totalSec) * 100).toFixed(1) : "0.0";

    const idleSeconds = data.categoryDist.idle || 0;
    const idleMin = Math.round(idleSeconds / 60);

    const dict = translations[currentLang];

    document.getElementById("kpiTotalEmp").textContent = `${totalEmp}${currentLang === 'ko' ? '명' : ' staff'}`;
    document.getElementById("kpiActiveEmp").textContent = `${activeEmp}${currentLang === 'ko' ? '명' : ' active'}`;
    document.getElementById("kpiNonWorkCount").textContent = `${nonWorkMin}${currentLang === 'ko' ? '분' : ' mins'}`;
    document.getElementById("kpiProductivity").textContent = `${prodPercent}%`;
    const kpiIdleTime = document.getElementById("kpiIdleTime");
    if (kpiIdleTime) {
        kpiIdleTime.textContent = `${idleMin}${currentLang === 'ko' ? '분' : ' mins'}`;
    }
}

function updateCategoryChart(dist) {
    if (!categoryChart || !dist) return;

    const dict = translations[currentLang];
    
    // 다국어 지원에 맞춘 범례 갱신
    categoryChart.data.labels = [dict.legend_work, dict.legend_nonwork, dict.legend_idle];
    
    const workMin = Math.round((dist.work || 0) / 60);
    const nonWorkMin = Math.round((dist['non-work'] || 0) / 60);
    const idleMin = Math.round((dist.idle || 0) / 60);

    categoryChart.data.datasets[0].data = [workMin, nonWorkMin, idleMin];
    categoryChart.update();
}

function updateProgramChart(programs) {
    if (!programChart || !Array.isArray(programs)) return;

    const top5 = programs.slice(0, 5);
    const labels = top5.map(p => {
        // 특정 주요 프로그램 명칭 영문화 맵핑 지원
        if (currentLang !== 'ko') {
            if (p.program_group === '기타 유틸리티') return 'Others';
            if (p.program_group === 'Web Browser') return 'Web Browser';
        }
        return p.program_group;
    });
    
    const durations = top5.map(p => Math.round(p.total_duration / 60));

    programChart.data.labels = labels;
    programChart.data.datasets[0].data = durations;
    programChart.update();
}

function updateRealtimeUsers(employees) {
    const listContainer = document.getElementById("realtimeUserList");
    if (!listContainer || !Array.isArray(employees)) return;

    listContainer.innerHTML = "";
    const dict = translations[currentLang];

    if (employees.length === 0) {
        listContainer.innerHTML = `
            <div class="col-span-full text-center text-xs text-slate-500 py-10">${dict.no_data_desc}</div>
        `;
        return;
    }

    employees.forEach(emp => {
        const isActive = emp.status === 'active';
        const pulse = isActive ? "bg-emerald-500 pulse-emerald" : "bg-amber-500";
        
        const badge = isActive
            ? `<span class="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-medium border border-emerald-500/20">${dict.status_online}</span>`
            : `<span class="text-xs px-2.5 py-1 bg-slate-500/10 text-slate-400 rounded-lg font-medium border border-slate-500/20">${dict.status_away}</span>`;

        // 최초 접속 시간 처리 (서버에서 가져온 first_seen 타임스탬프 파싱)
        let firstSeenText = "-";
        if (emp.first_seen) {
            try {
                const date = new Date(emp.first_seen);
                const locale = getLocale(currentLang);
                const dateStr = date.toLocaleDateString(locale, { timeZone: currentTz, month: '2-digit', day: '2-digit' });
                const timeStr = date.toLocaleTimeString(locale, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                firstSeenText = `${dateStr} ${timeStr}`;
            } catch (e) {
                firstSeenText = "-";
            }
        }
        
        const lblFirstSeen = currentLang === 'ko' ? '최초 접속' : 'First Seen';

        // 온라인인 경우에만 활성화되는 메시지 발송 버튼
        const msgBtn = isActive
            ? `<button onclick="sendDirectMessage('${emp.employee_id}', '${emp.employee_name}')" class="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-[11px] font-bold transition duration-200 cursor-pointer">
                   <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                   <span>${currentLang === 'ko' ? '메시지 전송' : 'Send Message'}</span>
               </button>`
            : `<button disabled class="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-500 border border-transparent rounded-lg text-[11px] font-bold cursor-not-allowed">
                   <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                   <span>${currentLang === 'ko' ? '오프라인' : 'Offline'}</span>
               </button>`;

        const card = document.createElement("div");
        card.className = "flex flex-col justify-between p-4 bg-white/5 border border-cardBorder rounded-2xl hover:border-indigo-500/35 transition duration-500 group";
        card.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-2.5 h-2.5 ${pulse} rounded-full"></div>
                        <h5 class="text-sm font-bold text-white group-hover:text-indigo-300 transition duration-300">${emp.employee_name}</h5>
                    </div>
                    ${badge}
                </div>
                
                <div class="text-xs space-y-1.5 font-medium text-slate-400">
                    <div class="flex justify-between">
                        <span>${dict.lbl_emp_id || (currentLang === 'ko' ? '사번' : 'Employee ID')}:</span>
                        <span class="font-mono text-slate-200">${emp.employee_id}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>${lblFirstSeen}:</span>
                        <span class="font-mono text-indigo-300">${firstSeenText}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-white/5 flex justify-end">
                ${msgBtn}
            </div>
        `;
        listContainer.appendChild(card);
    });

    // 동적으로 생성된 Lucide 아이콘들 생성/바인딩 보장
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

// ------------------------------------------------------------------
// 직행 실시간 메시지 발송 글로벌 핸들러
// ------------------------------------------------------------------
window.sendDirectMessage = async function(employeeId, employeeName) {
    const promptText = currentLang === 'ko' 
        ? `[${employeeName} (${employeeId})] 직원에게 보낼 실시간 알림 메시지를 입력해 주세요.`
        : `Enter direct alert message to send to [${employeeName} (${employeeId})]:`;
        
    const message = prompt(promptText);
    if (!message || !message.trim()) return;

    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/admin/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                employee_id: employeeId,
                message: message.trim()
            })
        });

        if (resp.ok) {
            const successText = currentLang === 'ko'
                ? "메시지가 해당 직원의 에이전트 팝업으로 실시간 전송되었습니다."
                : "Message sent in real-time to the agent popup.";
            alert(successText);
        } else {
            const errData = await resp.json();
            const failText = currentLang === 'ko' ? "메시지 발송 실패: " : "Failed to send message: ";
            alert(failText + (errData.error || "Unknown error"));
        }
    } catch (e) {
        const errText = currentLang === 'ko' ? "통신 오류 발생: " : "Communication error: ";
        alert(errText + e.message);
    }
};

function updateLeaderboard(domains) {
    const board = document.getElementById("nonWorkLeaderboard");
    if (!board || !Array.isArray(domains)) return;

    board.innerHTML = "";
    const dict = translations[currentLang];

    if (domains.length === 0) {
        board.innerHTML = `
            <div class="text-center text-xs text-slate-500 py-10">${dict.no_data_desc}</div>
        `;
        return;
    }

    const maxVal = domains[0]?.total_duration || 1;

    domains.forEach((item, index) => {
        const min = Math.round(item.total_duration / 60);
        const percent = Math.min(100, Math.round((item.total_duration / maxVal) * 100));
        
        let medal = `<span class="text-slate-400 font-bold font-outfit">${index + 1}</span>`;
        if (index === 0) medal = `🥇`;
        else if (index === 1) medal = `🥈`;
        else if (index === 2) medal = `🥉`;

        const row = document.createElement("div");
        row.className = "space-y-1.5 p-2 rounded-xl hover:bg-white/5 transition duration-300";
        row.innerHTML = `
            <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                    ${medal}
                    <span class="font-semibold text-slate-200">${item.domain}</span>
                </div>
                <div class="flex gap-2">
                    <span class="text-pink-400 font-bold">${min}${currentLang === 'ko' ? '분' : 'm'}</span>
                    <span class="text-slate-500">(${item.visit_count}${currentLang === 'ko' ? '회' : 'x'})</span>
                </div>
            </div>
            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-pink-500 to-rose-600 h-full rounded-full" style="width: ${percent}%"></div>
            </div>
        `;
        board.appendChild(row);
    });
}

let currentLogPage = 1;
const LOGS_PER_PAGE = 10;
let cachedLogs = [];

async function fetchLogs() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/logs?category=idle&today_only=true&tz=${currentTz}`);
        if (!response.ok) throw new Error("Logs 로딩 실패");
        
        cachedLogs = mergeConsecutiveLogs(await response.json());
        currentLogPage = 1;
        renderLogsPage();
    } catch (e) {
        console.error("원시 로그 로딩 에러:", e);
    }
}

function renderLogsPage() {
    const body = document.getElementById("detailedLogBody");
    if (!body) return;

    body.innerHTML = "";
    const dict = translations[currentLang];

    if (!cachedLogs || cachedLogs.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="6" class="py-8 text-center text-slate-500">${dict.no_data_desc || '데이터가 없습니다.'}</td>
            </tr>
        `;
        document.getElementById("logPaginationInfo").textContent = "";
        document.getElementById("btnPrevLogPage").disabled = true;
        document.getElementById("btnNextLogPage").disabled = true;
        return;
    }

    const totalPages = Math.ceil(cachedLogs.length / LOGS_PER_PAGE);
    if (currentLogPage < 1) currentLogPage = 1;
    if (currentLogPage > totalPages) currentLogPage = totalPages;

    const startIndex = (currentLogPage - 1) * LOGS_PER_PAGE;
    const endIndex = Math.min(startIndex + LOGS_PER_PAGE, cachedLogs.length);
    const pagedLogs = cachedLogs.slice(startIndex, endIndex);

    pagedLogs.forEach(log => {
        const date = new Date(log.timestamp);
        const locale = getLocale(currentLang);
        const dateStr = date.toLocaleDateString(locale, { timeZone: currentTz, month: '2-digit', day: '2-digit' });
        const timeStr = date.toLocaleTimeString(locale, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateTimeStr = `${dateStr} ${timeStr}`;
        
        let badge = "";
        if (log.category === 'work') {
            badge = `<span class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-semibold text-[10px]">${dict.category_work || '업무'}</span>`;
        } else if (log.category === 'non-work') {
            badge = `<span class="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-semibold text-[10px]">${dict.category_nonwork || '비업무'}</span>`;
        } else {
            badge = `<span class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold text-[10px]">${dict.category_idle || '자리비움'}</span>`;
        }

        const titleShort = log.window_title.length > 30 ? log.window_title.substring(0, 30) + "..." : log.window_title;
        const durStr = log.duration >= 60 
            ? `${Math.floor(log.duration / 60)}${currentLang === 'ko' ? '분' : 'm'} ${log.duration % 60}${currentLang === 'ko' ? '초' : 's'}`
            : `${log.duration}${currentLang === 'ko' ? '초' : 's'}`;

        const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";
        const companyCell = isSuperAdmin ? `<td class="py-3 px-4 text-indigo-300 font-mono font-semibold">${log.company_code}</td>` : "";

        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/5 transition duration-200 border-b border-white/5";
        tr.innerHTML = `
            <td class="py-3 px-4 font-mono text-slate-400">${dateTimeStr}</td>
            <td class="py-3 px-4 text-white font-medium">${log.employee_name} <span class="text-[10px] text-slate-500 font-mono block">${log.employee_id}</span></td>
            ${companyCell}
            <td class="py-3 px-4 text-slate-300 font-mono">${log.process_name}</td>
            <td class="py-3 px-4 text-slate-400" title="${log.window_title}">${titleShort} ${log.domain ? `<span class="text-[10px] text-pink-400 bg-pink-500/5 px-1.5 py-0.5 rounded border border-pink-500/10 ml-1 font-mono">${log.domain}</span>` : ''}</td>
            <td class="py-3 px-4 text-center">${badge}</td>
            <td class="py-3 px-4 text-right font-mono font-bold text-slate-300">${durStr}</td>
        `;
        body.appendChild(tr);
    });

    document.getElementById("logPaginationInfo").textContent = `${currentLogPage} / ${totalPages} Page (${cachedLogs.length} total)`;
    document.getElementById("btnPrevLogPage").disabled = currentLogPage === 1;
    document.getElementById("btnNextLogPage").disabled = currentLogPage === totalPages;
}

// ------------------------------------------------------------------
// TAB 2: 직원 활동 현황 - 데이터 렌더링
// ------------------------------------------------------------------
async function fetchEmployeeTab() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/stats?tz=${currentTz}`);
        if (!response.ok) throw new Error("직원 목록 로드 실패");

        const data = await response.json();
        const body = document.getElementById("employeeListBody");
        if (!body) return;

        body.innerHTML = "";
        const dict = translations[currentLang];

        if (!data.employees || data.employees.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="8" class="py-8 text-center text-slate-500">${dict.no_data_desc}</td>
                </tr>
            `;
            return;
        }

        // 설정 탭 메시지 카드를 위해 직원 데이터 캐시
        window._cachedEmployees = data.employees;

        data.employees.forEach(emp => {
            const date = new Date(emp.last_seen);
            const lastSeenStr = date.toLocaleString(getLocale(currentLang), { timeZone: currentTz });

            const isActive = emp.status === 'active';
            const pulse = isActive ? "bg-emerald-500 pulse-emerald" : "bg-amber-500";
            const badge = isActive
                ? `<span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold border border-emerald-500/20">${dict.status_online}</span>`
                : `<span class="px-3 py-1 bg-slate-500/10 text-slate-400 rounded-lg font-bold border border-slate-500/20">${dict.status_away}</span>`;

            const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";
            const companyCell = isSuperAdmin ? `<td class="py-4 px-4 text-indigo-300 font-mono font-semibold">${emp.company_code}</td>` : "";

            const tagsList = emp.tags ? emp.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            const tagsBadge = tagsList.length > 0
                ? tagsList.map(t => `<span class="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20 text-xs">${t}</span>`).join(' ')
                : `<span class="text-slate-600">-</span>`;

            const tr = document.createElement("tr");
            tr.className = "hover:bg-white/5 transition duration-200 border-b border-white/5 cursor-pointer employee-row group";
            tr.setAttribute("data-emp-id", emp.employee_id);
            tr.innerHTML = `
                <td class="py-4 px-4 text-indigo-400 font-mono font-bold">${emp.employee_id}</td>
                <td class="py-4 px-4 text-white font-medium text-sm">${emp.employee_name}</td>
                <td class="py-4 px-4">${tagsBadge}</td>
                ${companyCell}
                <td class="py-4 px-4 text-slate-400">${lastSeenStr}</td>
                <td class="py-4 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <span class="inline-block w-2.5 h-2.5 rounded-full ${pulse}"></span>
                        ${badge}
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <button onclick="openMsgModal('${emp.employee_id}', '${emp.employee_name.replace(/'/g, "&#39;")}')" 
                        title="메시지 전송" 
                        class="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </td>
                <td class="py-4 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button class="px-2.5 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition duration-200 btn-analyze-emp" data-emp-id="${emp.employee_id}">
                            <i data-lucide="bar-chart-3" class="w-3.5 h-3.5 inline mr-1"></i>${dict.btn_analyze || "분석"}
                        </button>
                        <button onclick="event.stopPropagation(); deleteEmployee('${emp.employee_id}', '${emp.employee_name.replace(/'/g, "\\'")}')" 
                            title="${dict.btn_delete || '삭제'}"
                            class="px-2.5 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-semibold transition duration-200">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5 inline mr-1"></i>${dict.btn_delete || "삭제"}
                        </button>
                    </div>
                </td>
            `;
            body.appendChild(tr);
        });

        // 행 및 분석 버튼 클릭 이벤트 바인딩
        body.querySelectorAll(".employee-row").forEach(row => {
            row.addEventListener("click", (e) => {
                if (e.target.closest("button")) return;
                const empId = row.getAttribute("data-emp-id");
                // 선택 강조 효과
                body.querySelectorAll(".employee-row").forEach(r => r.classList.remove("bg-indigo-600/10", "border-l-2", "border-indigo-500"));
                row.classList.add("bg-indigo-600/10", "border-l-2", "border-indigo-500");
                loadEmployeeStats(empId);
            });
        });

        body.querySelectorAll(".btn-analyze-emp").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const empId = btn.getAttribute("data-emp-id");
                // 해당 행 강조
                const parentRow = btn.closest(".employee-row");
                body.querySelectorAll(".employee-row").forEach(r => r.classList.remove("bg-indigo-600/10", "border-l-2", "border-indigo-500"));
                if (parentRow) parentRow.classList.add("bg-indigo-600/10", "border-l-2", "border-indigo-500");
                loadEmployeeStats(empId);
            });
        });

        lucide.createIcons();
    } catch (e) {
        console.error("직원 탭 로딩 에러:", e);
    }
}

// ------------------------------------------------------------------
// 직원 드롭다운 채우기 (비업무/업무 로그 탭 공용)
// ------------------------------------------------------------------
async function populateEmployeeDropdowns() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/stats?tz=${currentTz}`);
        if (!response.ok) return;
        const data = await response.json();
        const employees = data.employees || [];

        const selectors = ['violEmployeeSelect', 'workEmployeeSelect', 'idleEmployeeSelect'];
        selectors.forEach(selId => {
            const sel = document.getElementById(selId);
            if (!sel) return;
            // 기존 옵션 유지 (첫번째 "전체 직원")
            while (sel.options.length > 1) sel.remove(1);
            employees.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp.employee_id;
                opt.textContent = `${emp.employee_name} (${emp.employee_id})`;
                sel.appendChild(opt);
            });
        });
    } catch (e) {
        console.error('직원 목록 로딩 실패:', e);
    }
}

// ------------------------------------------------------------------
// 체류시간 합계 배지 업데이트
// ------------------------------------------------------------------
function updateTotalDurationBadge(logs, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const dict = translations[currentLang];
    const totalSec = (logs || []).reduce((sum, log) => sum + (log.duration || 0), 0);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const h = dict.duration_hours || '시간';
    const m = dict.duration_minutes || '분';
    const s = dict.duration_seconds || '초';
    const totalLabel = dict.duration_total || '합계';
    const itemsLabel = dict.duration_items || '건';
    let display = '';
    if (hours > 0) {
        display = `${hours}${h} ${mins}${m} ${secs}${s}`;
    } else if (mins > 0) {
        display = `${mins}${m} ${secs}${s}`;
    } else {
        display = `${secs}${s}`;
    }
    const span = el.querySelector('span');
    if (span) {
        span.textContent = `${totalLabel}: ${display} (${logs.length}${itemsLabel})`;
    }
}

// ------------------------------------------------------------------
// TAB 3: 비업무 로그 + TAB 3b: 업무 로그 - 데이터 렌더링 (페이지네이션 포함)
// ------------------------------------------------------------------
const LOGS_TAB_PER_PAGE = 20;
let violCachedLogs = [];
let violCurrentPage = 1;
let workCachedLogs = [];
let workCurrentPage = 1;
let idleCachedLogs = [];
let idleCurrentPage = 1;

function mergeConsecutiveLogs(logs) {
    if (!Array.isArray(logs) || logs.length === 0) return [];
    const merged = [];
    let current = null;
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        if (current === null) {
            current = {
                ...log,
                ids: [log.id],
                original_timestamps: [log.timestamp]
            };
        } else {
            const isSame = 
                current.employee_id === log.employee_id &&
                current.process_name === log.process_name &&
                current.window_title === log.window_title &&
                current.category === log.category &&
                current.domain === log.domain &&
                current.idle_reason === log.idle_reason &&
                current.idle_detailed_reason === log.idle_detailed_reason;
            if (isSame) {
                current.duration += log.duration;
                current.ids.push(log.id);
                current.original_timestamps.push(log.timestamp);
            } else {
                current.id = current.ids.join(',');
                merged.push(current);
                current = {
                    ...log,
                    ids: [log.id],
                    original_timestamps: [log.timestamp]
                };
            }
        }
    }
    if (current !== null) {
        current.id = current.ids.join(',');
        merged.push(current);
    }
    return merged;
}

async function fetchViolationTab(startDate = null, endDate = null, employeeId = null) {
    try {
        let url = `${API_BASE_URL}/dashboard/logs?category=non-work`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        if (employeeId) url += `&employee_id=${encodeURIComponent(employeeId)}`;
        const response = await authenticatedFetch(url);
        if (!response.ok) throw new Error("비업무 로그 로드 실패");
        violCachedLogs = mergeConsecutiveLogs(await response.json());
        violCurrentPage = 1;
        renderViolationPage();
        updateTotalDurationBadge(violCachedLogs, 'violTotalDuration');
    } catch (e) {
        console.error("비업무 로그 탭 로딩 에러:", e);
    }
}

function renderViolationPage() {
    const body = document.getElementById("violationListBody");
    if (!body) return;
    body.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(violCachedLogs.length / LOGS_TAB_PER_PAGE));
    const start = (violCurrentPage - 1) * LOGS_TAB_PER_PAGE;
    const pageLogs = violCachedLogs.slice(start, start + LOGS_TAB_PER_PAGE);

    const pageInfo = document.getElementById("violPageInfo");
    if (pageInfo) pageInfo.textContent = `${violCurrentPage} / ${totalPages}`;

    if (violCachedLogs.length === 0) {
        const dict = translations[currentLang];
        body.innerHTML = `<tr><td colspan="9" class="py-8 text-center text-slate-500">${dict.no_data_desc || '데이터 없음'}</td></tr>`;
        return;
    }

    const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";

    pageLogs.forEach(log => {
        const timeStr = new Date(log.timestamp).toLocaleString(getLocale(currentLang), { timeZone: currentTz });
        const titleShort = (log.window_title || '').length > 35 ? log.window_title.substring(0, 35) + "..." : (log.window_title || '-');
        const durStr = `${Math.floor(log.duration / 60)}${currentLang === 'ko' ? '분' : 'm'} ${log.duration % 60}${currentLang === 'ko' ? '초' : 's'}`;
        const companyCell = isSuperAdmin ? `<td class="py-3 px-4 text-indigo-300 font-mono text-xs">${log.company_code}</td>` : "";

        let reasonBadge = '-';
        if (log.idle_reason) {
            const detailText = log.idle_detailed_reason ? ` (${log.idle_detailed_reason})` : '';
            const trimmedReason = log.idle_reason.trim().toLowerCase();
            const badgeColor = ['휴식','식사','화장실','담배','rest','meal','restroom','smoking','toilet','smoke','พัก','ทานข้าว','ห้องน้ำ','สูบบุหรี่','ພັກ','ກິນເຂົ້າ','ຫ້ອງນ້ຳ','ສູບຢາ'].includes(trimmedReason)
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            reasonBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}" title="${log.idle_reason}${detailText}">${log.idle_reason}${detailText}</span>`;
        }

        const tr = document.createElement("tr");
        tr.id = `viol-row-${log.id}`;
        tr.className = "hover:bg-white/5 border-b border-white/5 transition duration-200";
        tr.innerHTML = `
            <td class="py-3 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">${timeStr}</td>
            <td class="py-3 px-4 text-white font-medium text-xs">${log.employee_name} <span class="text-[10px] text-slate-500 font-mono block">${log.employee_id}</span></td>
            ${companyCell}
            <td class="py-3 px-4 text-slate-300 font-mono text-xs">${log.process_name || '-'}</td>
            <td class="py-3 px-4 text-xs"><span class="px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded font-mono">${log.domain || '-'}</span></td>
            <td class="py-3 px-4 text-xs">${reasonBadge}</td>
            <td class="py-3 px-4 text-slate-400 text-xs" title="${log.window_title || ''}">${titleShort}</td>
            <td class="py-3 px-4 text-right font-mono font-bold text-rose-400 text-xs whitespace-nowrap">${durStr}</td>
            <td class="py-3 px-4 text-center">
                ${(localStorage.getItem("pguard_admin_role") || "admin") === "employee_manager"
                    ? `<span class="text-slate-600">-</span>`
                    : `<button onclick="toggleLogCategory('${log.id}', 'work', 'violation')" class="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded text-xs transition border border-emerald-500/20 whitespace-nowrap">
                           ${currentLang === 'ko' ? '→ 업무' : '→ Work'}
                       </button>`
                }
            </td>
        `;
        body.appendChild(tr);
    });
}

async function fetchIdleLogsTab(startDate = null, endDate = null, employeeId = null) {
    try {
        let url = `${API_BASE_URL}/dashboard/logs?category=idle`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        if (employeeId) url += `&employee_id=${encodeURIComponent(employeeId)}`;
        const response = await authenticatedFetch(url);
        if (!response.ok) throw new Error("자리비움 로그 로드 실패");
        idleCachedLogs = mergeConsecutiveLogs(await response.json());
        idleCurrentPage = 1;
        renderIdleLogPage();
        updateTotalDurationBadge(idleCachedLogs, 'idleTotalDuration');
    } catch (e) {
        console.error("자리비움 로그 탭 로딩 에러:", e);
    }
}

function renderIdleLogPage() {
    const body = document.getElementById("idleLogBody");
    if (!body) return;
    body.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(idleCachedLogs.length / LOGS_TAB_PER_PAGE));
    const start = (idleCurrentPage - 1) * LOGS_TAB_PER_PAGE;
    const pageLogs = idleCachedLogs.slice(start, start + LOGS_TAB_PER_PAGE);

    const pageInfo = document.getElementById("idlePageInfo");
    if (pageInfo) pageInfo.textContent = `${idleCurrentPage} / ${totalPages}`;

    if (idleCachedLogs.length === 0) {
        const dict = translations[currentLang];
        body.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-500">${dict.no_data_desc || '데이터 없음'}</td></tr>`;
        return;
    }

    const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";

    pageLogs.forEach(log => {
        const timeStr = new Date(log.timestamp).toLocaleString(getLocale(currentLang), { timeZone: currentTz });
        const titleShort = (log.window_title || '').length > 40 ? log.window_title.substring(0, 40) + "..." : (log.window_title || '-');
        const durStr = `${Math.floor(log.duration / 60)}${currentLang === 'ko' ? '분' : 'm'} ${log.duration % 60}${currentLang === 'ko' ? '초' : 's'}`;
        const companyCell = isSuperAdmin ? `<td class="py-3 px-4 text-indigo-300 font-mono text-xs">${log.company_code}</td>` : "";

        let reasonBadge = '-';
        if (log.idle_reason) {
            const detailText = log.idle_detailed_reason ? ` (${log.idle_detailed_reason})` : '';
            const trimmedReason = log.idle_reason.trim().toLowerCase();
            const badgeColor = ['회의','외부업무','meeting','external work','external','ประชุม','งานนอก','ປະຊຸມ','ວຽກນອກ','출근','commute','start work','เข้างาน','เริ่มงาน','ເຂົ້າວຽກ','ເລີ່ມວຽກ'].includes(trimmedReason)
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            reasonBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}" title="${log.idle_reason}${detailText}">${log.idle_reason}${detailText}</span>`;
        }

        const tr = document.createElement("tr");
        tr.id = `idle-row-${log.id}`;
        tr.className = "hover:bg-white/5 border-b border-white/5 transition duration-200";
        tr.innerHTML = `
            <td class="py-3 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">${timeStr}</td>
            <td class="py-3 px-4 text-white font-medium text-xs">${log.employee_name} <span class="text-[10px] text-slate-500 font-mono block">${log.employee_id}</span></td>
            ${companyCell}
            <td class="py-3 px-4 text-slate-300 font-mono text-xs">${log.process_name || '-'}</td>
            <td class="py-3 px-4 text-xs">${reasonBadge}</td>
            <td class="py-3 px-4 text-slate-400 text-xs" title="${log.window_title || ''}">${titleShort}</td>
            <td class="py-3 px-4 text-right font-mono font-bold text-amber-400 text-xs whitespace-nowrap">${durStr}</td>
            <td class="py-3 px-4 text-center">
                ${(localStorage.getItem("pguard_admin_role") || "admin") === "employee_manager"
                    ? `<span class="text-slate-600">-</span>`
                    : `<button onclick="toggleLogCategory('${log.id}', 'work', 'idle')" class="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded text-xs transition border border-emerald-500/20 whitespace-nowrap">
                           ${translations[currentLang].btn_change_to_work || '업무 전환'}
                       </button>`
                }
            </td>
        `;
        body.appendChild(tr);
    });
}

async function fetchWorkLogTab(startDate = null, endDate = null, employeeId = null) {
    try {
        let url = `${API_BASE_URL}/dashboard/logs?category=work`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        if (employeeId) url += `&employee_id=${encodeURIComponent(employeeId)}`;
        const response = await authenticatedFetch(url);
        if (!response.ok) throw new Error("업무 로그 로드 실패");
        workCachedLogs = mergeConsecutiveLogs(await response.json());
        workCurrentPage = 1;
        renderWorkLogPage();
        updateTotalDurationBadge(workCachedLogs, 'workTotalDuration');
    } catch (e) {
        console.error("업무 로그 탭 로딩 에러:", e);
    }
}

function renderWorkLogPage() {
    const body = document.getElementById("workLogBody");
    if (!body) return;
    body.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(workCachedLogs.length / LOGS_TAB_PER_PAGE));
    const start = (workCurrentPage - 1) * LOGS_TAB_PER_PAGE;
    const pageLogs = workCachedLogs.slice(start, start + LOGS_TAB_PER_PAGE);

    const pageInfo = document.getElementById("workPageInfo");
    if (pageInfo) pageInfo.textContent = `${workCurrentPage} / ${totalPages}`;

    if (workCachedLogs.length === 0) {
        const dict = translations[currentLang];
        body.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-500">${dict.no_data_desc || '데이터 없음'}</td></tr>`;
        return;
    }

    const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";

    pageLogs.forEach(log => {
        const timeStr = new Date(log.timestamp).toLocaleString(getLocale(currentLang), { timeZone: currentTz });
        const titleShort = (log.window_title || '').length > 40 ? log.window_title.substring(0, 40) + "..." : (log.window_title || '-');
        const durStr = `${Math.floor(log.duration / 60)}${currentLang === 'ko' ? '분' : 'm'} ${log.duration % 60}${currentLang === 'ko' ? '초' : 's'}`;
        const companyCell = isSuperAdmin ? `<td class="py-3 px-4 text-indigo-300 font-mono text-xs">${log.company_code}</td>` : "";

        let reasonBadge = '-';
        if (log.idle_reason) {
            const detailText = log.idle_detailed_reason ? ` (${log.idle_detailed_reason})` : '';
            const trimmedReason = log.idle_reason.trim().toLowerCase();
            const badgeColor = ['회의','외부업무','meeting','external work','external','ประชุม','งานนอก','ປະຊຸມ','ວຽກນອກ'].includes(trimmedReason)
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            reasonBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}" title="${log.idle_reason}${detailText}">${log.idle_reason}${detailText}</span>`;
        }

        const tr = document.createElement("tr");
        tr.id = `work-row-${log.id}`;
        tr.className = "hover:bg-white/5 border-b border-white/5 transition duration-200";
        tr.innerHTML = `
            <td class="py-3 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">${timeStr}</td>
            <td class="py-3 px-4 text-white font-medium text-xs">${log.employee_name} <span class="text-[10px] text-slate-500 font-mono block">${log.employee_id}</span></td>
            ${companyCell}
            <td class="py-3 px-4 text-slate-300 font-mono text-xs">${log.process_name || '-'}</td>
            <td class="py-3 px-4 text-xs"><span class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono">${log.domain || '-'}</span></td>
            <td class="py-3 px-4 text-xs">${reasonBadge}</td>
            <td class="py-3 px-4 text-slate-400 text-xs" title="${log.window_title || ''}">${titleShort}</td>
            <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-xs whitespace-nowrap">${durStr}</td>
            <td class="py-3 px-4 text-center">
                ${(localStorage.getItem("pguard_admin_role") || "admin") === "employee_manager"
                    ? `<span class="text-slate-600">-</span>`
                    : `<button onclick="toggleLogCategory('${log.id}', 'non-work', 'work')" class="px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded text-xs transition border border-rose-500/20 whitespace-nowrap">
                           ${currentLang === 'ko' ? '→ 비업무' : '→ Non-Work'}
                       </button>`
                }
            </td>
        `;
        body.appendChild(tr);
    });
}

window.toggleLogCategory = async function(logId, newCategory, sourceTab) {
    let changeReason = "";
    while (true) {
        const promptMsg = currentLang === 'ko' 
            ? '분류 변경 사유를 입력해 주세요 (필수):' 
            : 'Please enter the reason for category change (Required):';
        const res = prompt(promptMsg);
        if (res === null) return; // User cancelled prompt
        const trimmed = res.trim();
        if (trimmed) {
            changeReason = trimmed;
            break;
        }
        alert(currentLang === 'ko' ? '사유를 반드시 입력해야 합니다.' : 'Reason is required.');
    }

    const ids = typeof logId === 'string' ? logId.split(',').map(Number) : [logId];

    try {
        for (const id of ids) {
            const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/logs/${id}/category`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: newCategory, reason: changeReason })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '변경 실패');
            }
        }
        // Remove row visually and refresh cached arrays
        if (sourceTab === 'violation') {
            violCachedLogs = violCachedLogs.filter(l => l.id !== logId);
            if (violCurrentPage > Math.ceil(violCachedLogs.length / LOGS_TAB_PER_PAGE)) violCurrentPage = Math.max(1, violCurrentPage - 1);
            renderViolationPage();
        } else if (sourceTab === 'idle') {
            idleCachedLogs = idleCachedLogs.filter(l => l.id !== logId);
            if (idleCurrentPage > Math.ceil(idleCachedLogs.length / LOGS_TAB_PER_PAGE)) idleCurrentPage = Math.max(1, idleCurrentPage - 1);
            renderIdleLogPage();
        } else {
            workCachedLogs = workCachedLogs.filter(l => l.id !== logId);
            if (workCurrentPage > Math.ceil(workCachedLogs.length / LOGS_TAB_PER_PAGE)) workCurrentPage = Math.max(1, workCurrentPage - 1);
            renderWorkLogPage();
        }
    } catch(err) {
        alert((currentLang === 'ko' ? '카테고리 변경 실패: ' : 'Failed to change category: ') + err.message);
    }
};

// ------------------------------------------------------------------
// TAB 4: 데이터베이스 전체 초기화 처리
// ------------------------------------------------------------------
async function handleDatabaseReset() {
    const dict = translations[currentLang];
    
    // 다국어 컨펌 창 노출
    const confirmMsg = currentLang === 'ko' 
        ? "⚠️ 정말로 모든 PC 활동 내역 및 사원 데이터를 완전 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
        : "⚠️ Are you sure you want to completely FACTORY RESET the tracking database?\nAll collected logs will be deleted permanently.";
        
    if (!confirm(confirmMsg)) return;

    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/reset`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error("Database reset failed");
        
        const resData = await response.json();
        if (resData.success) {
            const successMsg = currentLang === 'ko'
                ? "데이터베이스가 성공적으로 초기화되었습니다!"
                : "Database reset completed successfully!";
                
            alert(successMsg);
            
            // 데이터 삭제 후 UI 갱신을 위해 현재 탭 갱신
            fetchCurrentTab();
        }
    } catch (err) {
        console.error("초기화 실패:", err);
        alert("초기화 과정 중 오류가 발생했습니다: " + err.message);
    }
}

// ------------------------------------------------------------------
// TAB 5: 통합관리자 (Super Admin) - 회사 및 권한 관리
// ------------------------------------------------------------------
let editCompanyCode = null;

async function fetchSuperTab() {
    try {
        const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";
        if (!isSuperAdmin) return;

        // 1. 회사 목록 가져오기
        const compRes = await authenticatedFetch(`${API_BASE_URL}/super/companies`);
        if (!compRes.ok) throw new Error("Failed to fetch companies");
        const companies = await compRes.json();
        
        renderSuperCompanies(companies);
        updateSuperCompanyDropdown(companies);

        // 2. 관리자 목록 가져오기
        const adminRes = await authenticatedFetch(`${API_BASE_URL}/super/admins`);
        if (!adminRes.ok) throw new Error("Failed to fetch admins");
        const admins = await adminRes.json();
        
        renderSuperAdmins(admins);
    } catch (err) {
        console.error("Super Admin 데이터 로드 실패:", err);
    }
}

function renderSuperCompanies(companies) {
    const body = document.getElementById("superCompanyListBody");
    if (!body) return;
    body.innerHTML = "";

    const dict = translations[currentLang];
    
    if (companies.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="4" class="py-4 text-center text-slate-500">${dict.no_data_desc || "데이터가 없습니다."}</td>
            </tr>
        `;
        return;
    }

    companies.forEach(comp => {
        const dateStr = new Date(comp.created_at).toLocaleString(getLocale(currentLang), { timeZone: currentTz });
        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/5 transition duration-200 border-b border-white/5";
        
        tr.innerHTML = `
            <td class="py-3 px-4 font-mono font-bold text-indigo-400">${comp.company_code}</td>
            <td class="py-3 px-4 text-white font-medium">${comp.company_name}</td>
            <td class="py-3 px-4 text-slate-400 font-mono">${dateStr}</td>
            <td class="py-3 px-4 text-center">
                <div class="flex justify-center gap-2">
                    <button class="px-2.5 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition btn-comp-edit" data-code="${comp.company_code}" data-name="${comp.company_name}">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5 inline mr-1"></i>${dict.btn_edit || "수정"}
                    </button>
                    <button class="px-2.5 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-semibold transition btn-comp-del" data-code="${comp.company_code}">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5 inline mr-1"></i>${dict.btn_delete || "삭제"}
                    </button>
                </div>
            </td>
        `;
        body.appendChild(tr);
    });

    // 이벤트 리스너 바인딩
    body.querySelectorAll(".btn-comp-edit").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.getAttribute("data-code");
            const name = btn.getAttribute("data-name");
            handleEditCompany(code, name);
        });
    });

    body.querySelectorAll(".btn-comp-del").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.getAttribute("data-code");
            handleDeleteCompany(code);
        });
    });

    lucide.createIcons();
}

function updateSuperCompanyDropdown(companies) {
    const dropdown = document.getElementById("superAdminComp");
    if (!dropdown) return;
    
    const prevVal = dropdown.value;
    dropdown.innerHTML = "";
    
    const dict = translations[currentLang];
    
    if (companies.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = dict.no_data_desc || "No companies registered";
        dropdown.appendChild(opt);
        return;
    }

    companies.forEach(comp => {
        const opt = document.createElement("option");
        opt.value = comp.company_code;
        opt.className = "bg-slate-900 text-slate-200";
        opt.textContent = `[${comp.company_code}] ${comp.company_name}`;
        dropdown.appendChild(opt);
    });

    if (prevVal && [...dropdown.options].some(o => o.value === prevVal)) {
        dropdown.value = prevVal;
    }
}

function renderSuperAdmins(admins) {
    const body = document.getElementById("superAdminListBody");
    if (!body) return;
    body.innerHTML = "";

    const dict = translations[currentLang];

    if (admins.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="4" class="py-4 text-center text-slate-500">${dict.no_data_desc || "데이터가 없습니다."}</td>
            </tr>
        `;
        return;
    }

    admins.forEach(admin => {
        const dateStr = new Date(admin.created_at).toLocaleString(getLocale(currentLang), { timeZone: currentTz });
        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/5 transition duration-200 border-b border-white/5";
        
        tr.innerHTML = `
            <td class="py-3 px-4 font-semibold text-white">${admin.admin_id}</td>
            <td class="py-3 px-4 text-indigo-300 font-mono font-bold">${admin.company_code} <span class="text-[10px] text-slate-500 font-sans block">${admin.company_name || ""}</span></td>
            <td class="py-3 px-4 text-slate-400 font-mono">${dateStr}</td>
            <td class="py-3 px-4 text-center">
                <button class="px-2.5 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-semibold transition btn-admin-del" data-id="${admin.admin_id}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5 inline mr-1"></i>${dict.btn_delete || "삭제"}
                </button>
            </td>
        `;
        body.appendChild(tr);
    });

    body.querySelectorAll(".btn-admin-del").forEach(btn => {
        btn.addEventListener("click", () => {
            const adminId = btn.getAttribute("data-id");
            handleDeleteAdmin(adminId);
        });
    });

    lucide.createIcons();
}

function handleEditCompany(code, name) {
    editCompanyCode = code;
    
    const inputCode = document.getElementById("superCompCode");
    const inputName = document.getElementById("superCompName");
    const btnCancel = document.getElementById("btnCompanyCancel");
    const btnSubmitText = document.querySelector("#btnCompanySubmit span");
    const iconSubmit = document.querySelector("#btnCompanySubmit i");

    if (inputCode && inputName) {
        inputCode.value = code;
        inputCode.disabled = true;
        inputCode.classList.add("opacity-60", "cursor-not-allowed");
        
        inputName.value = name;
        inputName.focus();
    }

    if (btnCancel) {
        btnCancel.classList.remove("hidden");
    }

    const dict = translations[currentLang];
    if (btnSubmitText) {
        btnSubmitText.textContent = dict.btn_edit || "수정";
        btnSubmitText.setAttribute("data-i18n", "btn_edit");
    }
    if (iconSubmit) {
        iconSubmit.setAttribute("data-lucide", "check-circle");
        lucide.createIcons();
    }
}

function resetCompanyForm() {
    editCompanyCode = null;
    
    const inputCode = document.getElementById("superCompCode");
    const inputName = document.getElementById("superCompName");
    const btnCancel = document.getElementById("btnCompanyCancel");
    const btnSubmitText = document.querySelector("#btnCompanySubmit span");
    const iconSubmit = document.querySelector("#btnCompanySubmit i");

    if (inputCode && inputName) {
        inputCode.value = "";
        inputCode.disabled = false;
        inputCode.classList.remove("opacity-60", "cursor-not-allowed");
        inputName.value = "";
    }

    if (btnCancel) {
        btnCancel.classList.add("hidden");
    }

    const dict = translations[currentLang];
    if (btnSubmitText) {
        btnSubmitText.textContent = dict.btn_super_comp_register || "회사 등록하기";
        btnSubmitText.setAttribute("data-i18n", "btn_super_comp_register");
    }
    if (iconSubmit) {
        iconSubmit.setAttribute("data-lucide", "plus-circle");
        lucide.createIcons();
    }
}

async function handleDeleteCompany(code) {
    const dict = translations[currentLang];
    const confirmMsg = currentLang === 'ko'
        ? `⚠️ 회사 [${code}]를 정말로 삭제하시겠습니까?\n해당 회사에 등록된 모든 사원 정보, PC 활동 로그, 관리자 계정이 함께 완전히 삭제되며 복구할 수 없습니다.`
        : `⚠️ Are you sure you want to permanently delete company [${code}]?\nAll registered employees, PC activity logs, and admin accounts under this company will be completely destroyed and cannot be recovered.`;

    if (!confirm(confirmMsg)) return;

    try {
        const res = await authenticatedFetch(`${API_BASE_URL}/super/companies/${code}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Delete failed");
        }

        const data = await res.json();
        if (data.success) {
            alert(currentLang === 'ko' ? "회사가 성공적으로 삭제되었습니다." : "Company deleted successfully.");
            if (editCompanyCode === code) {
                resetCompanyForm();
            }
            await fetchSuperTab();
        }
    } catch (err) {
        alert((currentLang === 'ko' ? "삭제 실패: " : "Delete failed: ") + err.message);
    }
}

async function handleDeleteAdmin(adminId) {
    const dict = translations[currentLang];
    const confirmMsg = currentLang === 'ko'
        ? `관리자 계정 [${adminId}]를 정말로 삭제하시겠습니까?`
        : `Are you sure you want to delete admin account [${adminId}]?`;

    if (!confirm(confirmMsg)) return;

    try {
        const res = await authenticatedFetch(`${API_BASE_URL}/super/admins/${adminId}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Delete failed");
        }

        const data = await res.json();
        if (data.success) {
            alert(currentLang === 'ko' ? "관리자 계정이 삭제되었습니다." : "Admin account deleted successfully.");
            await fetchSuperTab();
        }
    } catch (err) {
        alert((currentLang === 'ko' ? "삭제 실패: " : "Delete failed: ") + err.message);
    }
}

// ------------------------------------------------------------------
// 사원별 상세 통계 로드 및 시각화
// ------------------------------------------------------------------
async function loadEmployeeStats(employeeId) {
    const dict = translations[currentLang] || translations.ko;

    // 로딩 스피너 표시
    const placeholder = document.getElementById("empStatsPlaceholder");
    const content = document.getElementById("empStatsContent");
    placeholder.classList.remove("hidden");
    placeholder.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div class="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-xs text-slate-400">${dict.loading_stats || '통계 로딩 중...'}</p>
        </div>`;
    content.classList.add("hidden");

    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/employees/${employeeId}/stats`);
        if (!response.ok) throw new Error("사원 통계 로드 실패");

        const data = await response.json();
        currentEmployeeStats = data; // 엑셀 내보내기를 위해 현재 조회된 사원 통계 전역 저장

        // 플레이스홀더 감추고 컨텐츠 노출 (애니메이션)
        placeholder.classList.add("hidden");
        // 플레이스홀더 원본 복원 (다음 클릭 시 사용)
        placeholder.innerHTML = `
            <div class="bg-indigo-600/10 border border-indigo-500/25 p-4 rounded-3xl text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
                <i data-lucide="bar-chart-3" class="w-12 h-12"></i>
            </div>
            <h5 class="font-outfit font-bold text-white text-base" data-i18n="emp_stats_title">${dict.emp_stats_title}</h5>
            <p class="text-xs text-slate-400 max-w-xs mt-2" data-i18n="emp_select_placeholder">${dict.emp_select_placeholder}</p>`;
        content.classList.remove("hidden");

        // 정보 바인딩
        document.getElementById("statEmpName").textContent = data.employee_name;
        document.getElementById("statEmpId").textContent = `ID: ${data.employee_id}  |  ${data.company_code}`;

        const editEmpTags = document.getElementById("editEmpTags");
        if (editEmpTags) {
            editEmpTags.value = data.tags || '';
        }
        const empTagsPanel = document.getElementById("empTagsPanel");
        if (empTagsPanel) {
            const role = localStorage.getItem("pguard_admin_role") || "admin";
            if (role === "employee_manager") {
                empTagsPanel.classList.add("hidden");
            } else {
                empTagsPanel.classList.remove("hidden");
            }
        }

        // 집중도 바 (색상 동적 결정: 80+ 초록, 50+ 노랑, 미만 빨강)
        const score = data.focusScore || 0;
        const scoreColor = score >= 80 ? 'from-emerald-500 to-green-400'
            : score >= 50 ? 'from-amber-400 to-yellow-400'
            : 'from-rose-500 to-pink-500';
        document.getElementById("statFocusScore").textContent = `${score}%`;
        document.getElementById("statFocusScore").className =
            score >= 80 ? "text-2xl font-outfit font-extrabold text-emerald-400"
            : score >= 50 ? "text-2xl font-outfit font-extrabold text-amber-400"
            : "text-2xl font-outfit font-extrabold text-rose-400";
        const bar = document.getElementById("statFocusScoreBar");
        bar.className = `bg-gradient-to-r ${scoreColor} h-full rounded-full transition-all duration-700`;
        bar.style.width = "0%";
        setTimeout(() => { bar.style.width = `${score}%`; }, 50);

        // 시간 배분 바인딩
        const workSec    = data.categoryDist.work || 0;
        const nonWorkSec = data.categoryDist['non-work'] || 0;
        const idleSec    = data.categoryDist.idle || 0;
        const totalSec   = workSec + nonWorkSec + idleSec;
        const workMin    = Math.round(workSec / 60);
        const nonWorkMin = Math.round(nonWorkSec / 60);
        const idleMin    = Math.round(idleSec / 60);

        const workPct    = totalSec > 0 ? (workSec / totalSec) * 100 : 0;
        const nonWorkPct = totalSec > 0 ? (nonWorkSec / totalSec) * 100 : 0;
        const idlePct    = totalSec > 0 ? (idleSec / totalSec) * 100 : 0;

        ['statAllocWork', 'statAllocNonWork', 'statAllocIdle'].forEach(id => {
            document.getElementById(id).style.width = "0%";
        });
        setTimeout(() => {
            document.getElementById("statAllocWork").style.width = `${workPct}%`;
            document.getElementById("statAllocNonWork").style.width = `${nonWorkPct}%`;
            document.getElementById("statAllocIdle").style.width = `${idlePct}%`;
        }, 80);

        document.getElementById("lblAllocWork").textContent = formatMinutes(workMin);
        document.getElementById("lblAllocNonWork").textContent = formatMinutes(nonWorkMin);
        document.getElementById("lblAllocIdle").textContent = formatMinutes(idleMin);

        // 프로그램 사용량 렌더링
        const softwareList = document.getElementById("statTopSoftwareList");
        softwareList.innerHTML = "";
        if (data.programs && data.programs.length > 0) {
            const maxProgVal = data.programs[0].total_duration || 1;
            const progColors = ['from-indigo-500 to-purple-500','from-blue-500 to-indigo-500','from-cyan-500 to-blue-500','from-teal-500 to-cyan-500','from-green-500 to-teal-500'];
            data.programs.forEach((item, idx) => {
                const progMin = Math.round(item.total_duration / 60);
                const progPct = Math.round((item.total_duration / maxProgVal) * 100);
                const colorClass = progColors[idx % progColors.length];
                const row = document.createElement("div");
                row.className = "space-y-1.5 p-2 rounded-xl hover:bg-white/5 transition duration-200";
                row.innerHTML = `
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-gradient-to-r ${colorClass}"></span>
                            ${item.program_group}
                        </span>
                        <span class="text-indigo-300 font-bold font-mono">${formatMinutes(progMin)}</span>
                    </div>
                    <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div class="bg-gradient-to-r ${colorClass} h-full rounded-full transition-all duration-700" style="width:${progPct}%"></div>
                    </div>`;
                softwareList.appendChild(row);
            });
        } else {
            softwareList.innerHTML = `<p class="text-xs text-slate-500 italic py-2">${dict.no_stats_data || '수집된 데이터가 없습니다.'}</p>`;
        }

        // 비업무 도메인 랭킹 렌더링 (방문 횟수 포함)
        const domainsList = document.getElementById("statTopDomainsList");
        domainsList.innerHTML = "";
        if (data.nonWorkDomains && data.nonWorkDomains.length > 0) {
            const maxDomainVal = data.nonWorkDomains[0].total_duration || 1;
            data.nonWorkDomains.forEach((item, idx) => {
                const domMin = Math.round(item.total_duration / 60);
                const domPct = Math.round((item.total_duration / maxDomainVal) * 100);
                let medal = `<span class="text-slate-400 font-bold font-mono text-xs">${idx + 1}</span>`;
                if (idx === 0) medal = '🥇';
                else if (idx === 1) medal = '🥈';
                else if (idx === 2) medal = '🥉';
                const visitCount = item.visit_count || '';
                const row = document.createElement("div");
                row.className = "space-y-1.5 p-2 rounded-xl hover:bg-white/5 transition duration-200";
                row.innerHTML = `
                    <div class="flex justify-between items-center text-xs">
                        <div class="flex items-center gap-2">
                            ${medal}
                            <span class="font-semibold text-slate-200">${item.domain}</span>
                            ${visitCount ? `<span class="text-[10px] text-slate-500">(${visitCount}${currentLang === 'ko' ? '회' : 'x'})</span>` : ''}
                        </div>
                        <span class="text-rose-400 font-bold font-mono">${formatMinutes(domMin)}</span>
                    </div>
                    <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div class="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-700" style="width:${domPct}%"></div>
                    </div>`;
                domainsList.appendChild(row);
            });
        } else {
            domainsList.innerHTML = `<p class="text-xs text-slate-500 italic py-2">${dict.no_stats_data || '검출된 비업무 사이트 이력이 없습니다.'}</p>`;
        }

        lucide.createIcons();

    } catch (err) {
        console.error("사원 상세 통계 패칭 실패:", err);
        // 에러 시 플레이스홀더 복원
        placeholder.classList.remove("hidden");
        content.classList.add("hidden");
        placeholder.innerHTML = `<p class="text-xs text-rose-400 py-4">통계 로딩 실패: ${err.message}</p>`;
    }
}

function formatMinutes(minutes) {
    if (minutes >= 60) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${minutes}m`;
}

// ------------------------------------------------------------------
// 엑셀 다운로드 (SheetJS 연동)
// ------------------------------------------------------------------

// 1. 전체 직원 요약 Excel 다운로드
async function exportAllEmployeesToExcel() {
    const dict = translations[currentLang] || translations.ko;
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/dashboard/stats?tz=${currentTz}`);
        if (!response.ok) throw new Error("데이터 가져오기 실패");
        const data = await response.json();
        
        if (!data.employees || data.employees.length === 0) {
            alert(dict.no_stats_data || "수집된 데이터가 없습니다.");
            return;
        }

        const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";
        
        // 헤더 매핑
        const headers = [
            dict.th_emp_id || "사원 번호",
            dict.th_emp_name || "사원명"
        ];
        if (isSuperAdmin) {
            headers.push(dict.th_company || "회사");
        }
        headers.push(
            dict.th_last_seen || "마지막 활동 통신",
            dict.th_emp_status || "실시간 접속 여부"
        );

        // 데이터 구성
        const rows = data.employees.map(emp => {
            const date = new Date(emp.last_seen);
            const statusText = emp.status === 'active' ? (dict.status_online || "온라인") : (dict.status_away || "자리비움");
            
            const rowData = [
                emp.employee_id,
                emp.employee_name
            ];
            if (isSuperAdmin) {
                rowData.push(emp.company_code);
            }
            rowData.push(
                date.toLocaleString(getLocale(currentLang), { timeZone: currentTz }),
                statusText
            );
            return rowData;
        });

        // 워크시트 생성
        const aoa = [
            ["🛡️ PGuard - " + (dict.emp_tab_title || "관리 사원 세부 현황")],
            [],
            headers,
            ...rows
        ];
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // 열 너비 조절
        ws['!cols'] = [
            { wch: 15 }, // 사원 번호
            { wch: 15 }  // 사원명
        ];
        if (isSuperAdmin) {
            ws['!cols'].push({ wch: 12 }); // 회사
        }
        ws['!cols'].push(
            { wch: 25 }, // 마지막 활동 통신
            { wch: 15 }  // 접속 여부
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Employees_Summary");

        // 파일 내보내기
        const today = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `PGuard_전체직원현황_${today}.xlsx`);

    } catch (err) {
        console.error("전체 직원 엑셀 내보내기 실패:", err);
        alert((currentLang === 'ko' ? "엑셀 내보내기 중 오류가 발생했습니다: " : "Failed to export Excel: ") + err.message);
    }
}

// 2. 단일 직원 상세 통계 Excel 다운로드
async function exportEmployeeDetailToExcel() {
    const dict = translations[currentLang] || translations.ko;
    
    if (!currentEmployeeStats) {
        alert(dict.emp_select_placeholder || "분석할 사원을 선택해 주세요.");
        return;
    }

    const startDateInput = document.getElementById("exportStartDate").value;
    const endDateInput = document.getElementById("exportEndDate").value;

    if (!startDateInput || !endDateInput) {
        alert(dict.err_date_required || "시작일과 종료일을 모두 선택해주세요.");
        return;
    }

    const start = new Date(startDateInput);
    const end = new Date(endDateInput);
    if (end < start) {
        alert(currentLang === 'ko' ? "종료일은 시작일보다 이전일 수 없습니다." : "End date cannot be earlier than start date.");
        return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
        alert(dict.err_date_limit || "최대 7일까지만 다운로드할 수 있습니다.");
        return;
    }

    try {
        const emp = currentEmployeeStats;
        const today = new Date().toISOString().slice(0, 10);
        
        // --- 1. 상세 내역 API 호출 및 시트 (Detailed Logs Sheet) 구성 ---
        const wb = XLSX.utils.book_new();

        // API 호출
        const response = await authenticatedFetch(`${API_BASE_URL}/employees/${emp.employee_id}/activities?start_date=${startDateInput}&end_date=${endDateInput}`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "상세 로그 조회 실패");
        }
        const detailedLogs = await response.json();

        // 상세 시트 헤더
        const detailHeaders = [
            dict.th_time || "시각",
            dict.th_process || "프로세스",
            dict.th_title || "활성 창 타이틀",
            dict.th_category || "카테고리",
            dict.th_duration || "체류시간"
        ];

        const detailRows = detailedLogs.map(log => {
            const dt = new Date(log.timestamp);
            let catTrans = log.category;
            if (log.category === 'work') catTrans = dict.category_work || '업무';
            else if (log.category === 'non-work') catTrans = dict.category_nonwork || '비업무 경고';
            else if (log.category === 'idle') catTrans = dict.category_idle || '자리비움';

            return [
                dt.toLocaleString(getLocale(currentLang), { timeZone: currentTz }),
                log.process_name,
                log.window_title || '-',
                catTrans,
                log.duration + 's'
            ];
        });

        const detailAoa = [
            [ "🛡️ PGuard - " + (currentLang === 'ko' ? "상세 활동 로그" : "Detailed Activity Logs") ],
            [ (currentLang === 'ko' ? "사원명: " : "Employee: ") + emp.employee_name, (currentLang === 'ko' ? "조회 기간: " : "Period: ") + `${startDateInput} ~ ${endDateInput}` ],
            [],
            detailHeaders,
            ...detailRows
        ];

        const detailWs = XLSX.utils.aoa_to_sheet(detailAoa);
        detailWs['!cols'] = [
            { wch: 25 }, // 시각
            { wch: 20 }, // 프로세스
            { wch: 40 }, // 타이틀
            { wch: 15 }, // 카테고리
            { wch: 15 }  // 체류시간
        ];

        XLSX.utils.book_append_sheet(wb, detailWs, currentLang === 'ko' ? "상세내역_Detailed" : "Detailed_Logs");

        // 파일 내보내기
        XLSX.writeFile(wb, `PGuard_직원상세통계_${emp.employee_name}_${startDateInput}_to_${endDateInput}.xlsx`);

    } catch (err) {
        console.error("사원 상세 엑셀 내보내기 실패:", err);
        alert((currentLang === 'ko' ? "엑셀 내보내기 중 오류가 발생했습니다: " : "Failed to export Excel: ") + err.message);
    }
}

// ------------------------------------------------------------------
// 서브 관리자 관리 API 호출 함수
// ------------------------------------------------------------------
async function fetchSubAdmins() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/sub_admins`);
        if (!response.ok) return;
        const data = await response.json();
        const tbody = document.getElementById("subAdminList");
        if (!tbody) return;
        
        tbody.innerHTML = "";
        data.sub_admins.forEach(admin => {
            const dt = new Date(admin.created_at).toLocaleDateString(getLocale(currentLang), { timeZone: currentTz });
            const roleStr = admin.role === 'employee_manager' 
                ? (currentLang === 'ko' ? '직원 관리자' : 'Employee Manager')
                : (currentLang === 'ko' ? '서브 관리자' : 'Sub-admin');
            const tagsBadge = admin.tags
                ? admin.tags.split(',').map(t => `<span class="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20 text-[10px] whitespace-nowrap">${t.trim()}</span>`).join(' ')
                : `<span class="text-slate-600">-</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="py-3 px-4 font-mono text-slate-300">${admin.admin_id}</td>
                <td class="py-3 px-4 text-slate-400 text-xs">${roleStr}</td>
                <td class="py-3 px-4 text-xs">${tagsBadge}</td>
                <td class="py-3 px-4 text-slate-500 text-[10px]">${dt}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="deleteSubAdmin('${admin.admin_id}')" class="px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded text-xs transition border border-rose-500/20">
                        ${currentLang === 'ko' ? '삭제' : 'Delete'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("SubAdmin 로딩 실패", e);
    }
}

window.deleteSubAdmin = async function(adminId) {
    if (!confirm(dict.confirm_delete_subadmin || "Are you sure you want to delete this sub-admin?")) return;
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/sub_admins/${adminId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "삭제 실패");
        }
        fetchSubAdmins();
    } catch (err) {
        alert(err.message);
    }
};

// ------------------------------------------------------------------
// 날짜 범위 유효성 검사 (최대 7일)
// ------------------------------------------------------------------
function validateDateRange(startDate, endDate) {
    const dict = translations[currentLang] || translations.ko;
    if (!startDate || !endDate) {
        alert(dict.err_date_required || "시작일과 종료일을 모두 선택해주세요.");
        return false;
    }
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) {
        alert(currentLang === 'ko' ? "종료일은 시작일보다 이전일 수 없습니다." : "End date cannot be earlier than start date.");
        return false;
    }
    const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
        alert(dict.err_date_limit || "최대 7일까지만 다운로드할 수 있습니다.");
        return false;
    }
    return true;
}

// ------------------------------------------------------------------
// 비업무/업무 로그 Excel 내보내기 (날짜 범위 적용)
// ------------------------------------------------------------------
async function exportLogTabToExcel(category) {
    const dict = translations[currentLang] || translations.ko;
    const isNonWork = category === 'non-work';
    const isIdle = category === 'idle';
    let startId = "violStartDate";
    let endId = "violEndDate";
    if (category === 'work') {
        startId = "workStartDate";
        endId = "workEndDate";
    } else if (category === 'idle') {
        startId = "idleStartDate";
        endId = "idleEndDate";
    }

    const startDate = document.getElementById(startId)?.value || null;
    const endDate = document.getElementById(endId)?.value || null;

    if (!validateDateRange(startDate, endDate)) return;

    try {
        let url = `${API_BASE_URL}/dashboard/logs?category=${category}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;

        const response = await authenticatedFetch(url);
        if (!response.ok) throw new Error("로그 조회 실패");
        const logs = mergeConsecutiveLogs(await response.json());

        if (logs.length === 0) {
            alert(dict.no_data_desc || "해당 기간에 데이터가 없습니다.");
            return;
        }

        const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";
        const locale = getLocale(currentLang);

        let tabTitle = dict.violation_tab_title || "비업무 활동 로그";
        if (category === 'work') {
            tabTitle = dict.worklog_tab_title || "PC 활동 업무 로그";
        } else if (category === 'idle') {
            tabTitle = dict.idlelog_tab_title || "자리비움 활동 로그";
        }

        // 헤더 구성
        const headers = [
            dict.th_time || "시각",
            dict.th_name || "이름",
            "EMP ID"
        ];
        if (isSuperAdmin) headers.push(dict.th_company || "회사");
        headers.push(
            dict.th_process || "프로세스",
            category === 'idle' ? (dict.th_idle_reason || "사유") : (dict.th_domain || "도메인")
        );
        if (isNonWork) {
            headers.push(dict.th_idle_reason || "사유", "상세 사유");
        } else if (isIdle) {
            headers.push("상세 사유");
        }
        headers.push(
            dict.th_title || "타이틀",
            dict.th_duration || "체류시간"
        );

        // 데이터 행 구성
        const rows = logs.map(log => {
            const timeStr = new Date(log.timestamp).toLocaleString(locale, { timeZone: currentTz });
            const durStr = `${Math.floor(log.duration / 60)}m ${log.duration % 60}s`;
            const row = [timeStr, log.employee_name, log.employee_id];
            if (isSuperAdmin) row.push(log.company_code || '');
            if (category === 'idle') {
                row.push(log.process_name || '-', log.idle_reason || '-', log.idle_detailed_reason || '-');
            } else {
                row.push(log.process_name || '-', log.domain || '-');
                if (isNonWork) {
                    row.push(log.idle_reason || '-', log.idle_detailed_reason || '-');
                }
            }
            row.push(log.window_title || '-', durStr);
            return row;
        });

        const aoa = [
            [`🛡️ PGuard - ${tabTitle}`],
            [`${currentLang === 'ko' ? '조회 기간' : 'Period'}: ${startDate} ~ ${endDate}`, `${currentLang === 'ko' ? '총' : 'Total'}: ${logs.length}${currentLang === 'ko' ? '건' : ' records'}`],
            [],
            headers,
            ...rows
        ];

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols'] = [
            { wch: 22 }, // 시각
            { wch: 14 }, // 이름
            { wch: 14 }, // EMP ID
        ];
        if (isSuperAdmin) ws['!cols'].push({ wch: 10 }); // 회사
        ws['!cols'].push({ wch: 18 }, { wch: 20 }); // 프로세스, 도메인/사유
        if (isNonWork) ws['!cols'].push({ wch: 12 }, { wch: 20 }); // 사유, 상세사유
        else if (isIdle) ws['!cols'].push({ wch: 20 }); // 상세사유
        ws['!cols'].push({ wch: 40 }, { wch: 10 }); // 타이틀, 체류시간

        const wb = XLSX.utils.book_new();
        const sheetName = category === 'non-work' 
            ? "NonWork_Logs" 
            : (category === 'idle' ? "Idle_Logs" : "Work_Logs");
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const prefix = category === 'non-work' 
            ? "비업무로그" 
            : (category === 'idle' ? "자리비움로그" : "업무로그");
        XLSX.writeFile(wb, `PGuard_${prefix}_${startDate}_to_${endDate}.xlsx`);

    } catch (err) {
        console.error("로그 탭 Excel 내보내기 실패:", err);
        alert((currentLang === 'ko' ? "엑셀 내보내기 중 오류: " : "Excel export error: ") + err.message);
    }
}

// ------------------------------------------------------------------
// 직원 행에 메시지 버튼 포함 (renderEmployeeTable 내에서 호출)
// ------------------------------------------------------------------
function renderEmployeeMsgBtn(empId, empName) {
    return `<button
        onclick="openMsgModal('${empId}', '${empName.replace(/'/g, "&#39;")}')" 
        title="${empName}에게 메시지 전송"
        class="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
    </button>`;
}

// ------------------------------------------------------------------
// 설정 탭: 직원 메시지 카드 렌더링
// ------------------------------------------------------------------
function renderMessageEmpCards() {
    const container = document.getElementById("messageEmpList");
    if (!container) return;

    const dict = translations[currentLang] || translations.ko;
    // 마지막으로 캐시된 직원 데이터 사용
    const employees = window._cachedEmployees || [];
    if (employees.length === 0) {
        container.innerHTML = `<div class="text-xs text-slate-500 italic">${dict.msg_no_agents_connected || 'When agents are connected, the employee list will be displayed here.'}</div>`;
        return;
    }

    container.innerHTML = employees.map(emp => {
        const isActive = emp.status === 'active';
        const statusColor = isActive ? 'text-emerald-400' : 'text-slate-400';
        const statusDot = isActive
            ? '<span class="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-1 pulse-emerald"></span>'
            : '<span class="w-2 h-2 bg-amber-500 rounded-full inline-block mr-1"></span>';
        const statusText = isActive ? dict.status_online : dict.status_away;
        return `
        <div class="flex items-center justify-between bg-white/5 border border-cardBorder hover:border-indigo-500/30 rounded-xl px-4 py-3 transition duration-200">
            <div>
                <div class="text-sm font-semibold text-white">${emp.employee_name}</div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">${emp.employee_id}</div>
                <div class="text-[10px] ${statusColor} mt-1">${statusDot}${statusText}</div>
            </div>
            <button onclick="openMsgModal('${emp.employee_id}', '${emp.employee_name.replace(/'/g, "&#39;")}')" 
                class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold transition duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                ${dict.btn_send || 'Message'}
            </button>
        </div>`;
    }).join('');
}

// ------------------------------------------------------------------
// 메시지 모달 열기 / 닫기
// ------------------------------------------------------------------
let _msgTargetId = null;

function openMsgModal(employeeId, employeeName) {
    _msgTargetId = employeeId; // null이면 전체 발송
    const modal = document.getElementById("msgModal");
    const targetLabel = document.getElementById("msgModalTarget");
    const errorDiv = document.getElementById("msgModalError");
    const content = document.getElementById("msgContent");

    if (!modal) return;
    const dict = translations[currentLang] || translations.ko;
    if (targetLabel) {
        const recipientPrefix = dict.msg_recipient || 'Recipient';
        const allEmployeesStr = dict.all_employees || 'All Employees';
        targetLabel.textContent = employeeId ? `${recipientPrefix}: ${employeeName} (${employeeId})` : `${recipientPrefix}: ${allEmployeesStr}`;
    }
    if (errorDiv) errorDiv.classList.add("hidden");
    if (content) content.value = '';
    modal.classList.remove("hidden");
    setTimeout(() => content?.focus(), 100);
}

function closeMsgModal() {
    const modal = document.getElementById("msgModal");
    if (modal) modal.classList.add("hidden");
    _msgTargetId = null;
}

async function sendAgentMessage() {
    const content = document.getElementById("msgContent")?.value.trim();
    const errorDiv = document.getElementById("msgModalError");
    const btnSend = document.getElementById("btnSendMsg");
    const dict = translations[currentLang] || translations.ko;

    if (!content) {
        if (errorDiv) { errorDiv.textContent = dict.err_enter_message || 'Please enter message content.'; errorDiv.classList.remove("hidden"); }
        return;
    }

    if (btnSend) { btnSend.disabled = true; btnSend.textContent = dict.btn_sending || 'Sending...'; }

    try {
        const body = { message: content };
        if (_msgTargetId) body.employee_id = _msgTargetId;

        const resp = await authenticatedFetch(`${API_BASE_URL}/admin/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || '전송 실패');

        closeMsgModal();
        alert(_msgTargetId
            ? (dict.msg_sent_success || 'Message sent successfully.')
            : (dict.msg_sent_all || 'Message sent to all employees.'));
    } catch (err) {
        if (errorDiv) { errorDiv.textContent = (dict.err_send_failed || 'Sending error: ') + err.message; errorDiv.classList.remove("hidden"); }
    } finally {
        if (btnSend) { btnSend.disabled = false; btnSend.textContent = dict.btn_send_submit || 'Send'; }
    }
}

// ------------------------------------------------------------------
// 자리비움 시간 설정 로드 / 저장
// ------------------------------------------------------------------
async function loadIdleThreshold() {
    const companyCode = localStorage.getItem("pguard_company_code") || "";
    if (companyCode === 'auton') {
        const panel = document.getElementById('idleSettingsPanel');
        if (panel) panel.innerHTML = '<p class="text-xs text-slate-400">통합관리자(AUTON)는 개별 회사 설정을 직접 변경할 수 없습니다.</p>';
        return;
    }
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/admin/company-settings`);
        if (!resp.ok) return;
        const data = await resp.json();
        
        // 1. 자리비움 시간
        const minutes = Math.round((data.idle_threshold_seconds || 600) / 60);
        const slider = document.getElementById('idleThresholdSlider');
        const display = document.getElementById('idleThresholdDisplay');
        if (slider) slider.value = minutes;
        if (display) display.textContent = minutes;

        // 2. 에이전트 스캔 주기
        const scanVal = data.agent_scan_interval_seconds || 60;
        const scanSlider = document.getElementById('agentScanSlider');
        const scanDisplay = document.getElementById('agentScanDisplay');
        if (scanSlider) scanSlider.value = scanVal;
        if (scanDisplay) scanDisplay.textContent = scanVal;

        // 3. 에이전트 전송 주기
        const sendVal = data.agent_send_interval_seconds || 600;
        const sendSlider = document.getElementById('agentSendSlider');
        const sendDisplay = document.getElementById('agentSendDisplay');
        if (sendSlider) sendSlider.value = sendVal;
        if (sendDisplay) sendDisplay.textContent = sendVal;

        // 4. 에이전트 연동 토큰
        const tokenInput = document.getElementById('agentApiTokenInput');
        if (tokenInput && data.api_token) {
            tokenInput.value = data.api_token;
            tokenInput.dataset.token = data.api_token;
            const revealBtn = document.getElementById('btnToggleTokenVisible');
            if (revealBtn && revealBtn.dataset.masked !== '1') {
                tokenInput.type = 'password';
                revealBtn.dataset.masked = '1';
            }
        }

    } catch (e) {
        console.warn('자리비움 설정 로드 실패:', e);
    }
}

async function saveIdleThreshold() {
    const slider = document.getElementById('idleThresholdSlider');
    const scanSlider = document.getElementById('agentScanSlider');
    const sendSlider = document.getElementById('agentSendSlider');
    const msgEl = document.getElementById('idleSettingMsg');
    const btn = document.getElementById('btnSaveIdleThreshold');
    if (!slider || !scanSlider || !sendSlider) return;

    const minutes = parseInt(slider.value, 10);
    const seconds = minutes * 60;
    const scanVal = parseInt(scanSlider.value, 10);
    const sendVal = parseInt(sendSlider.value, 10);

    if (btn) { btn.disabled = true; btn.textContent = '저장 중...'; }

    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/admin/company-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                idle_threshold_seconds: seconds,
                agent_scan_interval_seconds: scanVal,
                agent_send_interval_seconds: sendVal
            })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || '저장 실패');

        if (msgEl) {
            msgEl.textContent = `✅ 설정이 성공적으로 저장되었습니다. 에이전트에 실시간 반영됩니다.`;
            msgEl.className = 'text-xs mt-3 text-emerald-400';
            msgEl.classList.remove('hidden');
            setTimeout(() => msgEl.classList.add('hidden'), 4000);
        }
    } catch (err) {
        if (msgEl) {
            msgEl.textContent = '❌ 저장 실패: ' + err.message;
            msgEl.className = 'text-xs mt-3 text-rose-400';
            msgEl.classList.remove('hidden');
        }
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> 저장'; lucide.createIcons(); }
    }
}

// ------------------------------------------------------------------
// TAB 6: 관리자 활동 로그 (Admin Audit Logs)
// ------------------------------------------------------------------
const AUDIT_LOGS_PER_PAGE = 20;
let auditCachedLogs = [];
let auditPagination = {};
let auditCurrentPage = 1;

async function fetchAuditTab(page = 1) {
    try {
        const startDate = document.getElementById("auditStartDate")?.value || "";
        const endDate = document.getElementById("auditEndDate")?.value || "";
        const actionType = document.getElementById("auditActionType")?.value || "";
        const adminUser = document.getElementById("auditAdminUser")?.value.trim() || "";

        let url = `${API_BASE_URL}/admin/audit-logs?page=${page}&limit=${AUDIT_LOGS_PER_PAGE}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        if (actionType) url += `&action_type=${actionType}`;
        if (adminUser) url += `&admin_username=${encodeURIComponent(adminUser)}`;

        const response = await authenticatedFetch(url);
        if (!response.ok) throw new Error("관리자 활동 로그 로드 실패");
        const data = await response.json();
        if (data.success) {
            auditCachedLogs = data.logs || [];
            auditPagination = data.pagination || { total: 0, page: 1, limit: AUDIT_LOGS_PER_PAGE, pages: 1 };
            auditCurrentPage = page;
            renderAuditPage();
        }
    } catch (e) {
        console.error("관리자 활동 로그 탭 로딩 에러:", e);
    }
}

function renderAuditPage() {
    const body = document.getElementById("auditListBody");
    if (!body) return;
    body.innerHTML = "";

    const totalPages = auditPagination.pages || 1;
    const pageInfo = document.getElementById("auditPageInfo");
    if (pageInfo) pageInfo.textContent = `${auditCurrentPage} / ${totalPages}`;

    const btnPrev = document.getElementById("btnPrevAuditPage");
    const btnNext = document.getElementById("btnNextAuditPage");
    if (btnPrev) btnPrev.disabled = (auditCurrentPage <= 1);
    if (btnNext) btnNext.disabled = (auditCurrentPage >= totalPages);

    if (auditCachedLogs.length === 0) {
        const dict = translations[currentLang] || translations["ko"];
        body.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">${dict.no_data_desc || '데이터 없음'}</td></tr>`;
        return;
    }

    auditCachedLogs.forEach(log => {
        const timeStr = new Date(log.created_at).toLocaleString(getLocale(currentLang), { timeZone: currentTz });
        
        const dict = translations[currentLang] || translations["ko"];
        const actionTypeKey = `act_${log.action_type}`;
        const translatedActionType = dict[actionTypeKey] || log.action_type;

        let typeBadge = '';
        if (log.action_type.includes('success')) {
            typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">${translatedActionType}</span>`;
        } else if (log.action_type.includes('failure') || log.action_type.includes('delete') || log.action_type.includes('reset')) {
            typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-500/15 text-rose-400 border-rose-500/30">${translatedActionType}</span>`;
        } else if (log.action_type.includes('update') || log.action_type.includes('edit')) {
            typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border bg-indigo-500/15 text-indigo-400 border-indigo-500/30">${translatedActionType}</span>`;
        } else {
            typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-500/15 text-slate-400 border-slate-500/30">${translatedActionType}</span>`;
        }

        const detailsText = log.details || '';
        const ipText = log.ip_address || '-';

        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/5 border-b border-white/5 transition duration-200";
        tr.innerHTML = `
            <td class="py-3 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">${timeStr}</td>
            <td class="py-3 px-4 text-white font-medium text-xs">${log.admin_username} <span class="text-[10px] text-slate-500 font-mono block">${log.company_code}</span></td>
            <td class="py-3 px-4 text-xs">${typeBadge}</td>
            <td class="py-3 px-4 text-slate-300 text-xs leading-normal">${detailsText}</td>
            <td class="py-3 px-4 font-mono text-slate-400 text-xs">${ipText}</td>
        `;
        body.appendChild(tr);
    });
}

// ------------------------------------------------------------------
// TAB: 분류 패턴 관리 관련 제어 함수군
// ------------------------------------------------------------------
async function fetchPatternsTab() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/patterns`);
        if (!response.ok) throw new Error("Patterns fetch failed");
        const data = await response.json();
        renderPatternsTable(data);
    } catch (err) {
        console.error("분류 패턴 조회 실패:", err);
    }
}

function renderPatternsTable(patterns) {
    const body = document.getElementById("patternsListBody");
    if (!body) return;
    
    body.innerHTML = "";
    const dict = translations[currentLang] || translations["ko"];
    
    if (patterns.length === 0) {
        body.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">${dict.no_data_desc || '데이터 없음'}</td></tr>`;
        return;
    }

    patterns.forEach(pat => {
        const timeStr = new Date(pat.created_at).toLocaleString(getLocale(currentLang), { timeZone: currentTz });
        
        // 패턴 유형 다국어 매핑
        let typeStr = pat.pattern_type;
        if (pat.pattern_type === 'process') {
            typeStr = dict.option_process || "프로세스명 (EXE)";
        } else if (pat.pattern_type === 'domain') {
            typeStr = dict.option_domain || "감지 도메인 (웹사이트)";
        } else if (pat.pattern_type === 'title') {
            typeStr = dict.option_title || "활성 타이틀 (창 제목)";
        }

        // 적용 분류 배지 매핑
        let catBadge = '';
        if (pat.category === 'work') {
            catBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#6366F1]/15 text-[#6366F1] border-[#6366F1]/30">${dict.menu_worklogs || '업무'}</span>`;
        } else {
            catBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-500/15 text-rose-400 border-rose-500/30">${dict.menu_violations || '비업무'}</span>`;
        }

        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/5 border-b border-white/5 transition duration-200";
        tr.innerHTML = `
            <td class="py-3 px-4 font-medium text-slate-300 text-xs">${typeStr}</td>
            <td class="py-3 px-4 text-white font-mono text-xs">${pat.pattern_value}</td>
            <td class="py-3 px-4 text-xs">${catBadge}</td>
            <td class="py-3 px-4 font-mono text-slate-400 text-xs">${timeStr}</td>
            <td class="py-3 px-4 text-center">
                <button onclick="handleDeletePattern(${pat.id})" class="px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded text-xs transition border border-rose-500/20 whitespace-nowrap">
                    ${currentLang === 'ko' ? '삭제' : 'Delete'}
                </button>
            </td>
        `;
        body.appendChild(tr);
    });
}

window.handleDeletePattern = async function(id) {
    const dict = translations[currentLang] || translations["ko"];
    if (!confirm(dict.confirm_pattern_delete || "정말로 이 분류 패턴을 삭제하시겠습니까?")) return;

    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/patterns/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "삭제 실패");
        }

        const data = await response.json();
        if (data.success) {
            alert(currentLang === 'ko' ? "패턴이 삭제되었습니다." : "Pattern deleted successfully.");
            await fetchPatternsTab();
        }
    } catch (err) {
        alert((currentLang === 'ko' ? "패턴 삭제 실패: " : "Failed to delete pattern: ") + err.message);
    }
};

window.deleteEmployee = async function(employeeId, employeeName) {
    const dict = translations[currentLang] || translations["ko"];
    const confirmMsg = dict.prompt_delete_emp
        ? dict.prompt_delete_emp.replace('{name}', employeeName)
        : `정말로 직원 ${employeeName} (${employeeId})의 모든 데이터와 계정 정보를 영구 삭제하시겠습니까?\n활동 이력(로그)을 포함한 모든 데이터가 복구 불가능하게 삭제됩니다.`;
    
    if (!confirm(confirmMsg)) return;

    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/employees/${employeeId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || '삭제 실패');
        }
        alert(currentLang === 'ko' ? '직원이 성공적으로 삭제되었습니다.' : 'Employee successfully deleted.');
        // Refresh employees list
        await fetchEmployeeTab();
        // Also refresh the stats in overview
        if (activeTab === "tab-overview") {
            await fetchDashboardData();
        }
    } catch (err) {
        alert((currentLang === 'ko' ? '직원 삭제 실패: ' : 'Failed to delete employee: ') + err.message);
    }
};

async function loadManagerTags() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/admin/manager_tags`);
        if (!response.ok) return;
        const data = await response.json();
        const dataList = document.getElementById("managerTagsList");
        if (dataList && data.tags) {
            dataList.innerHTML = "";
            data.tags.forEach(tag => {
                const option = document.createElement("option");
                option.value = tag;
                dataList.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Failed to load manager tags:", err);
    }
}

// ==================================================================
// 전자결재 관리 탭 (관리자 모드) — 서브탭 + 직원 계정/권한 관리
// ==================================================================
let approvalAdminSubtab = "approval-admin-pending";

// 직원 관리 탭 (별도 메뉴) 렌더링
function fetchEmployeeMgmtTab() {
    const c = document.getElementById("employeeMgmtContent");
    if (c) renderEmployeeAccounts(c);
}
function reloadEmployeeList() {
    const c = document.getElementById("employeeMgmtContent");
    if (c) renderEmployeeAccounts(c);
}

// 관리 권한 코드 → 표시 라벨
function adminRoleLabel(role) {
    const dict = translations[currentLang] || translations.ko;
    if (role === "sub_admin") return dict.role_sub_admin || "서브 관리자";
    if (role === "employee_manager") return dict.role_employee_manager || "직원 관리자";
    return dict.role_normal_employee || "일반 직원";
}

// 서브탭 pill 클릭 바인딩 (1회)
function bindApprovalAdminPills() {
    const pillWrap = document.getElementById("approvalAdminPills");
    if (!pillWrap || pillWrap.dataset.bound === "1") return;
    pillWrap.dataset.bound = "1";
    pillWrap.querySelectorAll("button[data-subtab]").forEach(btn => {
        btn.addEventListener("click", () => {
            approvalAdminSubtab = btn.getAttribute("data-subtab");
            pillWrap.querySelectorAll("button[data-subtab]").forEach(b => {
                b.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-400 hover:text-white transition";
            });
            btn.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white transition";
            renderApprovalAdminContent();
        });
    });
}

async function fetchApprovalAdminTab() {
    bindApprovalAdminPills();
    renderApprovalAdminContent();
}

function renderApprovalAdminContent() {
    const container = document.getElementById("approvalAdminContent");
    if (!container) return;
    if (approvalAdminSubtab === "approval-admin-templates") {
        renderTemplatesSubtab(container);
    } else if (approvalAdminSubtab === "approval-admin-pending") {
        renderDocumentListView(container, "pending", { title: (translations[currentLang]||translations.ko).approval_pill_pending });
    } else if (approvalAdminSubtab === "approval-admin-all") {
        renderDocumentListView(container, "all", { title: (translations[currentLang]||translations.ko).approval_pill_all, filters: true });
    } else if (approvalAdminSubtab === "approval-admin-settings") {
        renderApprovalSettings(container);
    } else {
        const dict = translations[currentLang] || translations.ko;
        container.className = "text-sm text-slate-400 py-12 text-center";
        container.innerHTML = `<i data-lucide="hammer" class="w-8 h-8 mx-auto mb-3 text-slate-600"></i><p>${dict.approval_coming_soon}</p>`;
        lucide.createIcons();
    }
}

// 직원 계정/권한 목록 렌더링
// 직원 등록/수정 모달
function openEmployeeModal(mode, data) {
    const dict = translations[currentLang] || translations.ko;
    const modal = document.getElementById("employeeFormModal");
    if (!modal) return;
    const idEl = document.getElementById("empFormId");
    const nameEl = document.getElementById("empFormName");
    const tagsEl = document.getElementById("empFormTags");
    const titleEl = document.getElementById("empFormTitle");
    const errEl = document.getElementById("empFormError");
    const saveBtn = document.getElementById("empFormSave");
    const closeBtn = document.getElementById("empFormClose");
    const cancelBtn = document.getElementById("empFormCancel");

    const orgEl = document.getElementById("empFormOrg");
    const isEdit = mode === "edit";
    titleEl.textContent = isEdit ? (dict.emp_edit_title || "직원 정보 수정") : (dict.emp_add || "직원 추가");
    idEl.value = data ? (data.employee_id || "") : "";
    idEl.disabled = isEdit; // 수정 시 사번 변경 불가
    nameEl.value = data ? (data.employee_name || "") : "";
    tagsEl.value = data ? (data.tags || "") : "";
    errEl.classList.add("hidden");
    modal.classList.remove("hidden");
    setTimeout(() => (isEdit ? nameEl : idEl).focus(), 50);

    // 소속 조직 드롭다운 채우기
    if (orgEl) {
        orgEl.innerHTML = `<option value="">${dict.org_unassigned || "(미배정)"}</option>`;
        ensureOrgUnitsLoaded().then(() => {
            orgEl.innerHTML = orgUnitSelectOptions(data ? (data.org_unit_id || "") : "");
        });
    }

    const close = () => {
        modal.classList.add("hidden");
        saveBtn.onclick = null; closeBtn.onclick = null; cancelBtn.onclick = null;
        modal.onclick = null; nameEl.onkeydown = null; tagsEl.onkeydown = null; idEl.onkeydown = null;
    };
    const showErr = (m) => { errEl.textContent = m; errEl.classList.remove("hidden"); };

    const save = async () => {
        const employee_id = idEl.value.trim();
        const employee_name = nameEl.value.trim();
        const tags = tagsEl.value.trim();
        const org_unit_id = orgEl ? orgEl.value : "";
        if (!isEdit && !employee_id) return showErr(dict.err_emp_id_required || "사번은 필수입니다.");
        if (!employee_name) return showErr(dict.err_emp_name_required || "이름은 필수입니다.");
        saveBtn.disabled = true;
        try {
            let resp;
            if (isEdit) {
                resp = await authenticatedFetch(`${API_BASE_URL}/admin/employees/${encodeURIComponent(data.employee_id)}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employee_name, tags, org_unit_id })
                });
            } else {
                resp = await authenticatedFetch(`${API_BASE_URL}/admin/employees`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employee_id, employee_name, tags })
                });
            }
            if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
            // 신규 생성 시 org 배정은 생성 직후 PUT 으로 반영
            if (!isEdit && org_unit_id) {
                await authenticatedFetch(`${API_BASE_URL}/admin/employees/${encodeURIComponent(employee_id)}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employee_name, org_unit_id })
                });
            }
            close();
            reloadEmployeeList();
        } catch (err) {
            saveBtn.disabled = false;
            showErr((isEdit ? (dict.emp_update_failed || "직원 수정 실패: ") : (dict.emp_add_failed || "직원 추가 실패: ")) + err.message);
        }
    };

    saveBtn.disabled = false;
    saveBtn.onclick = save;
    closeBtn.onclick = close;
    cancelBtn.onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    const onEnter = (e) => { if (e.key === "Enter") { e.preventDefault(); save(); } };
    idEl.onkeydown = onEnter; nameEl.onkeydown = onEnter; tagsEl.onkeydown = onEnter;
}

async function renderEmployeeAccounts(container) {
    const dict = translations[currentLang] || translations.ko;
    container.className = "";
    container.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">${dict.loading_text || "불러오는 중..."}</div>`;

    let rows;
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/admin/employees/accounts`);
        if (!resp.ok) {
            const e = await resp.json().catch(() => ({}));
            throw new Error(e.error || "목록 조회 실패");
        }
        rows = await resp.json();
    } catch (err) {
        container.innerHTML = `<div class="text-center py-8 text-rose-400 text-sm">${err.message}</div>`;
        return;
    }

    const isSuperAdmin = localStorage.getItem("pguard_company_code") === "auton";

    const bodyRows = (rows || []).map(r => {
        const enabled = !!r.is_login_enabled && !!r.login_id;
        const statusBadge = enabled
            ? `<span class="px-2 py-0.5 bg-emerald-600/20 text-emerald-300 text-[10px] rounded-full">${dict.account_active || "활성"}</span>`
            : `<span class="px-2 py-0.5 bg-slate-600/20 text-slate-400 text-[10px] rounded-full">${dict.account_inactive || "비활성"}</span>`;
        const roleBadgeCls = r.admin_role === "sub_admin" ? "bg-indigo-600/20 text-indigo-300"
            : r.admin_role === "employee_manager" ? "bg-amber-600/20 text-amber-300"
            : "bg-slate-600/20 text-slate-400";
        const companyCell = isSuperAdmin ? `<td class="py-3 px-4 font-mono text-slate-400">${r.company_code || ""}</td>` : "";

        // 권한 select (활성 계정에만 부여 가능)
        const roleSelect = `
            <select data-emp-role="${r.employee_id}" ${enabled ? "" : "disabled"}
                class="bg-slate-900 border border-cardBorder text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer disabled:opacity-40">
                <option value="" ${!r.admin_role ? "selected" : ""}>${dict.role_normal_employee || "일반 직원"}</option>
                <option value="sub_admin" ${r.admin_role === "sub_admin" ? "selected" : ""}>${dict.role_sub_admin || "서브 관리자"}</option>
                <option value="employee_manager" ${r.admin_role === "employee_manager" ? "selected" : ""}>${dict.role_employee_manager || "직원 관리자"}</option>
            </select>`;

        const nameEsc = (r.employee_name || "").replace(/"/g, "&quot;");
        const tagsEsc = (r.tags || "").replace(/"/g, "&quot;");
        return `
            <tr class="border-b border-white/5">
                <td class="py-3 px-4 text-white font-medium">${escapeHtml(r.employee_name || "")}</td>
                <td class="py-3 px-4 font-mono text-slate-400">${escapeHtml(r.employee_id)}</td>
                ${companyCell}
                <td class="py-3 px-4 text-slate-300">${r.org_unit_name ? escapeHtml(r.org_unit_name) : `<span class="text-slate-600">-</span>`}</td>
                <td class="py-3 px-4 text-slate-400">${escapeHtml(r.tags || "-")}</td>
                <td class="py-3 px-4 font-mono text-slate-300">${escapeHtml(r.login_id || "-")}</td>
                <td class="py-3 px-4">${statusBadge}</td>
                <td class="py-3 px-4">${roleSelect}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <button data-emp-edit="${r.employee_id}" data-emp-name="${nameEsc}" data-emp-tags="${tagsEsc}" data-emp-org="${r.org_unit_id || ''}"
                            class="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] rounded-lg font-semibold transition">
                            ${dict.emp_edit || "정보 수정"}
                        </button>
                        <button data-emp-account="${r.employee_id}" data-emp-name="${nameEsc}"
                            class="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-semibold transition">
                            ${enabled ? (dict.account_reset || "계정 재설정") : (dict.account_create || "계정 생성")}
                        </button>
                        ${enabled ? `<button data-emp-disable="${r.employee_id}"
                            class="px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] rounded-lg font-semibold transition">
                            ${dict.account_disable || "로그인 해제"}
                        </button>` : ""}
                        <button data-emp-delete="${r.employee_id}" data-emp-name="${nameEsc}"
                            class="px-2.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] rounded-lg font-semibold transition">
                            ${dict.emp_delete || "삭제"}
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join("");

    const colspan = isSuperAdmin ? 9 : 8;
    container.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-4">
            <div class="flex items-start gap-2 text-xs text-slate-400 bg-white/5 border border-cardBorder rounded-xl p-3 flex-1">
                <i data-lucide="info" class="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"></i>
                <p>${dict.emp_manage_help || "직원을 추가·수정·삭제하고, 로그인 계정 생성 및 관리 권한(서브 관리자/직원 관리자)을 부여할 수 있습니다. 최고 관리자(admin) 권한은 부여되지 않습니다."}</p>
            </div>
            <button id="btnAddEmployee" class="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white text-xs rounded-xl font-bold shadow-lg transition whitespace-nowrap">
                <i data-lucide="user-plus" class="w-3.5 h-3.5"></i><span>${dict.emp_add || "직원 추가"}</span>
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="text-slate-400 border-b border-cardBorder bg-white/5">
                        <th class="py-3 px-4 font-semibold">${dict.th_emp_name || "이름"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.th_emp_id || "사번"}</th>
                        ${isSuperAdmin ? `<th class="py-3 px-4 font-semibold">${dict.th_company || "회사"}</th>` : ""}
                        <th class="py-3 px-4 font-semibold">${dict.th_emp_org || "소속 조직"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.th_emp_tags || "태그"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.th_login_id || "로그인 ID"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.th_login_status || "로그인 상태"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.th_admin_role || "관리 권한"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.th_actions || "작업"}</th>
                    </tr>
                </thead>
                <tbody>${bodyRows || `<tr><td colspan="${colspan}" class="py-8 text-center text-slate-500">${dict.no_employees || "직원이 없습니다."}</td></tr>`}</tbody>
            </table>
        </div>`;

    lucide.createIcons();
    bindEmployeeAccountActions(container);
}

function bindEmployeeAccountActions(container) {
    const dict = translations[currentLang] || translations.ko;

    // 직원 추가 (모달)
    document.getElementById("btnAddEmployee")?.addEventListener("click", () => openEmployeeModal("create", null));

    // 직원 정보 수정 (모달)
    container.querySelectorAll("button[data-emp-edit]").forEach(btn => {
        btn.addEventListener("click", () => openEmployeeModal("edit", {
            employee_id: btn.getAttribute("data-emp-edit"),
            employee_name: btn.getAttribute("data-emp-name") || "",
            tags: btn.getAttribute("data-emp-tags") || "",
            org_unit_id: btn.getAttribute("data-emp-org") || ""
        }));
    });

    // 직원 삭제
    container.querySelectorAll("button[data-emp-delete]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const employeeId = btn.getAttribute("data-emp-delete");
            const empName = btn.getAttribute("data-emp-name") || employeeId;
            if (!confirm((dict.emp_confirm_delete || "직원을 삭제하시겠습니까? 활동 로그도 함께 삭제될 수 있습니다.") + `\n[${empName}]`)) return;
            try {
                const resp = await authenticatedFetch(`${API_BASE_URL}/admin/employees/${encodeURIComponent(employeeId)}`, { method: "DELETE" });
                if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
                reloadEmployeeList();
            } catch (err) { alert((dict.emp_delete_failed || "직원 삭제 실패: ") + err.message); }
        });
    });

    // 계정 생성/재설정
    container.querySelectorAll("button[data-emp-account]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const employeeId = btn.getAttribute("data-emp-account");
            const empName = btn.getAttribute("data-emp-name") || employeeId;
            const loginId = prompt(`[${empName}] ${dict.prompt_login_id || "로그인 ID를 입력하세요"}`, employeeId);
            if (loginId === null) return;
            if (!loginId.trim()) { alert(dict.err_login_id_required || "로그인 ID는 필수입니다."); return; }
            const password = prompt(`[${empName}] ${dict.prompt_password || "비밀번호를 입력하세요 (4자 이상)"}`);
            if (password === null) return;
            if (password.length < 4) { alert(dict.err_password_short || "비밀번호는 최소 4자 이상이어야 합니다."); return; }

            try {
                const resp = await authenticatedFetch(`${API_BASE_URL}/admin/employees/${encodeURIComponent(employeeId)}/account`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ login_id: loginId.trim(), password })
                });
                if (!resp.ok) {
                    const e = await resp.json().catch(() => ({}));
                    throw new Error(e.error || "실패");
                }
                alert(dict.account_saved || "직원 로그인 계정이 저장되었습니다.");
                reloadEmployeeList();
            } catch (err) {
                alert((dict.account_save_failed || "계정 저장 실패: ") + err.message);
            }
        });
    });

    // 로그인 해제
    container.querySelectorAll("button[data-emp-disable]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const employeeId = btn.getAttribute("data-emp-disable");
            if (!confirm(dict.confirm_disable || "이 직원의 로그인을 비활성화하시겠습니까? (부여된 관리 권한도 함께 해제됩니다)")) return;
            try {
                const resp = await authenticatedFetch(`${API_BASE_URL}/admin/employees/${encodeURIComponent(employeeId)}/account`, { method: "DELETE" });
                if (!resp.ok) {
                    const e = await resp.json().catch(() => ({}));
                    throw new Error(e.error || "실패");
                }
                // 로그인 해제 시 관리 권한도 해제
                await authenticatedFetch(`${API_BASE_URL}/admin/employees/${encodeURIComponent(employeeId)}/admin-role`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ admin_role: "" })
                });
                reloadEmployeeList();
            } catch (err) {
                alert((dict.account_disable_failed || "로그인 해제 실패: ") + err.message);
            }
        });
    });

    // 관리 권한 부여/변경
    container.querySelectorAll("select[data-emp-role]").forEach(sel => {
        sel.addEventListener("change", async () => {
            const employeeId = sel.getAttribute("data-emp-role");
            const newRole = sel.value;
            try {
                const resp = await authenticatedFetch(`${API_BASE_URL}/admin/employees/${encodeURIComponent(employeeId)}/admin-role`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ admin_role: newRole })
                });
                if (!resp.ok) {
                    const e = await resp.json().catch(() => ({}));
                    throw new Error(e.error || "실패");
                }
                const label = adminRoleLabel(newRole);
                sel.classList.add("ring-1", "ring-emerald-500");
                setTimeout(() => sel.classList.remove("ring-1", "ring-emerald-500"), 800);
            } catch (err) {
                alert((dict.role_update_failed || "권한 변경 실패: ") + err.message);
                reloadEmployeeList();
            }
        });
    });
}

// ==================================================================
// 전자결재 Phase 2: 템플릿 관리 UI (동적 필드 빌더)
// ==================================================================
let approvalTemplates = [];
let participantsCache = [];
let templateEditor = null; // null=목록보기, {id, title, category, fields[], approval[], agreement[], cc[]}

const FIELD_TYPES = ["text", "textarea", "number", "date", "select"];
const TEMPLATE_CATEGORIES = ["general", "leave", "expense", "purchase", "report", "hr", "it_request", "other"];

function escapeHtml(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function categoryLabel(cat) {
    const dict = translations[currentLang] || translations.ko;
    return (dict["cat_" + cat]) || cat;
}
function fieldTypeLabel(t) {
    const dict = translations[currentLang] || translations.ko;
    return (dict["ftype_" + t]) || t;
}

async function renderTemplatesSubtab(container) {
    if (templateEditor) {
        renderTemplateEditor(container);
    } else {
        await renderTemplateList(container);
    }
}

async function fetchParticipantsOnce(force) {
    if (participantsCache.length && !force) return participantsCache;
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/approval/participants`);
        if (resp.ok) participantsCache = await resp.json();
    } catch (e) { participantsCache = []; }
    return participantsCache;
}

async function renderTemplateList(container) {
    const dict = translations[currentLang] || translations.ko;
    container.className = "";
    container.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">${dict.loading_text || "불러오는 중..."}</div>`;

    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/approval/templates`);
        if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
        approvalTemplates = await resp.json();
    } catch (err) {
        container.innerHTML = `<div class="text-center py-8 text-rose-400 text-sm">${escapeHtml(err.message)}</div>`;
        return;
    }

    const rows = (approvalTemplates || []).map(t => {
        let fieldCount = 0;
        try { fieldCount = JSON.parse(t.body_schema || "[]").length; } catch (e) {}
        return `
            <tr class="border-b border-white/5">
                <td class="py-3 px-4 text-white font-medium">${escapeHtml(t.title)}</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 text-[10px] rounded-full">${escapeHtml(categoryLabel(t.category))}</span></td>
                <td class="py-3 px-4 text-slate-400">${fieldCount} ${dict.tpl_fields_unit || "개 항목"}</td>
                <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${(t.updated_at || "").slice(0, 16)}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                        <button data-tpl-edit="${t.id}" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-semibold transition">${dict.btn_edit || "수정"}</button>
                        <button data-tpl-del="${t.id}" class="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] rounded-lg font-semibold transition">${dict.btn_delete || "삭제"}</button>
                    </div>
                </td>
            </tr>`;
    }).join("");

    container.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <p class="text-xs text-slate-400">${dict.tpl_list_desc || "결재 양식(템플릿)을 만들고 관리합니다. 문서 작성 시 이 양식을 선택합니다."}</p>
            <button id="btnNewTemplate" class="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white text-xs rounded-xl font-bold shadow-lg transition">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i><span>${dict.tpl_new || "새 템플릿"}</span>
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="text-slate-400 border-b border-cardBorder bg-white/5">
                        <th class="py-3 px-4 font-semibold">${dict.tpl_th_title || "양식명"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.tpl_th_category || "분류"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.tpl_th_fields || "입력 항목"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.tpl_th_updated || "수정일"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.th_actions || "작업"}</th>
                    </tr>
                </thead>
                <tbody>${rows || `<tr><td colspan="5" class="py-8 text-center text-slate-500">${dict.tpl_empty || "등록된 템플릿이 없습니다."}</td></tr>`}</tbody>
            </table>
        </div>`;

    lucide.createIcons();

    document.getElementById("btnNewTemplate")?.addEventListener("click", () => openTemplateEditor(null));
    container.querySelectorAll("button[data-tpl-edit]").forEach(btn => {
        btn.addEventListener("click", () => {
            const t = approvalTemplates.find(x => String(x.id) === btn.getAttribute("data-tpl-edit"));
            openTemplateEditor(t);
        });
    });
    container.querySelectorAll("button[data-tpl-del]").forEach(btn => {
        btn.addEventListener("click", () => deleteTemplate(btn.getAttribute("data-tpl-del")));
    });
}

function openTemplateEditor(tpl) {
    const dict = translations[currentLang] || translations.ko;
    if (tpl) {
        let fields = [], approval = [], agreement = [], cc = [];
        try { fields = JSON.parse(tpl.body_schema || "[]"); } catch (e) {}
        try { approval = JSON.parse(tpl.default_approval_line || "[]"); } catch (e) {}
        try { agreement = JSON.parse(tpl.default_agreement_line || "[]"); } catch (e) {}
        try { cc = JSON.parse(tpl.default_cc_line || "[]"); } catch (e) {}
        templateEditor = { id: tpl.id, title: tpl.title, category: tpl.category, fields, approval, agreement, cc };
    } else {
        templateEditor = { id: null, title: "", category: "general", fields: [], approval: [], agreement: [], cc: [] };
    }
    fetchParticipantsOnce().then(() => renderApprovalAdminContent());
}

function closeTemplateEditor() {
    templateEditor = null;
    renderApprovalAdminContent();
}

function renderTemplateEditor(container) {
    const dict = translations[currentLang] || translations.ko;
    const ed = templateEditor;
    container.className = "";

    const catOptions = TEMPLATE_CATEGORIES.map(c =>
        `<option value="${c}" ${ed.category === c ? "selected" : ""}>${escapeHtml(categoryLabel(c))}</option>`).join("");

    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button id="btnTplBack" class="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"><i data-lucide="arrow-left" class="w-5 h-5"></i></button>
            <h5 class="font-outfit text-lg font-bold text-white">${ed.id ? (dict.tpl_edit_title || "템플릿 수정") : (dict.tpl_new_title || "새 템플릿")}</h5>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.tpl_th_title || "양식명"}</label>
                <input type="text" id="tplTitle" value="${escapeHtml(ed.title)}" class="w-full bg-white/5 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.tpl_th_category || "분류"}</label>
                <select id="tplCategory" class="w-full bg-slate-900 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer">${catOptions}</select>
            </div>
        </div>

        <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
                <h6 class="text-sm font-bold text-white">${dict.tpl_fields_title || "입력 항목 (본문 필드)"}</h6>
                <button id="btnAddField" class="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-semibold transition">
                    <i data-lucide="plus" class="w-3 h-3"></i><span>${dict.tpl_add_field || "항목 추가"}</span>
                </button>
            </div>
            <div id="tplFieldsWrap" class="space-y-3"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            ${renderLinePickerHtml("approval", dict.tpl_line_approval || "기본 결재선 (순차)", dict)}
            ${renderLinePickerHtml("agreement", dict.tpl_line_agreement || "기본 합의선 (병렬)", dict)}
            ${renderLinePickerHtml("cc", dict.tpl_line_cc || "기본 참조선", dict)}
        </div>

        <div class="flex items-center gap-3">
            <button id="btnSaveTpl" class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition">
                <i data-lucide="save" class="w-4 h-4"></i><span>${dict.btn_save || "저장"}</span>
            </button>
            <button id="btnCancelTpl" class="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold transition">${dict.btn_cancel || "취소"}</button>
        </div>`;

    renderTemplateFields();
    renderAllLinePickers();
    lucide.createIcons();

    document.getElementById("btnTplBack")?.addEventListener("click", closeTemplateEditor);
    document.getElementById("btnCancelTpl")?.addEventListener("click", closeTemplateEditor);
    document.getElementById("btnAddField")?.addEventListener("click", () => {
        ed.fields.push({ key: "", label: { ko: "", en: "", th: "", lo: "" }, type: "text", options: [] });
        renderTemplateFields();
    });
    document.getElementById("btnSaveTpl")?.addEventListener("click", saveTemplate);
}

function renderTemplateFields() {
    const dict = translations[currentLang] || translations.ko;
    const wrap = document.getElementById("tplFieldsWrap");
    if (!wrap) return;
    const ed = templateEditor;

    if (!ed.fields.length) {
        wrap.innerHTML = `<div class="text-xs text-slate-500 py-4 text-center border border-dashed border-cardBorder rounded-xl">${dict.tpl_no_fields || "입력 항목이 없습니다. '항목 추가'로 필드를 만드세요."}</div>`;
        return;
    }

    wrap.innerHTML = ed.fields.map((f, i) => {
        const typeOpts = FIELD_TYPES.map(t => `<option value="${t}" ${f.type === t ? "selected" : ""}>${escapeHtml(fieldTypeLabel(t))}</option>`).join("");
        const optionsRow = f.type === "select" ? `
            <div class="mt-2">
                <label class="block text-[10px] text-slate-500 mb-1">${dict.tpl_options || "선택 옵션 (쉼표로 구분)"}</label>
                <input type="text" data-field-options="${i}" value="${escapeHtml((f.options || []).join(", "))}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
            </div>` : "";
        return `
            <div class="bg-white/5 border border-cardBorder rounded-xl p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold text-indigo-300">#${i + 1}</span>
                    <div class="flex items-center gap-1">
                        <button data-field-up="${i}" class="p-1 hover:bg-white/10 rounded text-slate-400" title="위로"><i data-lucide="chevron-up" class="w-3.5 h-3.5"></i></button>
                        <button data-field-down="${i}" class="p-1 hover:bg-white/10 rounded text-slate-400" title="아래로"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
                        <button data-field-del="${i}" class="p-1 hover:bg-rose-500/20 rounded text-rose-400" title="삭제"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div><label class="block text-[10px] text-slate-500 mb-1">${dict.tpl_label_ko || "라벨(한국어)"}</label>
                        <input type="text" data-field-label-ko="${i}" value="${escapeHtml(f.label?.ko || "")}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"></div>
                    <div><label class="block text-[10px] text-slate-500 mb-1">EN</label>
                        <input type="text" data-field-label-en="${i}" value="${escapeHtml(f.label?.en || "")}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"></div>
                    <div><label class="block text-[10px] text-slate-500 mb-1">TH</label>
                        <input type="text" data-field-label-th="${i}" value="${escapeHtml(f.label?.th || "")}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"></div>
                    <div><label class="block text-[10px] text-slate-500 mb-1">LO</label>
                        <input type="text" data-field-label-lo="${i}" value="${escapeHtml(f.label?.lo || "")}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"></div>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <div><label class="block text-[10px] text-slate-500 mb-1">${dict.tpl_field_key || "키(영문 식별자, 선택)"}</label>
                        <input type="text" data-field-key="${i}" value="${escapeHtml(f.key || "")}" placeholder="auto" class="w-full bg-white/5 border border-cardBorder rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"></div>
                    <div><label class="block text-[10px] text-slate-500 mb-1">${dict.tpl_field_type || "타입"}</label>
                        <select data-field-type="${i}" class="w-full bg-slate-900 border border-cardBorder rounded-lg px-2.5 py-1.5 text-xs text-white cursor-pointer focus:outline-none focus:border-indigo-500">${typeOpts}</select></div>
                </div>
                ${optionsRow}
            </div>`;
    }).join("");

    lucide.createIcons();
    bindFieldEditors();
}

function bindFieldEditors() {
    const ed = templateEditor;
    const wrap = document.getElementById("tplFieldsWrap");
    if (!wrap) return;

    const setVal = (attr, cb) => {
        wrap.querySelectorAll(`[${attr}]`).forEach(el => {
            const i = parseInt(el.getAttribute(attr), 10);
            el.addEventListener("input", () => cb(i, el.value));
            el.addEventListener("change", () => cb(i, el.value));
        });
    };
    setVal("data-field-label-ko", (i, v) => { ed.fields[i].label = ed.fields[i].label || {}; ed.fields[i].label.ko = v; });
    setVal("data-field-label-en", (i, v) => { ed.fields[i].label = ed.fields[i].label || {}; ed.fields[i].label.en = v; });
    setVal("data-field-label-th", (i, v) => { ed.fields[i].label = ed.fields[i].label || {}; ed.fields[i].label.th = v; });
    setVal("data-field-label-lo", (i, v) => { ed.fields[i].label = ed.fields[i].label || {}; ed.fields[i].label.lo = v; });
    setVal("data-field-key", (i, v) => { ed.fields[i].key = v; });
    setVal("data-field-options", (i, v) => { ed.fields[i].options = v.split(",").map(s => s.trim()).filter(Boolean); });

    wrap.querySelectorAll("[data-field-type]").forEach(el => {
        el.addEventListener("change", () => {
            const i = parseInt(el.getAttribute("data-field-type"), 10);
            ed.fields[i].type = el.value;
            renderTemplateFields(); // select 옵션 표시 갱신
        });
    });
    wrap.querySelectorAll("[data-field-del]").forEach(el => {
        el.addEventListener("click", () => { ed.fields.splice(parseInt(el.getAttribute("data-field-del"), 10), 1); renderTemplateFields(); });
    });
    wrap.querySelectorAll("[data-field-up]").forEach(el => {
        el.addEventListener("click", () => {
            const i = parseInt(el.getAttribute("data-field-up"), 10);
            if (i > 0) { [ed.fields[i - 1], ed.fields[i]] = [ed.fields[i], ed.fields[i - 1]]; renderTemplateFields(); }
        });
    });
    wrap.querySelectorAll("[data-field-down]").forEach(el => {
        el.addEventListener("click", () => {
            const i = parseInt(el.getAttribute("data-field-down"), 10);
            if (i < ed.fields.length - 1) { [ed.fields[i + 1], ed.fields[i]] = [ed.fields[i], ed.fields[i + 1]]; renderTemplateFields(); }
        });
    });
}

function renderLinePickerHtml(kind, title, dict) {
    return `
        <div class="bg-white/5 border border-cardBorder rounded-xl p-3">
            <h6 class="text-xs font-bold text-white mb-2">${escapeHtml(title)}</h6>
            <div class="flex gap-1.5 mb-2">
                <select data-line-select="${kind}" class="flex-1 bg-slate-900 border border-cardBorder rounded-lg px-2 py-1.5 text-[11px] text-white cursor-pointer focus:outline-none"></select>
                <button data-line-add="${kind}" class="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-semibold transition">+</button>
            </div>
            <div data-line-list="${kind}" class="space-y-1.5"></div>
        </div>`;
}

function renderAllLinePickers() {
    ["approval", "agreement", "cc"].forEach(renderLinePicker);
}

function renderLinePicker(kind) {
    const dict = translations[currentLang] || translations.ko;
    const ed = templateEditor;
    const list = ed[kind] || [];
    const sel = document.querySelector(`[data-line-select="${kind}"]`);
    const listWrap = document.querySelector(`[data-line-list="${kind}"]`);
    if (!sel || !listWrap) return;

    // 선택 드롭다운: 참여자 목록 (이미 추가된 것 제외)
    const chosen = new Set(list.map(x => x.id));
    const opts = participantsCache.filter(p => !chosen.has(p.id)).map(p =>
        `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)} (${p.type === "admin" ? (dict.p_admin || "관리자") : (dict.p_employee || "직원")})</option>`).join("");
    sel.innerHTML = opts || `<option value="">${dict.tpl_no_participants || "추가 가능한 대상 없음"}</option>`;

    const ordered = kind === "approval";
    listWrap.innerHTML = list.length ? list.map((item, i) => {
        const p = participantsCache.find(x => x.id === item.id);
        const name = p ? p.name : item.id;
        const orderBadge = ordered ? `<span class="text-[10px] font-bold text-indigo-300 mr-1">${i + 1}.</span>` : "";
        const moveBtns = ordered ? `
            <button data-line-up="${kind}:${i}" class="p-0.5 hover:bg-white/10 rounded text-slate-400"><i data-lucide="chevron-up" class="w-3 h-3"></i></button>
            <button data-line-down="${kind}:${i}" class="p-0.5 hover:bg-white/10 rounded text-slate-400"><i data-lucide="chevron-down" class="w-3 h-3"></i></button>` : "";
        return `
            <div class="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1.5">
                <span class="text-[11px] text-slate-200">${orderBadge}${escapeHtml(name)}</span>
                <div class="flex items-center gap-0.5">${moveBtns}
                    <button data-line-del="${kind}:${i}" class="p-0.5 hover:bg-rose-500/20 rounded text-rose-400"><i data-lucide="x" class="w-3 h-3"></i></button>
                </div>
            </div>`;
    }).join("") : `<div class="text-[10px] text-slate-500 text-center py-1">${dict.tpl_line_empty || "지정 안 함"}</div>`;

    lucide.createIcons();

    // 바인딩
    const addBtn = document.querySelector(`[data-line-add="${kind}"]`);
    if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = "1";
        addBtn.addEventListener("click", () => {
            const selEl = document.querySelector(`[data-line-select="${kind}"]`);
            const val = selEl?.value;
            if (!val) return;
            const p = participantsCache.find(x => x.id === val);
            ed[kind].push({ id: val, type: p ? p.type : "admin", name: p ? p.name : val });
            renderLinePicker(kind);
        });
    }
    listWrap.querySelectorAll("[data-line-del]").forEach(btn => {
        btn.addEventListener("click", () => {
            const [k, idx] = btn.getAttribute("data-line-del").split(":");
            ed[k].splice(parseInt(idx, 10), 1); renderLinePicker(k);
        });
    });
    listWrap.querySelectorAll("[data-line-up]").forEach(btn => {
        btn.addEventListener("click", () => {
            const [k, idxs] = btn.getAttribute("data-line-up").split(":"); const i = parseInt(idxs, 10);
            if (i > 0) { [ed[k][i - 1], ed[k][i]] = [ed[k][i], ed[k][i - 1]]; renderLinePicker(k); }
        });
    });
    listWrap.querySelectorAll("[data-line-down]").forEach(btn => {
        btn.addEventListener("click", () => {
            const [k, idxs] = btn.getAttribute("data-line-down").split(":"); const i = parseInt(idxs, 10);
            if (i < ed[k].length - 1) { [ed[k][i + 1], ed[k][i]] = [ed[k][i], ed[k][i + 1]]; renderLinePicker(k); }
        });
    });
}

async function saveTemplate() {
    const dict = translations[currentLang] || translations.ko;
    const ed = templateEditor;
    const title = document.getElementById("tplTitle")?.value.trim() || "";
    const category = document.getElementById("tplCategory")?.value || "general";

    if (!title) { alert(dict.tpl_err_title || "양식명을 입력해 주세요."); return; }

    // 필드 key 자동 생성 및 검증
    const usedKeys = new Set();
    const fields = ed.fields.map((f, i) => {
        let key = (f.key || "").trim();
        if (!key) key = "field_" + (i + 1);
        key = key.replace(/[^a-zA-Z0-9_]/g, "_");
        while (usedKeys.has(key)) key = key + "_";
        usedKeys.add(key);
        const label = f.label || {};
        if (!label.ko && !label.en) label.ko = key;
        const field = { key, label, type: FIELD_TYPES.includes(f.type) ? f.type : "text" };
        if (field.type === "select") field.options = f.options || [];
        return field;
    });

    const payload = {
        title, category,
        body_schema: fields,
        default_approval_line: ed.approval,
        default_agreement_line: ed.agreement,
        default_cc_line: ed.cc
    };

    try {
        const url = ed.id ? `${API_BASE_URL}/approval/templates/${ed.id}` : `${API_BASE_URL}/approval/templates`;
        const method = ed.id ? "PUT" : "POST";
        const resp = await authenticatedFetch(url, {
            method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "저장 실패"); }
        alert(dict.tpl_saved || "템플릿이 저장되었습니다.");
        templateEditor = null;
        renderApprovalAdminContent();
    } catch (err) {
        alert((dict.tpl_save_failed || "템플릿 저장 실패: ") + err.message);
    }
}

async function deleteTemplate(id) {
    const dict = translations[currentLang] || translations.ko;
    if (!confirm(dict.tpl_confirm_delete || "이 템플릿을 삭제하시겠습니까?")) return;
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/approval/templates/${id}`, { method: "DELETE" });
        if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "삭제 실패"); }
        renderApprovalAdminContent();
    } catch (err) {
        alert((dict.tpl_delete_failed || "템플릿 삭제 실패: ") + err.message);
    }
}

// ==================================================================
// 전자결재 Phase 4: 문서 목록 / 상세 모달 / 작성 폼 (프론트엔드)
// ==================================================================
let approvalUserSubtab = "approval-user-new";
let currentDetailDocId = null;

// ── 상태/우선순위 배지 ──
function docStatusBadge(status) {
    const dict = translations[currentLang] || translations.ko;
    const map = {
        draft: ["bg-slate-600/20 text-slate-300", dict.st_draft || "임시저장"],
        submitted: ["bg-blue-600/20 text-blue-300", dict.st_submitted || "제출됨"],
        in_review: ["bg-amber-600/20 text-amber-300", dict.st_in_review || "결재중"],
        approved: ["bg-emerald-600/20 text-emerald-300", dict.st_approved || "승인완료"],
        rejected: ["bg-rose-600/20 text-rose-300", dict.st_rejected || "반려"],
        withdrawn: ["bg-purple-600/20 text-purple-300", dict.st_withdrawn || "회수"]
    };
    const pair = map[status] || ["bg-slate-600/20 text-slate-300", status];
    return `<span class="px-2 py-0.5 ${pair[0]} text-[10px] rounded-full font-semibold">${escapeHtml(pair[1])}</span>`;
}
function docPriorityBadge(priority) {
    const dict = translations[currentLang] || translations.ko;
    if (priority === "normal" || !priority) return "";
    const map = {
        low: ["bg-slate-600/20 text-slate-400", dict.pr_low || "낮음"],
        high: ["bg-orange-600/20 text-orange-300", dict.pr_high || "높음"],
        urgent: ["bg-rose-600/30 text-rose-300", dict.pr_urgent || "긴급"]
    };
    const m = map[priority]; if (!m) return "";
    return `<span class="px-2 py-0.5 ${m[0]} text-[10px] rounded-full font-semibold">${escapeHtml(m[1])}</span>`;
}

// ── 나의 결재 탭 ──
function bindApprovalUserPills() {
    const wrap = document.getElementById("approvalUserPills");
    if (!wrap || wrap.dataset.bound === "1") return;
    wrap.dataset.bound = "1";
    wrap.querySelectorAll("button[data-subtab]").forEach(btn => {
        btn.addEventListener("click", () => {
            approvalUserSubtab = btn.getAttribute("data-subtab");
            wrap.querySelectorAll("button[data-subtab]").forEach(b => {
                b.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-400 hover:text-white transition";
            });
            btn.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white transition";
            renderApprovalUserContent();
        });
    });
}

async function fetchApprovalUserTab() {
    bindApprovalUserPills();
    renderApprovalUserContent();
    refreshPendingBadge();
}

function renderApprovalUserContent() {
    const container = document.getElementById("approvalUserContent");
    if (!container) return;
    const dict = translations[currentLang] || translations.ko;
    if (approvalUserSubtab === "approval-user-new") {
        renderNewDocumentForm(container);
    } else if (approvalUserSubtab === "approval-user-mine") {
        renderDocumentListView(container, "mine", { title: dict.approval_pill_mine });
    } else if (approvalUserSubtab === "approval-user-todo") {
        renderDocumentListView(container, "pending", { title: dict.approval_pill_todo });
    } else if (approvalUserSubtab === "approval-user-cc") {
        renderDocumentListView(container, "cc", { title: dict.approval_pill_cc, showRead: true });
    }
}

// ── 문서 목록 뷰 (mode: pending|mine|cc|all) ──
async function renderDocumentListView(container, mode, opts) {
    opts = opts || {};
    const dict = translations[currentLang] || translations.ko;
    container.className = "";
    container.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">${dict.loading_text || "불러오는 중..."}</div>`;

    const endpointMap = {
        pending: "/approval/pending",
        mine: "/approval/my-docs",
        cc: "/approval/cc-docs",
        all: "/approval/documents"
    };
    let url = API_BASE_URL + endpointMap[mode];
    if (mode === "all") {
        const qs = [];
        const st = document.getElementById("docFilterStatus")?.value;
        const search = document.getElementById("docFilterSearch")?.value;
        if (st) qs.push("status=" + encodeURIComponent(st));
        if (search) qs.push("search=" + encodeURIComponent(search));
        if (qs.length) url += "?" + qs.join("&");
    }

    let rows;
    try {
        const resp = await authenticatedFetch(url);
        if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
        rows = await resp.json();
    } catch (err) {
        container.innerHTML = `<div class="text-center py-8 text-rose-400 text-sm">${escapeHtml(err.message)}</div>`;
        return;
    }

    const filterBar = opts.filters ? `
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <select id="docFilterStatus" class="bg-slate-900 border border-cardBorder text-slate-200 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none">
                <option value="">${dict.all_status || "전체 상태"}</option>
                <option value="draft">${dict.st_draft || "임시저장"}</option>
                <option value="in_review">${dict.st_in_review || "결재중"}</option>
                <option value="approved">${dict.st_approved || "승인완료"}</option>
                <option value="rejected">${dict.st_rejected || "반려"}</option>
                <option value="withdrawn">${dict.st_withdrawn || "회수"}</option>
            </select>
            <input type="text" id="docFilterSearch" placeholder="${dict.doc_search || "제목/문서번호 검색"}" class="bg-white/5 border border-cardBorder rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
            <button id="docFilterApply" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl font-bold transition">${dict.btn_apply || "적용"}</button>
            <button id="docExportExcel" class="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs rounded-xl font-bold transition ml-auto"><i data-lucide="file-down" class="w-3.5 h-3.5"></i>${dict.doc_export_excel || "Excel 내보내기"}</button>
        </div>` : "";

    const bodyRows = (rows || []).map(d => {
        const readCell = opts.showRead
            ? `<td class="py-3 px-4">${d.read_at ? `<span class="text-emerald-400 text-[10px]">● ${dict.cc_read || "읽음"}</span>` : `<span class="text-slate-500 text-[10px]">○ ${dict.cc_unread || "안읽음"}</span>`}</td>`
            : "";
        return `
            <tr class="border-b border-white/5 hover:bg-white/5 cursor-pointer" data-doc-open="${d.id}">
                <td class="py-3 px-4 font-mono text-indigo-300 text-[11px]">${escapeHtml(d.doc_number)}</td>
                <td class="py-3 px-4 text-white font-medium">${escapeHtml(d.title)} ${docPriorityBadge(d.priority)}</td>
                <td class="py-3 px-4 text-slate-400">${escapeHtml(categoryLabel(d.category))}</td>
                <td class="py-3 px-4">${docStatusBadge(d.status)}</td>
                <td class="py-3 px-4 text-slate-300">${escapeHtml(d.submitted_by_name || d.submitted_by || "")}</td>
                <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${(d.submitted_at || d.created_at || "").slice(0, 16)}</td>
                ${readCell}
            </tr>`;
    }).join("");

    const colspan = opts.showRead ? 7 : 6;
    container.innerHTML = `
        ${filterBar}
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
                <thead>
                    <tr class="text-slate-400 border-b border-cardBorder bg-white/5">
                        <th class="py-3 px-4 font-semibold">${dict.doc_th_number || "문서번호"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.doc_th_title || "제목"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.tpl_th_category || "분류"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.doc_th_status || "상태"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.doc_th_drafter || "기안자"}</th>
                        <th class="py-3 px-4 font-semibold">${dict.doc_th_date || "일시"}</th>
                        ${opts.showRead ? `<th class="py-3 px-4 font-semibold">${dict.doc_th_read || "열람"}</th>` : ""}
                    </tr>
                </thead>
                <tbody>${bodyRows || `<tr><td colspan="${colspan}" class="py-8 text-center text-slate-500">${dict.doc_empty || "문서가 없습니다."}</td></tr>`}</tbody>
            </table>
        </div>`;

    lucide.createIcons();
    container.querySelectorAll("[data-doc-open]").forEach(tr => {
        tr.addEventListener("click", () => openDocumentDetail(tr.getAttribute("data-doc-open")));
    });
    document.getElementById("docFilterApply")?.addEventListener("click", () => renderDocumentListView(container, mode, opts));
    document.getElementById("docFilterSearch")?.addEventListener("keydown", (e) => { if (e.key === "Enter") renderDocumentListView(container, mode, opts); });
    document.getElementById("docExportExcel")?.addEventListener("click", () => exportApprovalDocsToExcel(rows || []));
}

// 결재 문서 Excel 내보내기
function exportApprovalDocsToExcel(rows) {
    const dict = translations[currentLang] || translations.ko;
    if (typeof XLSX === "undefined") { alert("Excel 라이브러리를 불러올 수 없습니다."); return; }
    const statusLabel = (st) => {
        const m = { draft: dict.st_draft, submitted: dict.st_submitted, in_review: dict.st_in_review, approved: dict.st_approved, rejected: dict.st_rejected, withdrawn: dict.st_withdrawn };
        return m[st] || st;
    };
    const header = [dict.doc_th_number || "문서번호", dict.doc_th_title || "제목", dict.tpl_th_category || "분류", dict.doc_th_status || "상태", dict.doc_th_drafter || "기안자", dict.doc_th_date || "일시"];
    const aoa = [header].concat((rows || []).map(d => [
        d.doc_number, d.title, categoryLabel(d.category), statusLabel(d.status),
        d.submitted_by_name || d.submitted_by || "", (d.submitted_at || d.created_at || "").slice(0, 16)
    ]));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approvals");
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `PGuard_전자결재_${today}.xlsx`);
}

// ── 문서 상세 모달 ──
function localizedFieldLabel(label) {
    if (!label) return "";
    if (typeof label === "string") return label;
    return label[currentLang] || label.ko || label.en || Object.values(label)[0] || "";
}

async function openDocumentDetail(id) {
    if (currentDetailDocId !== id) detailTransLang = null;
    currentDetailDocId = id;
    const dict = translations[currentLang] || translations.ko;
    const modal = document.getElementById("approvalDetailModal");
    const content = document.getElementById("approvalDetailContent");
    modal.classList.remove("hidden");
    content.innerHTML = `<div class="text-center py-12 text-slate-500 text-sm">${dict.loading_text || "불러오는 중..."}</div>`;

    let data;
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/approval/documents/${id}`);
        if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
        data = await resp.json();
    } catch (err) {
        content.innerHTML = `<div class="text-center py-12 text-rose-400 text-sm">${escapeHtml(err.message)}</div>`;
        return;
    }
    renderDocumentDetail(data);
    refreshPendingBadge();
}

function closeDocumentDetail() {
    document.getElementById("approvalDetailModal").classList.add("hidden");
    currentDetailDocId = null;
}

function renderDocumentDetail(data) {
    const dict = translations[currentLang] || translations.ko;
    const content = document.getElementById("approvalDetailContent");
    const doc = data.document;
    const lines = data.lines || [];
    const viewer = data.viewer;

    // 본문 렌더 (body_schema 라벨 + body_data 값, 번역 병기 지원)
    let schema = [], bodyData = {}, translated = null;
    try { schema = JSON.parse(doc.body_schema || "[]"); } catch (e) {}
    try { bodyData = JSON.parse(doc.body_data || "{}"); } catch (e) {}
    try { translated = doc.body_data_translated ? JSON.parse(doc.body_data_translated) : null; } catch (e) {}
    const source = doc.original_language || "ko";
    const availableLangs = translated ? Object.keys(translated._status || {}).filter(l => translated._status[l] === "ok") : [];

    const buildBodyHtml = (transLang) => {
        if (!schema.length) return `<div class="text-xs text-slate-500 py-2">${dict.doc_no_body || "본문 내용이 없습니다."}</div>`;
        return schema.map(f => {
            const val = bodyData[f.key];
            const tVal = (transLang && translated && translated[transLang]) ? translated[transLang][f.key] : null;
            return `<div class="py-2 border-b border-white/5 flex gap-4">
                <span class="text-xs text-slate-400 w-32 shrink-0">${escapeHtml(localizedFieldLabel(f.label))}</span>
                <span class="text-sm text-white whitespace-pre-wrap flex-1">${escapeHtml(val != null && val !== "" ? val : "-")}${tVal ? `<br><span class="text-[12px] text-indigo-300">↳ ${escapeHtml(tVal)}</span>` : ""}</span>
            </div>`;
        }).join("");
    };
    const bodyHtml = buildBodyHtml(detailTransLang);

    // 번역 컨트롤 (원문 + 번역 가능 언어 드롭다운, 번역 실행 버튼)
    const canTranslate = (doc.submitted_by === viewer.id && doc.submitted_by_type === viewer.type) || viewer.type === "admin";
    const langOptions = `<option value="">${dict.trans_original || "원문"}</option>` +
        availableLangs.map(l => `<option value="${l}" ${detailTransLang === l ? "selected" : ""}>${l.toUpperCase()}</option>`).join("");
    const transControls = `
        <div class="flex items-center gap-2">
            ${availableLangs.length ? `<select id="detailTransSel" class="bg-slate-900 border border-cardBorder text-slate-200 text-[11px] rounded-lg px-2 py-1 cursor-pointer focus:outline-none">${langOptions}</select>` : ""}
            ${canTranslate ? `<button id="btnTranslateDoc" class="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] rounded-lg font-semibold transition"><i data-lucide="languages" class="w-3 h-3"></i>${dict.trans_run || "번역"}</button>` : ""}
        </div>`;

    // 첨부파일
    const attachments = data.attachments || [];
    const canManageAttach = (doc.submitted_by === viewer.id && doc.submitted_by_type === viewer.type && ["draft", "submitted", "in_review"].includes(doc.status));
    const attachRows = attachments.map(a => `
        <div class="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <button data-att-download="${a.id}" data-att-name="${escapeHtml(a.original_name)}" class="flex items-center gap-2 min-w-0 text-left hover:text-indigo-300 transition">
                <i data-lucide="${fileIconFor(a.mime_type)}" class="w-3.5 h-3.5 text-indigo-400 shrink-0"></i>
                <span class="text-[11px] text-slate-200 truncate">${escapeHtml(a.original_name)}</span>
                <span class="text-[10px] text-slate-500 shrink-0">${formatFileSize(a.file_size)}</span>
                <i data-lucide="download" class="w-3 h-3 text-slate-500 shrink-0"></i>
            </button>
            ${canManageAttach ? `<button data-att-detail-del="${a.id}" class="p-1 hover:bg-rose-500/20 rounded text-rose-400 shrink-0"><i data-lucide="trash-2" class="w-3 h-3"></i></button>` : ""}
        </div>`).join("");
    const attachHtml = (attachments.length || canManageAttach) ? `
        <div class="bg-white/5 border border-cardBorder rounded-xl p-4 mb-5">
            <div class="flex items-center justify-between mb-2">
                <div class="text-[11px] font-bold text-slate-400">${dict.doc_attachments || "첨부파일"}</div>
                ${canManageAttach ? `<label class="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] rounded-lg font-semibold transition cursor-pointer"><i data-lucide="paperclip" class="w-3 h-3"></i>${dict.doc_add_file || "파일 추가"}<input type="file" id="detailFileInput" multiple class="hidden"></label>` : ""}
            </div>
            <div class="space-y-1.5">${attachRows || `<div class="text-[11px] text-slate-500 text-center py-1">${dict.doc_no_files || "첨부된 파일이 없습니다."}</div>`}</div>
        </div>` : "";

    // 결재선 시각화
    const approvalLines = lines.filter(l => l.line_type === "approval").sort((a, b) => a.step_order - b.step_order);
    const agreementLines = lines.filter(l => l.line_type === "agreement");
    const ccLines = lines.filter(l => l.line_type === "cc");

    const lineStateBadge = (st) => {
        const m = {
            pending: ["bg-slate-600/20 text-slate-400", dict.ls_pending || "대기"],
            current: ["bg-amber-600/20 text-amber-300", dict.ls_current || "진행중"],
            approved: ["bg-emerald-600/20 text-emerald-300", dict.ls_approved || "완료"],
            rejected: ["bg-rose-600/20 text-rose-300", dict.ls_rejected || "반려"],
            skipped: ["bg-slate-700/20 text-slate-500", dict.ls_skipped || "건너뜀"]
        };
        const p = m[st] || m.pending;
        return `<span class="px-2 py-0.5 ${p[0]} text-[10px] rounded-full">${p[1]}</span>`;
    };
    const lineRow = (l) => `
        <div class="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <div class="flex items-center gap-2">
                <span class="text-xs text-white font-medium">${escapeHtml(l.approver_name || l.approver_id)}</span>
                ${l.read_at ? `<i data-lucide="eye" class="w-3 h-3 text-emerald-400" title="${(l.read_at||'').slice(0,16)}"></i>` : ""}
            </div>
            <div class="flex items-center gap-2">
                ${l.comment ? `<span class="text-[10px] text-slate-400 italic max-w-[160px] truncate" title="${escapeHtml(l.comment)}">"${escapeHtml(l.comment)}"</span>` : ""}
                ${lineStateBadge(l.status)}
            </div>
        </div>`;

    const approvalViz = approvalLines.length ? `
        <div class="mb-3">
            <div class="text-[11px] font-bold text-slate-400 mb-1.5">${dict.viz_approval || "결재선 (순차)"}</div>
            <div class="space-y-1.5">${approvalLines.map((l, i) => `<div class="flex items-center gap-2"><span class="text-[10px] font-bold text-indigo-300 w-4">${i + 1}</span>${lineRow(l)}</div>`).join("")}</div>
        </div>` : "";
    const agreementViz = agreementLines.length ? `
        <div class="mb-3">
            <div class="text-[11px] font-bold text-slate-400 mb-1.5">${dict.viz_agreement || "합의선 (병렬)"}</div>
            <div class="space-y-1.5">${agreementLines.map(lineRow).join("")}</div>
        </div>` : "";
    const ccViz = ccLines.length ? `
        <div class="mb-3">
            <div class="text-[11px] font-bold text-slate-400 mb-1.5">${dict.viz_cc || "참조 (읽음)"}</div>
            <div class="space-y-1.5">${ccLines.map(lineRow).join("")}</div>
        </div>` : "";

    // 활동 타임라인
    const actionLabel = (a) => (dict["act_ap_" + a]) || a;
    const timeline = (data.activity_log || []).map(log => `
        <div class="flex items-start gap-2 text-[11px]">
            <span class="text-slate-500 font-mono shrink-0">${(log.created_at || "").slice(5, 16)}</span>
            <span class="text-slate-300">${escapeHtml(log.actor_id)} · ${escapeHtml(actionLabel(log.action))}${log.details ? " — " + escapeHtml(log.details) : ""}</span>
        </div>`).join("");

    // 액션 버튼 컨텍스트
    const myApprovalCurrent = approvalLines.find(l => l.approver_id === viewer.id && l.approver_type === viewer.type && l.status === "current");
    const myAgreementCurrent = agreementLines.find(l => l.approver_id === viewer.id && l.approver_type === viewer.type && l.status === "current");
    const isDrafter = doc.submitted_by === viewer.id && doc.submitted_by_type === viewer.type;
    const canWithdraw = isDrafter && ["submitted", "in_review"].includes(doc.status);
    const canEditDraft = isDrafter && doc.status === "draft";

    let actionBtns = "";
    if (myApprovalCurrent) {
        actionBtns += `<button data-doc-act="approve" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold transition">${dict.act_approve || "승인"}</button>`;
        actionBtns += `<button data-doc-act="reject" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-bold transition">${dict.act_reject || "반려"}</button>`;
    }
    if (myAgreementCurrent) {
        actionBtns += `<button data-doc-act="agree" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl font-bold transition">${dict.act_agree || "합의"}</button>`;
        actionBtns += `<button data-doc-act="reject" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-bold transition">${dict.act_reject || "반려"}</button>`;
    }
    if (canWithdraw) {
        actionBtns += `<button data-doc-act="withdraw" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl font-bold transition">${dict.act_withdraw || "회수"}</button>`;
    }
    if (canEditDraft) {
        actionBtns += `<button data-doc-act="edit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl font-bold transition">${dict.act_edit_draft || "이어서 작성"}</button>`;
        actionBtns += `<button data-doc-act="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold transition">${dict.act_submit || "제출"}</button>`;
    }

    content.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono text-indigo-300 text-xs">${escapeHtml(doc.doc_number)}</span>
                    ${docStatusBadge(doc.status)} ${docPriorityBadge(doc.priority)}
                </div>
                <h3 class="font-outfit text-xl font-bold text-white">${escapeHtml(doc.title)}</h3>
                <p class="text-xs text-slate-400 mt-1">${dict.doc_th_drafter || "기안자"}: ${escapeHtml(doc.submitted_by_name || doc.submitted_by)} · ${(doc.submitted_at || doc.created_at || "").slice(0, 16)}</p>
            </div>
            <button id="btnCloseDetail" class="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        ${doc.rejection_reason ? `<div class="mb-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2"><b>${dict.doc_reject_reason || "반려 사유"}:</b> ${escapeHtml(doc.rejection_reason)}</div>` : ""}

        <div class="bg-white/5 border border-cardBorder rounded-xl p-4 mb-5">
            <div class="flex items-center justify-between mb-2">
                <div class="text-[11px] font-bold text-slate-400">${dict.doc_body || "문서 본문"}</div>
                ${transControls}
            </div>
            <div id="detailBodyContent">${bodyHtml}</div>
        </div>

        ${attachHtml}

        <div class="mb-5">${approvalViz}${agreementViz}${ccViz}</div>

        ${timeline ? `<details class="mb-5"><summary class="text-[11px] font-bold text-slate-400 cursor-pointer">${dict.doc_timeline || "활동 이력"}</summary><div class="space-y-1 mt-2 pl-2">${timeline}</div></details>` : ""}

        ${actionBtns ? `<div class="flex flex-wrap gap-2 pt-4 border-t border-white/5">${actionBtns}</div>` : ""}
    `;

    lucide.createIcons();
    document.getElementById("btnCloseDetail")?.addEventListener("click", closeDocumentDetail);
    content.querySelectorAll("[data-doc-act]").forEach(btn => {
        btn.addEventListener("click", () => handleDocAction(btn.getAttribute("data-doc-act"), doc));
    });

    // 번역 언어 병기 드롭다운
    document.getElementById("detailTransSel")?.addEventListener("change", (e) => {
        detailTransLang = e.target.value || null;
        const bodyEl = document.getElementById("detailBodyContent");
        if (bodyEl) { bodyEl.innerHTML = buildBodyHtml(detailTransLang); lucide.createIcons(); }
    });
    // 번역 실행
    document.getElementById("btnTranslateDoc")?.addEventListener("click", async () => {
        const btn = document.getElementById("btnTranslateDoc");
        const orig = btn.innerHTML;
        btn.disabled = true; btn.innerHTML = dict.trans_running || "번역 중...";
        try {
            const r = await authenticatedFetch(`${API_BASE_URL}/approval/translate`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: doc.id })
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "실패");
            detailTransLang = null;
            openDocumentDetail(doc.id); // 재조회하여 번역 반영
        } catch (err) {
            btn.disabled = false; btn.innerHTML = orig;
            alert((dict.trans_failed || "번역 실패: ") + err.message);
        }
    });

    // 첨부 다운로드
    content.querySelectorAll("[data-att-download]").forEach(btn => {
        btn.addEventListener("click", () => downloadAttachment(btn.getAttribute("data-att-download"), btn.getAttribute("data-att-name")));
    });
    // 첨부 삭제 (상세 모달)
    content.querySelectorAll("[data-att-detail-del]").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm(dict.doc_confirm_del_file || "이 첨부파일을 삭제하시겠습니까?")) return;
            try { await deleteAttachmentApi(btn.getAttribute("data-att-detail-del")); openDocumentDetail(doc.id); }
            catch (err) { alert(err.message); }
        });
    });
    // 첨부 추가 (상세 모달, 기안자)
    document.getElementById("detailFileInput")?.addEventListener("change", async (e) => {
        const files = Array.from(e.target.files || []);
        for (const f of files) {
            const fd = new FormData(); fd.append("file", f);
            try {
                const up = await authenticatedFetch(`${API_BASE_URL}/approval/documents/${doc.id}/attachments`, { method: "POST", body: fd });
                if (!up.ok) { const er = await up.json().catch(() => ({})); throw new Error(er.error || "실패"); }
            } catch (err) { alert((dict.doc_file_fail || "첨부 실패: ") + f.name + " — " + err.message); }
        }
        openDocumentDetail(doc.id);
    });
}

// ── 결재 액션 처리 ──
function openActionModal(titleText, placeholder, required) {
    return new Promise((resolve) => {
        const modal = document.getElementById("approvalActionModal");
        const titleEl = document.getElementById("approvalActionTitle");
        const commentEl = document.getElementById("approvalActionComment");
        const errEl = document.getElementById("approvalActionError");
        const confirmBtn = document.getElementById("approvalActionConfirm");
        const cancelBtn = document.getElementById("approvalActionCancel");
        titleEl.textContent = titleText;
        commentEl.value = "";
        commentEl.placeholder = placeholder || "";
        errEl.classList.add("hidden");
        modal.classList.remove("hidden");

        const cleanup = () => {
            modal.classList.add("hidden");
            confirmBtn.removeEventListener("click", onConfirm);
            cancelBtn.removeEventListener("click", onCancel);
        };
        const onConfirm = () => {
            const v = commentEl.value.trim();
            if (required && !v) { errEl.textContent = required; errEl.classList.remove("hidden"); return; }
            cleanup(); resolve(v);
        };
        const onCancel = () => { cleanup(); resolve(null); };
        confirmBtn.addEventListener("click", onConfirm);
        cancelBtn.addEventListener("click", onCancel);
    });
}

async function handleDocAction(action, doc) {
    const dict = translations[currentLang] || translations.ko;
    const id = doc.id;

    if (action === "edit") {
        // 초안 이어서 작성: 폼으로 이동
        closeDocumentDetail();
        approvalUserSubtab = "approval-user-new";
        renderApprovalUserContent();
        setTimeout(() => loadDraftIntoForm(doc), 100);
        return;
    }

    let body = {};
    if (action === "approve") {
        const c = await openActionModal(dict.act_approve || "승인", dict.comment_optional || "의견 (선택)", null);
        if (c === null) return; body.comment = c;
    } else if (action === "agree") {
        const c = await openActionModal(dict.act_agree || "합의", dict.comment_optional || "의견 (선택)", null);
        if (c === null) return; body.comment = c;
    } else if (action === "reject") {
        const c = await openActionModal(dict.act_reject || "반려", dict.reject_reason_ph || "반려 사유를 입력하세요", dict.reject_reason_req || "반려 사유는 필수입니다.");
        if (c === null) return; body.comment = c;
    } else if (action === "withdraw") {
        if (!confirm(dict.confirm_withdraw || "이 문서를 회수하시겠습니까?")) return;
    } else if (action === "submit") {
        if (!confirm(dict.confirm_submit || "이 문서를 제출하시겠습니까?")) return;
    }

    const actionPath = { approve: "approve", agree: "agree", reject: "reject", withdraw: "withdraw", submit: "submit" }[action];
    if (docActionInFlight) return;
    docActionInFlight = true;
    document.querySelectorAll("#approvalDetailContent [data-doc-act]").forEach(b => b.disabled = true);
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/approval/documents/${id}/${actionPath}`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
        closeDocumentDetail();
        fetchCurrentTab();
        refreshPendingBadge();
    } catch (err) {
        alert((dict.act_failed || "처리 실패: ") + err.message);
        document.querySelectorAll("#approvalDetailContent [data-doc-act]").forEach(b => b.disabled = false);
    } finally {
        docActionInFlight = false;
    }
}

// ── 새 결재 작성 폼 ──
let docForm = null; // {template_id, title, category, priority, fields[], data{}, approval[], agreement[], cc[], draftId}

async function renderNewDocumentForm(container) {
    const dict = translations[currentLang] || translations.ko;
    container.className = "";
    container.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">${dict.loading_text || "불러오는 중..."}</div>`;

    // 템플릿 목록(작성용, 직원 접근 가능) + 참여자 로드
    let templates = [];
    try {
        const r = await authenticatedFetch(`${API_BASE_URL}/approval/templates-available`);
        if (r.ok) templates = await r.json();
    } catch (e) {}
    await fetchParticipantsOnce();

    if (!docForm) {
        docForm = { template_id: "", title: "", category: "general", priority: "normal", fields: [], data: {}, approval: [], agreement: [], cc: [], draftId: null, pendingFiles: [], existingAttachments: [] };
    }
    if (!docForm.pendingFiles) docForm.pendingFiles = [];
    if (!docForm.existingAttachments) docForm.existingAttachments = [];

    const tplOptions = `<option value="">${dict.doc_select_template || "템플릿 선택 (또는 자유 양식)"}</option>` +
        templates.map(t => `<option value="${t.id}" ${String(docForm.template_id) === String(t.id) ? "selected" : ""}>${escapeHtml(t.title)}</option>`).join("");

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.doc_form_template || "템플릿"}</label>
                <select id="docTemplateSel" class="w-full bg-slate-900 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer focus:outline-none focus:border-indigo-500">${tplOptions}</select>
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.doc_form_priority || "우선순위"}</label>
                <select id="docPrioritySel" class="w-full bg-slate-900 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer focus:outline-none focus:border-indigo-500">
                    <option value="low" ${docForm.priority==="low"?"selected":""}>${dict.pr_low || "낮음"}</option>
                    <option value="normal" ${docForm.priority==="normal"?"selected":""}>${dict.pr_normal || "보통"}</option>
                    <option value="high" ${docForm.priority==="high"?"selected":""}>${dict.pr_high || "높음"}</option>
                    <option value="urgent" ${docForm.priority==="urgent"?"selected":""}>${dict.pr_urgent || "긴급"}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.doc_th_title || "제목"}</label>
                <input type="text" id="docTitleInput" value="${escapeHtml(docForm.title)}" class="w-full bg-white/5 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500">
            </div>
        </div>

        <div id="docDynamicFields" class="bg-white/5 border border-cardBorder rounded-xl p-4 mb-5"></div>

        <div class="bg-white/5 border border-cardBorder rounded-xl p-4 mb-5">
            <div class="flex items-center justify-between mb-3">
                <h6 class="text-sm font-bold text-white">${dict.doc_attachments || "첨부파일"}</h6>
                <label class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-semibold transition cursor-pointer">
                    <i data-lucide="paperclip" class="w-3 h-3"></i><span>${dict.doc_add_file || "파일 추가"}</span>
                    <input type="file" id="docFileInput" multiple class="hidden">
                </label>
            </div>
            <div id="docAttachList" class="space-y-1.5"></div>
            <p class="text-[10px] text-slate-500 mt-2">${dict.doc_file_hint || "파일당 최대 20MB · 문서/이미지/PDF"}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            ${renderDocLinePickerHtml("approval", dict.tpl_line_approval || "결재선 (순차)")}
            ${renderDocLinePickerHtml("agreement", dict.tpl_line_agreement || "합의선 (병렬)")}
            ${renderDocLinePickerHtml("cc", dict.tpl_line_cc || "참조선")}
        </div>

        <div class="flex items-center gap-3">
            <button id="btnDocSubmit" class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition">
                <i data-lucide="send" class="w-4 h-4"></i><span>${dict.doc_submit || "제출"}</span>
            </button>
            <button id="btnDocDraft" class="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold transition">${dict.doc_save_draft || "임시저장"}</button>
            <button id="btnDocReset" class="px-6 py-2.5 text-slate-400 hover:text-white rounded-xl font-semibold transition">${dict.doc_reset || "초기화"}</button>
        </div>`;

    renderDocDynamicFields(templates);
    renderAllDocLinePickers();
    renderDocFormAttachments();
    lucide.createIcons();

    document.getElementById("docFileInput")?.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        docForm.pendingFiles.push(...files);
        e.target.value = "";
        renderDocFormAttachments();
    });

    document.getElementById("docTemplateSel").addEventListener("change", (e) => {
        docForm.template_id = e.target.value;
        const tpl = templates.find(t => String(t.id) === String(e.target.value));
        if (tpl) {
            try { docForm.fields = JSON.parse(tpl.body_schema || "[]"); } catch (x) { docForm.fields = []; }
            docForm.category = tpl.category || "general";
            if (!docForm.title) docForm.title = tpl.title;
            try { docForm.approval = JSON.parse(tpl.default_approval_line || "[]"); } catch (x) {}
            try { docForm.agreement = JSON.parse(tpl.default_agreement_line || "[]"); } catch (x) {}
            try { docForm.cc = JSON.parse(tpl.default_cc_line || "[]"); } catch (x) {}
        } else {
            docForm.fields = [];
        }
        docForm.data = {};
        renderNewDocumentForm(container);
    });
    document.getElementById("docTitleInput").addEventListener("input", (e) => { docForm.title = e.target.value; });
    document.getElementById("docPrioritySel").addEventListener("change", (e) => { docForm.priority = e.target.value; });
    document.getElementById("btnDocSubmit").addEventListener("click", () => saveDocument("submit"));
    document.getElementById("btnDocDraft").addEventListener("click", () => saveDocument("draft"));
    document.getElementById("btnDocReset").addEventListener("click", () => { docForm = null; renderNewDocumentForm(container); });
}

function renderDocDynamicFields(templates) {
    const dict = translations[currentLang] || translations.ko;
    const wrap = document.getElementById("docDynamicFields");
    if (!wrap) return;
    if (!docForm.fields.length) {
        wrap.innerHTML = `<div class="text-xs text-slate-500 text-center py-2">${dict.doc_free_form || "자유 양식입니다. 템플릿을 선택하면 항목이 표시됩니다."}</div>`;
        return;
    }
    wrap.innerHTML = docForm.fields.map((f, i) => {
        const label = escapeHtml(localizedFieldLabel(f.label));
        const val = docForm.data[f.key] != null ? docForm.data[f.key] : "";
        let input;
        if (f.type === "textarea") {
            input = `<textarea data-doc-field="${escapeHtml(f.key)}" rows="3" class="w-full bg-white/5 border border-cardBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none">${escapeHtml(val)}</textarea>`;
        } else if (f.type === "select") {
            const opts = (f.options || []).map(o => `<option value="${escapeHtml(o)}" ${val===o?"selected":""}>${escapeHtml(o)}</option>`).join("");
            input = `<select data-doc-field="${escapeHtml(f.key)}" class="w-full bg-slate-900 border border-cardBorder rounded-lg px-3 py-2 text-sm text-white cursor-pointer focus:outline-none focus:border-indigo-500"><option value="">-</option>${opts}</select>`;
        } else if (f.type === "date") {
            input = `<input type="date" data-doc-field="${escapeHtml(f.key)}" value="${escapeHtml(val)}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">`;
        } else if (f.type === "number") {
            input = `<input type="number" data-doc-field="${escapeHtml(f.key)}" value="${escapeHtml(val)}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">`;
        } else {
            input = `<input type="text" data-doc-field="${escapeHtml(f.key)}" value="${escapeHtml(val)}" class="w-full bg-white/5 border border-cardBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">`;
        }
        return `<div class="${i>0?'mt-3':''}"><label class="block text-xs font-semibold text-slate-400 mb-1.5">${label}</label>${input}</div>`;
    }).join("");

    wrap.querySelectorAll("[data-doc-field]").forEach(el => {
        const key = el.getAttribute("data-doc-field");
        const handler = () => { docForm.data[key] = el.value; };
        el.addEventListener("input", handler);
        el.addEventListener("change", handler);
    });
}

// ── 문서 폼 결재선 피커 (docForm 상태 기반) ──
function renderDocLinePickerHtml(kind, title) {
    return `
        <div class="bg-white/5 border border-cardBorder rounded-xl p-3">
            <h6 class="text-xs font-bold text-white mb-2">${escapeHtml(title)}</h6>
            <div class="flex gap-1.5 mb-2">
                <select data-docline-select="${kind}" class="flex-1 bg-slate-900 border border-cardBorder rounded-lg px-2 py-1.5 text-[11px] text-white cursor-pointer focus:outline-none"></select>
                <button data-docline-add="${kind}" class="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] rounded-lg font-semibold transition">+</button>
            </div>
            <div data-docline-list="${kind}" class="space-y-1.5"></div>
        </div>`;
}
function renderAllDocLinePickers() { ["approval", "agreement", "cc"].forEach(renderDocLinePicker); }

function renderDocLinePicker(kind) {
    const dict = translations[currentLang] || translations.ko;
    const list = docForm[kind] || [];
    const sel = document.querySelector(`[data-docline-select="${kind}"]`);
    const listWrap = document.querySelector(`[data-docline-list="${kind}"]`);
    if (!sel || !listWrap) return;

    const chosen = new Set(list.map(x => x.id));
    const opts = participantsCache.filter(p => !chosen.has(p.id)).map(p =>
        `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)} (${p.type === "admin" ? (dict.p_admin || "관리자") : (dict.p_employee || "직원")})</option>`).join("");
    sel.innerHTML = opts || `<option value="">${dict.tpl_no_participants || "추가 가능한 대상 없음"}</option>`;

    const ordered = kind === "approval";
    listWrap.innerHTML = list.length ? list.map((item, i) => {
        const p = participantsCache.find(x => x.id === item.id);
        const name = p ? p.name : (item.name || item.id);
        const orderBadge = ordered ? `<span class="text-[10px] font-bold text-indigo-300 mr-1">${i + 1}.</span>` : "";
        const moveBtns = ordered ? `
            <button data-docline-up="${kind}:${i}" class="p-0.5 hover:bg-white/10 rounded text-slate-400"><i data-lucide="chevron-up" class="w-3 h-3"></i></button>
            <button data-docline-down="${kind}:${i}" class="p-0.5 hover:bg-white/10 rounded text-slate-400"><i data-lucide="chevron-down" class="w-3 h-3"></i></button>` : "";
        return `
            <div class="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1.5">
                <span class="text-[11px] text-slate-200">${orderBadge}${escapeHtml(name)}</span>
                <div class="flex items-center gap-0.5">${moveBtns}
                    <button data-docline-del="${kind}:${i}" class="p-0.5 hover:bg-rose-500/20 rounded text-rose-400"><i data-lucide="x" class="w-3 h-3"></i></button>
                </div>
            </div>`;
    }).join("") : `<div class="text-[10px] text-slate-500 text-center py-1">${dict.tpl_line_empty || "지정 안 함"}</div>`;

    lucide.createIcons();

    const addBtn = document.querySelector(`[data-docline-add="${kind}"]`);
    if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = "1";
        addBtn.addEventListener("click", () => {
            const selEl = document.querySelector(`[data-docline-select="${kind}"]`);
            const val = selEl?.value;
            if (!val) return;
            const p = participantsCache.find(x => x.id === val);
            docForm[kind].push({ id: val, type: p ? p.type : "admin", name: p ? p.name : val });
            renderDocLinePicker(kind);
        });
    }
    listWrap.querySelectorAll("[data-docline-del]").forEach(btn => {
        btn.addEventListener("click", () => { const [k, idx] = btn.getAttribute("data-docline-del").split(":"); docForm[k].splice(parseInt(idx, 10), 1); renderDocLinePicker(k); });
    });
    listWrap.querySelectorAll("[data-docline-up]").forEach(btn => {
        btn.addEventListener("click", () => { const [k, s] = btn.getAttribute("data-docline-up").split(":"); const i = parseInt(s, 10); if (i > 0) { [docForm[k][i-1], docForm[k][i]] = [docForm[k][i], docForm[k][i-1]]; renderDocLinePicker(k); } });
    });
    listWrap.querySelectorAll("[data-docline-down]").forEach(btn => {
        btn.addEventListener("click", () => { const [k, s] = btn.getAttribute("data-docline-down").split(":"); const i = parseInt(s, 10); if (i < docForm[k].length - 1) { [docForm[k][i+1], docForm[k][i]] = [docForm[k][i], docForm[k][i+1]]; renderDocLinePicker(k); } });
    });
}

function loadDraftIntoForm(doc) {
    let fields = [], data = {}, approval = [], agreement = [], cc = [];
    try { fields = JSON.parse(doc.body_schema || "[]"); } catch (e) {}
    try { data = JSON.parse(doc.body_data || "{}"); } catch (e) {}
    docForm = {
        template_id: doc.template_id || "", title: doc.title, category: doc.category,
        priority: doc.priority || "normal", fields, data, approval, agreement, cc, draftId: doc.id,
        pendingFiles: [], existingAttachments: []
    };
    // 초안의 기존 결재선 + 첨부 로드
    authenticatedFetch(`${API_BASE_URL}/approval/documents/${doc.id}`).then(r => r.json()).then(d => {
        (d.lines || []).forEach(l => {
            const entry = { id: l.approver_id, type: l.approver_type, name: l.approver_name };
            if (l.line_type === "approval") docForm.approval.push(entry);
            else if (l.line_type === "agreement") docForm.agreement.push(entry);
            else if (l.line_type === "cc") docForm.cc.push(entry);
        });
        docForm.existingAttachments = d.attachments || [];
        const container = document.getElementById("approvalUserContent");
        if (container) renderNewDocumentForm(container);
    });
}

let docActionInFlight = false;

async function saveDocument(action) {
    const dict = translations[currentLang] || translations.ko;
    if (docActionInFlight) return;
    if (!docForm.title || !docForm.title.trim()) { alert(dict.doc_err_title || "제목을 입력해 주세요."); return; }
    if (action === "submit" && docForm.approval.length === 0 && docForm.agreement.length === 0) {
        alert(dict.doc_err_line || "제출하려면 결재선 또는 합의선을 1명 이상 지정해야 합니다."); return;
    }

    const payload = {
        template_id: docForm.template_id || null,
        title: docForm.title.trim(),
        category: docForm.category || "general",
        priority: docForm.priority || "normal",
        body_schema: docForm.fields,
        body_data: docForm.data,
        approval_line: docForm.approval,
        agreement_line: docForm.agreement,
        cc_line: docForm.cc,
        action
    };

    const pendingFiles = docForm.pendingFiles || [];

    docActionInFlight = true;
    const btnS = document.getElementById("btnDocSubmit"), btnD = document.getElementById("btnDocDraft");
    if (btnS) btnS.disabled = true; if (btnD) btnD.disabled = true;
    try {
        let resp;
        let docId = docForm.draftId;
        if (docForm.draftId) {
            // 기존 초안 수정 (첨부 업로드 후 제출)
            resp = await authenticatedFetch(`${API_BASE_URL}/approval/documents/${docForm.draftId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
            });
            if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
        } else {
            // 신규 생성 시 첨부가 있으면 우선 draft 로 만들어 id 확보 후 업로드, 이후 제출
            const createPayload = pendingFiles.length > 0 ? { ...payload, action: "draft" } : payload;
            resp = await authenticatedFetch(`${API_BASE_URL}/approval/documents`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createPayload)
            });
            if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
            const created = await resp.json();
            docId = created.id;
        }

        // 첨부파일 업로드
        for (const f of pendingFiles) {
            const fd = new FormData();
            fd.append("file", f);
            const upResp = await authenticatedFetch(`${API_BASE_URL}/approval/documents/${docId}/attachments`, { method: "POST", body: fd });
            if (!upResp.ok) {
                const e = await upResp.json().catch(() => ({}));
                alert((dict.doc_file_fail || "첨부 실패: ") + (f.name || "") + " — " + (e.error || ""));
            }
        }

        // 제출 처리 (첨부 업로드 후)
        if (action === "submit") {
            const subResp = await authenticatedFetch(`${API_BASE_URL}/approval/documents/${docId}/submit`, { method: "POST" });
            if (!subResp.ok) { const e = await subResp.json().catch(() => ({})); throw new Error(e.error || "제출 실패"); }
        }

        alert(action === "submit" ? (dict.doc_submitted || "결재 문서가 제출되었습니다.") : (dict.doc_drafted || "임시저장되었습니다."));
        docForm = null;
        approvalUserSubtab = action === "submit" ? "approval-user-mine" : "approval-user-mine";
        // pill 활성 표시 갱신
        const wrap = document.getElementById("approvalUserPills");
        if (wrap) {
            wrap.querySelectorAll("button[data-subtab]").forEach(b => b.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-400 hover:text-white transition");
            const active = wrap.querySelector('button[data-subtab="approval-user-mine"]');
            if (active) active.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white transition";
        }
        renderApprovalUserContent();
        refreshPendingBadge();
    } catch (err) {
        alert((dict.doc_save_failed || "저장 실패: ") + err.message);
        if (btnS) btnS.disabled = false; if (btnD) btnD.disabled = false;
    } finally {
        docActionInFlight = false;
    }
}

// ── 대기 건수 배지 ──
async function refreshPendingBadge() {
    const badge = document.getElementById("approvalPendingBadge");
    if (!badge) return;
    if (!localStorage.getItem("pguard_token")) { badge.classList.add("hidden"); return; }
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/approval/stats`);
        if (!resp.ok) { badge.classList.add("hidden"); return; }
        const s = await resp.json();
        const n = s.pending || 0;
        if (n > 0) { badge.textContent = n; badge.classList.remove("hidden"); }
        else badge.classList.add("hidden");
    } catch (e) { badge.classList.add("hidden"); }
}

// 문서 상세 모달: 배경 클릭 / ESC 로 닫기
(function bindApprovalModalDismiss() {
    const modal = document.getElementById("approvalDetailModal");
    if (modal) {
        modal.addEventListener("click", (e) => { if (e.target === modal) closeDocumentDetail(); });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const dm = document.getElementById("approvalDetailModal");
            if (dm && !dm.classList.contains("hidden")) closeDocumentDetail();
        }
    });
})();

// ── 첨부파일 공통 헬퍼 ──
function formatFileSize(bytes) {
    if (bytes == null) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
}
function fileIconFor(mime) {
    if (!mime) return "file";
    if (mime.startsWith("image/")) return "image";
    if (mime === "application/pdf") return "file-text";
    if (mime.includes("sheet") || mime.includes("excel") || mime === "text/csv") return "table";
    if (mime.includes("word") || mime === "text/plain") return "file-text";
    if (mime.includes("zip")) return "file-archive";
    return "file";
}

async function downloadAttachment(attId, filename) {
    const dict = translations[currentLang] || translations.ko;
    try {
        const resp = await authenticatedFetch(`${API_BASE_URL}/approval/attachments/${attId}/download`);
        if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "실패"); }
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename || "download";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
        alert((dict.doc_download_fail || "다운로드 실패: ") + err.message);
    }
}

async function deleteAttachmentApi(attId) {
    const resp = await authenticatedFetch(`${API_BASE_URL}/approval/attachments/${attId}`, { method: "DELETE" });
    if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "삭제 실패"); }
}

// ── 새 결재 폼: 첨부 목록 렌더 (미업로드 pending + 기존 저장분) ──
function renderDocFormAttachments() {
    const dict = translations[currentLang] || translations.ko;
    const wrap = document.getElementById("docAttachList");
    if (!wrap) return;
    const pending = docForm.pendingFiles || [];
    const existing = docForm.existingAttachments || [];

    if (!pending.length && !existing.length) {
        wrap.innerHTML = `<div class="text-[11px] text-slate-500 text-center py-1">${dict.doc_no_files || "첨부된 파일이 없습니다."}</div>`;
        return;
    }
    const existingRows = existing.map(a => `
        <div class="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <div class="flex items-center gap-2 min-w-0">
                <i data-lucide="${fileIconFor(a.mime_type)}" class="w-3.5 h-3.5 text-indigo-400 shrink-0"></i>
                <span class="text-[11px] text-slate-200 truncate">${escapeHtml(a.original_name)}</span>
                <span class="text-[10px] text-slate-500 shrink-0">${formatFileSize(a.file_size)}</span>
            </div>
            <button data-att-del="${a.id}" class="p-1 hover:bg-rose-500/20 rounded text-rose-400 shrink-0"><i data-lucide="x" class="w-3 h-3"></i></button>
        </div>`).join("");
    const pendingRows = pending.map((f, i) => `
        <div class="flex items-center justify-between bg-indigo-600/10 rounded-lg px-3 py-2">
            <div class="flex items-center gap-2 min-w-0">
                <i data-lucide="upload" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
                <span class="text-[11px] text-slate-200 truncate">${escapeHtml(f.name)}</span>
                <span class="text-[10px] text-slate-500 shrink-0">${formatFileSize(f.size)} · ${dict.doc_file_pending || "저장 시 업로드"}</span>
            </div>
            <button data-att-pending-del="${i}" class="p-1 hover:bg-rose-500/20 rounded text-rose-400 shrink-0"><i data-lucide="x" class="w-3 h-3"></i></button>
        </div>`).join("");

    wrap.innerHTML = existingRows + pendingRows;
    lucide.createIcons();

    wrap.querySelectorAll("[data-att-pending-del]").forEach(btn => {
        btn.addEventListener("click", () => {
            docForm.pendingFiles.splice(parseInt(btn.getAttribute("data-att-pending-del"), 10), 1);
            renderDocFormAttachments();
        });
    });
    wrap.querySelectorAll("[data-att-del]").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm(dict.doc_confirm_del_file || "이 첨부파일을 삭제하시겠습니까?")) return;
            try {
                await deleteAttachmentApi(btn.getAttribute("data-att-del"));
                docForm.existingAttachments = docForm.existingAttachments.filter(a => String(a.id) !== btn.getAttribute("data-att-del"));
                renderDocFormAttachments();
            } catch (err) { alert(err.message); }
        });
    });
}

// ==================================================================
// 전자결재 Phase 6: 번역 설정 UI + 상세 병기 표시
// ==================================================================
async function renderApprovalSettings(container) {
    const dict = translations[currentLang] || translations.ko;
    container.className = "";
    container.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">${dict.loading_text || "불러오는 중..."}</div>`;

    let s = {};
    try {
        const r = await authenticatedFetch(`${API_BASE_URL}/approval/settings`);
        if (r.ok) s = await r.json();
    } catch (e) {}

    const langChecks = ["en", "th", "lo", "ko"].map(l => {
        const checked = (s.translate_target_languages || "en,th,lo").split(",").map(x => x.trim()).includes(l);
        return `<label class="flex items-center gap-1.5 text-xs text-slate-300"><input type="checkbox" data-tl-lang="${l}" ${checked ? "checked" : ""} class="accent-indigo-600"> ${l.toUpperCase()}</label>`;
    }).join("");

    container.innerHTML = `
        <div class="max-w-xl space-y-5">
            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.set_lt_url || "LibreTranslate 서버 URL"}</label>
                <div class="flex gap-2">
                    <input type="text" id="setLtUrl" value="${escapeHtml(s.libretranslate_url || "")}" placeholder="http://localhost:5000" class="flex-1 bg-white/5 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500">
                    <button id="btnTestLt" class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-cardBorder text-slate-200 text-xs rounded-xl font-semibold transition whitespace-nowrap">${dict.set_test || "연결 테스트"}</button>
                </div>
                <div id="ltTestResult" class="text-[11px] mt-1.5"></div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.set_lt_key || "API 키 (선택)"}</label>
                <input type="text" id="setLtKey" value="${escapeHtml(s.libretranslate_api_key || "")}" placeholder="(선택)" class="w-full bg-white/5 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.set_targets || "번역 대상 언어"}</label>
                <div class="flex gap-4 bg-white/5 border border-cardBorder rounded-xl px-4 py-3">${langChecks}</div>
            </div>

            <div class="flex items-center justify-between bg-white/5 border border-cardBorder rounded-xl px-4 py-3">
                <div>
                    <div class="text-sm text-white font-medium">${dict.set_auto || "제출 시 자동 번역"}</div>
                    <div class="text-[11px] text-slate-500">${dict.set_auto_desc || "문서 제출과 동시에 자동으로 번역합니다."}</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="setAutoTranslate" ${s.auto_translate_enabled === "true" ? "checked" : ""} class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-600 peer-checked:bg-indigo-600 rounded-full peer transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition peer-checked:after:translate-x-5"></div>
                </label>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-400 mb-1.5">${dict.set_prefix || "문서번호 접두사"}</label>
                <input type="text" id="setPrefix" value="${escapeHtml(s.doc_number_prefix || "APPR")}" class="w-full bg-white/5 border border-cardBorder rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500">
            </div>

            <button id="btnSaveApprovalSettings" class="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg transition">
                <i data-lucide="save" class="w-4 h-4"></i><span>${dict.btn_save || "저장"}</span>
            </button>
        </div>`;

    lucide.createIcons();

    document.getElementById("btnTestLt").addEventListener("click", async () => {
        const url = document.getElementById("setLtUrl").value.trim();
        const resEl = document.getElementById("ltTestResult");
        resEl.className = "text-[11px] mt-1.5 text-slate-400";
        resEl.textContent = dict.set_testing || "테스트 중...";
        try {
            const r = await authenticatedFetch(`${API_BASE_URL}/approval/translate/test`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url })
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || "실패");
            resEl.className = "text-[11px] mt-1.5 text-emerald-400";
            resEl.textContent = `✓ ${dict.set_ok || "연결 성공"} — ${(j.languages || []).join(", ")}`;
        } catch (err) {
            resEl.className = "text-[11px] mt-1.5 text-rose-400";
            resEl.textContent = "✗ " + err.message;
        }
    });

    document.getElementById("btnSaveApprovalSettings").addEventListener("click", async () => {
        const targets = Array.from(document.querySelectorAll("[data-tl-lang]:checked")).map(c => c.getAttribute("data-tl-lang")).join(",");
        const payload = {
            libretranslate_url: document.getElementById("setLtUrl").value.trim(),
            libretranslate_api_key: document.getElementById("setLtKey").value.trim(),
            translate_target_languages: targets,
            auto_translate_enabled: document.getElementById("setAutoTranslate").checked ? "true" : "false",
            doc_number_prefix: document.getElementById("setPrefix").value.trim() || "APPR"
        };
        try {
            const r = await authenticatedFetch(`${API_BASE_URL}/approval/settings`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
            });
            if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "실패"); }
            alert(dict.set_saved || "결재 설정이 저장되었습니다.");
        } catch (err) {
            alert((dict.set_save_failed || "설정 저장 실패: ") + err.message);
        }
    });
}

// 상세 모달: 번역 병기 표시용 언어 선택 상태
let detailTransLang = null;

// ==================================================================
// 조직도 관리 (org_units 트리 + 직원 배정)
// ==================================================================
let orgUnitsCache = [];

async function fetchOrgChartTab() {
    const dict = translations[currentLang] || translations.ko;
    const container = document.getElementById("orgChartContent");
    if (!container) return;
    container.className = "";
    container.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">${dict.loading_text || "불러오는 중..."}</div>`;

    // 최상위 추가 버튼 (1회 바인딩)
    const addRootBtn = document.getElementById("btnAddRootUnit");
    if (addRootBtn && !addRootBtn.dataset.bound) {
        addRootBtn.dataset.bound = "1";
        addRootBtn.addEventListener("click", () => openOrgUnitModal("create", { parent_id: "" }));
    }

    try {
        const r = await authenticatedFetch(`${API_BASE_URL}/admin/org-units`);
        if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "실패"); }
        orgUnitsCache = await r.json();
    } catch (err) {
        container.innerHTML = `<div class="text-center py-8 text-rose-400 text-sm">${escapeHtml(err.message)}</div>`;
        return;
    }
    renderOrgTree(container);
}

function orgChildrenOf(parentId) {
    return orgUnitsCache
        .filter(u => (u.parent_id || null) === (parentId || null))
        .sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
}

function renderOrgTree(container) {
    const dict = translations[currentLang] || translations.ko;
    const companyLabel = localStorage.getItem("pguard_company_code") === "auton"
        ? "AUTON" : (localStorage.getItem("pguard_company_code") || "회사");

    const roots = orgChildrenOf(null);
    const treeHtml = roots.length
        ? roots.map(u => renderOrgNode(u, 0)).join("")
        : `<div class="text-xs text-slate-500 py-4 text-center">${dict.org_empty || "조직이 없습니다. '최상위 조직 추가'로 시작하세요."}</div>`;

    container.className = "";
    container.innerHTML = `
        <div class="flex items-center gap-2 mb-3 px-2">
            <i data-lucide="building-2" class="w-4 h-4 text-indigo-400"></i>
            <span class="text-sm font-bold text-white">${escapeHtml(companyLabel)}</span>
            <span class="text-[10px] text-slate-500">(${dict.org_company_root || "회사 최상위"})</span>
        </div>
        <div class="space-y-1">${treeHtml}</div>`;

    lucide.createIcons();
    bindOrgNodeActions(container);
}

function renderOrgNode(unit, depth) {
    const dict = translations[currentLang] || translations.ko;
    const children = orgChildrenOf(unit.id);
    const isGroup = unit.unit_type === "group";
    const icon = isGroup ? "folder" : "users";
    const typeBadge = isGroup
        ? `<span class="px-1.5 py-0.5 bg-amber-600/20 text-amber-300 text-[9px] rounded">${dict.org_type_group_short || "그룹"}</span>`
        : `<span class="px-1.5 py-0.5 bg-indigo-600/20 text-indigo-300 text-[9px] rounded">${dict.org_type_team_short || "팀"}</span>`;
    const empBadge = unit.employee_count > 0
        ? `<span class="px-1.5 py-0.5 bg-white/10 text-slate-300 text-[9px] rounded">${unit.employee_count}${dict.org_emp_unit || "명"}</span>` : "";

    const row = `
        <div class="flex items-center justify-between rounded-lg hover:bg-white/5 px-2 py-2 group" style="margin-left:${depth * 22}px">
            <div class="flex items-center gap-2 min-w-0">
                ${depth > 0 ? `<span class="text-slate-600">└</span>` : ""}
                <i data-lucide="${icon}" class="w-4 h-4 ${isGroup ? "text-amber-400" : "text-indigo-400"} shrink-0"></i>
                <span class="text-sm text-white truncate">${escapeHtml(unit.name)}</span>
                ${typeBadge} ${empBadge}
            </div>
            <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                <button data-org-add="${unit.id}" title="${dict.org_add_child || "하위 추가"}" class="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-emerald-400"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button>
                <button data-org-edit="${unit.id}" title="${dict.btn_edit || "수정"}" class="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
                <button data-org-del="${unit.id}" title="${dict.btn_delete || "삭제"}" class="p-1.5 hover:bg-rose-500/20 rounded text-slate-400 hover:text-rose-400"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </div>
        </div>`;
    const childHtml = children.map(c => renderOrgNode(c, depth + 1)).join("");
    return row + childHtml;
}

function bindOrgNodeActions(container) {
    const dict = translations[currentLang] || translations.ko;
    container.querySelectorAll("[data-org-add]").forEach(btn => {
        btn.addEventListener("click", () => openOrgUnitModal("create", { parent_id: btn.getAttribute("data-org-add") }));
    });
    container.querySelectorAll("[data-org-edit]").forEach(btn => {
        btn.addEventListener("click", () => {
            const u = orgUnitsCache.find(x => String(x.id) === btn.getAttribute("data-org-edit"));
            if (u) openOrgUnitModal("edit", u);
        });
    });
    container.querySelectorAll("[data-org-del]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const u = orgUnitsCache.find(x => String(x.id) === btn.getAttribute("data-org-del"));
            if (!u) return;
            if (!confirm((dict.org_confirm_delete || "이 조직을 삭제하시겠습니까? 배정된 직원은 미배정 처리됩니다.") + `\n[${u.name}]`)) return;
            try {
                const r = await authenticatedFetch(`${API_BASE_URL}/admin/org-units/${u.id}`, { method: "DELETE" });
                if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "실패"); }
                fetchOrgChartTab();
            } catch (err) { alert((dict.org_delete_failed || "조직 삭제 실패: ") + err.message); }
        });
    });
}

// 상위 조직 선택 옵션 (자기 자신/후손 제외)
function orgParentOptions(selectedParentId, excludeId) {
    const dict = translations[currentLang] || translations.ko;
    const excluded = new Set();
    if (excludeId != null) {
        const collect = (pid) => { excluded.add(pid); orgChildrenOf(pid).forEach(c => collect(c.id)); };
        collect(excludeId);
    }
    let opts = `<option value="">${dict.org_root_option || "(최상위 - 회사 직속)"}</option>`;
    const walk = (parentId, depth) => {
        orgChildrenOf(parentId).forEach(u => {
            if (!excluded.has(u.id)) {
                const indent = "  ".repeat(depth);
                opts += `<option value="${u.id}" ${String(selectedParentId) === String(u.id) ? "selected" : ""}>${indent}${escapeHtml(u.name)}</option>`;
            }
            walk(u.id, depth + 1);
        });
    };
    walk(null, 0);
    return opts;
}

function openOrgUnitModal(mode, data) {
    const dict = translations[currentLang] || translations.ko;
    const modal = document.getElementById("orgUnitModal");
    if (!modal) return;
    const nameEl = document.getElementById("orgUnitName");
    const typeEl = document.getElementById("orgUnitType");
    const parentEl = document.getElementById("orgUnitParent");
    const titleEl = document.getElementById("orgUnitTitle");
    const errEl = document.getElementById("orgUnitError");
    const saveBtn = document.getElementById("orgUnitSave");
    const closeBtn = document.getElementById("orgUnitClose");
    const cancelBtn = document.getElementById("orgUnitCancel");

    const isEdit = mode === "edit";
    titleEl.textContent = isEdit ? (dict.org_edit_title || "조직 수정") : (dict.org_add_title || "조직 추가");
    nameEl.value = isEdit ? (data.name || "") : "";
    typeEl.value = isEdit ? (data.unit_type || "team") : "team";
    parentEl.innerHTML = orgParentOptions(isEdit ? data.parent_id : (data.parent_id || ""), isEdit ? data.id : null);
    errEl.classList.add("hidden");
    modal.classList.remove("hidden");
    setTimeout(() => nameEl.focus(), 50);

    const close = () => {
        modal.classList.add("hidden");
        saveBtn.onclick = closeBtn.onclick = cancelBtn.onclick = modal.onclick = nameEl.onkeydown = null;
    };
    const showErr = (m) => { errEl.textContent = m; errEl.classList.remove("hidden"); };

    const save = async () => {
        const name = nameEl.value.trim();
        if (!name) return showErr(dict.org_err_name || "조직 이름을 입력해 주세요.");
        const payload = { name, unit_type: typeEl.value, parent_id: parentEl.value || "" };
        saveBtn.disabled = true;
        try {
            let r;
            if (isEdit) {
                r = await authenticatedFetch(`${API_BASE_URL}/admin/org-units/${data.id}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
                });
            } else {
                r = await authenticatedFetch(`${API_BASE_URL}/admin/org-units`, {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
                });
            }
            if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "실패"); }
            close();
            fetchOrgChartTab();
        } catch (err) {
            saveBtn.disabled = false;
            showErr((isEdit ? (dict.org_update_failed || "조직 수정 실패: ") : (dict.org_add_failed || "조직 추가 실패: ")) + err.message);
        }
    };

    saveBtn.disabled = false;
    saveBtn.onclick = save;
    closeBtn.onclick = cancelBtn.onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    nameEl.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); save(); } };
}

// 직원 모달용 조직 옵션 로더 (캐시 없으면 조회)
async function ensureOrgUnitsLoaded() {
    if (orgUnitsCache.length) return orgUnitsCache;
    try {
        const r = await authenticatedFetch(`${API_BASE_URL}/admin/org-units`);
        if (r.ok) orgUnitsCache = await r.json();
    } catch (e) {}
    return orgUnitsCache;
}
function orgUnitSelectOptions(selectedId) {
    const dict = translations[currentLang] || translations.ko;
    let opts = `<option value="">${dict.org_unassigned || "(미배정)"}</option>`;
    const walk = (parentId, depth) => {
        orgChildrenOf(parentId).forEach(u => {
            const indent = "  ".repeat(depth);
            opts += `<option value="${u.id}" ${String(selectedId) === String(u.id) ? "selected" : ""}>${indent}${escapeHtml(u.name)}</option>`;
            walk(u.id, depth + 1);
        });
    };
    walk(null, 0);
    return opts;
}
