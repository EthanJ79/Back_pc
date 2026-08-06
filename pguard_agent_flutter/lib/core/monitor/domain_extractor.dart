// lib/core/monitor/domain_extractor.dart
// Ported from Python agent.py extract_domain_from_title function

class DomainExtractor {
  static const List<String> browserProcesses = [
    'chrome.exe', 'chrome',
    'msedge.exe', 'msedge', 'microsoftedge.exe', 'microsoftedge',
    'firefox.exe', 'firefox',
    'whale.exe', 'whale',
    'brave.exe', 'brave',
    'opera.exe', 'opera',
    'vivaldi.exe', 'vivaldi',
    'safari', 'safari.exe',
  ];

  static const List<MapEntry<String, String>> commonDomains = [
    MapEntry('youtube.com', r'(youtube\.com|유튜브|youtube)'),
    MapEntry('naver.com', r'(naver\.com|네이버|naver)'),
    MapEntry('google.com', r'(google\.com|구글|google)'),
    MapEntry('facebook.com', r'(facebook\.com|페이스북|facebook)'),
    MapEntry('instagram.com', r'(instagram\.com|인스타그램|instagram)'),
    MapEntry('twitter.com', r'(twitter\.com|트위터|twitter|x\.com)'),
    MapEntry('tiktok.com', r'(tiktok\.com|틱톡|tiktok)'),
    MapEntry('twitch.tv', r'(twitch\.tv|트위치|twitch)'),
    MapEntry('netflix.com', r'(netflix\.com|넷플릭스|netflix)'),
    MapEntry('disneyplus.com', r'(disneyplus\.com|디즈니플러스|disney\+)'),
    MapEntry('wavve.com', r'(wavve\.com|웨이브|wavve)'),
    MapEntry('tving.com', r'(tving\.com|티빙|tving)'),
    MapEntry('coupang.com', r'(coupang\.com|쿠팡|coupang)'),
    MapEntry('11st.co.kr', r'(11st\.co\.kr|11번가|11st)'),
    MapEntry('gmarket.co.kr', r'(gmarket\.co\.kr|지마켓|gmarket)'),
    MapEntry('auction.co.kr', r'(auction\.co\.kr|옥션|auction)'),
    MapEntry('webtoon.naver.com', r'(webtoon\.naver\.com|네이버웹툰|webtoon)'),
    MapEntry('comic.naver.com', r'(comic\.naver\.com|네이버만화|comic)'),
    MapEntry('kakao.com', r'(kakao\.com|카카오|kakao)'),
    MapEntry('daum.net', r'(daum\.net|다음|daum)'),
    MapEntry('namu.wiki', r'(namu\.wiki|나무위키|namu)'),
    MapEntry('dcinside.com', r'(dcinside\.com|디시인사이드|dcinside)'),
    MapEntry('fmkorea.com', r'(fmkorea\.com|에펨코리아|fmkorea)'),
    MapEntry('clien.net', r'(clien\.net|클리앙|clien)'),
    MapEntry('ppomppu.co.kr', r'(ppomppu\.co\.kr|뽐뿌|ppomppu)'),
    MapEntry('reddit.com', r'(reddit\.com|레딧|reddit)'),
    MapEntry('linkedin.com', r'(linkedin\.com|링크드인|linkedin)'),
    MapEntry('github.com', r'(github\.com|깃허브|github)'),
    MapEntry('stackoverflow.com', r'(stackoverflow\.com|스택오버플로|stackoverflow)'),
    MapEntry('notion.so', r'(notion\.so|노션|notion)'),
    MapEntry('figma.com', r'(figma\.com|피그마|figma)'),
    MapEntry('canva.com', r'(canva\.com|캔바|canva)'),
    MapEntry('spotify.com', r'(spotify\.com|스포티파이|spotify)'),
    MapEntry('soundcloud.com', r'(soundcloud\.com|사운드클라우드|soundcloud)'),
    MapEntry('steamcommunity.com', r'(steamcommunity\.com|스팀|steam)'),
    MapEntry('discord.com', r'(discord\.com|디스코드|discord)'),
    MapEntry('slack.com', r'(slack\.com|슬랙|slack)'),
    MapEntry('teams.microsoft.com', r'(teams\.microsoft\.com|팀즈|teams)'),
    MapEntry('zoom.us', r'(zoom\.us|줌|zoom)'),
    MapEntry('webex.com', r'(webex\.com|웹엑스|webex)'),
    MapEntry('meet.google.com', r'(meet\.google\.com|구글미트|meet)'),
  ];

  static const List<String> excludeDomains = [
    'chrome.com', 'microsoft.com', 'edge.com', 'safari.com',
    '.exe', '.dll', '.js', '.png', '.jpg', '.css', '.html',
  ];

  /// 브라우저 프로세스인지 확인
  static bool isBrowser(String processName) {
    final lower = processName.toLowerCase();
    return browserProcesses.any((bp) => lower.contains(bp));
  }

  /// 창 제목에서 도메인 추출
  static String? extractDomainFromTitle(String windowTitle, String processName) {
    if (!isBrowser(processName) || windowTitle.isEmpty) {
      return null;
    }

    final titleLower = windowTitle.toLowerCase();

    // 1. URL 패턴에서 도메인 추출 (정규식)
    final urlPattern = RegExp(r'([a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?)');
    final match = urlPattern.firstMatch(titleLower);
    if (match != null) {
      final domain = match.group(1)!.toLowerCase();
      // 제외 도메인/확장자 필터링
      if (!excludeDomains.any((ex) => domain == ex || domain.endsWith(ex))) {
        return domain;
      }
    }

    // 2. 알려진 비업무/주요 웹사이트 키워드 매칭
    for (final entry in commonDomains) {
      final pattern = RegExp(entry.value, caseSensitive: false);
      if (pattern.hasMatch(titleLower)) {
        return entry.key;
      }
    }

    // 3. 브라우저인데 매칭 안 되면 'browsing_activity' 반환
    return 'browsing_activity';
  }
}