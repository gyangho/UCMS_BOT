const bot = BotManager.getCurrentBot();
const CONFIG = {
  serverURL: " ",
  gitAccessKey: " ",
};

function init(msg) {
  if (Database.exists("config.json")) {
    const config = Database.readObject("config.json");
    CONFIG.serverURL = config.serverURL;
    CONFIG.gitAccessKey = config.gitAccessKey;
  } else {
    msg.reply("Cannot Find File : config.json");
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

bot.send("이경호", "컴파일 완료", "com.kakao.talk");

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
function onMessage(msg) {}
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
      msg.reply("컴파일을 시작합니다.");
      let ret = bot.compile();
      if (ret) {
        bot.send("이경호", "컴파일 완료", "com.kakao.talk");
      }
    } catch (err) {
      msg.reply(err);
    }
  } else {
    try {
      const url = `${serverURL}?content=${msg.content}&author=${msg.author.name}`;
      msg.reply(fetchData(url));
    } catch (err) {
      msg.reply(err);
    }
  }
}
bot.setCommandPrefix("@"); //@로 시작하는 메시지를 command로 판단
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
