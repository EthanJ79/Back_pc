#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import platform
import subprocess
import shutil

def log(msg, level="INFO"):
    colors = {
        "INFO": "\033[94m[INFO]\033[0m",
        "SUCCESS": "\033[92m[SUCCESS]\033[0m",
        "WARNING": "\033[93m[WARNING]\033[0m",
        "ERROR": "\033[91m[ERROR]\033[0m"
    }
    prefix = colors.get(level, f"[{level}]")
    print(f"{prefix} {msg}")

def check_os():
    current_os = platform.system()
    log(f"감지된 운영체제: {current_os}", "INFO")
    if current_os != "Darwin":
        log("주의: 이 빌드 스크립트는 macOS 환경에서 실행하도록 설계되었습니다.", "WARNING")
        log("현재 시스템에서는 빌드가 정상적으로 수행되지 않거나, 생성된 앱이 macOS에서 작동하지 않을 수 있습니다.", "WARNING")
        confirm = input("계속 진행하시겠습니까? (y/N): ").strip().lower()
        if confirm != 'y':
            log("빌드 작업을 취소합니다.", "INFO")
            sys.exit(0)

def install_dependencies():
    log("필수 의존성 패키지 점검 중...", "INFO")
    required_packages = ["pyinstaller", "requests", "psutil"]
    
    # macOS에서는 PyObjC가 필요함
    if platform.system() == "Darwin":
        required_packages.append("pyobjc")

    missing_packages = []
    for pkg in required_packages:
        try:
            if pkg == "pyobjc":
                import AppKit
            else:
                __import__(pkg)
        except ImportError:
            missing_packages.append(pkg)

    if missing_packages:
        log(f"누락된 패키지 감지: {missing_packages}", "WARNING")
        log("패키지 자동 설치를 시도합니다...", "INFO")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", *missing_packages])
            log("의존성 패키지 설치 완료.", "SUCCESS")
        except Exception as e:
            log(f"패키지 설치 실패: {e}", "ERROR")
            log("수동으로 'pip install " + " ".join(missing_packages) + "'를 실행해 주세요.", "ERROR")
            sys.exit(1)
    else:
        log("모든 필수 의존성 패키지가 충족되었습니다.", "SUCCESS")

def clean_previous_builds():
    log("이전 빌드 파일 청소 중...", "INFO")
    paths_to_clean = ["build", "dist", "PGuardAgent.spec"]
    for path in paths_to_clean:
        if os.path.exists(path):
            try:
                if os.path.isdir(path):
                    shutil.rmtree(path)
                else:
                    os.remove(path)
                log(f"삭제 완료: {path}", "INFO")
            except Exception as e:
                log(f"삭제 중 오류 발생 ({path}): {e}", "WARNING")

def run_pyinstaller():
    log("PyInstaller를 이용한 macOS 앱 번들(.app) 빌드를 시작합니다...", "INFO")
    
    # pyinstaller가 설치되었는지 확인 후 경로 획득
    pyinstaller_bin = shutil.which("pyinstaller")
    if not pyinstaller_bin:
        # pip로 설치된 경우 python -m PyInstaller 형식으로 실행 가능
        pyinstaller_cmd = [sys.executable, "-m", "PyInstaller"]
    else:
        pyinstaller_cmd = [pyinstaller_bin]

    # 빌드 옵션 구성
    cmd = pyinstaller_cmd + [
        "--noconsole",                           # 백그라운드로 작동 (터미널 창 미오픈)
        "--onefile",                             # 단일 바이너리 패키징
        "--name=PGuardAgent",                    # 생성할 실행 파일/앱 이름
        "--osx-bundle-identifier=com.pguard.agent", # macOS 고유 번들 식별자
        "agent.py"                               # 타겟 스크립트
    ]

    log(f"실행 명령어: {' '.join(cmd)}", "INFO")
    
    try:
        # 빌드 프로세스 실행
        subprocess.check_call(cmd)
        log("PyInstaller 컴파일 성공!", "SUCCESS")
    except subprocess.CalledProcessError as e:
        log(f"PyInstaller 컴파일 오류 발생: {e}", "ERROR")
        sys.exit(1)

def verify_and_post_process():
    dist_dir = "dist"
    app_path = os.path.join(dist_dir, "PGuardAgent.app")
    
    if os.path.exists(app_path):
        log(f"성공적으로 macOS 애플리케이션이 빌드되었습니다: {app_path}", "SUCCESS")
        
        # macOS의 경우, translocate(격리) 및 미인증 개발자 검증 우회를 위해 격리 해제 명령어 안내
        log("="*60, "SUCCESS")
        log("macOS 보안 경고 해제 및 권한 설정 안내", "SUCCESS")
        log("="*60, "SUCCESS")
        log("1. 보안 격리 속성 제거 (게이트키퍼 경고 우회):", "INFO")
        log(f"   sudo xattr -rd com.apple.quarantine {app_path}", "INFO")
        log("2. 애플리케이션 실행 권한 부여:", "INFO")
        log(f"   chmod -R 755 {app_path}", "INFO")
        log("3. 이제 Finder에서 PGuardAgent.app을 더블 클릭하여 편리하게 실행하실 수 있습니다.", "INFO")
        log("="*60, "SUCCESS")
    else:
        # --onefile로 빌드하면 Darwin이 아닌 환경에서는 .app 대신 실행 파일 형태로 나옵니다.
        exe_path = os.path.join(dist_dir, "PGuardAgent")
        if os.path.exists(exe_path):
            log(f"실행 파일은 빌드되었으나 macOS .app 번들 구조가 아닙니다: {exe_path}", "WARNING")
            log("macOS 환경에서 실행해야 정상적으로 .app 구조를 지닌 번들이 생성됩니다.", "WARNING")
        else:
            log("빌드 결과물을 찾을 수 없습니다. 빌드 도중 문제가 있었는지 확인하십시오.", "ERROR")

def main():
    print("="*60)
    print("      PGuard Agent macOS Application (.app) Builder      ")
    print("="*60)
    
    check_os()
    install_dependencies()
    clean_previous_builds()
    run_pyinstaller()
    verify_and_post_process()

if __name__ == "__main__":
    main()
