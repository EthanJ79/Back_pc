#!/bin/bash
# build_macos.sh - macOS용 PGuard Agent 빌드 스크립트

set -e

echo "========================================"
echo "  PGuard Agent macOS Build Script"
echo "========================================"

# macOS에서만 실행 가능 확인
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 이 스크립트는 macOS에서만 실행 가능합니다."
    echo "   Windows에서는 'flutter build macos'가 작동하지 않습니다."
    exit 1
fi

# Flutter 버전 확인
flutter --version

# 의존성 설치
echo "📦 의존성 설치 중..."
flutter pub get

# 코드 생성
echo "🔧 코드 생성 중..."
flutter pub run intl_utils:generate 2>/dev/null || true

# macOS 빌드 (릴리즈 모드)
echo "🏗️ macOS 릴리즈 빌드 중..."
flutter build macos --release

# 빌드 결과 확인
BUILD_DIR="build/macos/Build/Products/Release"
APP_NAME="pguard_agent.app"
APP_PATH="$BUILD_DIR/$APP_NAME"

if [ -d "$APP_PATH" ]; then
    echo "✅ 빌드 성공!"
    echo "📁 앱 위치: $APP_PATH"
    
    # 앱 크기 확인
    SIZE=$(du -sh "$APP_PATH" | cut -f1)
    echo "📦 앱 크기: $SIZE"
    
    # 격리 속성 제거 안내
    echo ""
    echo "⚠️  중요: macOS 보안 설정 (Gatekeeper 우회)"
    echo "   배포 전 다음 명령어로 격리 속성을 제거하세요:"
    echo "   sudo xattr -rd com.apple.quarantine \"$APP_PATH\""
    echo ""
    echo "   실행 권한 부여:"
    echo "   chmod -R 755 \"$APP_PATH\""
else
    echo "❌ 빌드 실패: $APP_PATH를 찾을 수 없습니다."
    exit 1
fi

# 배포용 DMG 생성 (선택사항)
read -p "DMG 설치 이미지를 생성하시겠습니까? (y/N): " CREATE_DMG
if [[ "$CREATE_DMG" =~ ^[Yy]$ ]]; then
    DMG_DIR="dist/macos"
    mkdir -p "$DMG_DIR"
    
    DMG_NAME="PGuardAgent-1.0.0.dmg"
    echo "📦 DMG 생성 중..."
    
    hdiutil create -volname "PGuard Agent Installer" \
        -srcfolder "$APP_PATH" \
        -ov -format UDZO \
        "$DMG_DIR/$DMG_NAME"
    
    echo "✅ DMG 생성 완료: $DMG_DIR/$DMG_NAME"
fi

echo ""
echo "========================================"
echo "  빌드 완료!"
echo "========================================"
echo "배포 방법:"
echo "  1. $APP_PATH를 타겟 Mac의 Applications 폴더로 복사"
echo "  2. 우클릭 > '열기' 로 최초 실행 (Gatekeeper 승인)"
echo "  3. 시스템 설정 > 개인정보 보호 및 보안 > 접근성에서 PGuardAgent 허용"
echo "  4. 설정 마법사에서 연동 정보 입력"
echo "  5. 자동으로 백그라운드 데몬(LaunchAgent) 등록"
echo ""
echo "권한 설정 (최초 1회):"
echo "  sudo xattr -rd com.apple.quarantine /Applications/PGuardAgent.app"
echo "  chmod -R 755 /Applications/PGuardAgent.app"