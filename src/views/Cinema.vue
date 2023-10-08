<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { WatchStopHandle } from "vue";
import { useWebSocket, useWindowSize } from "@vueuse/core";
import Player from "@/components/Player.vue";
import ArtPlayer from "artplayer";
import { roomStore } from "@/stores/room";
import { ElNotification, ElMessage } from "element-plus";
import router from "@/router";
import { updateRoomPasswordApi, delRoomApi } from "@/services/apis/room";
import {
  movieListApi,
  pushMovieApi,
  editMovieInfoApi,
  delMovieApi,
  swapMovieApi,
  moviesApi,
  changeCurrentMovieApi,
  clearMovieListApi,
  liveInfoApi
} from "@/services/apis/movie";
import type { BaseMovieInfo, MovieInfo, EditMovieInfo, MovieStatus } from "@/types/Movie";
import type { WsMessage } from "@/types/Room";
import { WsMessageType } from "@/types/Room";
import { getFileExtension, devLog } from "@/utils/utils";
import { sync } from "@/plugins/sync";

const watchers: WatchStopHandle[] = [];
onBeforeUnmount(() => {
  watchers.forEach((w) => w());
});
const { width: WindowWidth } = useWindowSize();
const room = roomStore();

// 检查是否登录
(() => !room.login && router.push("/"))();

// 获取房间信息
const roomID = localStorage.roomId;
let password = localStorage.password;

// 启动websocket连接
const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const { status, data, send, close } = useWebSocket(
  `${wsProtocol}//${window.location.host}/api/room/ws`,
  {
    protocols: [localStorage.token],
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        ElMessage.error("Websocket 自动重连失败！");
      }
    }
  }
);

// 更新房间密码
const { state: newToken, execute: reqUpdateRoomPasswordApi } = updateRoomPasswordApi();
const changePassword = async () => {
  try {
    await reqUpdateRoomPasswordApi({
      data: {
        password: password
      },
      headers: { Authorization: localStorage.token }
    });

    ElNotification({
      title: "更新成功",
      type: "success"
    });
    if (newToken.value) {
      localStorage.setItem("token", newToken.value.token);
      localStorage.setItem("password", password);
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
      headers: { Authorization: localStorage.token }
    });

    ElNotification({
      title: "删除成功",
      type: "success"
    });
    setInterval(() => {
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
      headers: { Authorization: localStorage.token }
    });

    if (movieList.value) {
      devLog(movieList.value);
      room.movies = movieList.value.movies;
      room.totalMovies = movieList.value.total;
      room.currentMovie = movieList.value.current.movie;
      room.currentMovieStatus = movieList.value.current.status;
    }
  } catch (err: any) {
    devLog(err);
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
      headers: { Authorization: localStorage.token }
    });

    if (movies.value) {
      devLog(movies.value);
      room.movies = movies.value.movies;
      room.totalMovies = movies.value.total;
    }
  } catch (err: any) {
    devLog(err);
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
      headers: { Authorization: localStorage.token }
    });
    ElNotification({
      title: "已清空",
      type: "success"
    });
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "清除成功",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 新影片信息
let newMovieInfo = ref<BaseMovieInfo>({
  name: "",
  live: false,
  proxy: false,
  url: "",
  rtmpSource: false,
  type: "",
  headers: null
});

// 直播相关
const liveInfoDialog = ref(false);
const liveInfoForm = ref({
  host: "",
  app: "",
  token: ""
});
const { state: liveInfo, execute: reqLiveInfoApi } = liveInfoApi();
const getLiveInfo = async (id: number) => {
  try {
    await reqLiveInfoApi({
      data: {
        id: id
      },
      headers: { Authorization: localStorage.token }
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

watch(
  () => newMovieInfo.value.live,
  () => {
    !newMovieInfo.value.live ? (newMovieInfo.value.rtmpSource = false) : void 0;
  }
);

// 把视频链接添加到列表
const { execute: reqPushMovieApi } = pushMovieApi();
const pushMovie = async (dir: string) => {
  if (newMovieInfo.value.live) {
    if (newMovieInfo.value.name === "")
      return ElNotification({
        title: "添加失败",
        message: "请填写表单完整",
        type: "error"
      });
  } else {
    if (newMovieInfo.value.url === "" || newMovieInfo.value.name === "")
      return ElNotification({
        title: "添加失败",
        message: "请填写表单完整",
        type: "error"
      });
  }

  try {
    await reqPushMovieApi({
      params: {
        pos: dir
      },
      data: newMovieInfo.value,
      headers: { Authorization: localStorage.token }
    });

    ElNotification({
      title: "添加成功",
      type: "success"
    });
    newMovieInfo.value.name = newMovieInfo.value.url = "";
    getMovies();
  } catch (err: any) {
    console.log(err);
    ElNotification({
      title: "添加失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

// 获取当前影片状态
// const { state: movieStatus, execute: reqMovieStatusApi } = movieStatusApi();
// const getCurrentMovieStatus = async () => {
//   try {
//     await reqMovieStatusApi({
//       headers: { Authorization: localStorage.token }
//     });
//     if (movieStatus.value) {
//       setAllStatus(movieStatus.value.current.status.playing, movieStatus.value.current.status.seek, movieStatus.value.current.status.rate);
//     }
//   } catch (err: any) {
//     console.error(err.message);
//     ElNotification({
//       title: "获取失败",
//       type: "error",
//       message: err.response.data.error || err.message
//     });
//   }
// };

// 当前影片信息
let cMovieInfo = ref<EditMovieInfo>({
  id: 0,
  url: "",
  name: "",
  type: "",
  headers: null
});

// 打开编辑对话框
const editDialog = ref(false);
const openEditDialog = (item: MovieInfo) => {
  cMovieInfo.value.id = item.id;
  cMovieInfo.value.url = item.url;
  cMovieInfo.value.name = item.name;
  cMovieInfo.value.type = item.type;
  cMovieInfo.value.headers = item.headers;
  editDialog.value = true;
};

// 编辑影片信息
const { isLoading: editMovieInfoLoading, execute: reqEditMovieInfoApi } = editMovieInfoApi();
const editMovieInfo = async () => {
  try {
    await reqEditMovieInfoApi({
      data: cMovieInfo.value,
      headers: { Authorization: localStorage.token }
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
const deleteMovie = async (ids: Array<number>) => {
  try {
    await reqDelMovieApi({
      data: {
        ids: ids
      },
      headers: { Authorization: localStorage.token }
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
const selectMovies = ref<number[]>([]);
const { execute: reqSwapMovieApi } = swapMovieApi();
const swapMovie = async () => {
  try {
    await reqSwapMovieApi({
      data: {
        id1: selectMovies.value[0],
        id2: selectMovies.value[1]
      },
      headers: { Authorization: localStorage.token }
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
const playerLoaded = ref(true);

const { execute: reqChangeCurrentMovieApi } = changeCurrentMovieApi();
const changeCurrentMovie = async (id: number) => {
  // playerLoaded.value = false;
  try {
    await reqChangeCurrentMovieApi({
      data: {
        id: id
      },
      headers: { Authorization: localStorage.token }
    });

    ElNotification({
      title: "设置成功",
      type: "success"
    });

    // playerLoaded.value = true;
  } catch (err: any) {
    console.error(err);
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
let msgList = ref<string[]>([]);

// 更新消息列表
const updateMsgList = (msg: string) => {
  msgList.value.push(msg);
};

const setAllStatus = (status: MovieStatus) => {
  // playing必须比seek后设置，因为watch的顺序会变成先seek后playing，seek会导致playing状态不正确，导致playing无法设置
  room.currentMovieStatus.playing = status.playing;
  setStatus(status.seek, status.rate);
};

const setStatus = (seek: number, rate: number) => {
  if (room.currentMovieStatus.seek - seek > 2 || room.currentMovieStatus.seek - seek < -2)
    room.currentMovieStatus.seek = seek;
  room.currentMovieStatus.rate = rate;
};

// 监听ws信息变化
watch(
  () => data.value,
  () => {
    if (data.value === "") return devLog("返回了空", data.value);

    const jsonData: WsMessage = JSON.parse(data.value);
    devLog(`-----Ws Message Start-----`);
    devLog(jsonData);
    devLog(`-----Ws Message End-----`);
    switch (jsonData.type) {
      // 聊天消息
      case WsMessageType.MESSAGE: {
        msgList.value.push(`${jsonData.sender}：${jsonData.message}`);
        // jsonData.message.split("：")[0] !== "PLAYER" &&
        room.danmuku = {
          text: jsonData.message, // 弹幕文本
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
      case WsMessageType.PLAY: {
        setAllStatus({
          playing: true,
          seek: jsonData.seek,
          rate: jsonData.rate
        });
        break;
      }

      // 暂停
      case WsMessageType.PAUSE: {
        setAllStatus({
          playing: false,
          seek: jsonData.seek,
          rate: jsonData.rate
        });
        break;
      }

      // 视频进度发生变化
      case WsMessageType.SEEK: {
        setStatus(jsonData.seek, jsonData.rate);
        break;
      }

      case WsMessageType.RATE: {
        setStatus(jsonData.seek, jsonData.rate);
        break;
      }

      // 设置正在播放的影片
      case WsMessageType.CURRENT_MOVIE: {
        room.currentMovie = jsonData.current.movie;
        setAllStatus(jsonData.current.status);
        break;
      }

      // 播放列表更新
      case WsMessageType.PLAY_LIST_UPDATE: {
        getMovies();
        // jsonData.movies
        //   ? (movieList.value = room.movies = jsonData.movies)
        //   : movieList.value.splice(0, 1);
        break;
      }

      // ん？
      case WsMessageType.PEOPLE_NUM: {
        room.peopleNum < jsonData.peopleNum
          ? msgList.value.push(
              `<p><b>SYSTEM：</b>欢迎新成员加入，当前共有 ${jsonData.peopleNum} 人在观看</p>`
            )
          : room.peopleNum > jsonData.peopleNum
          ? msgList.value.push(
              `<p><b>SYSTEM：</b>有人离开了房间，当前还剩 ${jsonData.peopleNum} 人在观看</p>`
            )
          : "";
        room.peopleNum = jsonData.peopleNum;
        break;
      }
    }
  }
);

// 发送消息（临时
let sendText_ = ref("");
const sendText = () => {
  if (sendText_.value === "")
    return ElMessage({
      message: "发送的消息不能为空",
      type: "warning"
    });
  const msg = JSON.stringify({
    Type: 2,
    Message: sendText_.value,
    Time: Date.now()
  });
  send(msg);
  sendText_.value = "";
  if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight;
  devLog("sended:" + msg);
};

const playerOptions = ref({
  url: "",
  isLive: false,
  type: ""
});

const playerMounted = ref(false);

let player: ArtPlayer;

const syncPlugin = sync({
  "set-player-status": send,
  "ws-send": updateMsgList
});

function getPlayerInstance(art: ArtPlayer) {
  player = art;
  player.plugins.add(syncPlugin);
  playerMounted.value = true;
}

const parseVideoType = (movie: MovieInfo) => {
  if (movie.type) {
    return movie.type;
  }
  return getFileExtension(movie.url);
};

const syncCurrent = () => {
  watchers.push(
    watch(
      () => room.currentMovie,
      () => {
        const jsonData = room.currentMovie;
        if (jsonData.pullKey !== "") {
          jsonData.url = `${window.location.origin}/api/movie/live/${jsonData.pullKey}.flv`;
          // jsonData.url = `${window.location.origin}/api/movie/live/${jsonData.pullKey}.m3u8`;
        }
        console.log(jsonData);
        playerOptions.value = {
          url: jsonData.url,
          isLive: jsonData.live,
          type: parseVideoType(jsonData)
        };
      }
    )
  );
};

watchers.push(
  watch(
    () => playerMounted.value,
    () => {
      syncCurrent();
      getMovieList();
    }
  )
);

// 设置聊天框高度
const resetChatAreaHeight = () => {
  const h = playArea ? playArea : noPlayArea;
  chatArea && h && (chatArea.value.style.height = h.value.scrollHeight - 63 + "px");
};

onMounted(() => {
  setTimeout(() => {
    resetChatAreaHeight();
  }, 233);

  watch(WindowWidth, () => {
    resetChatAreaHeight();
  });
});

onBeforeUnmount(() => {
  close();
});
</script>

<template>
  <el-row :gutter="20">
    <el-col :md="18" class="mb-6 max-sm:my-2">
      <div class="card max-sm:rounded-none">
        <div
          class="card-title flex flex-wrap justify-between max-sm:text-sm"
          v-if="room.currentMovie.url !== ''"
        >
          {{ room.currentMovie.name }}
          <small>👁‍🗨 {{ room.peopleNum }} </small>
        </div>
        <div class="card-title flex flex-wrap justify-between max-sm:text-sm" v-else>
          当前没有影片播放，快去添加几部吧~<small class="font-normal"
            >👁‍🗨 {{ room.peopleNum }}
          </small>
        </div>
        <div class="card-body max-sm:p-0" ref="playArea" v-if="playerLoaded">
          <div class="art-player">
            <Player @get-instance="getPlayerInstance" :options="playerOptions"></Player>
          </div>
        </div>
        <div class="card-body max-sm:pb-3 max-sm:px-3" ref="noPlayArea" v-else>
          <!-- <img class="mx-auto" src="../assets/something-lost.png" /> -->
          <el-carousel height="37vmax" indicator-position="none" arrow="never" interval="5000">
            <el-carousel-item v-for="item in 4" :key="item">
              <img class="mx-auto" :src="'https://api.imlazy.ink/img?t=' + item" />
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="card-footer p-4 max-sm:hidden"></div>
      </div>
    </el-col>
    <el-col :md="6" class="mb-6 max-sm:mb-2">
      <div class="card h-full max-sm:rounded-none">
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
      <div class="card max-sm:rounded-none">
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
                <td>{{ roomID }}</td>
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
      <div class="card max-sm:rounded-none">
        <div class="card-title">影片列表（{{ room.movies.length }}）</div>

        <div class="card-body">
          <el-skeleton v-if="movieListLoading" :rows="1" animated />
          <div
            v-else
            v-for="item in room.movies"
            :key="item.name"
            class="flex justify-around mb-2 rounded-lg bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800"
          >
            <div class="m-auto pl-2">
              <input v-model="selectMovies" type="checkbox" :value="item['id']" />
            </div>
            <div class="overflow-hidden text-ellipsis m-auto p-2 w-7/12">
              <b class="block text-base font-semibold" :title="`ID: ${item.id}`">
                <el-tag class="mr-1" size="small" v-if="item.live"> 直播流 </el-tag>
                {{ item["name"] }}
                <button
                  v-if="item.rtmpSource"
                  class="ml-1 font-normal text-sm border bg-rose-50 dark:bg-transparent border-rose-500 rounded-lg px-2 text-rose-500 hover:brightness-75 transition-all"
                  @click="getLiveInfo(item['id'])"
                >
                  查看推流信息
                </button>
              </b>
              <small class="truncate">{{ item["url"] || item["pullKey"] }}</small>
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
      <div class="card max-sm:rounded-none">
        <div class="card-title">添加影片</div>
        <div class="card-body flex justify-around flex-wrap">
          <input
            type="text"
            placeholder="影片Url"
            class="l-input-violet mb-1.5 w-full"
            v-if="!(newMovieInfo.live && newMovieInfo.rtmpSource)"
            v-model="newMovieInfo.url"
          />
          <input
            type="text"
            placeholder="影片名称"
            class="l-input-slate mt-1.5 w-full"
            v-model="newMovieInfo.name"
          />

          <div class="mt-4 mb-0 flex flex-wrap justify-around w-full">
            <div>
              <input type="checkbox" v-model="newMovieInfo.live" />
              <label>&nbsp;这是一条直播流</label>
            </div>

            <div>
              <input
                type="checkbox"
                v-model="newMovieInfo.rtmpSource"
                @click="newMovieInfo.live ? true : (newMovieInfo.live = true)"
              />
              <label>&nbsp;我想创建直播</label>
            </div>

            <!-- <div>
              <input type="checkbox" v-model="newMovieInfo.proxy" />
              <label>&nbsp;isProxy</label>
            </div> -->
          </div>
        </div>
        <div class="card-footer flex-wrap pt-3" style="justify-content: space-around">
          <button class="btn" @click="pushMovie('front')">添加到列表最<b>前</b>面</button>
          <button class="btn" @click="pushMovie('back')">添加到列表最<b>后</b>面</button>
        </div>
      </div>
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
      <el-form-item label="Url：">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" v-model="cMovieInfo.url" />
      </el-form-item>
      <el-form-item label="Name：">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" v-model="cMovieInfo.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <button class="btn mr-2" @click="editDialog = false">取消</button>
      <button class="btn btn-success contrast-50" disabled v-if="editMovieInfoLoading">
        请求中...
      </button>
      <button class="btn btn-success" @click="editMovieInfo()" v-else>确定修改</button>
    </template>
  </el-dialog>

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
  // height: 33vmax;
}

.i-table {
  td {
    padding: 2px 0 2px;
  }
}
</style>
