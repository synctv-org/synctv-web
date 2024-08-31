<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  defineAsyncComponent,
  nextTick
} from "vue";
import { currentMovieApi } from "@/services/apis/movie";
import type { WatchStopHandle } from "vue";
import { useWebSocket, useResizeObserver, useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { roomStore } from "@/stores/room";
import { ElNotification, ElMessage } from "element-plus";
import router from "@/router";
import { useMovieApi } from "@/hooks/useMovie";
import { useRoomApi, useRoomPermission } from "@/hooks/useRoom";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { strLengthLimit, blobToUint8Array, formatTime } from "@/utils";
import { ElementMessage, ElementMessageType, MovieStatus } from "@/proto/message";
import type { options } from "@/components/Player.vue";
import RoomInfo from "@/components/cinema/RoomInfo.vue";
import MovieList from "@/components/cinema/MovieList.vue";
import MoviePush from "@/components/cinema/MoviePush.vue";
import type { Subtitles } from "@/types/Movie";
import { RoomMemberPermission } from "@/types/Room";
import artplayerPluginAss from "@/plugins/artplayer-plugin-ass";
import { newSyncPlugin } from "@/plugins/sync";
import { artplayPluginSource } from "@/plugins/source";

const Player = defineAsyncComponent(() => import("@/components/Player.vue"));

// 获取房间信息
const room = roomStore();
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage<string>(`room-${roomID.value}-token`, "");

const watchers: WatchStopHandle[] = [];
onBeforeUnmount(() => {
  watchers.forEach((w) => w());
});

const { getMovies, getCurrentMovie } = useMovieApi(roomToken.value);
const { getMyInfo, myInfo } = useRoomApi(roomID.value);
const { hasMemberPermission } = useRoomPermission();

let player: Artplayer;

const sendDanmuku = (msg: string) => {
  if (!player || !player.plugins.artplayerPluginDanmuku) return;
  player.plugins.artplayerPluginDanmuku.emit({
    direct: true,
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
  console.log(`-----Ws Send Start-----`);
  console.log(msg);
  console.log(`-----Ws Send End-----`);
  return send(ElementMessage.encode(msg).finish());
};

// 消息列表
const chatMsgList = ref<string[]>([]);
const sendChatText = (msg: string, onSuccess?: () => any, onFailed?: () => any) => {
  if (msg.length === 0) {
    ElMessage({
      message: "发送的消息不能为空",
      type: "warning"
    });
    if (onFailed) onFailed();
    return;
  }

  strLengthLimit(msg, 4096);
  sendElement(
    ElementMessage.create({
      type: ElementMessageType.CHAT_MESSAGE,
      chatReq: msg
    })
  );
  if (onSuccess) onSuccess();
};

const sendChatMsg_ = ref("");
const onSendSuccess = () => {
  sendChatMsg_.value = "";
};

const MAX_MESSAGE_COUNT = 64; // 设定聊天记录的最大长度
const sendMsg = (msg: string) => {
  chatMsgList.value.push(msg);
  // 如果超过聊天记录最大长度，则从前面开始删除多余的消息
  nextTick(() => {
    if (chatMsgList.value.length > MAX_MESSAGE_COUNT) {
      chatMsgList.value.splice(0, chatMsgList.value.length - MAX_MESSAGE_COUNT);
    }
    // 将新消息存储到 sessionStorage
    sessionStorage.setItem(`chatMessages-${roomID}`, JSON.stringify(chatMsgList.value));
  });

  // 确保聊天区域滚动到底部
  nextTick(() => {
    if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight;
  });
};

const playerOption = computed<options>(() => {
  if (!room.currentMovie.base!.url) {
    return {
      url: ""
    };
  }
  let option: options = {
    url: room.currentMovie.base!.url,
    type: room.currentMovie.base!.type,
    isLive: room.currentMovie.base!.live,
    headers: room.currentMovie.base!.headers,
    plugins: [
      // 弹幕
      artplayerPluginDanmuku({
        danmuku: [],
        speed: 8,
        async beforeEmit(danmu: any) {
          if (danmu.direct) {
            return true;
          }
          sendChatText(danmu.text);
          return false;
        }
      }),
      // WARN: room.currentStatus 变了会导致重载
      newSyncPlugin(sendElement, room.currentStatus, () => room.currentExpireId)
    ]
  };

  if (room.currentMovie.base!.moreSources) {
    const obj = room.currentMovie.base!.moreSources;
    option.plugins!.push(
      artplayPluginSource([
        {
          url: option.url,
          html: "默认",
          type: option.type || ""
        },
        ...obj.map((item) => ({
          url: item.url,
          html: item.name,
          type: item.type
        }))
      ])
    );
  }

  if (room.currentMovie.base!.subtitles) {
    let defaultUrl;
    let useAssPlugin = false;

    // deep copy
    const subtitle = Object.assign({}, room.currentMovie.base!.subtitles);

    for (let key in subtitle) {
      if (subtitle[key].type === "ass") {
        useAssPlugin = true;
        defaultUrl = subtitle[key].url;
        break;
      }
    }

    option.plugins!.push(newLazyInitSubtitlePlugin(subtitle));
    // return;
    useAssPlugin &&
      option.plugins!.push(
        artplayerPluginAss({
          // debug: true,
          subUrl: defaultUrl
        })
      );
  }

  return option;
});

const newLazyInitSubtitlePlugin = (subtitle: Subtitles) => {
  const subtitleP = import("@/plugins/subtitle");
  return async (art: Artplayer) => {
    console.log("加载字幕插件中...");
    const subtitlePlugin = await subtitleP;
    art.controls.add(subtitlePlugin.newSubtitleControl(subtitle));
    art.setting.add(subtitlePlugin.newSubtitleControl(subtitle));
    return {
      name: "subtitle"
    };
  };
};

const getPlayerInstance = (art: Artplayer) => {
  player = art;
};

const setPlayerStatus = (status: MovieStatus) => {
  if (!player) return;
  player.plugins["syncPlugin"].setAndNoPublishStatus(status);
};

const { state: currentMovie, execute: reqCurrentMovieApi } = currentMovieApi();
const switchCurrentMovie = async () => {
  try {
    await reqCurrentMovieApi({
      headers: { Authorization: roomToken.value }
    });

    if (!currentMovie.value) return;

    if (currentMovie.value.movie.base.url.startsWith("/")) {
      currentMovie.value.movie.base.url = `${window.location.origin}${currentMovie.value.movie.base.url}`;
    }

    if (!player) return;
    const currentExpireId = currentMovie.value.expireId;
    const currentStatus = currentMovie.value.status;
    room.currentExpireId = currentExpireId;
    player.option.type = currentMovie.value.movie.base.type;
    player.url = currentMovie.value.movie.base.url;
    player.once("video:canplay", () => {
      if (room.currentExpireId != currentExpireId) return;
      setPlayerStatus(currentStatus);
    });
  } catch (err: any) {
    console.log(err);
    ElNotification({
      title: "获取影片列表失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

const handleElementMessage = (msg: ElementMessage) => {
  console.log(`-----Ws Message Start-----`);
  console.log(msg);
  console.log(`-----Ws Message End-----`);
  switch (msg.type) {
    case ElementMessageType.ERROR: {
      console.error(msg.error);
      ElNotification({
        title: "错误",
        message: msg.error,
        type: "error"
      });
      break;
    }

    // 聊天消息
    case ElementMessageType.CHAT_MESSAGE: {
      if (!msg.chatResp) {
        return;
      }
      const currentTime = formatTime(new Date()); // 格式化时间
      const senderName = msg.chatResp.sender?.username;
      const messageContent = `${senderName}: ${msg.chatResp.message}`;
      const messageWithTime = `${messageContent} <small>[${currentTime}]</small>`;
      // 添加消息到消息列表
      sendMsg(messageWithTime);
      sendDanmuku(messageContent);
      break;
    }
    case ElementMessageType.PLAY:
    case ElementMessageType.PAUSE:
    case ElementMessageType.CHANGE_SEEK:
    case ElementMessageType.CHANGE_RATE:
    case ElementMessageType.TOO_FAST:
    case ElementMessageType.TOO_SLOW:
    case ElementMessageType.SYNC_MOVIE_STATUS: {
      switch (msg.type) {
        case ElementMessageType.TOO_FAST:
          ElNotification({
            title: "播放速度过快",
            type: "warning"
          });
          break;
        case ElementMessageType.TOO_SLOW:
          ElNotification({
            title: "播放速度落后",
            type: "warning"
          });
          break;
        case ElementMessageType.SYNC_MOVIE_STATUS:
          ElNotification({
            title: "播放状态同步中",
            type: "success"
          });
          break;
      }
      setPlayerStatus(msg.movieStatusChanged!.status!);
      break;
    }

    case ElementMessageType.CHECK_STATUS: {
      break;
    }

    // 设置正在播放的影片
    case ElementMessageType.CURRENT_CHANGED: {
      getCurrentMovie();
      break;
    }

    case ElementMessageType.CURRENT_EXPIRED: {
      switchCurrentMovie();
      break;
    }

    // 播放列表更新
    case ElementMessageType.MOVIES_CHANGED: {
      getMovies(
        room.movieList[room.movieList.length - 1].id,
        room.movieList[room.movieList.length - 1].subPath
      );
      break;
    }

    case ElementMessageType.PEOPLE_CHANGED: {
      room.peopleNum = msg.peopleChanged!;
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

const can = (p: RoomMemberPermission) => {
  if (!myInfo.value) return;
  const myP = myInfo.value.permissions;
  return hasMemberPermission(myP, p);
};

const p = async () => {
  if (can(RoomMemberPermission.PermissionGetMovieList)) await getMovies();
  await getCurrentMovie();
};

onMounted(async () => {
  if (roomToken.value === "") {
    router.push({
      name: "joinRoom",
      params: {
        roomId: roomID.value
      }
    });
    return;
  }

  // 获取用户信息
  if (!myInfo.value) await getMyInfo(roomToken.value);

  // 从 sessionStorage 获取存储的聊天消息
  const storedMessages = sessionStorage.getItem(`chatMessages-${roomID}`);
  if (storedMessages) {
    chatMsgList.value = JSON.parse(storedMessages);
  }

  // 启动websocket连接
  open();

  // 监听ws信息变化
  watchers.push(
    watch(
      () => data.value,
      async () => {
        try {
          const arr = await blobToUint8Array(data.value);
          handleElementMessage(ElementMessage.decode(arr));
        } catch (err: any) {
          console.error(err);
          ElMessage.error(err.message);
        }
      }
    )
  );

  await p();
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
            <div class="message" v-for="item in chatMsgList" :key="item">
              <div v-html="item"></div>
            </div>
          </div>
        </div>
        <div
          v-if="can(RoomMemberPermission.PermissionSendChatMessage)"
          class="card-footer"
          style="justify-content: center; padding: 0.5rem"
        >
          <input
            type="text"
            @keyup.enter="() => sendChatText(sendChatMsg_, onSendSuccess)"
            v-model="sendChatMsg_"
            placeholder="按 Enter 键即可发送..."
            class="l-input w-full bg-transparent"
            autocomplete="off"
          />
          <button
            class="btn w-24 m-2.5 ml-0"
            @click="() => sendChatText(sendChatMsg_, onSendSuccess)"
          >
            发送
          </button>
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
    <el-col
      v-if="can(RoomMemberPermission.PermissionGetMovieList)"
      :lg="12"
      :md="16"
      :sm="15"
      :xs="24"
      class="mb-5 max-sm:mb-2"
    >
      <MovieList @send-msg="sendMsg" />
    </el-col>

    <!-- 添加影片 -->
    <el-col
      v-if="can(RoomMemberPermission.PermissionAddMovie)"
      :lg="6"
      :md="14"
      :xs="24"
      class="mb-5 max-sm:mb-2"
    >
      <MoviePush
        @getMovies="
          getMovies(
            room.movieList[room.movieList.length - 1].id,
            room.movieList[room.movieList.length - 1].subPath
          )
        "
        :token="roomToken"
      />
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.chatArea {
  overflow-y: scroll;
  height: 67vh;
}
</style>
