import os
import sys
import time
import re
import platform
import logging
from datetime import datetime
import requests
import psutil
import threading

# 로깅 설정 (PyInstaller EXE 환경 대응)
if getattr(sys, 'frozen', False):
    log_dir = os.path.dirname(sys.executable)
else:
    log_dir = os.path.dirname(os.path.abspath(__file__))
log_file_path = os.path.join(log_dir, "agent.log")

log_handlers = [logging.FileHandler(log_file_path, encoding="utf-8")]
if sys.stdout is not None:
    log_handlers.append(logging.StreamHandler(sys.stdout))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=log_handlers
)

# OS 판별 및 라이브러리 로드
CURRENT_OS = platform.system()
logging.info(f"감지된 운영체제: {CURRENT_OS}")

if CURRENT_OS == "Windows":
    try:
        import win32gui
        import win32process
        import win32con
    except ImportError:
        logging.error("Windows 라이브러리(pywin32)가 설치되지 않았습니다. 'pip install pywin32'를 실행하세요.")
elif CURRENT_OS == "Darwin": # macOS
    try:
        from AppKit import NSWorkspace
        import Quartz
    except ImportError:
        logging.error("macOS 라이브러리(pyobjc)가 설치되지 않았습니다. 'pip install pyobjc'를 실행하세요.")

# 설정값
LOOP_INTERVAL = 60              # 60초(1분)마다 마우스/키보드 움직임 및 활성 창 감지 (스캔 주기, 서버에서 동적으로 갱신됨)
SEND_INTERVAL = 600             # 10분(600초) 마다 백엔드로 데이터 일괄 전송 (서버에서 동적으로 갱신됨)
IDLE_THRESHOLD = 600            # 자리비움 판정 기준 (서버에서 동적으로 갱신됨)
SETTINGS_POLL_INTERVAL = 300   # 5분마다 서버 설정 동기화
COMMAND_POLL_INTERVAL = 30     # 30초마다 관리자 명령 확인
RETRY_BASE_BACKOFF = 15        # 전송 실패 시 초기 재시도 대기(초)
RETRY_MAX_BACKOFF = 300        # 전송 실패 시 최대 재시도 대기(초) (지수 백오프 상한)
MAX_BUFFER_ITEMS = 500         # 전송 대기 버퍼 최대 항목 수 (초과 시 가장 오래된 항목 폐기)
DEFAULT_SERVER = "http://localhost:3000"
BACKEND_URL = f"{DEFAULT_SERVER}/api/activity"

# 설정 파일 경로 (PyInstaller EXE 및 일반 .py 실행 모두 대응)
# - EXE 빌드 시: sys.executable 기준 (dist/ 폴더, EXE 옆)
# - .py 직접 실행 시: __file__ 기준 (agent/ 폴더)
if getattr(sys, 'frozen', False):
    CONFIG_FILE = os.path.join(os.path.dirname(sys.executable), "config.json")
else:
    CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")

# 설정 변수들 (load_config()를 통해 config.json에서 주입받음)
COMPANY_CODE = ""
EMPLOYEE_ID = ""
EMPLOYEE_NAME = ""
API_TOKEN = ""
SERVER_URL = DEFAULT_SERVER
AGENT_LANG = "ko"

# 다국어 번역 사전 (한국어, 영어, 태국어, 라오어)
AGENT_TRANSLATIONS = {
    "ko": {
        "title": "PGuard 에이전트 연동 설정",
        "header_title": "에이전트 연동 설정",
        "lbl_server": "📡  서버 주소 (Server URL) *",
        "lbl_company": "🏢  회사 코드 (Company Code) *",
        "lbl_empid": "👤  사원 번호 (Employee ID) *",
        "lbl_empname": "✏  사원 이름 (Employee Name) *",
        "lbl_token": "🔑  연동 토큰 (Agent Token) *",
        "btn_verify": "검증",
        "btn_verify_ok": "✔ 인증 완료",
        "btn_verify_fail": "✖ 인증 실패",
        "btn_verify_offline": "⚠ 오프라인",
        "status_server_empty": "⚠  서버 주소를 먼저 입력해 주세요.",
        "status_code_empty": "⚠  회사 코드를 입력해 주세요.",
        "status_verifying": "⏳  서버에서 검증 중...",
        "status_verified": "✅  인증됨: {cname}",
        "status_invalid": "❌  등록되지 않은 회사 코드입니다.",
        "status_server_err": "⚠  서버 오류 ({code})",
        "status_offline": "⚠  서버 연결 실패 - 오프라인 저장 가능",
        "btn_submit": "  설정 저장 및 에이전트 시작  ",
        "footer_info": "설정은 config.json에 안전하게 저장됩니다.",
        "err_title": "입력 오류",
        "err_empty": "모든 필수 항목을 빠짐없이 입력해 주세요.",
        "msg_not_verified_title": "검증 안 됨",
        "msg_not_verified": "회사 코드 '{code}' 이(가) 아직 서버에서 검증되지 않았습니다.\n[검증] 버튼을 눌러 먼저 확인하는 것을 권장합니다.\n\n검증 없이 저장하고 계속하시겠습니까?",
        "msg_offline_title": "오프라인 저장",
        "msg_offline": "서버에 연결할 수 없습니다. 오프라인 상태로 설정을 저장하시겠습니까?\n(에이전트 가동 후 서버 연결 시 자동으로 동기화됩니다.)",
        "msg_confirm_title": "연동 확인",
        "msg_confirm": "✅  회사: {cname}\n👤  사원번호: {empid}  |  이름: {empname}\n📡  서버: {server}\n🔑  토큰: {token}\n\n위 정보로 에이전트를 연동하시겠습니까?",
        "msg_done_title": "설정 완료",
        "msg_done": "에이전트 연동 설정이 성공적으로 저장되었습니다.\n모니터링을 시작합니다.",
        "msg_save_err_title": "저장 오류",
        "msg_save_err": "설정 파일 저장 중 오류: {ex}",
        "msg_close_title": "종료",
        "msg_close": "설정이 완료되지 않았습니다. PGuard 에이전트를 종료하시겠습니까?",
        "mismatch_title": "회사 코드 불일치",
        "mismatch_msg": "입력하신 회사 코드가 서버 설정과 일치하지 않아 데이터 전송이 거부되었습니다.\n연동 설정을 다시 진행해 주세요.",
        "mismatch_log": "잘못된 회사 코드로 인해 로컬 config.json을 파기했습니다.",
        "lang_select": "🌐  언어 선택 (Language) :",
        "placeholder_server": "예) http://192.168.1.100:3000"
    },
    "en": {
        "title": "PGuard Agent Connection Setup",
        "header_title": "Agent Connection Setup",
        "lbl_server": "📡  Server URL *",
        "lbl_company": "🏢  Company Code *",
        "lbl_empid": "👤  Employee ID *",
        "lbl_empname": "✏  Employee Name *",
        "lbl_token": "🔑  Agent Token *",
        "btn_verify": "Verify",
        "btn_verify_ok": "✔ Verified",
        "btn_verify_fail": "✖ Failed",
        "btn_verify_offline": "⚠ Offline",
        "status_server_empty": "⚠  Please enter Server URL first.",
        "status_code_empty": "⚠  Please enter Company Code.",
        "status_verifying": "⏳  Verifying with server...",
        "status_verified": "✅  Verified: {cname}",
        "status_invalid": "❌  Unregistered Company Code.",
        "status_server_err": "⚠  Server Error ({code})",
        "status_offline": "⚠  Server offline - Can save for offline use",
        "btn_submit": "  Save Settings & Start Agent  ",
        "footer_info": "Settings are saved securely in config.json.",
        "err_title": "Input Error",
        "err_empty": "Please fill in all required fields.",
        "msg_not_verified_title": "Not Verified",
        "msg_not_verified": "Company Code '{code}' has not been verified yet.\nWe highly recommend clicking [Verify] first.\n\nDo you want to save and proceed anyway?",
        "msg_offline_title": "Offline Save",
        "msg_offline": "Could not connect to the server. Do you want to save settings offline?\n(It will sync automatically once server is connected.)",
        "msg_confirm_title": "Confirm Connection",
        "msg_confirm": "✅  Company: {cname}\n👤  EMP ID: {empid}  |  Name: {empname}\n📡  Server: {server}\n🔑  Token: {token}\n\nDo you want to connect with these settings?",
        "msg_done_title": "Setup Complete",
        "msg_done": "Agent configuration has been successfully saved.\nMonitoring will start now.",
        "msg_save_err_title": "Save Error",
        "msg_save_err": "Failed to save configuration: {ex}",
        "msg_close_title": "Exit",
        "msg_close": "Configuration is not complete. Exit PGuard Agent?",
        "mismatch_title": "Company Code Mismatch",
        "mismatch_msg": "The company code entered does not match the server configuration, and transmission was rejected.\nPlease re-configure the connection.",
        "mismatch_log": "Destroyed local config.json due to company code mismatch.",
        "lang_select": "🌐  Language :",
        "placeholder_server": "ex) http://192.168.1.100:3000"
    },
    "th": {
        "title": "PGuard การตั้งค่าการเชื่อมต่อเอเจนต์",
        "header_title": "การตั้งค่าการเชื่อมต่อเอเจนต์",
        "lbl_server": "📡  ที่อยู่เซิร์ฟเวอร์ (Server URL) *",
        "lbl_company": "🏢  รหัสบริษัท (Company Code) *",
        "lbl_empid": "👤  รหัสพนักงาน (Employee ID) *",
        "lbl_empname": "✏  ชื่อพนักงาน (Employee Name) *",
        "lbl_token": "🔑  โทเคนเอเจนต์ (Agent Token) *",
        "btn_verify": "ตรวจสอบ",
        "btn_verify_ok": "✔ ตรวจสอบแล้ว",
        "btn_verify_fail": "✖ ล้มเหลว",
        "btn_verify_offline": "⚠ ออฟไลน์",
        "status_server_empty": "⚠  กรุณากรอกที่อยู่เซิร์ฟเวอร์ก่อน",
        "status_code_empty": "⚠  กรุณากรอกรหัสบริษัท",
        "status_verifying": "⏳  กำลังตรวจสอบกับเซิร์ฟเวอร์...",
        "status_verified": "✅  รับรองแล้ว: {cname}",
        "status_invalid": "❌  รหัสบริษัทไม่ได้รับการลงทะเบียน",
        "status_server_err": "⚠  เซิร์ฟเวอร์ขัดข้อง ({code})",
        "status_offline": "⚠  เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว - สามารถบันทึกแบบออฟไลน์ได้",
        "btn_submit": "  บันทึกการตั้งค่าและเริ่มเอเจนต์  ",
        "footer_info": "การตั้งค่าจะถูกบันทึกอย่างปลอดภัยใน config.json",
        "err_title": "ข้อผิดพลาดในการกรอกข้อมูล",
        "err_empty": "กรุณากรอกข้อมูลในช่องที่จำเป็นทั้งหมด",
        "msg_not_verified_title": "ยังไม่ได้ตรวจสอบ",
        "msg_not_verified": "รหัสบริษัท '{code}' ยังไม่ได้รับการตรวจสอบจากเซิร์ฟเวอร์\nแนะนำให้กดปุ่ม [ตรวจสอบ] ก่อน\n\nต้องการบันทึกและดำเนินการต่อหรือไม่?",
        "msg_offline_title": "บันทึกแบบออฟไลน์",
        "msg_offline": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ ต้องการบันทึกการตั้งค่าแบบออฟไลน์หรือไม่?\n(จะซิงค์โดยอัตโนมัติเมื่อเชื่อมต่อกับเซิร์ฟเวอร์)",
        "msg_confirm_title": "ยืนยันการเชื่อมต่อ",
        "msg_confirm": "✅  บริษัท: {cname}\n👤  รหัสพนักงาน: {empid}  |  ชื่อ: {empname}\n📡  เซิร์ฟเวอร์: {server}\n🔑  โทเคน: {token}\n\nต้องการเชื่อมต่อด้วยข้อมูลนี้หรือไม่?",
        "msg_done_title": "ตั้งค่าเสร็จสิ้น",
        "msg_done": "บันทึกการตั้งค่าเอเจนต์เรียบร้อยแล้ว\nเริ่มดำเนินการติดตามกิจกรรมขณะนี้",
        "msg_save_err_title": "ข้อผิดพลาดในการบันทึก",
        "msg_save_err": "เกิดข้อผิดพลาดขณะบันทึกไฟล์ตั้งค่า: {ex}",
        "msg_close_title": "ออก",
        "msg_close": "การตั้งค่าไม่เสร็จสิ้น ต้องการออกจาก PGuard เอเจนต์หรือไม่?",
        "mismatch_title": "รหัสบริษัทไม่ตรงกัน",
        "mismatch_msg": "รหัสบริษัทที่กรอกไม่ตรงกับที่ตั้งค่าบนเซิร์ฟเวอร์ การส่งข้อมูลถูกปฏิเสธ\nกรุณาตั้งค่าการเชื่อมต่อใหม่อีกครั้ง",
        "mismatch_log": "ล้างข้อมูลตั้งค่า config.json เนื่องจากรหัสบริษัทไม่ตรงกัน",
        "lang_select": "🌐  ภาษา (Language) :",
        "placeholder_server": "ต.ย.) http://192.168.1.100:3000"
    },
    "lo": {
        "title": "PGuard ການຕັ້ງຄ່າການເຊື່ອມຕໍ່ເອເຈນ",
        "header_title": "ການຕັ້ງຄ່າການເຊື່ອມຕໍ່ເອເຈນ",
        "lbl_server": "📡  ທີ່ຢູ່ເຊີເວີ (Server URL) *",
        "lbl_company": "🏢  ລະຫັດບໍລິສັດ (Company Code) *",
        "lbl_empid": "👤  ລະຫັດພະນັກງານ (Employee ID) *",
        "lbl_empname": "✏  ຊື່ພະນັກງານ (Employee Name) *",
        "lbl_token": "🔑  ໂທເຄັນເອເຈນ (Agent Token) *",
        "btn_verify": "ກວດສອບ",
        "btn_verify_ok": "✔ ກວດສອບແລ້ວ",
        "btn_verify_fail": "✖ ລົ້ມເຫຼວ",
        "btn_verify_offline": "⚠ ອອບລາຍ",
        "status_server_empty": "⚠  ກະລຸນາປ້ອນທີ່ຢູ່ເຊີເວີກ່ອນ",
        "status_code_empty": "⚠  ກະລຸນາປ້ອນລະຫັດບໍລິສັດ",
        "status_verifying": "⏳  ກຳລັງກວດສອບກັບເຊີເວີ...",
        "status_verified": "✅  ຮັບຮອງແລ້ວ: {cname}",
        "status_invalid": "❌  ລະຫັດບໍລິສັດບໍ່ໄດ້ຮັບການລົງທະບຽນ",
        "status_server_err": "⚠  ເຊີເວີຂັດຂ້ອງ ({code})",
        "status_offline": "⚠  ເຊື່ອມຕໍ່ເຊີເວີລົ້ມເຫຼວ - ສາມາດບັນທຶກແບບອອບລາຍໄດ້",
        "btn_submit": "  ບັນທຶກການຕັ້ງຄ່າ ແລະ ເລີ່ມເອເຈນ  ",
        "footer_info": "ການຕັ້ງຄ່າຈະຖືກບັນທຶກຢ່າງປອດໄພໃນ config.json",
        "err_title": "ຂໍ้ຜິດພາດໃນການປ້ອນຂໍ້ມູນ",
        "err_empty": "ກະລຸນາປ້ອນຂໍ້ມູນໃນຊ່ອງທີ່ຈຳເປັນທັງໝົດ",
        "msg_not_verified_title": "ຍັງບໍ່ໄດ້ກວດສອບ",
        "msg_not_verified": "ລະຫັດບໍລິສັດ '{code}' ຍັງບໍ່ທັນໄດ້ຮັບການກວດສອບຈາກເຊີເວີ\nແນະນຳໃຫ້ກົດປຸ່ມ [ກວດສອບ] ກ່ອນ\n\nຕ້ອງການບັນທຶກ ແລະ ດຳເນີນການຕໍ່ຫຼືບໍ່?",
        "msg_offline_title": "慢ຕັ້ງຄ່າແບບອອບລາຍ",
        "msg_offline": "ບໍ່ສາມາດເຊື່ອມຕໍ່ເຊີເວີໄດ້ ຕ້ອງການບັນທຶກການຕັ້ງຄ່າແບບອອບລາຍຫຼືບໍ່?\n(ຈະຊິງຄ໌ໂດຍອັດຕະໂນມັດເມື່ອເຊື່ອມຕໍ່ກັບເຊີເວີ)",
        "msg_confirm_title": "ຢືນຢັນການເຊື່ອມຕໍ່",
        "msg_confirm": "✅  ບໍລິສັດ: {cname}\n👤  ລະຫັດພະນັກງານ: {empid}  |  ຊື່: {empname}\n📡  ເຊີເວີ: {server}\n🔑  ໂທເຄັນ: {token}\n\nຕ້ອງການເຊື່ອມຕໍ່ດ້ວຍຂໍ້ມູນນີ້ຫຼືບໍ່?",
        "msg_done_title": "ຕັ້ງຄ່າສຳເລັດ",
        "msg_done": "ບັນທຶກການຕັ້ງຄ່າເອເຈນຮຽບຮ້ອຍແລ້ວ\nເລີ່ມດຳເນີນການຕິດຕາມກິດຈະກຳຕອນນີ້",
        "msg_save_err_title": "ຂໍ້ຜິດພາດໃນການບັນທຶก",
        "msg_save_err": "ເກີດຂໍ້ຜິດພາດຂະນະບັນທຶກໄຟລ໌ຕັ້ງຄ່າ: {ex}",
        "msg_close_title": "ອອກ",
        "msg_close": "ການຕັ້ງຄ່າບໍ່ສຳເລັດ ຕ້ອງການອອກຈາກ PGuard ເອເຈນຫຼືບໍ່?",
        "mismatch_title": "ລະຫັດບໍລິສັດບໍ່ກົງກັນ",
        "mismatch_msg": "ລະຫັດບໍລິສັດທີ່ປ້อนບໍ່ກົງກັບທີ່ຕັ້ງຄ່າໄວ້ເທິງເຊີເວີ ການສົ່ງຂໍ້ມູນຖືກປະຕິເສດ\nກະລຸນາຕັ້ງຄ່າການເຊື່ອມຕໍ່ໃໝ່ອີກຄັ້ງ",
        "mismatch_log": "ລ້າງຂໍ້ມູນຕັ້ງຄ່າ config.json ເນື່ອງຈາກລະຫັດບໍລິສັດບໍ່ກົງກັນ",
        "lang_select": "🌐  ພາສາ (Language) :",
        "placeholder_server": "ຕ.ຍ.) http://192.168.1.100:3000"
    }
}

def show_setup_gui():
    """에이전트 최초 설정 GUI - 서버 URL, 회사 코드, 사원 정보 입력 및 다국어 지원."""
    global COMPANY_CODE, EMPLOYEE_ID, EMPLOYEE_NAME, API_TOKEN, SERVER_URL, BACKEND_URL, AGENT_LANG
    import tkinter as tk
    from tkinter import messagebox
    import json

    root = tk.Tk()
    root.attributes("-topmost", True)  # 항상 최상단 표시

    # 윈도우 크기 및 화면 중앙 배치
    window_width = 480
    window_height = 690
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    x = (screen_width - window_width) // 2
    y = (screen_height - window_height) // 2
    root.geometry(f"{window_width}x{window_height}+{x}+{y}")
    root.resizable(False, False)

    # ─── 테마 (Slate Dark, 대시보드와 동일)
    bg_color      = "#090D16"
    panel_color   = "#111827"
    text_white    = "#F8FAFC"
    text_slate    = "#94A3B8"
    accent_indigo = "#6366F1"
    success_green = "#22C55E"
    error_red     = "#EF4444"
    border_color  = "#1F2937"

    root.configure(bg=bg_color)

    # ─── 헤더
    tk.Label(root, text="🛡  PGuard", font=("Helvetica", 22, "bold"),
             bg=bg_color, fg=text_white).pack(pady=(20, 2))
    header_desc = tk.Label(root, text="", font=("Helvetica", 12),
             bg=bg_color, fg=text_slate)
    header_desc.pack(pady=(0, 4))
    tk.Frame(root, bg=border_color, height=1).pack(fill="x", padx=30, pady=(6, 12))

    # ─── 폼 컨테이너
    form = tk.Frame(root, bg=bg_color)
    form.pack(padx=32, fill="x")

    def make_field(parent, label_text, placeholder="", show=None):
        """라벨 + 입력칸 세트 생성 헬퍼."""
        lbl = tk.Label(parent, text=label_text, font=("Helvetica", 9, "bold"),
                 bg=bg_color, fg=text_slate, anchor="w")
        lbl.pack(fill="x", pady=(8, 2))
        entry = tk.Entry(parent, font=("Helvetica", 11), bg=panel_color, fg=text_white,
                         insertbackground="white", bd=0, relief="flat",
                         highlightthickness=1, highlightbackground=border_color,
                         highlightcolor=accent_indigo, show=show)
        entry.pack(fill="x", ipady=7)
        if placeholder:
            entry.insert(0, placeholder)
            entry.config(fg=text_slate)
            def on_focus_in(e):
                if entry.get() == placeholder:
                    entry.delete(0, tk.END)
                    entry.config(fg=text_white)
            def on_focus_out(e):
                if not entry.get():
                    entry.insert(0, placeholder)
                    entry.config(fg=text_slate)
            entry.bind("<FocusIn>", on_focus_in)
            entry.bind("<FocusOut>", on_focus_out)
        return entry, lbl

    # 0. 언어 선택 콤보/옵션 메뉴 프레임
    lang_frame = tk.Frame(form, bg=bg_color)
    lang_frame.pack(fill="x", pady=(4, 8))
    
    lbl_lang = tk.Label(lang_frame, text="", font=("Helvetica", 9, "bold"),
                        bg=bg_color, fg=text_slate)
    lbl_lang.pack(side="left")

    current_gui_lang = AGENT_LANG
    lang_options = {"ko": "한국어", "en": "English", "th": "ไทย", "lo": "ລາວ"}
    lang_names = {v: k for k, v in lang_options.items()}

    selected_option = tk.StringVar(root)
    selected_option.set(lang_options.get(current_gui_lang, "한국어"))

    # 1. 서버 URL
    dict_lang = AGENT_TRANSLATIONS[current_gui_lang]
    PH_SERVER = dict_lang["placeholder_server"]
    entry_server, lbl_server_title = make_field(form, dict_lang["lbl_server"], PH_SERVER)
    if SERVER_URL and SERVER_URL != DEFAULT_SERVER:
        entry_server.delete(0, tk.END)
        entry_server.config(fg=text_white)
        entry_server.insert(0, SERVER_URL)
    else:
        entry_server.delete(0, tk.END)
        entry_server.config(fg=text_white)
        entry_server.insert(0, DEFAULT_SERVER)

    # 2. 회사 코드 + 검증 버튼
    lbl_company_title = tk.Label(form, text=dict_lang["lbl_company"], font=("Helvetica", 9, "bold"),
             bg=bg_color, fg=text_slate, anchor="w")
    lbl_company_title.pack(fill="x", pady=(8, 2))
    
    code_row = tk.Frame(form, bg=bg_color)
    code_row.pack(fill="x")
    entry_company = tk.Entry(code_row, font=("Helvetica", 11), bg=panel_color, fg=text_white,
                             insertbackground="white", bd=0, relief="flat",
                             highlightthickness=1, highlightbackground=border_color,
                             highlightcolor=accent_indigo)
    entry_company.pack(side="left", fill="x", expand=True, ipady=7)
    
    if COMPANY_CODE:
        entry_company.insert(0, COMPANY_CODE)

    # 검증 상태 레이블
    lbl_verify = tk.Label(form, text="", font=("Helvetica", 9),
                           bg=bg_color, fg=text_slate, anchor="w")
    lbl_verify.pack(fill="x", pady=(2, 0))

    verified_company_name = {"value": None}  # mutable 상태 저장용

    def do_verify():
        """회사 코드 서버 검증 함수."""
        d_lang = AGENT_TRANSLATIONS[current_gui_lang]
        server = entry_server.get().strip().rstrip("/")
        if server == PH_SERVER:
            server = ""
        code = entry_company.get().strip().upper()
        if not server:
            lbl_verify.config(text=d_lang["status_server_empty"], fg=error_red)
            return
        if not code:
            lbl_verify.config(text=d_lang["status_code_empty"], fg=error_red)
            return
        lbl_verify.config(text=d_lang["status_verifying"], fg=text_slate)
        root.update()
        try:
            url = f"{server}/api/companies/validate/{code}"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                cname = resp.json().get("company_name", code)
                verified_company_name["value"] = cname
                lbl_verify.config(text=d_lang["status_verified"].format(cname=cname), fg=success_green)
                btn_verify.config(bg="#166534", text=d_lang["btn_verify_ok"])
            elif resp.status_code == 404:
                verified_company_name["value"] = None
                lbl_verify.config(text=d_lang["status_invalid"], fg=error_red)
                btn_verify.config(bg="#7F1D1D", text=d_lang["btn_verify_fail"])
            else:
                verified_company_name["value"] = None
                lbl_verify.config(text=d_lang["status_server_err"].format(code=resp.status_code), fg=error_red)
        except requests.RequestException:
            verified_company_name["value"] = "(오프라인)"
            lbl_verify.config(text=d_lang["status_offline"], fg="#F59E0B")
            btn_verify.config(bg="#78350F", text=d_lang["btn_verify_offline"])

    btn_verify = tk.Button(code_row, text=dict_lang["btn_verify"], font=("Helvetica", 9, "bold"),
                           bg="#312E81", fg=text_white, activebackground="#4338CA",
                           activeforeground=text_white, bd=0, cursor="hand2",
                           padx=10, pady=0, command=do_verify)
    btn_verify.pack(side="left", padx=(6, 0), ipady=7)

    # 코드 변경 시 검증 상태 초기화
    def on_code_change(*args):
        d_lang = AGENT_TRANSLATIONS[current_gui_lang]
        verified_company_name["value"] = None
        lbl_verify.config(text="", fg=text_slate)
        btn_verify.config(bg="#312E81", text=d_lang["btn_verify"])
    entry_company.bind("<KeyRelease>", on_code_change)
    entry_company.bind("<Return>", lambda e: do_verify())

    # 3. 사원 번호
    entry_empid, lbl_empid_title = make_field(form, dict_lang["lbl_empid"])
    if EMPLOYEE_ID:
        entry_empid.insert(0, EMPLOYEE_ID)
    entry_company.bind("<Tab>", lambda e: entry_empid.focus())

    # 4. 사원 이름
    entry_empname, lbl_empname_title = make_field(form, dict_lang["lbl_empname"])
    if EMPLOYEE_NAME:
        entry_empname.insert(0, EMPLOYEE_NAME)
    entry_empid.bind("<Tab>", lambda e: entry_empname.focus())

    # 5. 연동 토큰 (보안: show로 마스킹)
    entry_token, lbl_token_title = make_field(form, dict_lang["lbl_token"], show="*")
    if API_TOKEN:
        entry_token.insert(0, API_TOKEN)
    entry_empname.bind("<Tab>", lambda e: entry_token.focus())
    entry_token.bind("<Return>", lambda e: on_submit())

    # ─── 제출 및 하단 안내 위젯 미리 생성
    btn_submit = tk.Button(
        root, text="",
        font=("Helvetica", 11, "bold"),
        bg=accent_indigo, fg=text_white,
        activebackground="#4F46E5", activeforeground=text_white,
        bd=0, cursor="hand2"
    )
    
    footer_lbl = tk.Label(root, text="", font=("Helvetica", 8), bg=bg_color, fg="#475569")

    # ─── 동적 다국어 언어 전환 로직
    def update_ui_texts(*args):
        nonlocal current_gui_lang, PH_SERVER
        new_lang_name = selected_option.get()
        new_lang = lang_names[new_lang_name]
        current_gui_lang = new_lang
        
        d_lang = AGENT_TRANSLATIONS[new_lang]
        
        # 1. 창 타이틀 & 헤더
        root.title(d_lang["title"])
        header_desc.config(text=d_lang["header_title"])
        
        # 2. 폼 타이틀
        lbl_lang.config(text=d_lang["lang_select"])
        lbl_server_title.config(text=d_lang["lbl_server"])
        lbl_company_title.config(text=d_lang["lbl_company"])
        lbl_empid_title.config(text=d_lang["lbl_empid"])
        lbl_empname_title.config(text=d_lang["lbl_empname"])
        lbl_token_title.config(text=d_lang["lbl_token"])
        
        # 3. 서버 주소 플레이스홀더 갱신
        old_ph = PH_SERVER
        PH_SERVER = d_lang["placeholder_server"]
        if entry_server.get() == old_ph or not entry_server.get():
            entry_server.delete(0, tk.END)
            entry_server.insert(0, PH_SERVER)
            entry_server.config(fg=text_slate)
            
        # 4. 검증 버튼 및 상태 라벨 상태별 번역 적용
        if verified_company_name["value"] is None:
            lbl_verify.config(text="")
            btn_verify.config(text=d_lang["btn_verify"], bg="#312E81")
        elif verified_company_name["value"] == "(오프라인)":
            lbl_verify.config(text=d_lang["status_offline"], fg="#F59E0B")
            btn_verify.config(text=d_lang["btn_verify_offline"], bg="#78350F")
        else:
            lbl_verify.config(text=d_lang["status_verified"].format(cname=verified_company_name["value"]), fg=success_green)
            btn_verify.config(text=d_lang["btn_verify_ok"], bg="#166534")
            
        # 5. 제출 및 하단 안내
        btn_submit.config(text=d_lang["btn_submit"])
        footer_lbl.config(text=d_lang["footer_info"])

    # OptionMenu 생성
    opt_menu = tk.OptionMenu(lang_frame, selected_option, *lang_options.values())
    opt_menu.config(font=("Helvetica", 9), bg=panel_color, fg=text_white, 
                    activebackground=accent_indigo, activeforeground=text_white,
                    bd=0, highlightthickness=1, highlightbackground=border_color,
                    relief="flat", cursor="hand2")
    opt_menu["menu"].config(bg=panel_color, fg=text_white, activebackground=accent_indigo, activeforeground=text_white)
    opt_menu.pack(side="right")

    # 변수 변경 추적
    selected_option.trace_add("write", update_ui_texts)
    
    # 최초 UI 렌더링 호출
    update_ui_texts()

    # ─── 저장 버튼
    def on_submit():
        global COMPANY_CODE, EMPLOYEE_ID, EMPLOYEE_NAME, API_TOKEN, SERVER_URL, BACKEND_URL, AGENT_LANG
        d_lang = AGENT_TRANSLATIONS[current_gui_lang]
        sv = entry_server.get().strip().rstrip("/")
        if sv == PH_SERVER:
            sv = ""
        c_code = entry_company.get().strip().upper()
        e_id = entry_empid.get().strip()
        e_name = entry_empname.get().strip()
        token = entry_token.get().strip()

        if not sv or not c_code or not e_id or not e_name or not token:
            messagebox.showerror(d_lang["err_title"], d_lang["err_empty"])
            return

        # 검증 여부 확인
        if verified_company_name["value"] is None:
            ok = messagebox.askyesno(
                d_lang["msg_not_verified_title"],
                d_lang["msg_not_verified"].format(code=c_code)
            )
            if not ok:
                return
        elif verified_company_name["value"] == "(오프라인)":
            ok = messagebox.askyesno(
                d_lang["msg_offline_title"],
                d_lang["msg_offline"]
            )
            if not ok:
                return
        else:
            # 정상 인증된 경우, 최종 확인
            ok = messagebox.askyesno(
                d_lang["msg_confirm_title"],
                d_lang["msg_confirm"].format(cname=verified_company_name['value'], empid=e_id, empname=e_name, server=sv, token=token)
            )
            if not ok:
                return

        COMPANY_CODE = c_code
        EMPLOYEE_ID  = e_id
        EMPLOYEE_NAME = e_name
        API_TOKEN    = token
        SERVER_URL   = sv
        BACKEND_URL  = f"{sv}/api/activity"
        AGENT_LANG   = current_gui_lang

        try:
            config_data = {
                "server_url":    SERVER_URL,
                "company_code":  COMPANY_CODE,
                "employee_id":   EMPLOYEE_ID,
                "employee_name": EMPLOYEE_NAME,
                "api_token":     API_TOKEN,
                "language":      AGENT_LANG
            }
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(config_data, f, indent=4, ensure_ascii=False)
            logging.info(f"설정 저장 완료: {CONFIG_FILE} (언어: {AGENT_LANG})")
            messagebox.showinfo(d_lang["msg_done_title"], d_lang["msg_done"])
            root.destroy()
        except Exception as ex:
            messagebox.showerror(d_lang["msg_save_err_title"], d_lang["msg_save_err"].format(ex=ex))

    btn_submit.config(command=on_submit)
    tk.Frame(root, bg=border_color, height=1).pack(fill="x", padx=30, pady=(12, 10))
    btn_submit.pack(fill="x", padx=32, ipady=10)
    footer_lbl.pack(pady=(6, 0))

    def on_closing():
        d_lang = AGENT_TRANSLATIONS[current_gui_lang]
        if messagebox.askokcancel(d_lang["msg_close_title"], d_lang["msg_close"]):
            root.destroy()
            sys.exit(0)

    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

def load_config(force_gui=False):
    """config.json 에서 설정을 읽어 전역 변수에 주입합니다."""
    global COMPANY_CODE, EMPLOYEE_ID, EMPLOYEE_NAME, API_TOKEN, SERVER_URL, BACKEND_URL, AGENT_LANG
    import json
    config_valid = False
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                config = json.load(f)
                COMPANY_CODE  = config.get("company_code",  "").strip().upper()
                EMPLOYEE_ID   = config.get("employee_id",   "").strip()
                EMPLOYEE_NAME = config.get("employee_name", "").strip()
                API_TOKEN     = config.get("api_token",     "").strip()
                AGENT_LANG    = config.get("language",      "ko").strip().lower()
                if AGENT_LANG not in AGENT_TRANSLATIONS:
                    AGENT_LANG = "ko"
                sv = config.get("server_url", DEFAULT_SERVER).strip().rstrip("/")
                SERVER_URL    = sv if sv else DEFAULT_SERVER
                BACKEND_URL   = f"{SERVER_URL}/api/activity"
                if COMPANY_CODE and EMPLOYEE_ID and EMPLOYEE_NAME:
                    logging.info(
                        f"설정 로드 완료 - 사원: {EMPLOYEE_NAME} "
                        f"| 회사코드: {COMPANY_CODE} | 서버: {SERVER_URL} | 언어: {AGENT_LANG}"
                    )
                    config_valid = True
                else:
                    logging.warning("설정 파일이 불완전합니다. 설정 화면을 다시 표시합니다.")
        except Exception as e:
            logging.error(f"설정 파일 읽기 오류: {e}")

    # 설정이 불완전하거나 수동 실행(force_gui=True)인 경우 GUI 표시
    if not config_valid or force_gui:
        show_setup_gui()
    return True

# 업무 프로그램 판단용 키워드/프로세스명
WORK_PROCESSES = ["excel.exe", "excel", "powerpnt.exe", "powerpoint", "winword.exe", "word", "code.exe", "code"]
BROWSER_PROCESSES = ["chrome.exe", "chrome", "msedge.exe", "msedge", "safari", "firefox.exe", "firefox"]

# 도메인 추출을 위한 정규식 및 주요 비업무 사이트 매핑 키워드
COMMON_DOMAINS = [
    ("youtube.com", "유튜브|youtube"),
    ("instagram.com", "인스타그램|instagram"),
    ("facebook.com", "페이스북|facebook"),
    ("twitter.com", "트위터|twitter|x.com"),
    ("coupang.com", "쿠팡|coupang"),
    ("gmarket.co.kr", "지마켓|gmarket"),
    ("webtoon", "웹툰|webtoon|comic"),
    ("netflix.com", "넷플릭스|netflix")
]

# 활동 데이터를 담을 버퍼
activity_buffer = []
last_send_time = time.time()
next_send_time = 0.0          # 전송 실패 시 다음 재시도 가능 절대 시각 (0이면 제약 없음)
send_failure_count = 0        # 연속 전송 실패 횟수 (지수 백오프 계산용)
_overlay_result = {"reason": None, "detail": None, "submitted": False}
_overlay_stop_evt = threading.Event()
_overlay_thread = None
active_tk_roots = []

def extract_domain_from_title(title, process_name):
    """
    브라우저의 창 타이틀 텍스트에서 도메인을 추출합니다.
    창 타이틀에 도메인 형태가 있거나 유명 사이트 키워드가 매칭되는 경우 해당 도메인을 반환합니다.
    """
    title_lower = title.lower()
    
    # 1. 일반적인 URL 패턴 검색 (예: naver.com, github.com 등)
    url_pattern = re.search(r'([a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?)', title)
    if url_pattern:
        domain = url_pattern.group(1).lower()
        # 단순 브라우저 이름이나 파일 확장자 등이 잡히는 경우 예외 처리
        if domain not in ["chrome.com", "microsoft.com", "edge.com", "safari.com"] and not domain.endswith(('.exe', '.dll', '.js', '.png', '.jpg')):
            return domain

    # 2. 알려진 비업무/주요 웹사이트 키워드 매칭
    for domain, pattern in COMMON_DOMAINS:
        if re.search(pattern, title_lower):
            return domain
            
    # 3. 아무것도 매칭되지 않았지만 브라우저인 경우, 'web_browsing' 카테고리로 분류하기 위해 도메인을 'unknown_site' 등으로 반환
    return "browsing_activity"

def get_active_window_windows():
    """Windows 환경에서 활성 창의 프로세스명과 타이틀을 가져옵니다."""
    try:
        hwnd = win32gui.GetForegroundWindow()
        if not hwnd:
            return None, None
        
        # 윈도우 타이틀 가져오기
        title = win32gui.GetWindowText(hwnd)
        
        # 프로세스 ID(PID) 및 프로세스 이름 가져오기
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        if pid == 0:
            return "system", title
            
        try:
            process = psutil.Process(pid)
            process_name = process.name().lower()
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            process_name = "admin_process"
        except Exception:
            process_name = "unknown"
        
        return process_name, title
    except Exception as e:
        # 권한 오류나 창이 순간적으로 닫히는 등의 예외 처리
        return None, None

def get_active_window_macos():
    """macOS 환경에서 활성 창의 프로세스명과 타이틀을 가져옵니다."""
    try:
        shared_workspace = NSWorkspace.sharedWorkspace()
        active_app = shared_workspace.activeApplication()
        if not active_app:
            return None, None
            
        process_name = active_app.get('NSApplicationName', '').lower()
        pid = active_app.get('NSApplicationProcessIdentifier', 0)
        
        # Quartz를 이용해 전면 활성화된 실제 창의 타이틀(Window Title) 획득
        title = "알 수 없는 창"
        options = Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements
        window_list = Quartz.CGWindowListCopyWindowInfo(options, Quartz.kCGNullWindowID)
        
        for window in window_list:
            window_pid = window.get(Quartz.kCGWindowOwnerPID, -1)
            if window_pid == pid:
                # 윈도우 레이어가 0(일반 창)인 전면 창 찾기
                if window.get(Quartz.kCGWindowLayer, -1) == 0:
                    title = window.get(Quartz.kCGWindowName, '')
                    break
        
        # 윈도우 타이틀을 찾지 못했다면 애플리케이션명으로 대체
        if not title and active_app.get('NSApplicationBundleIdentifier'):
            title = active_app.get('NSApplicationBundleIdentifier')
            
        return process_name, title
    except Exception as e:
        return None, None

def get_active_window():
    """OS에 맞춰 전면 활성 창 정보를 반환합니다."""
    if CURRENT_OS == "Windows":
        return get_active_window_windows()
    elif CURRENT_OS == "Darwin":
        return get_active_window_macos()
    else:
        return None, None

def get_idle_time_seconds():
    """OS에 맞춰 마우스/키보드 미입력 유휴 시간(초)을 반환합니다."""
    if CURRENT_OS == "Windows":
        try:
            import win32api
            tick = win32api.GetTickCount() & 0xFFFFFFFF
            last_input = win32api.GetLastInputInfo() & 0xFFFFFFFF
            return ((tick - last_input) & 0xFFFFFFFF) / 1000.0
        except Exception:
            return 0
    elif CURRENT_OS == "Darwin":
        try:
            import Quartz
            return Quartz.CGEventSourceSecondsSinceLastEventType(
                Quartz.kCGEventSourceStateHIDSystemState,
                Quartz.kCGAnyInputEventType
            )
        except Exception:
            return 0
def is_video_or_meeting_active(process_name, window_title, domain):
    """
    현재 활성 창의 프로세스명, 타이틀, 도메인을 기반으로
    영상 재생(유튜브/넷플릭스 등) 또는 화상 회의(Zoom/Teams 등) 중인지 판별합니다.
    """
    if not process_name:
        return False
    
    proc_lower = process_name.lower()
    title_lower = window_title.lower() if window_title else ""
    dom_lower = domain.lower() if domain else ""

    # 1. 화상회의 및 메신저 통화 프로세스/타이틀 키워드
    MEETING_PROCS = ["zoom.exe", "zoom", "teams.exe", "teams", "webex.exe", "webex", "skype.exe", "skype", "discord.exe", "discord", "slack.exe", "slack"]
    MEETING_TITLES = ["회의", "meeting", "zoom", "teams", "webex", "통화", "call"]
    
    if any(mp in proc_lower for mp in MEETING_PROCS):
        return True
    if any(mt in title_lower for mt in MEETING_TITLES):
        return True

    # 2. 로컬 비디오 플레이어 프로세스
    VIDEO_PROCS = ["potplayer.exe", "potplayermini64.exe", "vlc.exe", "kmplayer.exe", "gom.exe", "gomplayer.exe", "wmplayer.exe", "mpc-hc.exe"]
    if any(vp in proc_lower for vp in VIDEO_PROCS):
        return True

    # 3. 비디오 스트리밍 도메인 및 창 타이틀 키워드
    VIDEO_DOMAINS = ["youtube.com", "netflix.com", "disneyplus.com", "wavve.com", "tving.com", "twitch.tv", "zoom.us", "meet.google.com"]
    VIDEO_TITLES = ["유튜브", "youtube", "넷플릭스", "netflix", "비디오", "video", "플레이어", "player", "동영상", "영화", "movie", "스트리밍", "streaming"]
    
    if any(vd in dom_lower for vd in VIDEO_DOMAINS):
        return True
    if any(vt in title_lower for vt in VIDEO_TITLES):
        return True

    return False

def determine_category(process_name, window_title, domain):
    """프로세스명과 웹 도메인을 분석하여 카테고리(work, non-work, idle)를 판별합니다."""
    process_lower = process_name.lower()
    title_lower = window_title.lower()
    
    # 브라우저인 경우 도메인 기반 판별
    is_browser = any(bp in process_lower for bp in BROWSER_PROCESSES)
    
    if is_browser and domain:
        # 비업무 사이트 도메인 키워드 매칭
        for non_work_domain, pattern in COMMON_DOMAINS:
            if non_work_domain == domain or re.search(pattern, domain):
                return "non-work"
        return "work"  # 그 외 웹 서핑은 기본 업무(리서치 등)로 분류
        
    # 일반 애플리케이션 판별
    for wp in WORK_PROCESSES:
        if wp in process_lower:
            return "work"
            
    # 화면 보호기 또는 잠금 화면 등 자리비움 감지
    if "lockapp" in process_lower or "scrnsave" in process_lower:
        return "idle"
        
    return "work"  # 기본값은 업무/일반 활동으로 분류

def handle_company_code_mismatch():
    """서버와 회사 코드가 불일치할 때 로컬 설정을 무효화하고 다시 입력을 요구합니다."""
    global AGENT_LANG
    try:
        import tkinter as tk
        from tkinter import messagebox
        
        root = tk.Tk()
        root.withdraw()
        
        d_lang = AGENT_TRANSLATIONS.get(AGENT_LANG, AGENT_TRANSLATIONS["ko"])
        messagebox.showerror(
            d_lang["mismatch_title"], 
            d_lang["mismatch_msg"]
        )
        root.destroy()
    except Exception:
        pass

    if os.path.exists(CONFIG_FILE):
        try:
            os.remove(CONFIG_FILE)
            d_lang = AGENT_TRANSLATIONS.get(AGENT_LANG, AGENT_TRANSLATIONS["ko"])
            logging.info(d_lang["mismatch_log"])
        except Exception as e:
            logging.error(f"설정 파일 제거 오류: {e}")

    # GUI 즉시 재기동으로 자가 치유 수행
    show_setup_gui()

def send_data_to_server():
    """버퍼에 쌓인 활동 데이터를 백엔드로 전송합니다."""
    global activity_buffer, last_send_time, next_send_time, send_failure_count
    if not activity_buffer:
        last_send_time = time.time()
        return

    payload = {
        "company_code": COMPANY_CODE,
        "employee_id": EMPLOYEE_ID,
        "employee_name": EMPLOYEE_NAME,
        "activities": activity_buffer
    }

    headers = {"X-Agent-Token": API_TOKEN} if API_TOKEN else {}

    try:
        logging.info(f"서버({BACKEND_URL})로 데이터 전송 중... (건수: {len(activity_buffer)}건)")
        response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=10)
        if response.status_code in (200, 201):
            logging.info("데이터가 서버에 성공적으로 전송되었습니다.")
            activity_buffer = []  # 성공 시 버퍼 비우기
            last_send_time = time.time()
            next_send_time = 0.0
            send_failure_count = 0
        elif response.status_code == 403:
            logging.error(
                f"회사 코드 '{COMPANY_CODE}' 이(가) 서버에서 거부(403)되었습니다. "
                "설정을 재입력합니다."
            )
            handle_company_code_mismatch()
        elif response.status_code in (401, 400):
            # 인증 실패/잘못된 요청은 재시도해도 성공할 수 없으므로 즉시 경고만 기록
            logging.error(
                f"서버가 요청을 거부했습니다 (상태 코드: {response.status_code}): {response.text}. "
                "연동 토큰/회사 코드를 확인해 주세요."
            )
            activity_buffer = []
            last_send_time = time.time()
            send_failure_count = 0
        else:
            schedule_retry(f"서버 응답 오류 (상태 코드: {response.status_code}).")
    except Exception as e:
        schedule_retry(f"서버 전송 실패: {e}. (대기: {len(activity_buffer)}건)")


def buffer_append(act):
    """전송 대기 버퍼에 활동을 추가합니다. 최대 개수 초과 시 가장 오래된 항목을 폐기해 메모리 증가를 방지합니다."""
    global activity_buffer
    activity_buffer.append(act)
    if len(activity_buffer) > MAX_BUFFER_ITEMS:
        dropped = activity_buffer.pop(0)
        logging.warning(
            f"전송 대기 버퍼가 상한({MAX_BUFFER_ITEMS})을 초과해 가장 오래된 활동 1건을 폐기했습니다. "
            f"(폐기: {dropped.get('timestamp')} {dropped.get('window_title')})"
        )


def schedule_retry(msg):
    """전송 실패 시 지수 백오프를 적용해 다음 재시도 시각을 예약합니다."""
    global send_failure_count, next_send_time
    send_failure_count += 1
    backoff = min(RETRY_MAX_BACKOFF, RETRY_BASE_BACKOFF * (2 ** min(send_failure_count - 1, 6)))
    next_send_time = time.time() + backoff
    logging.warning(f"{msg} {backoff}초 후 재시도합니다.")

def register_startup():
    """OS에 맞춰 에이전트를 시작 프로그램에 등록합니다."""
    try:
        if CURRENT_OS == "Windows":
            import winreg
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            # 실행파일 형태(frozen)인지 스크립트 형태인지에 따라 경로 판별
            if getattr(sys, 'frozen', False):
                exe_path = f'"{sys.executable}" --background'
            else:
                exe_path = f'"{sys.executable}" "{os.path.abspath(__file__)}" --background'
            
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
            winreg.SetValueEx(key, "PGuardAgent", 0, winreg.REG_SZ, exe_path)
            winreg.CloseKey(key)
            logging.info("Windows 시작 프로그램(레지스트리)에 에이전트 등록 성공.")
            return True
        elif CURRENT_OS == "Darwin":  # macOS
            home = os.path.expanduser("~")
            launch_agents_dir = os.path.join(home, "Library", "LaunchAgents")
            os.makedirs(launch_agents_dir, exist_ok=True)
            plist_path = os.path.join(launch_agents_dir, "com.pguard.agent.plist")
            
            if getattr(sys, 'frozen', False):
                # .app 또는 단일 빌드 실행 파일
                exe_path = sys.executable
                args = [exe_path, "--background"]
            else:
                python_path = sys.executable
                script_path = os.path.abspath(__file__)
                args = [python_path, script_path, "--background"]
                
            args_xml = "".join(f"\n        <string>{arg}</string>" for arg in args)
            
            plist_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pguard.agent</string>
    <key>ProgramArguments</key>
    <array>{args_xml}
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>"""
            
            with open(plist_path, "w", encoding="utf-8") as f:
                f.write(plist_content)
            logging.info("macOS LaunchAgent에 에이전트 등록 성공.")
            return True
        else:
            logging.warning(f"지원하지 않는 운영체제({CURRENT_OS})이므로 시작 프로그램 등록을 건너뜁니다.")
            return False
    except Exception as e:
        logging.error(f"시작 프로그램 자동 등록 중 에러 발생: {e}")
        return False

def show_idle_reason_dialog(lang):
    """자리비움에서 업무로 복귀 시 사유 입력 다이얼로그를 표시합니다."""
    import tkinter as tk
    from tkinter import ttk

    REASON_OPTIONS = {
        "ko": ["컴퓨터켜기", "회의", "외부업무", "휴식", "식사", "화장실", "담배"],
        "en": ["Turn On PC", "Meeting", "External Work", "Rest", "Meal", "Restroom", "Smoking"],
        "th": ["เปิดคอมพิวเตอร์", "ประชุม", "งานนอก", "พัก", "ทานข้าว", "ห้องน้ำ", "สูบบุหรี่"],
        "lo": ["ເປີດຄອມພິວເຕີ", "ປະຊຸມ", "ວຽກນອກ", "ພັກ", "ກິນເຂົ້າ", "ຫ້ອງນ້ຳ", "ສູບຢາ"],
    }
    TITLE = {
        "ko": "자리비움 사유 입력",
        "en": "Enter Absence Reason",
        "th": "กรอกเหตุผลที่ไม่อยู่หน้าจอ",
        "lo": "ກອກເຫດຜົນທີ່ບໍ່ຢູ່ໜ້າຈໍ",
    }
    LABEL_REASON = {
        "ko": "자리비움 유형 선택:",
        "en": "Select absence type:",
        "th": "เลือกประเภทการไม่อยู่:",
        "lo": "ເລືອກປະເພດການບໍ່ຢູ່:",
    }
    LABEL_DETAIL = {
        "ko": "상세 사유 (선택 입력):",
        "en": "Detailed reason (optional):",
        "th": "เหตุผลโดยละเอียด (ไม่บังคับ):",
        "lo": "ເຫດຜົນລະອຽດ (ຖ້ານຈຳ):",
    }
    BTN_OK = {"ko": "확인", "en": "OK", "th": "ตกลง", "lo": "ຕົກລົງ"}
    BTN_SKIP = {"ko": "건너뜀", "en": "Skip", "th": "ข้าม", "lo": "ຂ້າມ"}

    effective_lang = lang if lang in REASON_OPTIONS else "ko"
    options = REASON_OPTIONS[effective_lang]

    result = {"reason": None, "detail": None}

    root = tk.Tk()
    root.title(TITLE.get(effective_lang, ""))
    root.attributes("-topmost", True)
    root.resizable(False, False)

    # 강제로 포커스 및 최상단 표시 보강
    root.lift()
    root.focus_force()
    root.after(100, lambda: root.focus_force())

    bg_color = "#090D16"
    panel_color = "#111827"
    text_white = "#F8FAFC"
    text_slate = "#94A3B8"
    accent = "#6366F1"
    border_color = "#1F2937"

    root.configure(bg=bg_color)

    window_width, window_height = 400, 360
    sw = root.winfo_screenwidth()
    sh = root.winfo_screenheight()
    root.geometry(f"{window_width}x{window_height}+{(sw - window_width)//2}+{(sh - window_height)//2}")

    tk.Label(root, text="🛡  PGuard", font=("Helvetica", 16, "bold"),
             bg=bg_color, fg=text_white).pack(pady=(16, 2))
    tk.Label(root, text=TITLE.get(effective_lang, ""), font=("Helvetica", 10),
             bg=bg_color, fg=text_slate).pack(pady=(0, 8))
    tk.Frame(root, bg=border_color, height=1).pack(fill="x", padx=24, pady=(0, 12))

    form = tk.Frame(root, bg=bg_color)
    form.pack(padx=24, fill="x")

    tk.Label(form, text=LABEL_REASON.get(effective_lang, ""), font=("Helvetica", 9, "bold"),
             bg=bg_color, fg=text_slate, anchor="w").pack(fill="x", pady=(0, 4))

    selected_reason = tk.StringVar(root)
    selected_reason.set(options[0])

    reasons_frame = tk.Frame(form, bg=bg_color)
    reasons_frame.pack(fill="x", pady=(0, 10))

    buttons = []

    def select_reason(reason_str, btn_widget):
        selected_reason.set(reason_str)
        for b in buttons:
            b.configure(bg=panel_color, fg=text_slate, activebackground=panel_color, activeforeground=text_slate)
        btn_widget.configure(bg=accent, fg=text_white, activebackground=accent, activeforeground=text_white)

    for idx, opt in enumerate(options):
        row = idx // 2
        col = idx % 2
        
        btn = tk.Button(reasons_frame, text=opt, font=("Helvetica", 9, "bold"),
                        bg=panel_color, fg=text_slate, activebackground=panel_color, activeforeground=text_slate,
                        bd=0, cursor="hand2", padx=8, pady=5)
        
        if idx == 6:
            btn.grid(row=row, column=col, columnspan=2, sticky="nsew", padx=3, pady=3)
        else:
            btn.grid(row=row, column=col, sticky="nsew", padx=3, pady=3)
            
        reasons_frame.grid_columnconfigure(col, weight=1)
        btn.configure(command=lambda o=opt, b=btn: select_reason(o, b))
        buttons.append(btn)
        
        if opt == options[0]:
            btn.configure(bg=accent, fg=text_white, activebackground=accent, activeforeground=text_white)

    tk.Label(form, text=LABEL_DETAIL.get(effective_lang, ""), font=("Helvetica", 9, "bold"),
             bg=bg_color, fg=text_slate, anchor="w").pack(fill="x", pady=(0, 4))

    detail_entry = tk.Entry(form, font=("Helvetica", 10), bg=panel_color, fg=text_white,
                            insertbackground="white", bd=0, relief="flat",
                            highlightthickness=1, highlightbackground=border_color,
                            highlightcolor=accent)
    detail_entry.pack(fill="x", ipady=6)

    btn_frame = tk.Frame(root, bg=bg_color)
    btn_frame.pack(pady=14, padx=24, fill="x")

    def on_ok():
        result["reason"] = selected_reason.get()
        detail = detail_entry.get().strip()
        result["detail"] = detail if detail else None
        root.destroy()

    def on_skip():
        root.destroy()

    tk.Button(btn_frame, text=BTN_SKIP.get(effective_lang, "Skip"),
              font=("Helvetica", 10), bg="#1F2937", fg=text_slate,
              activebackground="#374151", activeforeground=text_white,
              bd=0, cursor="hand2", command=on_skip).pack(side="left", fill="x", expand=True, ipady=6, padx=(0, 6))

    tk.Button(btn_frame, text=BTN_OK.get(effective_lang, "OK"),
              font=("Helvetica", 10, "bold"), bg=accent, fg=text_white,
              activebackground="#4F46E5", activeforeground=text_white,
              bd=0, cursor="hand2", command=on_ok).pack(side="left", fill="x", expand=True, ipady=6)

    root.protocol("WM_DELETE_WINDOW", on_skip)
    root.mainloop()
    return result["reason"], result["detail"]


def init_away_overlay(lang, idle_start_time, stop_event, result_dict):
    """자리비움 전체화면 오버레이 - 화면보호기 스타일. 메인 루프에서 update() 호출."""
    global active_tk_roots
    import tkinter as tk
    from tkinter import ttk

    REASON_OPTIONS = {
        "ko": ["컴퓨터켜기", "회의", "외부업무", "휴식", "식사", "화장실", "담배"],
        "en": ["Turn On PC", "Meeting", "External Work", "Rest", "Meal", "Restroom", "Smoking"],
        "th": ["เปิดคอมพิวเตอร์", "ประชุม", "งานนอก", "พัก", "ทานข้าว", "ห้องน้ำ", "สูบบุหรี่"],
        "lo": ["ເປີດຄອມພິວເຕີ", "ປະຊຸມ", "ວຽກນອກ", "ພັກ", "ກິນເຂົ້າ", "ຫ້ອງນ້ຳ", "ສູບຢາ"],
    }
    TEXTS = {
        "ko": {"title": "자리비움 중", "subtitle": "현재 자리를 비우고 있습니다", "reason_label": "자리비움 사유 선택", "detail_label": "상세 사유 (선택)", "detail_ph": "직접 입력...", "btn": "사유 제출 및 닫기", "elapsed": "자리비움 경과"},
        "en": {"title": "Away from Desk", "subtitle": "You are currently away", "reason_label": "Select Reason", "detail_label": "Detail (optional)", "detail_ph": "Type here...", "btn": "Submit & Close", "elapsed": "Time Away"},
        "th": {"title": "ไม่อยู่หน้าจอ", "subtitle": "คุณไม่อยู่ที่โต๊ะทำงาน", "reason_label": "เลือกเหตุผล", "detail_label": "รายละเอียด (ไม่บังคับ)", "detail_ph": "พิมพ์ที่นี่...", "btn": "ส่งเหตุผลและปิด", "elapsed": "เวลาที่ไม่อยู่"},
        "lo": {"title": "ບໍ່ຢູ່ໜ້າຈໍ", "subtitle": "ທ່ານບໍ່ຢູ່ທີ່ໂຕ້ະ", "reason_label": "ເລືອກເຫດຜົນ", "detail_label": "ລາຍລະອຽດ (ຖ້ານຈຳ)", "detail_ph": "ພິມທີ່ນີ້...", "btn": "ສົ່ງເຫດຜົນ ແລະ ປິດ", "elapsed": "ເວລາທີ່ບໍ່ຢູ່"},
    }
    effective_lang = lang if lang in REASON_OPTIONS else "ko"
    options = REASON_OPTIONS[effective_lang]
    t = TEXTS[effective_lang]

    root = tk.Tk()
    root.title("PGuard")
    root.attributes("-fullscreen", True)
    root.attributes("-topmost", True)
    root.configure(bg="#060A12")
    root.resizable(False, False)

    BG = "#060A12"
    PANEL = "#0F1723"
    ACCENT = "#6366F1"
    TEXT_W = "#F1F5F9"
    TEXT_S = "#94A3B8"
    BORDER = "#1E2A3A"

    canvas = tk.Canvas(root, bg=BG, highlightthickness=0)
    canvas.place(relx=0, rely=0, relwidth=1, relheight=1)

    sw = root.winfo_screenwidth()
    sh = root.winfo_screenheight()

    import random
    dots = []
    for _ in range(40):
        x = random.randint(0, sw)
        y = random.randint(0, sh)
        r = random.uniform(1, 3)
        opacity = random.choice(["#1E2A3A", "#1a2035", "#162030", "#0F1723"])
        dot = canvas.create_oval(x - r, y - r, x + r, y + r, fill=opacity, outline="")
        dots.append({"id": dot, "x": x, "y": y, "dx": random.uniform(-0.3, 0.3), "dy": random.uniform(-0.3, 0.3)})



    panel_w, panel_h = 520, 580
    panel_x = (sw - panel_w) // 2
    panel_y = (sh - panel_h) // 2
    panel = tk.Frame(root, bg=PANEL, bd=0, highlightthickness=1, highlightbackground=BORDER)
    panel.place(x=panel_x, y=panel_y, width=panel_w, height=panel_h)

    tk.Label(panel, text="🛡", font=("Segoe UI Emoji", 32), bg=PANEL, fg=ACCENT).pack(pady=(28, 4))
    tk.Label(panel, text=t["title"], font=("Helvetica", 20, "bold"), bg=PANEL, fg=TEXT_W).pack()
    tk.Label(panel, text=t["subtitle"], font=("Helvetica", 10), bg=PANEL, fg=TEXT_S).pack(pady=(2, 10))

    tk.Frame(panel, bg=BORDER, height=1).pack(fill="x", padx=24, pady=(0, 10))
    elapsed_frame = tk.Frame(panel, bg=PANEL)
    elapsed_frame.pack()
    tk.Label(elapsed_frame, text=t["elapsed"] + ": ", font=("Helvetica", 10), bg=PANEL, fg=TEXT_S).pack(side="left")
    elapsed_lbl = tk.Label(elapsed_frame, text="00:00:00", font=("Courier", 14, "bold"), bg=PANEL, fg=ACCENT)
    elapsed_lbl.pack(side="left")
    tk.Frame(panel, bg=BORDER, height=1).pack(fill="x", padx=24, pady=(10, 16))

    form = tk.Frame(panel, bg=PANEL)
    form.pack(fill="x", padx=28)

    tk.Label(form, text=t["reason_label"], font=("Helvetica", 9, "bold"), bg=PANEL, fg=TEXT_S, anchor="w").pack(fill="x", pady=(0, 4))

    selected_reason = tk.StringVar(root)
    selected_reason.set(options[0])

    reasons_frame = tk.Frame(form, bg=PANEL)
    reasons_frame.pack(fill="x", pady=(0, 12))

    buttons = []

    def select_reason(reason_str, btn_widget):
        selected_reason.set(reason_str)
        for b in buttons:
            b.configure(bg=BORDER, fg=TEXT_S, activebackground=BORDER, activeforeground=TEXT_S)
        btn_widget.configure(bg=ACCENT, fg=TEXT_W, activebackground=ACCENT, activeforeground=TEXT_W)

    for idx, opt in enumerate(options):
        row = idx // 2
        col = idx % 2
        
        btn = tk.Button(reasons_frame, text=opt, font=("Helvetica", 10, "bold"),
                        bg=BORDER, fg=TEXT_S, activebackground=BORDER, activeforeground=TEXT_S,
                        bd=0, cursor="hand2", padx=10, pady=6)
        
        if idx == 6:
            btn.grid(row=row, column=col, columnspan=2, sticky="nsew", padx=4, pady=4)
        else:
            btn.grid(row=row, column=col, sticky="nsew", padx=4, pady=4)
            
        reasons_frame.grid_columnconfigure(col, weight=1)
        btn.configure(command=lambda o=opt, b=btn: select_reason(o, b))
        buttons.append(btn)
        
        if opt == options[0]:
            btn.configure(bg=ACCENT, fg=TEXT_W, activebackground=ACCENT, activeforeground=TEXT_W)

    tk.Label(form, text=t["detail_label"], font=("Helvetica", 9, "bold"), bg=PANEL, fg=TEXT_S, anchor="w").pack(fill="x", pady=(0, 4))
    detail_entry = tk.Entry(form, font=("Helvetica", 10), bg=BORDER, fg=TEXT_W,
                            insertbackground="white", bd=0, relief="flat",
                            highlightthickness=1, highlightbackground=BORDER, highlightcolor=ACCENT)
    detail_entry.insert(0, t["detail_ph"])
    detail_entry.config(fg=TEXT_S)

    def on_detail_focus(e):
        if detail_entry.get() == t["detail_ph"]:
            detail_entry.delete(0, tk.END)
            detail_entry.config(fg=TEXT_W)

    def on_detail_blur(e):
        if not detail_entry.get():
            detail_entry.insert(0, t["detail_ph"])
            detail_entry.config(fg=TEXT_S)

    detail_entry.bind("<FocusIn>", on_detail_focus)
    detail_entry.bind("<FocusOut>", on_detail_blur)
    detail_entry.pack(fill="x", ipady=7, pady=(0, 20))

    def on_submit():
        reason = selected_reason.get()
        raw_detail = detail_entry.get().strip()
        detail = None if (not raw_detail or raw_detail == t["detail_ph"]) else raw_detail
        
        result_dict.update({"reason": reason, "detail": detail, "submitted": True})
        if root in active_tk_roots:
            active_tk_roots.remove(root)
        root.destroy()

    submit_btn = tk.Button(form, text=t["btn"], font=("Helvetica", 11, "bold"),
                           bg=ACCENT, fg=TEXT_W, activebackground="#4F46E5", activeforeground=TEXT_W,
                           bd=0, cursor="hand2", command=on_submit)
    submit_btn.pack(fill="x", ipady=10)

    def update_elapsed():
        if not root.winfo_exists():
            return
        elapsed = int(time.time() - idle_start_time)
        h = elapsed // 3600
        m = (elapsed % 3600) // 60
        s = elapsed % 60
        elapsed_lbl.config(text=f"{h:02d}:{m:02d}:{s:02d}")
        root.after(1000, update_elapsed)

    update_elapsed()

    def animate_dots():
        if not root.winfo_exists():
            return
        for d in dots:
            d["x"] += d["dx"]
            d["y"] += d["dy"]
            if d["x"] < 0: d["x"] = sw
            if d["x"] > sw: d["x"] = 0
            if d["y"] < 0: d["y"] = sh
            if d["y"] > sh: d["y"] = 0
            r = 2
            canvas.coords(d["id"], d["x"] - r, d["y"] - r, d["x"] + r, d["y"] + r)
        root.after(50, animate_dots)

    animate_dots()

    def check_stop():
        if not root.winfo_exists():
            return
        if stop_event.is_set():
            if root in active_tk_roots:
                active_tk_roots.remove(root)
            root.destroy()
        else:
            root.after(500, check_stop)

    check_stop()
    active_tk_roots.append(root)


def init_agent_notification(message):
    """관리자로부터 수신한 메시지를 팝업으로 표시합니다."""
    global active_tk_roots
    import tkinter as tk
    try:
        root = tk.Tk()
        root.title("PGuard 관리자 메시지")
        root.attributes("-topmost", True)
        root.resizable(False, False)

        BG = "#0F1723"
        ACCENT = "#6366F1"
        TEXT_W = "#F1F5F9"
        BORDER = "#1E2A3A"

        root.configure(bg=BG)
        w, h = 420, 220
        sw = root.winfo_screenwidth()
        sh = root.winfo_screenheight()
        root.geometry(f"{w}x{h}+{sw - w - 20}+{sh - h - 60}")

        tk.Label(root, text="📢  관리자 메시지", font=("Helvetica", 13, "bold"), bg=BG, fg=TEXT_W).pack(pady=(18, 4))
        tk.Frame(root, bg=BORDER, height=1).pack(fill="x", padx=20, pady=(0, 12))

        msg_frame = tk.Frame(root, bg="#162030", bd=0, highlightthickness=1, highlightbackground=BORDER)
        msg_frame.pack(fill="x", padx=20)
        tk.Label(msg_frame, text=message, font=("Helvetica", 11), bg="#162030", fg=TEXT_W,
                 wraplength=360, justify="left", anchor="w").pack(padx=16, pady=14, fill="x")

        def close_noti():
            if root in active_tk_roots:
                active_tk_roots.remove(root)
            root.destroy()

        tk.Button(root, text="확인", font=("Helvetica", 10, "bold"),
                  bg=ACCENT, fg=TEXT_W, activebackground="#4F46E5", activeforeground=TEXT_W,
                  bd=0, cursor="hand2",
                  command=close_noti).pack(fill="x", padx=20, pady=14, ipady=8)

        root.lift()
        root.focus_force()
        active_tk_roots.append(root)
    except Exception as e:
        logging.error(f"관리자 메시지 팝업 오류: {e}")


def fetch_agent_settings():
    """서버에서 회사별 에이전트 설정(자리비움 임계값 등)을 가져와 전역 변수에 반영합니다."""
    global IDLE_THRESHOLD, LOOP_INTERVAL, SEND_INTERVAL
    if not SERVER_URL or not COMPANY_CODE:
        return
    try:
        headers = {"X-Agent-Token": API_TOKEN} if API_TOKEN else {}
        resp = requests.get(f"{SERVER_URL}/api/agent/settings",
                            params={"company_code": COMPANY_CODE}, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            new_threshold = int(data.get("idle_threshold_seconds", IDLE_THRESHOLD))
            if new_threshold != IDLE_THRESHOLD:
                logging.info(f"자리비움 임계값 서버 동기화: {IDLE_THRESHOLD}초 → {new_threshold}초")
                IDLE_THRESHOLD = new_threshold
                
            new_scan = int(data.get("agent_scan_interval_seconds", LOOP_INTERVAL))
            if new_scan != LOOP_INTERVAL:
                logging.info(f"감시 스캔 주기 서버 동기화: {LOOP_INTERVAL}초 → {new_scan}초")
                LOOP_INTERVAL = new_scan
                
            new_send = int(data.get("agent_send_interval_seconds", SEND_INTERVAL))
            if new_send != SEND_INTERVAL:
                logging.info(f"서버 전송 주기 서버 동기화: {SEND_INTERVAL}초 → {new_send}초")
                SEND_INTERVAL = new_send
    except Exception as e:
        logging.debug(f"에이전트 설정 동기화 실패 (무시): {e}")


def send_startup_ping():
    """에이전트 시작 시 즉시 서버로 온라인 상태임을 알리는 빈 활동 데이터를 전송합니다."""
    if not SERVER_URL or not COMPANY_CODE or not EMPLOYEE_ID:
        return
    try:
        payload = {
            "company_code": COMPANY_CODE,
            "employee_id": EMPLOYEE_ID,
            "employee_name": EMPLOYEE_NAME,
            "activities": []
        }
        resp = requests.post(f"{SERVER_URL}/api/activity", json=payload,
                             headers={"X-Agent-Token": API_TOKEN} if API_TOKEN else {}, timeout=5)
        if resp.status_code in (200, 201):
            logging.info("에이전트 시작: 온라인 정보 즉시 전송 완료.")
        else:
            logging.error(f"온라인 정보 즉시 전송 실패 (서버 응답 코드: {resp.status_code}): {resp.text}")
    except Exception as e:
        logging.error(f"온라인 정보 즉시 전송 에러 발생: {e}", exc_info=True)


def check_agent_commands():
    """서버에서 관리자가 발행한 명령(메시지 등)을 확인하고 처리합니다."""
    if not SERVER_URL or not COMPANY_CODE or not EMPLOYEE_ID:
        return
    try:
        headers = {"X-Agent-Token": API_TOKEN} if API_TOKEN else {}
        resp = requests.get(f"{SERVER_URL}/api/agent/commands",
                            params={"company_code": COMPANY_CODE, "employee_id": EMPLOYEE_ID},
                            headers=headers, timeout=5)
        if resp.status_code == 200:
            commands = resp.json()
            for cmd in commands:
                if cmd.get("type") == "message":
                    payload = cmd.get("payload", {})
                    msg = payload.get("message", "")
                    if msg:
                        logging.info(f"관리자 메시지 수신: {msg}")
                        init_agent_notification(msg)
    except Exception as e:
        logging.debug(f"명령 폴링 실패 (무시): {e}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="PGuard Agent")
    parser.add_argument("--background", action="store_true", help="Run in background without showing GUI if config exists")
    args = parser.parse_args()

    global last_send_time, activity_buffer, _overlay_result, _overlay_stop_evt, _overlay_thread
    logging.info("직원 PC 활동 모니터링 에이전트가 가동되었습니다.")
    
    # 0. 로컬 연동 설정 파일 로드 (수동 실행 시 항상 GUI 표시)
    load_config(force_gui=not args.background)
    
    logging.info(f"수집 설정: 실시간 체크 주기 = {LOOP_INTERVAL}초, 서버 전송 주기 = {SEND_INTERVAL}초")
    
    # OS별 시작 프로그램 자동 등록 실행
    register_startup()

    # 실시간 모니터링 및 집계 관련 상태 변수
    MAX_ACCUMULATE_TIME = 60        # 동일 활동은 최대 60초 단위로 합산하여 하나의 로그로 저장
    
    current_activity = None         # 현재 측정 및 합산 중인 활동 객체
    prev_category = None            # 이전 주기에서의 카테고리 상태 (유휴 -> 업무 전환 감지용)
    recent_idle_activities = []     # 이번 유휴 구간 동안 생성된 모든 유휴 활동 (복귀 시 사유 일괄 기입용)
    is_overlay_active = False
    
    persistent_break_reason = None
    persistent_break_detail = None
    work_start_time_after_break = 0.0
    
    # 자체 2차 유휴 감지를 위한 상태 변수 (OS API 오작동 방지)
    last_active_time = time.time()
    last_mouse_pos = None
    last_window_title = ""
    prev_key_states = {}  # Tracks previous key states for activity detection
    
    # 전역 IDLE_THRESHOLD 사용 (서버에서 동적으로 갱신됨)
    last_settings_check = 0.0
    last_command_check = 0.0
    fetch_agent_settings()
    send_startup_ping()
    check_agent_commands()
    last_settings_check = time.time()
    last_command_check = time.time()
    
    current_activity_start_time = time.time()
    last_send_time = time.time() - SEND_INTERVAL  # 처음 수집된 활동을 즉시 서버로 전송하기 위해
    first_activity_sent = False
    
    while True:
        try:
            start_check = time.time()
            
            # 1. 활성 창 및 프로세스 정보 획득
            process_name, window_title = get_active_window()
            
            domain = ""
            if process_name and window_title is not None:
                is_browser = any(bp in process_name for bp in BROWSER_PROCESSES)
                if is_browser:
                    domain = extract_domain_from_title(window_title, process_name)
            
            # 사용자 마우스/키보드 유휴 시간 확인 (OS API 기준)
            os_idle_seconds = get_idle_time_seconds()
            
            # --- 2차 자체 활동 감지 보강 (OS API 오작동 및 권한 격리 대비) ---
            current_time = time.time()
            mouse_moved = False
            window_changed = False
            
            # 1) 마우스 좌표 변화 및 전역 입력 감지 (윈도우 전용)
            if CURRENT_OS == "Windows":
                try:
                    import win32gui
                    import win32api
                    
                    # 마우스 좌표 이동 감지
                    curr_pos = win32gui.GetCursorPos()
                    if last_mouse_pos is not None and curr_pos != last_mouse_pos:
                        mouse_moved = True
                    last_mouse_pos = curr_pos
                    
                    # 마우스 클릭 감지 (왼쪽=0x01, 오른쪽=0x02)
                    if (win32api.GetAsyncKeyState(0x01) & 0x8000) or (win32api.GetAsyncKeyState(0x02) & 0x8000):
                        mouse_moved = True
                        
                    # 주요 키보드 입력 전역 비동기 감지
                    KEYS_TO_CHECK = [
                        0x20, 0x0D, 0x08, 0x09,  # Space, Enter, Backspace, Tab
                        0xA0, 0xA1, 0xA2, 0xA3,  # L/R Shift, L/R Ctrl
                        0x25, 0x26, 0x27, 0x28,  # Left, Up, Right, Down
                        *range(0x41, 0x5B),      # A to Z
                        *range(0x30, 0x3A)       # 0 to 9
                    ]
                    for key in KEYS_TO_CHECK:
                        if win32api.GetAsyncKeyState(key) & 0x8000:
                            mouse_moved = True
                            break
                except Exception:
                    pass
            
            # 2) 활성 창 제목 변화 감지
            if window_title and window_title != last_window_title:
                window_changed = True
                last_window_title = window_title
            
            # 활동 감지 시 자체 타이머 및 OS idle 강제 보정
            if mouse_moved or window_changed or is_video_or_meeting_active(process_name, window_title, domain) or process_name == "admin_process":
                last_active_time = current_time
                os_idle_seconds = 0.0  # 현재 활동 중이므로 OS 유휴 시간을 즉시 리셋해줌
                
            custom_idle_seconds = current_time - last_active_time
            
            # 최종 유휴 시간은 OS API 기준과 자체 감지 기준 중 최소값으로 설정
            idle_seconds = min(os_idle_seconds, custom_idle_seconds)
            
            # 컴퓨터 부팅/에이전트 시작 직후 10분 즉시 자리비움 오류 방지:
            # os_idle_seconds가 아무리 길어도, custom_idle_seconds가 짧다면(방금 앱 실행 등)
            # 사용 중인 것으로 간주하여 idle_seconds를 0으로 강제 보정
            if custom_idle_seconds < 5.0 and os_idle_seconds > 300:
                os_idle_seconds = 0.0
                idle_seconds = 0.0
            
            # 오버레이 상태 기획 변경: 사유를 전송하기 전까지는 마우스/키보드를 조작해도 오버레이를 닫지 않고 유휴(idle) 상태 유지
            if is_overlay_active:
                if _overlay_result.get("reason"):
                    tmp_reason = _overlay_result.get("reason")
                    tmp_detail = _overlay_result.get("detail")
                    for act in recent_idle_activities:
                        if not act.get("idle_reason"):
                            act["idle_reason"] = tmp_reason
                            act["idle_detailed_reason"] = tmp_detail
                    for act in reversed(activity_buffer):
                        if act["category"] == "idle":
                            if not act.get("idle_reason"):
                                act["idle_reason"] = tmp_reason
                                act["idle_detailed_reason"] = tmp_detail
                        else:
                            break
            
                if _overlay_result.get("submitted"):
                    is_overlay_active = False
                    is_afk = False
                    # 복귀 시 자체 타이머 및 마우스 좌표 초기화로 즉시 재진입 차단
                    last_active_time = time.time()
                    os_idle_seconds = 0.0
                    idle_seconds = 0.0
                    if CURRENT_OS == "Windows":
                        try:
                            import win32gui
                            last_mouse_pos = win32gui.GetCursorPos()
                        except Exception:
                            pass
                else:
                    is_afk = True
            else:
                is_afk = idle_seconds > IDLE_THRESHOLD
            
            if not is_afk:
                if process_name and window_title is not None:
                    category = determine_category(process_name, window_title, domain)
                else:
                    category = prev_category if prev_category and prev_category != "idle" else "work"
                    process_name = "system_process" if not process_name else process_name
                    window_title = "시스템 화면(UAC 등)" if not window_title else window_title
                    domain = ""
            else:
                category = "idle"
                process_name = "system_idle" if not process_name else process_name
                window_title = "자리비움 또는 화면 잠금" if not window_title else window_title
                domain = ""

            # --- 자리비움 → 업무 전환 감지 (복귀) ---
            if prev_category == "idle" and category != "idle":
                _overlay_stop_evt.set()  # 오버레이가 아직 열려있으면 닫기 신호
                logging.info("자리비움에서 업무 상태로 복귀 감지.")
                try:
                    if _overlay_result.get("submitted"):
                        reason = _overlay_result.get("reason")
                        detail = _overlay_result.get("detail")
                        logging.info(f"오버레이에서 수집된 사유: {reason} | {detail}")
                    else:
                        reason, detail = show_idle_reason_dialog(AGENT_LANG)
                    if reason:
                        logging.info(f"선택된 자리비움 사유: {reason} | 상세: {detail}")
                        
                        # 1) 이번 유휴 구간 동안 current_activity였거나 activity_buffer에 들어간 idle 활동들에 사유 기입
                        for act in recent_idle_activities:
                            act["idle_reason"] = reason
                            act["idle_detailed_reason"] = detail
                        
                        # 2) 이중 보장: 버퍼 끝쪽의 idle 항목들 재탐색 및 사유 보강
                        for act in reversed(activity_buffer):
                            if act["category"] == "idle":
                                if not act.get("idle_reason"):
                                    act["idle_reason"] = reason
                                    act["idle_detailed_reason"] = detail
                            else:
                                break
                except Exception as dlg_err:
                    logging.error(f"자리비움 사유 다이얼로그 처리 중 에러: {dlg_err}", exc_info=True)
                
                # 복귀 완료 후 최근 유휴 활동 리스트 초기화
                recent_idle_activities = []

            # 새로운 자리비움 구간 진입 시 초기화 및 오버레이 표시
            if category == "idle" and prev_category != "idle":
                recent_idle_activities = []
                is_overlay_active = True
                _overlay_stop_evt.clear()
                _overlay_result.update({"reason": None, "detail": None, "submitted": False})
                try:
                    init_away_overlay(AGENT_LANG, time.time(), _overlay_stop_evt, _overlay_result)
                    logging.info("자리비움 진입: 전체화면 오버레이 표시")
                except Exception as e:
                    logging.error(f"오버레이 표시 오류: {e}")


            # --- 활동 집계 및 버퍼 추가 로직 ---
            is_same_activity = False
            if current_activity is not None:
                is_same_activity = (
                    current_activity["process_name"] == process_name and
                    current_activity["window_title"] == window_title and
                    current_activity["category"] == category and
                    current_activity["domain"] == domain
                )

            current_time = time.time()
            if current_activity is not None and is_same_activity and (current_time - current_activity_start_time) < MAX_ACCUMULATE_TIME:
                # 동일 활동이며 아직 최대 누적 시간에 도달하지 않음 -> 실제 경과 시간 반영
                current_activity["duration_seconds"] = max(1, int(round(current_time - current_activity_start_time)))
            else:
                # 활동이 바뀌었거나 60초가 차서 완료됨 -> 기존 활동이 존재하면 버퍼에 추가
                if current_activity is not None:
                    current_activity["duration_seconds"] = max(1, int(round(current_time - current_activity_start_time)))
                    buffer_append(current_activity)
                    if current_activity["category"] == "idle":
                        recent_idle_activities.append(current_activity)
                
                # 새로운 활동 측정 시작
                current_activity_start_time = current_time
                
                # 오버레이가 활성화되어 있고 사유가 선택된 경우, 즉시 새 활동에 사유 반영
                current_idle_reason = None
                current_idle_detail = None
                if is_overlay_active and _overlay_result.get("reason"):
                    current_idle_reason = _overlay_result.get("reason")
                    current_idle_detail = _overlay_result.get("detail")
                
                current_activity = {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "duration_seconds": 0, # 임시 0
                    "process_name": process_name,
                    "window_title": window_title,
                    "category": category,
                    "domain": domain,
                    "idle_reason": current_idle_reason,
                    "idle_detailed_reason": current_idle_detail
                }

            if current_activity["duration_seconds"] == 0:
                current_activity["duration_seconds"] = max(1, int(round(time.time() - current_activity_start_time)))

            logging.debug(f"[수집] {process_name} | {window_title[:30]}... | 카테고리: {category} | 도메인: {domain} | 시간: {current_activity['duration_seconds']}초")
            prev_category = category

            # 2. 전송 주기 판단 및 전송 (실패 후 백오프가 진행 중이면 대기)
            current_time = time.time()
            send_eligible = current_time >= next_send_time
            if send_eligible and (current_time - last_send_time >= SEND_INTERVAL or (not first_activity_sent and len(activity_buffer) > 0)):
                if activity_buffer:
                    send_data_to_server()
                    recent_idle_activities = []
                    first_activity_sent = True
                else:
                    last_send_time = time.time()

            # 2b. 에이전트 설정 동기화 (5분마다)
            if current_time - last_settings_check >= SETTINGS_POLL_INTERVAL:
                fetch_agent_settings()
                last_settings_check = current_time

            # 2c. 관리자 명령 폴링 (30초마다)
            if current_time - last_command_check >= COMMAND_POLL_INTERVAL:
                check_agent_commands()
                last_command_check = current_time

            # 3. 주기 유지를 위한 정밀 슬립 계산 (초단위 측정을 위해 1초 주기로 실행하며 GUI 업데이트 병행)
            elapsed = time.time() - start_check
            sleep_time = max(0.01, 1.0 - elapsed)
            
            wait_start = time.time()
            while time.time() - wait_start < sleep_time:
                for r in list(active_tk_roots):
                    try:
                        if r.winfo_exists():
                            r.update()
                        else:
                            active_tk_roots.remove(r)
                    except Exception:
                        if r in active_tk_roots:
                            active_tk_roots.remove(r)
                time.sleep(0.05)

        except KeyboardInterrupt:
            logging.info("에이전트가 사용자에 의해 종료되었습니다.")
            # 종료 전 측정 중이던 마지막 활동과 남은 버퍼 전송 시도
            if current_activity is not None:
                current_activity["duration_seconds"] = max(1, int(round(time.time() - current_activity_start_time)))
                buffer_append(current_activity)
            if activity_buffer:
                send_data_to_server()
            break
        except Exception as e:
            logging.error(f"메인 루프 에러 발생: {e}", exc_info=True)
            time.sleep(LOOP_INTERVAL)

if __name__ == "__main__":
    main()

