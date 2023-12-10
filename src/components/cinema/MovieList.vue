<script setup lang="ts">
import { ref } from "vue";
import { ElNotification } from "element-plus";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { roomStore } from "@/stores/room";
import {
  movieListApi,
  editMovieInfoApi,
  delMovieApi,
  swapMovieApi,
  changeCurrentMovieApi,
  clearMovieListApi,
  liveInfoApi
} from "@/services/apis/movie";
import type { EditMovieInfo, MovieInfo } from "@/types/Movie";
import { strLengthLimit } from "@/utils";
import customHeaders from "@/components/dialogs/customHeaders.vue";

const customHeadersDialog = ref<InstanceType<typeof customHeaders>>();

// 获取房间信息
const room = roomStore();
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage<string>(`room-${roomID.value}-token`, "");

const emits = defineEmits(["send-msg"]);

// 获取影片列表
const currentPage = ref(1);
const pageSize = ref(10);
const { state: movieList, isLoading: movieListLoading, execute: reqMovieListApi } = movieListApi();
/**
 * @argument {boolean} updateStatus 是否更新当前正在播放的影片（包括状态）
 */
const getMovieList = async (updateStatus: boolean) => {
  try {
    await reqMovieListApi({
      params: {
        page: currentPage.value,
        max: pageSize.value
      },
      headers: { Authorization: roomToken.value }
    });

    if (movieList.value) {
      console.log(movieList.value);
      room.movies = movieList.value.movies;
      room.totalMovies = movieList.value.total;
      if (updateStatus) {
        room.currentMovieStatus = movieList.value.current.status;
        room.currentMovie = movieList.value.current.movie;
      }
    }
  } catch (err: any) {
    console.log(err);
    ElNotification({
      title: "获取影片列表失败",
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
      headers: { Authorization: roomToken.value }
    });

    ElNotification({
      title: "交换成功",
      type: "success"
    });
    selectMovies.value = [];
    getMovieList(false);
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
      headers: { Authorization: roomToken.value }
    });

    showMsg &&
      ElNotification({
        title: "设置成功",
        type: "success"
      });
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

// 编辑影片信息
const { isLoading: editMovieInfoLoading, execute: reqEditMovieInfoApi } = editMovieInfoApi();
const editMovieInfo = async () => {
  try {
    for (const key in cMovieInfo.value) {
      strLengthLimit(key, 32);
    }
    await reqEditMovieInfoApi({
      data: cMovieInfo.value,
      headers: { Authorization: roomToken.value }
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
      headers: { Authorization: roomToken.value }
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
      headers: { Authorization: roomToken.value }
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

// 清空影片列表
const { execute: reqClearMovieListApi } = clearMovieListApi();
const clearMovieList = async (id: number) => {
  try {
    await reqClearMovieListApi({
      headers: { Authorization: roomToken.value }
    });
    await changeCurrentMovie("", false);
    ElNotification({
      title: "已清空",
      type: "success"
    });
    emits("send-msg", "PLAYER：视频已清空");
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

const updateHeaders = (header: { [key: string]: string }) => {
  cMovieInfo.value.headers = header;
};
</script>

<template>
  <div class="card">
    <div class="card-title">影片列表（{{ room.totalMovies }}）</div>

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
            <img
              v-if="item.base?.vendorInfo?.vendor === 'bilibili'"
              class="inline leading-3 w-4"
              src="/src/assets/appIcons/bilibili.svg"
            />
            <img
              v-else-if="item.base?.vendorInfo?.vendor === 'alist'"
              class="inline leading-3 w-4"
              src="/src/assets/appIcons/alist.svg"
            />
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
      <div v-if="selectMovies.length >= 2">
        <button v-if="selectMovies.length === 2" class="btn mr-2" @click="swapMovie">
          交换位置
        </button>

        <el-popconfirm
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
        class="max-sm:mb-4 flex-wrap"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        :total="room.totalMovies"
        @size-change="getMovieList(false)"
        @current-change="getMovieList(false)"
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
        <button class="btn btn-success" @click="getMovieList(false)">更新列表</button>
      </div>
    </div>
  </div>

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
