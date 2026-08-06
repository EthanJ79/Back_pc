// lib/core/monitor/category_classifier.dart
// Ported from Python agent.py determine_category function

import 'domain_extractor.dart';

class CategoryClassifier {
  static const List<String> workProcesses = [
    'code.exe', 'code', 'vscode',
    'devenv.exe', 'devenv', 'visualstudio',
    'idea.exe', 'idea', 'intellij',
    'pycharm.exe', 'pycharm',
    'webstorm.exe', 'webstorm',
    'androidstudio.exe', 'androidstudio',
    'eclipse.exe', 'eclipse',
    'sublime_text.exe', 'sublime_text', 'sublime',
    'notepad++.exe', 'notepad++',
    'vim.exe', 'vim', 'nvim.exe', 'nvim',
    'git.exe', 'git',
    'cmd.exe', 'cmd', 'powershell.exe', 'powershell', 'pwsh.exe', 'pwsh',
    'wt.exe', 'wt', 'windowsterminal.exe', 'windowsterminal',
    'mintty.exe', 'mintty',
    'putty.exe', 'putty',
    'winscp.exe', 'winscp',
    'filezilla.exe', 'filezilla',
    'docker.exe', 'docker', 'docker desktop.exe', 'docker desktop',
    'postman.exe', 'postman',
    'insomnia.exe', 'insomnia',
    'dbeaver.exe', 'dbeaver',
    'datagrip.exe', 'datagrip',
    'sqlplus.exe', 'sqlplus',
    'mysql.exe', 'mysql',
    'redis-cli.exe', 'redis-cli',
    'nginx.exe', 'nginx',
    'apache.exe', 'apache', 'httpd.exe', 'httpd',
    'node.exe', 'node', 'npm.exe', 'npm', 'npx.exe', 'npx',
    'python.exe', 'python', 'python3.exe', 'python3',
    'pip.exe', 'pip', 'pip3.exe', 'pip3',
    'java.exe', 'java', 'javac.exe', 'javac',
    'mvn.exe', 'mvn', 'gradle.exe', 'gradle',
    'dotnet.exe', 'dotnet',
    'go.exe', 'go', 'go.exe',
    'rustc.exe', 'rustc', 'cargo.exe', 'cargo',
    'gcc.exe', 'gcc', 'g++.exe', 'g++', 'clang.exe', 'clang',
    'make.exe', 'make', 'cmake.exe', 'cmake',
    'excel.exe', 'excel',
    'winword.exe', 'winword', 'word',
    'powerpnt.exe', 'powerpnt', 'powerpoint',
    'outlook.exe', 'outlook',
    'onenote.exe', 'onenote',
    'teams.exe', 'teams', 'ms-teams.exe', 'ms-teams',
    'zoom.exe', 'zoom',
    'slack.exe', 'slack',
    'discord.exe', 'discord',
    'skype.exe', 'skype',
    'webex.exe', 'webex',
    'chrome.exe', 'chrome', 'msedge.exe', 'msedge', 'firefox.exe', 'firefox',
    'safari', 'safari.exe',
    'explorer.exe', 'explorer',
    'notepad.exe', 'notepad',
    'calc.exe', 'calc', 'calculator.exe', 'calculator',
    'mspaint.exe', 'mspaint',
    'snippingtool.exe', 'snippingtool',
    'taskmgr.exe', 'taskmgr',
    'regedit.exe', 'regedit',
    'services.msc', 'services',
    'mmc.exe', 'mmc',
  ];

  static const List<String> meetingProcesses = [
    'zoom.exe', 'zoom', 'teams.exe', 'teams', 'webex.exe', 'webex',
    'skype.exe', 'skype', 'discord.exe', 'discord', 'slack.exe', 'slack',
  ];

  static const List<String> meetingTitleKeywords = [
    '회의', 'meeting', 'zoom', 'teams', 'webex', '통화', 'call',
  ];

  static const List<String> videoProcesses = [
    'potplayer.exe', 'potplayermini64.exe', 'vlc.exe', 'kmplayer.exe',
    'gom.exe', 'gomplayer.exe', 'wmplayer.exe', 'mpc-hc.exe',
  ];

  static const List<String> videoDomains = [
    'youtube.com', 'netflix.com', 'disneyplus.com', 'wavve.com',
    'tving.com', 'twitch.tv', 'zoom.us', 'meet.google.com',
  ];

  static const List<String> videoTitleKeywords = [
    '유튜브', 'youtube', '넷플릭스', 'netflix', '비디오', 'video',
    '플레이어', 'player', '동영상', '영화', 'movie', '스트리밍', 'streaming',
  ];

  static const List<String> idleProcesses = [
    'lockapp.exe', 'lockapp', 'scrnsave.scr', 'scrnsave',
    'logonui.exe', 'logonui',
  ];

  /// 비디오/회의 중인지 판별
  static bool isVideoOrMeetingActive(
    String processName,
    String windowTitle,
    String? domain,
  ) {
    if (processName.isEmpty) return false;

    final procLower = processName.toLowerCase();
    final titleLower = windowTitle.toLowerCase();
    final domLower = domain?.toLowerCase() ?? '';
    if (meetingProcesses.any((mp) => procLower.contains(mp))) return true;
    if (meetingTitleKeywords.any((mt) => titleLower.contains(mt))) return true;

    // 2. 로컬 비디오 플레이어
    if (videoProcesses.any((vp) => procLower.contains(vp))) return true;

    // 3. 비디오 스트리밍 도메인/타이틀
    if (videoDomains.any((vd) => domLower.contains(vd))) return true;
    if (videoTitleKeywords.any((vt) => titleLower.contains(vt))) return true;

    return false;
  }

  /// 카테고리 판별 (work, non-work, idle)
  static String determineCategory(
    String processName,
    String windowTitle,
    String? domain,
  ) {
    final processLower = processName.toLowerCase();

    // 브라우저인 경우 도메인 기반 판별
    if (DomainExtractor.isBrowser(processName) && domain != null) {
      // 비업무 사이트 도메인 키워드 매칭
      for (final entry in DomainExtractor.commonDomains) {
        final pattern = RegExp(entry.value, caseSensitive: false);
        if (entry.key == domain || pattern.hasMatch(domain)) {
          return 'non-work';
        }
      }
      // 비디오/회의 중이면 non-work로 분류 (업무용 화상회의는 예외 처리 가능)
      if (isVideoOrMeetingActive(processName, windowTitle, domain)) {
        return 'non-work';
      }
      return 'work'; // 그 외 웹 서핑은 기본 업무(리서치 등)로 분류
    }

    // 일반 애플리케이션 판별
    if (workProcesses.any((wp) => processLower.contains(wp))) {
      return 'work';
    }

    // 화면 보호기 또는 잠금 화면 등 자리비움 감지
    if (idleProcesses.any((ip) => processLower.contains(ip))) {
      return 'idle';
    }

    // 비디오/회의 중이면 non-work
    if (isVideoOrMeetingActive(processName, windowTitle, domain)) {
      return 'non-work';
    }

    return 'work'; // 기본값은 업무/일반 활동으로 분류
  }
}