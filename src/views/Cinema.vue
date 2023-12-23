<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, defineAsyncComponent } from "vue";
import type { WatchStopHandle } from "vue";
import { useWebSocket, useResizeObserver, useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { roomStore } from "@/stores/room";
import { ElNotification, ElMessage } from "element-plus";
import router from "@/router";
import { useMovieApi } from "@/hooks/useMovie";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { strLengthLimit, blobToUin8Array } from "@/utils";
import { ElementMessage, ElementMessageType, type Status } from "@/proto/message";
import type { options } from "@/components/Player.vue";
import RoomInfo from "@/components/cinema/RoomInfo.vue";
import MovieList from "@/components/cinema/MovieList.vue";
import MoviePush from "@/components/cinema/MoviePush.vue";
import type { Subtitles } from "@/types/Movie";

const Player = defineAsyncComponent(() => import("@/components/Player.vue"));

// 获取房间信息
const room = roomStore();
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage<string>(`room-${roomID.value}-token`, "");

const watchers: WatchStopHandle[] = [];
onBeforeUnmount(() => {
  watchers.forEach((w) => w());
});

const { getMovieListAndCurrent, getMovies, getCurrentMovie, currentMovie } = useMovieApi(
  roomToken.value
);

let player: Artplayer;

const sendDanmuku = (msg: string) => {
  if (!player || !player.plugins.artplayerPluginDanmuku) return;
  player.plugins.artplayerPluginDanmuku.emit({
    text: msg, // 弹幕文本
    color: "#fff", // 弹幕局部颜色
    border: false // 是否显示描边
    //mode: 0, // 弹幕模式: 0表示滚动, 1静止
  });
};

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

const playerOption = computed<options>(() => {
  let option: options = {
    url: room.currentMovie.base!.url,
    type: room.currentMovie.base!.type,
    isLive: room.currentMovie.base!.live,
    headers: room.currentMovie.base!.headers,
    plugins: [
      // 弹幕
      artplayerPluginDanmuku({
        danmuku: [],
        speed: 4
      }),
      newLazyInitSyncPlugin(room.currentMovieStatus)
    ]
  };
  if (option.url.startsWith(window.location.origin) || option.url.startsWith("/")) {
    option.headers = {
      ...option.headers,
      Authorization: roomToken.value
    };
  }
  if (room.currentMovie.base!.subtitles) {
    option.plugins.push(newLazyInitSubtitlePlugin(room.currentMovie.base!.subtitles));
  }

  return option;
});

const newLazyInitSyncPlugin = (status: Status) => {
  return (art: Artplayer): void => {
    import("@/plugins/sync")
      .then((sync) => {
        console.log("加载进度同步插件中...");
        art.plugins.add(sync.newSyncPlugin(sendElement, status));
      })
      .catch((e) => {
        ElNotification({
          title: "进度同步失败",
          type: "error",
          message: `进度同步插件加载失败，同步功能将不可用：${e}`
        });
        console.error(`进度同步插件加载失败，同步功能将不可用：${e}`);
      });
  };
};

const newLazyInitSubtitlePlugin = (subtitle: Subtitles) => {
  return (art: Artplayer): void => {
    import("@/plugins/subtitle")
      .then((subtitlePlugin) => {
        console.log("加载字幕插件中...");
        art.plugins.add(subtitlePlugin.newSubtitle(subtitle));
      })
      .catch((e) => {
        ElNotification({
          title: "字幕加载失败",
          type: "error",
          message: `字幕插件加载失败，字幕功能将不可用：${e}`
        });
        console.error(`字幕插件加载失败，字幕功能将不可用：${e}`);
      });
  };
};

const getPlayerInstance = async (art: Artplayer) => {
  player = art;
};

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
      sendDanmuku(msg.message);

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
      room.currentMovieStatus.playing = true;
      room.currentMovieStatus.seek = msg.seek;
      room.currentMovieStatus.rate = msg.rate;
      break;
    }

    // 暂停
    case ElementMessageType.PAUSE: {
      room.currentMovieStatus.playing = false;
      room.currentMovieStatus.seek = msg.seek;
      room.currentMovieStatus.rate = msg.rate;
      break;
    }

    // 视频进度发生变化
    case ElementMessageType.CHANGE_SEEK: {
      room.currentMovieStatus.seek = msg.seek;
      room.currentMovieStatus.rate = msg.rate;
      break;
    }

    case ElementMessageType.TOO_FAST: {
      ElNotification({
        title: "播放速度过快",
        type: "warning"
      });
      room.currentMovieStatus.seek = msg.seek;
      room.currentMovieStatus.rate = msg.rate;
      break;
    }

    case ElementMessageType.TOO_SLOW: {
      ElNotification({
        title: "播放速度落后",
        type: "warning"
      });
      room.currentMovieStatus.seek = msg.seek;
      room.currentMovieStatus.rate = msg.rate;
      break;
    }

    case ElementMessageType.CHECK_SEEK: {
      break;
    }

    case ElementMessageType.CHANGE_RATE: {
      room.currentMovieStatus.seek = msg.seek;
      room.currentMovieStatus.rate = msg.rate;
      break;
    }

    // 设置正在播放的影片
    case ElementMessageType.CHANGE_CURRENT: {
      getCurrentMovie();
      break;
    }

    // 播放列表更新
    case ElementMessageType.CHANGE_MOVIES: {
      getMovies();
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
  getMovieListAndCurrent(true);
});
</script>

<template>
  <el-row :gutter="20">
    <el-col :md="18" class="mb-5 max-sm:my-2">
      <div class="card" ref="card">
        <div
          class="card-title flex flex-wrap justify-between max-sm:text-sm max-sm:pb-4"
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
        <div class="card-body max-sm:p-0 pb-4" ref="playArea" v-if="playerOption.url">
          <div class="art-player">
            <Player @get-instance="getPlayerInstance" :options="playerOption"></Player>
          </div>
        </div>
        <div class="card-body max-sm:pb-3 max-sm:px-3" ref="noPlayArea" v-else>
          <img class="mx-auto" src="/src/assets/something-lost.webp" />
        </div>
      </div>
    </el-col>
    <el-col :md="6" class="mb-5 max-sm:mb-2">
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
    <el-col :lg="6" :md="8" :sm="9" :xs="24" class="mb-5 max-sm:mb-2">
      <RoomInfo :status="status" />
    </el-col>

    <!-- 影片列表 -->
    <el-col :lg="12" :md="16" :sm="15" :xs="24" class="mb-5 max-sm:mb-2">
      <MovieList @send-msg="sendMsg" />
    </el-col>

    <!-- 添加影片 -->
    <el-col :lg="6" :md="14" :xs="24" class="mb-5 max-sm:mb-2">
      <MoviePush @getMovies="getMovies()" :token="roomToken" />
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.chatArea {
  overflow-y: scroll;
  height: 67vh;
}
</style>
