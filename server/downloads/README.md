# 에이전트 배포 파일 위치

이 폴더의 파일은 `/download/<파일명>` 경로로 제공됩니다.
대시보드의 "에이전트 다운로드" 화면이 아래 파일을 링크합니다.

- `PGuardAgent-Windows.zip`  ← Windows 빌드 산출물 압축
- `PGuardAgent-macOS.zip`    ← macOS 빌드 산출물 압축

## 빌드 방법 (pguard_agent_flutter)
- Windows:  flutter build windows --release
  → build/windows/x64/runner/Release/ 폴더 전체를 zip 하여 PGuardAgent-Windows.zip 로 배치
- macOS:    flutter build macos --release
  → build/macos/Build/Products/Release/PGuardAgent.app 을 zip 하여 PGuardAgent-macOS.zip 로 배치

zip 바이너리는 용량이 커서 git 에 커밋하지 않습니다(.gitignore). 배포 서버에 직접 배치하세요.
