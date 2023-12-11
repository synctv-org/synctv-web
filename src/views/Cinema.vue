<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, defineAsyncComponent } from "vue";
import type { WatchStopHandle } from "vue";
import { useWebSocket, useResizeObserver, useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { roomStore } from "@/stores/room";
import { ElNotification, ElMessage } from "element-plus";
import router from "@/router";
import { useMovieApi } from "@/hooks/useMovie";
import { sync } from "@/plugins/sync";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { strLengthLimit, blobToUin8Array } from "@/utils";
import { ElementMessage, ElementMessageType } from "@/proto/message";
import type { options } from "@/components/Player.vue";
import RoomInfo from "@/components/cinema/RoomInfo.vue";
import MovieList from "@/components/cinema/MovieList.vue";
import MoviePush from "@/components/cinema/MoviePush.vue";

const Player = defineAsyncComponent(() => import("@/components/Player.vue"));

// 获取房间信息
const room = roomStore();
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage<string>(`room-${roomID.value}-token`, "");

const watchers: WatchStopHandle[] = [];
onBeforeUnmount(() => {
  watchers.forEach((w) => w());
});

const { getMovieList, getCurrentMovie, currentMovie } = useMovieApi(roomToken.value);

let player: Artplayer;

const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const { status, data, send, open } = useWebSocket(
  `${wsProtocol}//${window.location.host}/api/room/ws`,
  {
    protocols: [roomToken.value],
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        ElMessage.error("Websocket 自动重连失败！");
      }
    },
    autoClose: true,
    immediate: false
  }
);

const sendElement = (msg: ElementMessage) => {
  if (!msg.time) {
    msg.time = Date.now();
  }
  return send(ElementMessage.encode(msg).finish());
};

// 消息列表
const msgList = ref<string[]>([]);
const sendText_ = ref("");
const sendText = () => {
  if (sendText_.value === "")
    return ElMessage({
      message: "发送的消息不能为空",
      type: "warning"
    });
  strLengthLimit(sendText_.value, 64);
  sendElement(
    ElementMessage.create({
      type: ElementMessageType.CHAT_MESSAGE,
      message: sendText_.value
    })
  );
  sendText_.value = "";
  if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight;
};

const sendMsg = (msg: string) => {
  msgList.value.push(msg);
};

const syncPlugin = sync({
  publishStatus: sendElement,
  sendDanmuku: (msg) => sendMsg(msg)
});

const danmukuPlugin = artplayerPluginDanmuku({
  // 弹幕数组
  danmuku: [],
  speed: 4
});

const playerUrl = computed(() => {
  if (
    room.currentMovie.base?.rtmpSource ||
    (room.currentMovie.base?.live && room.currentMovie.base?.proxy)
  ) {
    const fileType = room.currentMovie.base!.type === "flv" ? "flv" : "m3u8";
    return `${window.location.origin}/api/movie/live/${room.currentMovie.id}.${fileType}`;
  } else if (room.currentMovie.base?.proxy) {
    return `${window.location.origin}/api/movie/proxy/${roomID.value}/${room.currentMovie.id}`;
  } else {
    return room.currentMovie.base!.url;
  }
});

const playerOption = computed<options>(() => {
  let option: options = {
    url: playerUrl.value,
    type: room.currentMovie.base?.type || "",
    isLive: room.currentMovie.base!.live,
    headers: room.currentMovie.base!.headers,
    plugins: [danmukuPlugin, syncPlugin?.plugin],
    subtitles: room.currentMovie.base?.subtitles
  };
  if (option.url.startsWith(window.location.origin)) {
    option.headers = {
      ...option.headers,
      Authorization: roomToken.value
    };
  }

  return option;
});

const handleElementMessage = (msg: ElementMessage) => {
  console.log(`-----Ws Message Start-----`);
  console.log(msg);
  console.log(`-----Ws Message End-----`);
  switch (msg.type) {
    case ElementMessageType.ERROR: {
      console.error(msg.message);
      ElNotification({
        title: "错误",
        message: msg.message,
        type: "error"
      });
      break;
    }

    // 聊天消息
    case ElementMessageType.CHAT_MESSAGE: {
      msgList.value.push(`${msg.sender}：${msg.message}`);
      // jsonData.message.split("：")[0] !== "PLAYER" &&
      player?.plugins.artplayerPluginDanmuku.emit({
        text: msg.message, // 弹幕文本
        //time: Date.now(), // 发送时间，单位秒
        color: "#fff", // 弹幕局部颜色
        border: false // 是否显示描边
        //mode: 0, // 弹幕模式: 0表示滚动, 1静止
      });

      // 自动滚动到最底部
      if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight;

      if (msgList.value.length > 40)
        return (msgList.value = [
          "<p><b>SYSTEM：</b>已达到最大聊天记录长度，系统已自动清空...</p>"
        ]);

      break;
    }

    // 播放
    case ElementMessageType.PLAY: {
      syncPlugin.setAndNoPublishSeek(msg.seek!);
      syncPlugin.setAndNoPublishRate(msg.rate!);
      syncPlugin.setAndNoPublishPlay();
      break;
    }

    // 暂停
    case ElementMessageType.PAUSE: {
      syncPlugin.setAndNoPublishPause();
      syncPlugin.setAndNoPublishSeek(msg.seek!);
      syncPlugin.setAndNoPublishRate(msg.rate!);
      break;
    }

    // 视频进度发生变化
    case ElementMessageType.CHANGE_SEEK: {
      syncPlugin.setAndNoPublishSeek(msg.seek!);
      syncPlugin.setAndNoPublishRate(msg.rate!);
      break;
    }

    case ElementMessageType.TOO_FAST: {
      ElNotification({
        title: "播放速度过快",
        type: "warning"
      });
      syncPlugin.setAndNoPublishSeek(msg.seek!);
      syncPlugin.setAndNoPublishRate(msg.rate!);
      break;
    }

    case ElementMessageType.TOO_SLOW: {
      ElNotification({
        title: "播放速度落后",
        type: "warning"
      });
      syncPlugin.setAndNoPublishSeek(msg.seek!);
      syncPlugin.setAndNoPublishRate(msg.rate!);
      break;
    }

    case ElementMessageType.CHECK_SEEK: {
      break;
    }

    case ElementMessageType.CHANGE_RATE: {
      syncPlugin.setAndNoPublishSeek(msg.seek!);
      syncPlugin.setAndNoPublishRate(msg.rate!);
      break;
    }

    // 设置正在播放的影片
    case ElementMessageType.CHANGE_CURRENT: {
      getCurrentMovie();
      if (currentMovie.value) {
        syncPlugin.setAndNoPublishSeek(currentMovie.value.status.seek);
        syncPlugin.setAndNoPublishRate(currentMovie.value.status.rate);
      }
      break;
    }

    // 播放列表更新
    case ElementMessageType.CHANGE_MOVIES: {
      getMovieList(false);
      break;
    }

    case ElementMessageType.CHANGE_PEOPLE: {
      room.peopleNum < msg.peopleNum!
        ? msgList.value.push(
            `<p><b>SYSTEM：</b>欢迎新成员加入，当前共有 ${msg.peopleNum} 人在观看</p>`
          )
        : room.peopleNum > msg.peopleNum!
        ? msgList.value.push(
            `<p><b>SYSTEM：</b>有人离开了房间，当前还剩 ${msg.peopleNum} 人在观看</p>`
          )
        : "";
      room.peopleNum = msg.peopleNum!;
      break;
    }
  }
};

const noPlayArea = ref();
const playArea = ref();

// 消息区域
const chatArea = ref();

function getPlayerInstance(art: Artplayer) {
  player = art;
  player.once("ready", () => {
    syncPlugin.setAndNoPublishSeek(room.currentMovieStatus.seek);
    syncPlugin.setAndNoPublishRate(room.currentMovieStatus.rate);
    room.currentMovieStatus.playing
      ? syncPlugin.setAndNoPublishPlay()
      : syncPlugin.setAndNoPublishPause();
  });
}

// 设置聊天框高度
const resetChatAreaHeight = () => {
  const h = playArea.value ? playArea : noPlayArea;
  chatArea && h && (chatArea.value.style.height = h.value.scrollHeight - 112 + "px");
};

const card = ref(null);
useResizeObserver(card, resetChatAreaHeight);

onMounted(() => {
  if (roomToken.value === "") {
    router.push({
      name: "joinRoom",
      params: {
        roomId: roomID.value
      }
    });
    return;
  }

  // 启动websocket连接
  open();

  // 监听ws信息变化
  watchers.push(
    watch(
      () => data.value,
      () => {
        blobToUin8Array(data.value)
          .then((array) => {
            handleElementMessage(ElementMessage.decode(array));
          })
          .catch((err) => {
            console.error(err);
          });
      }
    )
  );

  getMovieList(true);
});
</script>

<template>
  <el-row :gutter="20">
    <el-col :md="18" class="mb-6 max-sm:my-2">
      <div class="card" ref="card">
        <div
          class="card-title flex flex-wrap justify-between max-sm:text-sm"
          v-if="playerOption.url"
        >
          {{ room.currentMovie.base!.name }}
          <small>👁‍🗨 {{ room.peopleNum }} </small>
        </div>
        <div class="card-title flex flex-wrap justify-between max-sm:text-sm" v-else>
          当前没有影片播放，快去添加几部吧~<small class="font-normal"
            >👁‍🗨 {{ room.peopleNum }}
          </small>
        </div>
        <div class="card-body max-sm:p-0" ref="playArea" v-if="playerOption.url">
          <div class="art-player">
            <Player @get-instance="getPlayerInstance" :options="playerOption"></Player>
          </div>
        </div>
        <div class="card-body max-sm:pb-3 max-sm:px-3" ref="noPlayArea" v-else>
          <img class="mx-auto" src="/src/assets/something-lost.webp" />
        </div>
      </div>
    </el-col>
    <el-col :md="6" class="mb-6 max-sm:mb-2">
      <div class="card h-full">
        <div class="card-title">在线聊天</div>
        <div class="card-body mb-2">
          <div class="chatArea" ref="chatArea">
            <div class="message" v-for="item in msgList" :key="item">
              <div v-html="item"></div>
            </div>
          </div>
        </div>
        <div class="card-footer" style="justify-content: center; padding: 0.5rem">
          <input
            type="text"
            @keyup.enter="sendText()"
            v-model="sendText_"
            placeholder="按 Enter 键即可发送..."
            class="l-input w-full bg-transparent"
          />
          <button class="btn w-24 m-2.5 ml-0" @click="sendText()">发送</button>
        </div>
      </div>
    </el-col>
  </el-row>

  <el-row :gutter="20">
    <!-- 房间信息 -->
    <el-col :lg="6" :md="8" :sm="9" :xs="24" class="mb-6 max-sm:mb-2">
      <RoomInfo :status="status" />
    </el-col>

    <!-- 影片列表 -->
    <el-col :lg="12" :md="16" :sm="15" :xs="24" class="mb-6 max-sm:mb-2">
      <MovieList @send-msg="sendMsg" />
    </el-col>

    <!-- 添加影片 -->
    <el-col :lg="6" :md="14" :xs="24" class="mb-6 max-sm:mb-2">
      <MoviePush @getMovies="getMovieList(false)" :token="roomToken" />
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.chatArea {
  overflow-y: scroll;
  height: 67vh;
}

.i-table {
  td {
    padding: 2px 0 2px;
  }
}
</style>
