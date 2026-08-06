#!/bin/bash
# build_windows.sh - Windows용 PGuard Agent 빌드 스크립트

set -e

echo "========================================"
echo "  PGuard Agent Windows Build Script"
echo "========================================"

# Flutter 버전 확인
flutter --version

# 의존성 설치
echo "📦 의존성 설치 중..."
flutter pub get

# 코드 생성 (l10n 등)
echo "🔧 코드 생성 중..."
flutter pub run intl_utils:generate 2>/dev/null || true

# Windows 빌드 (릴리즈 모드)
echo "🏗️ Windows 릴리즈 빌드 중..."
flutter build windows --release

# 빌드 결과 확인
BUILD_DIR="build/windows/x64/runner/Release"
if [ -d "$BUILD_DIR" ]; then
    echo "✅ 빌드 성공!"
    echo "📁 실행 파일 위치: $BUILD_DIR/pguard_agent.exe"
    
    # 파일 크기 확인
    SIZE=$(du -h "$BUILD_DIR/pguard_agent.exe" | cut -f1)
    echo "📦 파일 크기: $SIZE"
    
    # 필요한 DLL들 확인
    echo "📋 포함된 DLL:"
    ls -la "$BUILD_DIR"/*.dll 2>/dev/null | head -20
else
    echo "❌ 빌드 실패: $BUILD_DIR를 찾을 수 없습니다."
    exit 1
fi

# 배포용 폴더 생성
DIST_DIR="dist/windows"
mkdir -p "$DIST_DIR"
cp -r "$BUILD_DIR"/* "$DIST_DIR"/
echo "📦 배포 패키지 생성: $DIST_DIR"

echo ""
echo "========================================"
echo "  빌드 완료!"
echo "========================================"
echo "배포 방법:"
echo "  1. $DIST_DIR 폴더 전체를 타겟 PC로 복사"
echo "  2. pguard_agent.exe 실행 (최초 1회 관리자 권한 권장)"
echo "  3. 설정 마법사에서 연동 정보 입력"
echo "  4. 자동으로 백그라운드 모드 전환 및 시작프로그램 등록"