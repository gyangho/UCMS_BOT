const bot = BotManager.getCurrentBot();
const CONFIG = {
  serverURL: " ",
};
const PREFIX = "!";
const INIT_INTERVAL = 4 * 60 * 60 * 1000; //ms 단위
let INTERVAL_ID;
let sbn;

try {
  if (Database.exists("CompileTime.json")) {
    let T = Database.readObject("CompileTime.json").T;
    sendToAdmin("👍컴파일 완료!\n" + "[⏱️: " + diffMs(new Date(), T) + "ms]");
  } else {
    throw new Error("Time Measure Error");
  }
  init();

  INTERVAL_ID = setInterval(init, INIT_INTERVAL);
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
  clearInterval(INTERVAL_ID);
  Database.writeObject("CompileTime.json", {
    T: new Date(),
  });
}

function init() {
  let T = new Date();
  if (Database.exists("config.json")) {
    const config = Database.readObject("config.json");
    CONFIG.serverURL = config.serverURL;
  } else {
    throw new Error("Cannot Find File : config.json");
  }

  bot.removeAllListeners(Event.COMMAND);
  bot.removeAllListeners(Event.MESSAGE);
  bot.removeAllListeners(Event.START_COMPILE);
  bot.removeAllListeners(Event.NOTIFICATION_POSTED);

  bot.setCommandPrefix(PREFIX); //@로 시작하는 메시지를 command로 판단
  bot.addListener(Event.COMMAND, onCommand);
  bot.addListener(Event.MESSAGE, onMessage);
  bot.addListener(Event.START_COMPILE, onStartCompile);
  bot.addListener(Event.NOTIFICATION_POSTED, onNotificationPosted);

  sendToAdmin("🥳초기화 완료\n" + checkCostTime(T));
}

function sendToAdmin(content) {
  admin = 441898712178969;

  if (!bot.send(BigInt(admin), content, "com.kakao.talk")) {
    Log.e("[sendToAdmin] Fail" + content);
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
  return;
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
  const content = msg.content.slice(PREFIX.length).trim();
  let url = "";
  let res;

  if (content === "컴파일") {
    try {
      bot.compile();
    } catch (err) {
      msg.reply(err + "\n" + err.stack);
    }
  } else if (content.startsWith("인증")) {
    if (msg.isGroupChat) {
      msg.reply(
        "그룹 채팅방에서는 인증을 수행할 수 없습니다.\n인증은 개인 톡으로만 수행 가능합니다."
      );
      return;
    }
    const auth_code = content.slice(2).trim();
    try {
      url = `${CONFIG.serverURL}/auth?authcode='${auth_code}'&chat_room_id=${msg.channelId}`;
      res = fetchData(url);
      msg.reply(res.message);
    } catch (err) {
      msg.reply(err + "\n" + err.stack);
    }
  } else {
    try {
      url = `${CONFIG.serverURL}/chat?content=${encodeURIComponent(
        content
      )}&chat_room_id=${msg.channelId}&isgroupchat=${msg.isGroupChat}&author=${
        msg.author.name
      }`;
      res = fetchData(url);
      bot.send(BigInt(res.chat_room_id), res.message, "com.kakao.talk");
    } catch (err) {
      msg.reply(err + "\n" + err.stack);
    }
  }
}

function onNotificationPosted(sbn, sm) {
  const packageName = sbn.getPackageName();
  if (!packageName.startsWith("com.kakaobank.channel")) {
    return;
  } else {
    const notification = sbn.getNotification();
    const title = notification.extras.getCharSequence(
      android.app.Notification.EXTRA_TITLE
    );

    const notiContent = notification.extras.get("android.text");
    if (notiContent) {
      const content = notiContent.toString();

      url = `${CONFIG.serverURL}/kakaobank?title=${title}&content=${encodeURIComponent(
        content
      )}&`;
      const res = fetchData(url);
      bot.send(BigInt(res.chat_room_id), res.message, "com.kakao.talk");
    }
  }
}
