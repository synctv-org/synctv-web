<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, defineAsyncComponent } from "vue";
import type { WatchStopHandle } from "vue";
import { useWebSocket, useWindowSize, useResizeObserver } from "@vueuse/core";
import { roomStore } from "@/stores/room";
import { ElNotification, ElMessage } from "element-plus";
import router from "@/router";
import { updateRoomPasswordApi, delRoomApi } from "@/services/apis/room";
import {
  movieListApi,
  editMovieInfoApi,
  delMovieApi,
  swapMovieApi,
  moviesApi,
  changeCurrentMovieApi,
  clearMovieListApi,
  liveInfoApi
} from "@/services/apis/movie";
import type { EditMovieInfo } from "@/types/Movie";
import type { MovieInfo } from "@/proto/message";
import { getFileExtension } from "@/utils/utils";
import { sync } from "@/plugins/sync";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import { strLengthLimit, blobToUin8Array } from "@/utils/utils";
import MoviePush from "@/components/MoviePush.vue";
import { ElementMessage, ElementMessageType } from "@/proto/message";
import customHeaders from "@/components/dialogs/customHeaders.vue";
import { useRouteParams } from "@vueuse/router";

const Player = defineAsyncComponent(() => import("@/components/Player.vue"));

const customHeadersDialog = ref<InstanceType<typeof customHeaders>>();

const watchers: WatchStopHandle[] = [];
onBeforeUnmount(() => {
  watchers.forEach((w) => w());
});
const { width: WindowWidth } = useWindowSize();
const room = roomStore();

// 检查是否登录
(() => !room.login && router.push("/"))();

// 获取房间信息
const roomID = useRouteParams("roomId");
const roomToken = localStorage.getItem(`room-${roomID.value}-token`) ?? "";

// 启动websocket连接
const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const { status, data, send } = useWebSocket(`${wsProtocol}//${window.location.host}/api/room/ws`, {
  protocols: [roomToken],
  autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed() {
      ElMessage.error("Websocket 自动重连失败！");
    }
  },
  autoClose: true
});

const SendElement = (msg: ElementMessage) => {
  if (!msg.time) {
    msg.time = Date.now();
  }
  return send(ElementMessage.encode(msg).finish());
};

// 更新房间密码
const password = ref("");
const { state: newToken, execute: reqUpdateRoomPasswordApi } = updateRoomPasswordApi();
const changePassword = async () => {
  try {
    strLengthLimit(password, 32);
    await reqUpdateRoomPasswordApi({
      data: {
        password: password.value
      },
      headers: { Authorization: roomToken }
    });

    if (newToken.value) {
      ElNotification({
        title: "更新成功",
        type: "success"
      });
      localStorage.setItem(`room-${roomID.value}-token`, newToken.value.token);
      setInterval(() => {
        window.location.reload();
      }, 500);
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "更新失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 显示房间密码
let isShowPassword = ref(false);

// 删除房间
const { execute: reqDelRoomApi } = delRoomApi();
const deleteRoom = async () => {
  try {
    await reqDelRoomApi({
      data: {
        roomId: localStorage.roomId
      },
      headers: { Authorization: roomToken }
    });

    ElNotification({
      title: "删除成功",
      type: "success"
    });
    setTimeout(() => {
      localStorage.removeItem("RoomID");
      localStorage.removeItem("password");
      localStorage.removeItem("login");
      localStorage.removeItem("token");
      window.location.href = window.location.origin;
    }, 500);
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "删除失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

let msgList = ref<string[]>([]);

// 更新消息列表
const updateMsgList = (msg: string) => {
  msgList.value.push(msg);
};

const syncPlugin = sync({
  publishStatus: SendElement,
  sendDanmuku: updateMsgList
});

// 获取影片列表
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("desc");
const { state: movieList, isLoading: movieListLoading, execute: reqMovieListApi } = movieListApi();
/**
 * @argument updateStatus 是否更新当前正在播放的影片（包括状态）
 */
const getMovieList = async () => {
  try {
    await reqMovieListApi({
      params: {
        page: currentPage.value,
        max: pageSize.value,
        order: order.value
      },
      headers: { Authorization: roomToken }
    });

    if (movieList.value) {
      console.log(movieList.value);
      room.movies = movieList.value.movies;
      room.totalMovies = movieList.value.total;
      room.currentMovieStatus = movieList.value.current.status;
      room.currentMovie = movieList.value.current.movie;
    }
  } catch (err: any) {
    console.log(err);
    if (err.response.status === 401) {
      ElNotification({
        title: "身份验证失败，请重新进入房间",
        message: err.message,
        type: "error"
      });
      setInterval(() => {
        localStorage.removeItem("roomId");
        localStorage.removeItem("password");
        localStorage.removeItem("login");
        localStorage.removeItem("token");
        window.location.href = window.location.origin;
      }, 500);
    }
    ElNotification({
      title: "获取影片列表失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

const { state: movies, execute: reqMoviesApi } = moviesApi();
const getMovies = async () => {
  try {
    await reqMoviesApi({
      params: {
        page: currentPage.value,
        max: pageSize.value,
        order: order.value
      },
      headers: { Authorization: roomToken }
    });

    if (movies.value) {
      console.log(movies.value);
      room.movies = movies.value.movies;
      room.totalMovies = movies.value.total;
    }
  } catch (err: any) {
    console.log(err);
    if (err.response.status === 401) {
      ElNotification({
        title: "身份验证失败，请重新进入房间",
        message: err.message,
        type: "error"
      });
      setInterval(() => {
        localStorage.removeItem("roomId");
        localStorage.removeItem("password");
        localStorage.removeItem("login");
        localStorage.removeItem("token");
        window.location.href = window.location.origin;
      }, 500);
    }
    ElNotification({
      title: "获取影片列表失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 清空影片列表
const { execute: reqClearMovieListApi } = clearMovieListApi();
const clearMovieList = async (id: number) => {
  try {
    await reqClearMovieListApi({
      headers: { Authorization: roomToken }
    });
    await changeCurrentMovie("", false);
    ElNotification({
      title: "已清空",
      type: "success"
    });
    msgList.value.push("PLAYER：视频已清空");
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 直播相关
const liveInfoDialog = ref(false);
const liveInfoForm = ref({
  host: "",
  app: "",
  token: ""
});
const { state: liveInfo, execute: reqLiveInfoApi } = liveInfoApi();
const getLiveInfo = async (id: string) => {
  try {
    await reqLiveInfoApi({
      data: {
        id: id
      },
      headers: { Authorization: roomToken }
    });

    liveInfoDialog.value = true;
    if (liveInfo.value) liveInfoForm.value = liveInfo.value;
    console.log(liveInfo.value);
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// watchers.push(
//   watch(
//     () => newMovieInfo.value.live,
//     () => {
//       !newMovieInfo.value.live ? (newMovieInfo.value.rtmpSource = false) : void 0;
//     }
//   )
// );

// 当前影片信息
let cMovieInfo = ref<EditMovieInfo>({
  id: "",
  url: "",
  name: "",
  live: false,
  proxy: false,
  rtmpSource: false,
  type: "",
  headers: {},
  vendorInfo: undefined
});

// 打开编辑对话框
const editDialog = ref(false);
const openEditDialog = (item: MovieInfo) => {
  cMovieInfo.value = {
    id: item.id,
    ...item.base
  } as EditMovieInfo;
  editDialog.value = true;
};

const updateHeaders = (header: { [key: string]: string }) => {
  cMovieInfo.value.headers = header;
};

// 编辑影片信息
const { isLoading: editMovieInfoLoading, execute: reqEditMovieInfoApi } = editMovieInfoApi();
const editMovieInfo = async () => {
  try {
    for (const key in cMovieInfo.value) {
      strLengthLimit(key, 32);
    }
    await reqEditMovieInfoApi({
      data: cMovieInfo.value,
      headers: { Authorization: roomToken }
    });
    ElNotification({
      title: "更新成功",
      type: "success"
    });
    editDialog.value = false;
  } catch (err: any) {
    console.error(err.message);
    ElNotification({
      title: "更新失败",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

// 删除影片
const { execute: reqDelMovieApi } = delMovieApi();
const deleteMovie = async (ids: Array<string>) => {
  try {
    await reqDelMovieApi({
      data: {
        ids: ids
      },
      headers: { Authorization: roomToken }
    });
    for (const id of ids) {
      room.movies.splice(
        room.movies.findIndex((movie: MovieInfo) => movie["id"] === id),
        1
      );
    }

    ElNotification({
      title: "删除成功",
      type: "success"
    });
    selectMovies.value = [];
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "删除失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 交换两个影片的位置
const selectMovies = ref<string[]>([]);
const { execute: reqSwapMovieApi } = swapMovieApi();
const swapMovie = async () => {
  try {
    await reqSwapMovieApi({
      data: {
        id1: selectMovies.value[0],
        id2: selectMovies.value[1]
      },
      headers: { Authorization: roomToken }
    });

    ElNotification({
      title: "交换成功",
      type: "success"
    });
    selectMovies.value = [];
    getMovies();
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "交换失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 设置当前正在播放的影片
const { execute: reqChangeCurrentMovieApi } = changeCurrentMovieApi();
const changeCurrentMovie = async (id: string, showMsg = true) => {
  try {
    await reqChangeCurrentMovieApi({
      data: {
        id: id
      },
      headers: { Authorization: roomToken }
    });

    showMsg &&
      ElNotification({
        title: "设置成功",
        type: "success"
      });
    resetChatAreaHeight();
  } catch (err: any) {
    console.error(err);
    showMsg &&
      ElNotification({
        title: "设置失败",
        message: err.response.data.error || err.message,
        type: "error"
      });
  }
};

const noPlayArea = ref();
const playArea = ref();

// 消息列表
const chatArea = ref();

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
      room.danmuku = {
        text: msg.message, // 弹幕文本
        //time: Date.now(), // 发送时间，单位秒
        color: "#fff", // 弹幕局部颜色
        border: false // 是否显示描边
        //mode: 0, // 弹幕模式: 0表示滚动, 1静止
      };

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
      // TODO: 询问是否重新同步
      syncPlugin.setAndNoPublishSeek(msg.seek!);
      syncPlugin.setAndNoPublishRate(msg.rate!);
      break;
    }

    case ElementMessageType.TOO_SLOW: {
      ElNotification({
        title: "播放速度落后",
        type: "warning"
      });
      // TODO: 询问是否重新同步
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
      room.currentMovie = msg.current!.movie!;
      room.currentMovieStatus = msg.current!.status!;
      syncPlugin.setAndNoPublishSeek(msg.current!.status!.seek);
      syncPlugin.setAndNoPublishRate(msg.current!.status!.rate);
      resetChatAreaHeight();
      break;
    }

    // 播放列表更新
    case ElementMessageType.CHANGE_MOVIES: {
      getMovies();
      resetChatAreaHeight();
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

// 发送消息（临时
let sendText_ = ref("");
const sendText = () => {
  if (sendText_.value === "")
    return ElMessage({
      message: "发送的消息不能为空",
      type: "warning"
    });
  strLengthLimit(sendText_.value, 64);
  SendElement(
    ElementMessage.create({
      type: ElementMessageType.CHAT_MESSAGE,
      message: sendText_.value
    })
  );
  sendText_.value = "";
  if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight;
  // console.log("sended:" + msg);
};

let player: Artplayer;

function getPlayerInstance(art: Artplayer) {
  player = art;
  resetChatAreaHeight();
  player.once("ready", resetChatAreaHeight);
}

// 设置聊天框高度
const resetChatAreaHeight = () => {
  const h = playArea.value ? playArea : noPlayArea;
  chatArea && h && (chatArea.value.style.height = h.value.scrollHeight - 112 + "px");
};

const card = ref(null);
useResizeObserver(card, resetChatAreaHeight);

getMovieList();

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
    switch (room.currentMovie.base!.type) {
      case "flv":
        return `${window.location.origin}/api/movie/live/${room.currentMovie.id}.flv`;
      default:
        return `${window.location.origin}/api/movie/live/${room.currentMovie.id}.m3u8`;
    }
  } else if (room.currentMovie.base?.proxy) {
    return `${window.location.origin}/api/movie/proxy/${roomID.value}/${room.currentMovie.id}`;
  } else {
    return room.currentMovie.base!.url;
  }
});

const playerOption = computed(() => {
  let option = {
    url: playerUrl.value,
    type: room.currentMovie.base?.type || getFileExtension(playerUrl.value),
    isLive: room.currentMovie.base!.live,
    headers: room.currentMovie.base!.headers,
    plugins: [danmukuPlugin, syncPlugin.plugin]
  };
  if (option.url.startsWith(window.location.origin)) {
    option.headers = {
      ...option.headers,
      Authorization: roomToken
    };
  }

  return option;
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
          <img class="mx-auto" src="../assets/something-lost.webp" />
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
      <div class="card">
        <div class="card-title">房间信息</div>

        <div class="card-body">
          <table class="table-auto i-table">
            <tbody>
              <tr>
                <td width="100">连接状态</td>
                <td>{{ status }}</td>
              </tr>
              <tr>
                <td>房间ID</td>
                <td>
                  <div class="overflow-hidden text-ellipsis max-w-[150px]">
                    <span class="truncate">{{ roomID }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>房间密码</td>
                <td>
                  <input
                    :type="isShowPassword ? 'text' : 'password'"
                    v-model="password"
                    class="w-full m-0 pl-1 inline-block bg-neutral-200 border border-neutral-200 rounded-md focus:outline-none hover:bg-neutral-100 transition-all text-sm dark:bg-neutral-700 dark:border-neutral-800"
                  />
                  <button
                    class="inline-block absolute -translate-x-5 opacity-50 pr-0.5"
                    @click="isShowPassword = !isShowPassword"
                  >
                    {{ isShowPassword ? "●" : "◯" }}
                  </button>
                </td>
              </tr>
              <tr>
                <td>在线人数</td>
                <td>{{ room.peopleNum }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer flex-wrap justify-between">
          <el-popconfirm
            width="220"
            confirm-button-text="是"
            cancel-button-text="否"
            title="你确定要删除这个房间吗？!"
            @confirm="deleteRoom"
          >
            <template #reference>
              <button class="btn btn-error">删除房间</button>
            </template>
          </el-popconfirm>

          <el-popconfirm
            width="220"
            confirm-button-text="是"
            cancel-button-text="否"
            title="更新后，所有人将会被踢下线！"
            @confirm="changePassword"
          >
            <template #reference>
              <button class="btn btn-success">更新房间密码</button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </el-col>

    <!-- 影片列表 -->
    <el-col :lg="12" :md="16" :sm="15" :xs="24" class="mb-6 max-sm:mb-2">
      <div class="card">
        <div class="card-title">影片列表（{{ room.movies.length }}）</div>

        <div class="card-body">
          <el-skeleton v-if="movieListLoading" :rows="1" animated />
          <div
            v-else
            v-for="item in room.movies"
            :key="item.base!.name"
            class="flex justify-around mb-2 rounded-lg bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800"
          >
            <div class="m-auto pl-2">
              <input v-model="selectMovies" type="checkbox" :value="item['id']" />
            </div>
            <div class="overflow-hidden text-ellipsis m-auto p-2 w-7/12">
              <b class="block text-base font-semibold" :title="`ID: ${item.id}`">
                <el-tag class="mr-1" size="small" v-if="item.base!.live"> 直播流 </el-tag>
                {{ item.base!.name }}
                <button
                  v-if="item.base!.rtmpSource"
                  class="ml-1 font-normal text-sm border bg-rose-50 dark:bg-transparent border-rose-500 rounded-lg px-2 text-rose-500 hover:brightness-75 transition-all"
                  @click="getLiveInfo(item['id'])"
                >
                  查看推流信息
                </button>
              </b>
              <small class="truncate">{{ item.base!.url || item.id }}</small>
            </div>

            <div class="m-auto p-2">
              <button class="btn btn-dense m-0 mr-1" @click="changeCurrentMovie(item['id'])">
                播放
                <PlayIcon class="inline-block" width="18px" />
              </button>
              <button class="btn btn-dense btn-warning m-0 mr-1" @click="openEditDialog(item)">
                编辑
                <EditIcon class="inline-block" width="16px" height="16px" />
              </button>
              <el-popconfirm
                width="220"
                confirm-button-text="是"
                cancel-button-text="否"
                title="你确定要删除这条影片吗？"
                @confirm="deleteMovie([item['id']])"
              >
                <template #reference>
                  <button class="btn btn-dense btn-error m-0 mr-1">
                    删除
                    <TrashIcon class="inline-block" width="16px" height="16px" />
                  </button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </div>

        <div class="card-footer justify-between flex-wrap overflow-hidden">
          <div v-if="selectMovies.length === 2">
            <button class="btn mr-2" @click="swapMovie">交换位置</button>

            <el-popconfirm
              v-if="selectMovies.length >= 2"
              width="220"
              confirm-button-text="是"
              cancel-button-text="否"
              title="你确定要删除这些影片吗？"
              @confirm="deleteMovie(selectMovies)"
            >
              <template #reference>
                <button class="btn btn-error">批量删除</button>
              </template>
            </el-popconfirm>
          </div>
          <el-pagination
            v-else
            class="max-sm:mb-4"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :pager-count="4"
            layout="total, sizes, prev, pager, next, jumper"
            :total="room.totalMovies"
            @size-change="getMovies()"
            @current-change="getMovies()"
          />

          <div></div>
          <div>
            <el-popconfirm
              width="220"
              confirm-button-text="是"
              cancel-button-text="否"
              title="你确定要清空影片列表吗？!"
              @confirm="clearMovieList"
            >
              <template #reference>
                <button class="btn btn-error mr-2">清空列表</button>
              </template>
            </el-popconfirm>
            <button class="btn btn-success" @click="getMovies()">更新列表</button>
          </div>
        </div>
      </div>
    </el-col>

    <!-- 添加影片 -->
    <el-col :lg="6" :md="14" :xs="24" class="mb-6 max-sm:mb-2">
      <MoviePush @getMovies="getMovies()" />
    </el-col>
  </el-row>

  <!-- 编辑影片对话框 -->
  <el-dialog
    v-model="editDialog"
    title="编辑影片"
    width="443px"
    class="rounded-lg dark:bg-zinc-800"
  >
    <el-form label-position="top">
      <el-form-item label="名称：">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" v-model="cMovieInfo.name" />
      </el-form-item>
      <el-form-item label="URL：">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" v-model="cMovieInfo.url" />
      </el-form-item>
      <el-form-item label="类型：">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" v-model="cMovieInfo.type" />
      </el-form-item>
      <div
        class="rounded-lg p-3 w-full bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-700 hover:dark:bg-zinc-800 cursor-pointer"
        @click="customHeadersDialog?.openDialog()"
      >
        <span class="text-sm min-w-fit"> 自定义 header </span>
      </div>
    </el-form>
    <template #footer>
      <button class="btn mr-2" @click="editDialog = false">取消</button>
      <button class="btn btn-success contrast-50" disabled v-if="editMovieInfoLoading">
        请求中...
      </button>
      <button class="btn btn-success" @click="editMovieInfo()" v-else>确定修改</button>
    </template>
  </el-dialog>

  <customHeaders
    ref="customHeadersDialog"
    :customHeader="cMovieInfo.headers"
    @updateHeaders="updateHeaders"
  />

  <!-- 直播推流信息 -->
  <el-dialog
    v-model="liveInfoDialog"
    title="直播推流信息"
    width="443px"
    class="rounded-lg dark:bg-zinc-800"
  >
    <el-form label-position="top">
      <el-form-item label="推流地址：">
        <input
          type="text"
          class="l-input m-0 p-0 pl-2 w-full"
          :value="`rtmp://${liveInfoForm.host}/${liveInfoForm.app}/`"
        />
      </el-form-item>
      <el-form-item label="推流密钥：">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" :value="liveInfoForm.token" />
      </el-form-item>
    </el-form>

    <template #footer>
      <button class="btn btn-success" @click="liveInfoDialog = false">我已知晓</button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.art-player {
  // margin-bottom: 10px;
}

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
