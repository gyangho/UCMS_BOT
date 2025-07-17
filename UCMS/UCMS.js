const bot = BotManager.getCurrentBot();

function fetchData(url) {
  try {
    const response = org.jsoup.Jsoup.connect(url)
      .timeout(5000)
      .ignoreContentType(true)
      .execute();

    const body = response.body();
    if (!body) return null;

    const data = JSON.parse(body);

    return data;
  } catch (e) {
    const nerErr = new Error(`API 호출 오류: ${e}`);
    throw newErr;
  }
}

/**
 * 주어진 디렉터리에서 'git pull'을 수행하고,
 * stdout/stderr 결과를 모두 출력한 뒤, 종료 코드를 반환합니다.
 *
 * @param {String} repoDir - git pull을 실행할 작업 디렉터리 경로
 * @returns {Number} 프로세스 종료 코드 (0 = 성공)
 */

function gitPull(repoDir, msg) {
  // Java 클래스 가져오기
  var ProcessBuilder = Packages.java.lang.ProcessBuilder;
  var File = Packages.java.io.File;
  var BufferedReader = Packages.java.io.BufferedReader;
  var InputStreamReader = Packages.java.io.InputStreamReader;

  // ProcessBuilder 준비
  var pb = new ProcessBuilder(java.util.Arrays.asList("git", "pull", "origin", "main"));
  pb.directory(new File(repoDir));
  pb.redirectErrorStream(true); // stdout와 stderr를 합침

  // 프로세스 시작
  var process = pb.start();

  // 출력 읽기
  var reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
  var line;
  while ((line = reader.readLine()) !== null) {
    print(line);
  }

  // 완료 대기
  var exitCode = process.waitFor();
  msg.reply("git pull exited with code: " + exitCode);
  return exitCode;
}

/*
 * (string) msg.content: 메시지의 내용
 * (string) msg.room: 메시지를 받은 방 이름
 * (User) msg.author: 메시지 전송자
 * (string) msg.author.name: 메시지 전송자 이름
 * (Image) msg.author.avatar: 메시지 전송자 프로필 사진
 * (string) msg.author.avatar.getBase64()
 * (string | null) msg.author.hash: 사용자의 고유 id
 * (boolean) msg.isGroupChat: 단체/오픈채팅 여부
 * (boolean) msg.isDebugRoom: 디버그룸에서 받은 메시지일 시 true
 * (string) msg.packageName: 메시지를 받은 메신저의 패키지명
 * (void) msg.reply(string): 답장하기
 * (boolean) msg.isMention: 메세지 맨션 포함 여부
 * (bigint) msg.logId: 각 메세지의 고유 id
 * (bigint) msg.channelId: 각 방의 고유 id
 */
function onMessage(msg) {
  bot.send("이경호", msg.author.name + ": " + msg.content);
}
bot.addListener(Event.MESSAGE, onMessage);

/**
 * (string) msg.content: 메시지의 내용
 * (string) msg.room: 메시지를 받은 방 이름
 * (User) msg.author: 메시지 전송자
 * (string) msg.author.name: 메시지 전송자 이름
 * (Image) msg.author.avatar: 메시지 전송자 프로필 사진
 * (string) msg.author.avatar.getBase64()
 * (boolean) msg.isDebugRoom: 디버그룸에서 받은 메시지일 시 true
 * (boolean) msg.isGroupChat: 단체/오픈채팅 여부
 * (string) msg.packageName: 메시지를 받은 메신저의 패키지명
 * (void) msg.reply(string): 답장하기
 * (string) msg.command: 명령어 이름
 * (Array) msg.args: 명령어 인자 배열
 */
function onCommand(msg) {
  msg.reply("커맨드 수신: " + msg.content);

  if (msg.content === "@컴파일") {
    try {
      gitPull("./", msg);
      bot.compile();
    } catch (err) {
      msg.reply(err);
    }
  } else {
    try {
      const url = `${serverURL}?content=${msg.content}&author=${msg.author.name}`;
      msg.reply(fetchData(url));
    } catch (err) {
      msg.reply(err.code);
    }
  }
}
bot.setCommandPrefix("/"); //@로 시작하는 메시지를 command로 판단
bot.addListener(Event.COMMAND, onCommand);

function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("뭐야이건");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}

function onRestart(activity) {}

function onDestroy(activity) {}

function onBackPressed(activity) {}

bot.addListener(Event.Activity.CREATE, onCreate);
bot.addListener(Event.Activity.START, onStart);
bot.addListener(Event.Activity.RESUME, onResume);
bot.addListener(Event.Activity.PAUSE, onPause);
bot.addListener(Event.Activity.STOP, onStop);
bot.addListener(Event.Activity.RESTART, onRestart);
bot.addListener(Event.Activity.DESTROY, onDestroy);
bot.addListener(Event.Activity.BACK_PRESSED, onBackPressed);
