# 코드 서명 및 배포 가이드

## Windows 코드 서명

### 1. 인증서 구매
- **EV(Extended Validation) 코드 서명 인증서** 권장 (SmartScreen 즉시 통과)
- 추천 벤더: DigiCert, Sectigo, SSL.com
- 비용: ~$200-500/년

### 2. 서명 도구 설치
Windows SDK 설치 시 `signtool.exe` 포함
```
C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe
```

### 3. EXE 서명
```powershell
# 테스트 인증서 생성 (개발용)
makecert -r -pe -n "CN=PGuard Test" -ss My -sr CurrentUser -a sha256 -sky signature -cy authority -sv pguard.pvk pguard.cer
pvk2pfx -pvk pguard.pvk -spc pguard.cer -pfx pguard.pfx -po password

# 서명
signtool sign /f pguard.pfx /p password /t http://timestamp.digicert.com /fd sha256 "build\windows\x64\runner\Release\pguard_agent.exe"

# 서명 확인
signtool verify /pa "build\windows\x64\runner\Release\pguard_agent.exe"
```

### 4. MSI 설치 프로그램 생성 (선택사항)
WiX Toolset 사용:
```xml
<!-- Product.wxs -->
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="PGuard Agent" Version="1.0.0" Manufacturer="PGuard" Language="1033" Codepage="1252">
    <Package InstallerVersion="200" Compressed="yes" InstallScope="perUser" />
    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />
    <MediaTemplate />
    <Feature Id="ProductFeature" Title="PGuard Agent" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>
  </Product>
  <Fragment>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="LocalAppDataFolder">
        <Directory Id="INSTALLFOLDER" Name="PGuardAgent" />
      </Directory>
    </Directory>
  </Fragment>
  <Fragment>
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="MainExecutable">
        <File Source="build\windows\x64\runner\Release\pguard_agent.exe" />
      </Component>
    </ComponentGroup>
  </Fragment>
</Wix>
```

### 5. SmartScreen 우회
- EV 인증서 사용 시 즉시 통과
- 일반 인증서는 사용자 신뢰 쌓기 필요 (수백~수천 다운로드 후 통과)

---

## macOS 코드 서명 및 공증(Notarization)

### 1. Apple Developer 프로그램 가입
- 비용: $99/년
- https://developer.apple.com/programs/

### 2. 인증서 생성
Xcode → Preferences → Accounts → Manage Certificates
- **Developer ID Application**: 앱 배포용
- **Developer ID Installer**: 패키지 배포용

### 3. Xcode에서 서명 설정
```bash
# Xcode에서 자동 서명 활성화
# Runner.xcodeproj → Signing & Capabilities → Team 선택

# 수동 서명 시
codesign --force --deep --sign "Developer ID Application: PGuard Inc." \
  --options runtime --timestamp \
  build/macos/Build/Products/Release/pguard_agent.app
```

### 4. 앱 패키징 (DMG)
```bash
# DMG 생성
hdiutil create -volname "PGuard Agent Installer" \
  -srcfolder "build/macos/Build/Products/Release/pguard_agent.app" \
  -ov -format UDZO "dist/macos/PGuardAgent.dmg"

# DMG 서명
codesign --sign "Developer ID Application: PGuard Inc." \
  --timestamp "dist/macos/PGuardAgent.dmg"
```

### 5. 공증(Notarization) 제출
```bash
# 키체인에 Apple ID 추가
xcrun notarytool store-credentials "pguard-profile" \
  --apple-id "your@email.com" \
  --team-id "XXXXXXXXXX" \
  --password "app-specific-password"

# 공증 제출
xcrun notarytool submit "dist/macos/PGuardAgent.dmg" \
  --keychain-profile "pguard-profile" --wait

# 공증 스티플 (필수)
xcrun stapler staple "dist/macos/PGuardAgent.dmg"
xcrun stapler staple "build/macos/Build/Products/Release/pguard_agent.app"

# 확인
spctl -a -vv "build/macos/Build/Products/Release/pguard_agent.app"
```

### 6. Gatekeeper 우회 (비공증 앱)
사용자가 최초 실행 시:
```bash
# 격리 속성 제거
sudo xattr -rd com.apple.quarantine /Applications/PGuardAgent.app
```

---

## 빌드 체크리스트

### Windows 빌드 전 확인
- [ ] Visual Studio 2022 설치 (C++ 데스크톱 개발)
- [ ] `flutter config --enable-windows-desktop` 실행
- [ ] `flutter doctor`에서 Windows  toolchain 확인

### macOS 빌드 전 확인
- [ ] macOS 하드웨어 (MacBook, iMac, Mac mini)
- [ ] Xcode 설치 및 `xcode-select --install`
- [ ] Apple Developer 프로그램 가입

### 빌드 실행
```bash
# Windows
flutter build windows --release

# macOS
flutter build macos --release
```

---

## 자동 시작 등록

### Windows (레지스트리)
Flutter 앱에서 자동 등록:
```dart
// 이미 windows_monitor.dart에 구현됨
final key = Registry.openPath(
  Registry.currentUser.path + r'\Software\Microsoft\Windows\CurrentVersion\Run',
  access: RegistryKeyAccess.write,
);
key.setStringValue('PGuardAgent', '"$exePath" --background');
```

### macOS (LaunchAgent)
```xml
<!-- ~/Library/LaunchAgents/com.pguard.agent.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pguard.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/PGuardAgent.app/Contents/MacOS/pguard_agent</string>
        <string>--background</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```