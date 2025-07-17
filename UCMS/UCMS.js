const bot = BotManager.getCurrentBot();
const CONFIG = {
  serverURL: " ",
};
const PREFIX = "빵뿡아~ ";

try {
  if (Database.exists("CompileTime.json")) {
    let T = Database.readObject("CompileTime.json").T;
    sendToAdmin("👍컴파일 완료!\n" + "[⏱️: " + diffMs(new Date(), T) + "ms]");
  } else {
    throw new Error("Time Measure Error");
  }
  init();
} catch (err) {
  sendToAdmin("[" + new Date().toLocaleString + "]\n" + err);
}

function checkCostTime(T) {
  let ret = "[⏱️: " + diffMs(new Date(), T) + "ms]";
  return ret;
}

function diffMs(a, b) {
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  return t1 - t2;
}

function onStartCompile() {
  sendToAdmin("컴파일 시작....");
  Database.writeObject("CompileTime.json", {
    T: new Date(),
  });
}

function init() {
  let T = new Date();
  if (Database.exists("config.json")) {
    const config = Database.readObject("config.json");
    CONFIG.serverURL = config.serverURL;
    CONFIG.gitAccessKey = config.gitAccessKey;
  } else {
    throw new Error("Cannot Find File : config.json");
  }
  bot.addListener(Event.MESSAGE, onMessage);
  bot.setCommandPrefix(PREFIX); //@로 시작하는 메시지를 command로 판단
  bot.addListener(Event.COMMAND, onCommand);
  bot.addListener(Event.START_COMPILE, onStartCompile);
  bot.addListener(Event.Activity.CREATE, onCreate);
  bot.addListener(Event.Activity.START, onStart);
  bot.addListener(Event.Activity.RESUME, onResume);
  bot.addListener(Event.Activity.PAUSE, onPause);
  bot.addListener(Event.Activity.STOP, onStop);
  bot.addListener(Event.Activity.RESTART, onRestart);
  bot.addListener(Event.Activity.DESTROY, onDestroy);
  bot.addListener(Event.Activity.BACK_PRESSED, onBackPressed);

  sendToAdmin("🥳초기화 완료\n" + checkCostTime(T));
}

function sendToAdmin(content) {
  admin = "이경호";

  if (!bot.send(admin, content, "com.kakao.talk")) {
    Log.e("[sendToAdmin] Fail");
  }
}

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
    const newErr = new Error(`API 호출 오류: ${e}`);
    throw newErr;
  }
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
  msg.reply(msg.content);
  if (msg.content === "초기화") {
    init();
  }
}

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
  const content = msg.content.slice(PREFIX.length);
  msg.reply(content);

  if (content === "컴파일해줘" || content === " 컴파일해줘") {
    try {
      bot.compile();
    } catch (err) {
      msg.reply(err);
    }
  } else {
    try {
      const url = `http://${CONFIG.serverURL}?content=${content}&author=${msg.author.name}`;
      msg.reply(fetchData(url));
    } catch (err) {
      msg.reply(err);
    }
  }
}

function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("?");
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
