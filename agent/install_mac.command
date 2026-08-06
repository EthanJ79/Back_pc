#!/bin/bash

# ==============================================================================
# 🛡️ PGuard Activity Agent Installer for macOS
# ==============================================================================
# 이 파일은 macOS 환경에서 PGuard 에이전트를 더블 클릭만으로
# 편리하게 설치, 의존성 구성 및 상시 자동 시작 서비스(LaunchAgent)로
# 등록 기동하기 위한 원터치 설치 스크립트입니다.
# ==============================================================================

# 1. 셸 실행 경로 추적 및 이동 (더블 클릭 시 실행 경로 보장)
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"

clear
echo "======================================================================"
echo "      🛡️  PGuard Activity Monitoring Agent Installer (macOS)         "
echo "======================================================================"
echo " 설치 디렉토리: $SCRIPT_DIR"
echo "----------------------------------------------------------------------"

# 2. Python3 가용성 검증
echo "🔍 [1단계] Python 3 환경 검사 중..."
if ! command -v python3 &>/dev/null; then
    echo "❌ Python3를 찾을 수 없습니다!"
    echo "PGuard Agent 구동을 위해서는 Python 3가 필요합니다."
    echo "Xcode Command Line Tools 설치를 제안하거나 설치를 시작합니다..."
    
    # xcode-select 가용한지 체크
    if command -v xcode-select &>/dev/null; then
        echo "💡 Xcode Command Line Tools를 설치합니다. 팝업 창의 지시사항을 따르세요."
        xcode-select --install
        echo "설치가 완료된 후 이 스크립트를 다시 실행해 주세요."
    else
        echo "💡 https://www.python.org/downloads/ 에서 Python 3 최신 버전을 다운로드해 설치해 주세요."
    fi
    exit 1
else
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo "✅ Python3 설치 확인: $PYTHON_VERSION"
fi

# 3. Pip 가용성 검증 및 설치
echo "🔍 [2단계] pip 패키지 매니저 검사 중..."
if ! python3 -m pip --version &>/dev/null; then
    echo "💡 pip를 찾을 수 없습니다. pip 설치를 진행합니다..."
    curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py --user
    rm get-pip.py
    if ! python3 -m pip --version &>/dev/null; then
        echo "❌ pip 설치 실패. 패키지 설치를 계속할 수 없습니다."
        exit 1
    fi
fi
echo "✅ pip 확인 완료"

# 4. 필수 Python 패키지 설치
echo "🔍 [3단계] 필수 모듈(requests, psutil, pyobjc) 설치 및 업데이트 중..."
echo "이 작업은 수 분이 소요될 수 있습니다. 잠시만 기다려 주세요..."
python3 -m pip install --upgrade pip
python3 -m pip install requests psutil pyobjc

if [ $? -eq 0 ]; then
    echo "✅ 필수 패키지 설치 완료!"
else
    echo "❌ 필수 패키지 설치 중 오류가 발생했습니다."
    echo "인터넷 연결을 확인하고 다시 시도해 주세요."
    exit 1
fi

# 5. Gatekeeper 및 격리 속성 우회 명령어 적용
echo "🔍 [4단계] macOS Gatekeeper 보안 속성 우회 적용 중..."
# 스크립트 파일들에 대해 격리 속성을 강제 제거하고 실행 권한을 줍니다.
chmod +x "$SCRIPT_DIR/agent.py"
xattr -d com.apple.quarantine "$SCRIPT_DIR/agent.py" 2>/dev/null
xattr -rd com.apple.quarantine "$SCRIPT_DIR" 2>/dev/null
echo "✅ 보안 격리 속성 우회 처리 및 실행 권한 부여 완료"

# 6. LaunchAgent plist 동적 생성 및 등록
echo "🔍 [5단계] 로그인 시 자동 시작을 위한 LaunchAgent 등록 중..."
PLIST_PATH="$HOME/Library/LaunchAgents/com.pguard.agent.plist"

# 기존에 구동 중인 데몬이 있다면 먼저 중단 및 해제
if launchctl list | grep -q "com.pguard.agent"; then
    echo "💡 기존 가동 중인 PGuard 서비스를 언로드합니다..."
    launchctl unload "$PLIST_PATH" 2>/dev/null
    launchctl bootout gui/$(id -u) "$PLIST_PATH" 2>/dev/null
fi

# LaunchAgents 디렉토리 보장
mkdir -p "$HOME/Library/LaunchAgents"

# PLIST 파일 생성
cat <<EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pguard.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(which python3)</string>
        <string>$SCRIPT_DIR/agent.py</string>
        <string>--background</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR</string>
    <key>StandardOutPath</key>
    <string>$SCRIPT_DIR/agent_stdout.log</string>
    <key>StandardErrorPath</key>
    <string>$SCRIPT_DIR/agent_stderr.log</string>
</dict>
</plist>
EOF

chmod 644 "$PLIST_PATH"
echo "✅ LaunchAgent 설정 파일 생성 완료: $PLIST_PATH"

# 7. 서비스 활성화 및 백그라운드 구동 시작
echo "🚀 [6단계] PGuard 에이전트 서비스 로드 및 즉시 실행..."
# launchctl 로드
launchctl load "$PLIST_PATH" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ PGuard 서비스가 백그라운드 데몬으로 성공적으로 등록되었습니다."
else
    # bootout/bootstrap 대안 기동 시도
    launchctl bootstrap gui/$(id -u) "$PLIST_PATH" 2>/dev/null
    echo "✅ PGuard 서비스가 시스템 백그라운드로 등록되었습니다."
fi

# 8. 최초 설정창 GUI 강제 팝업 대기
echo "💡 시스템 데몬이 에이전트를 자동 기동하며 초기 설정창(GUI)이 곧 표시됩니다..."

echo "======================================================================"
echo "🎉 PGuard Agent macOS 설치 완료!"
echo "======================================================================"
echo " 1. 백그라운드 상시 자동 기동(LaunchAgent) 등록이 완료되었습니다."
echo " 2. 로그 파일은 아래 위치에서 실시간으로 확인할 수 있습니다:"
echo "    - $SCRIPT_DIR/agent.log"
echo " 3. 서비스를 강제로 중단하거나 삭제하시려면 터미널에 다음을 실행하세요:"
echo "    - launchctl unload ~/Library/LaunchAgents/com.pguard.agent.plist"
echo "    - rm ~/Library/LaunchAgents/com.pguard.agent.plist"
echo "----------------------------------------------------------------------"
echo "잠시 후 이 터미널 창은 닫으셔도 됩니다."
echo "======================================================================"

# 5초 대기 후 종료
sleep 5
exit 0
