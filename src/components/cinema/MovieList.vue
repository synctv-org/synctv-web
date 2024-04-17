<script setup lang="ts">
import { ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { roomStore } from "@/stores/room";
import type { EditMovieInfo, MovieInfo } from "@/types/Movie";
import { useMovieApi } from "@/hooks/useMovie";
import { useRoomApi, RoomMemberPermission, useRoomPermission } from "@/hooks/useRoom";
import customHeaders from "@/components/cinema/dialogs/customHeaders.vue";
import customSubtitles from "@/components/cinema/dialogs/customSubtitles.vue";

const customHeadersDialog = ref<InstanceType<typeof customHeaders>>();
const customSubtitlesDialog = ref<InstanceType<typeof customSubtitles>>();

// 获取房间信息
const room = roomStore();
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage<string>(`room-${roomID.value}-token`, "");
const { myInfo } = useRoomApi(roomID.value);
const { hasMemberPermission } = useRoomPermission();
const can = (p: RoomMemberPermission) => {
  if (!myInfo.value) return;
  const myP = myInfo.value.permissions;
  return hasMemberPermission(myP, p);
};

const emits = defineEmits(["send-msg"]);
const {
  currentPage,
  pageSize,
  getMovies,
  moviesLoading,
  selectMovies,
  swapMovie,
  changeCurrentMovie,
  cMovieInfo,
  updateHeaders,
  updateSubtitles,
  editMovieInfo,
  editMovieInfoLoading,
  deleteMovie,
  deleteMovieLoading,
  clearMovieList,
  clearMovieListLoading,
  getLiveInfo,
  liveInfo
} = useMovieApi(roomToken.value);

// 打开编辑对话框
const editDialog = ref(false);
const openEditDialog = (item: MovieInfo) => {
  cMovieInfo.value = {
    id: item.id,
    ...item.base
  } as EditMovieInfo;
  editDialog.value = true;
};

// 编辑确认
const confirmEdit = async () => {
  await editMovieInfo();
  editDialog.value = false;
};

// 直播相关
const liveInfoDialog = ref(false);
const openLiveInfoDialog = async (id: string) => {
  await getLiveInfo(id);
  liveInfoDialog.value = true;
};

// 清空确认
const confirmClear = async () => {
  await clearMovieList();
  emits("send-msg", "PLAYER：列表已清空");
};

const confirmCancelPlayback = async () => {
  await changeCurrentMovie("", true);
  emits("send-msg", "PLAYER：播放已取消");
};
</script>

<template>
  <div class="card">
    <div class="card-title">影片列表（{{ room.totalMovies }}）</div>

    <div class="card-body">
      <el-skeleton v-if="moviesLoading" :rows="1" animated />
      <div
        v-else
        v-for="item in room.movies"
        :key="item.base!.name"
        class="flex justify-around mb-2 rounded-lg bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800"
      >
        <div class="m-auto pl-2">
          <input v-model="selectMovies" type="checkbox" :value="item['id']" />
        </div>
        <div class="overflow-hidden text-ellipsis mr-auto p-2 w-7/12">
          <b class="block text-base font-semibold" :title="`ID: ${item.id}`">
            <el-tag class="mr-1" size="small" v-if="item.base!.live"> 直播流 </el-tag>
            <el-tag class="mr-1" size="small" type="success" v-if="item.base!.proxy"> 代理 </el-tag>
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
            <img
              v-else-if="item.base?.vendorInfo?.vendor === 'emby'"
              class="inline leading-3 w-4"
              src="/src/assets/appIcons/emby.svg"
            />
            {{ item.base!.name }}
            <button
              v-if="item.base!.rtmpSource"
              class="ml-1 font-normal text-sm border bg-rose-50 dark:bg-transparent border-rose-500 rounded-lg px-2 text-rose-500 hover:brightness-75 transition-all"
              @click="openLiveInfoDialog(item['id'])"
            >
              查看推流信息
            </button>
          </b>
          <small class="truncate">{{ item.base!.url || item.id }}</small>
        </div>

        <div class="m-auto p-2" v-if="room.currentMovie.id === item.id">
          <button
            class="btn btn-dense btn-success border-green-500 text-green-600 bg-green-100 dark:bg-green-950 dark:border-green-800 m-0 mr-5"
            disabled
          >
            正在播放
            <PlayIcon class="inline-block" width="18px" />
          </button>
          <el-popconfirm
            v-if="can(RoomMemberPermission.PermissionSetCurrentMovie)"
            width="220"
            confirm-button-text="是"
            cancel-button-text="否"
            title="你确定要取消正在播放的影片吗？!"
            @confirm="confirmCancelPlayback"
          >
            <template #reference>
              <button class="btn btn-dense btn-error m-0 mr-1">
                取消播放
                <TrashIcon class="inline-block" width="16px" height="16px" />
              </button>
            </template>
          </el-popconfirm>
        </div>

        <div class="m-auto p-2" v-else>
          <button
            v-if="can(RoomMemberPermission.PermissionSetCurrentMovie)"
            class="btn btn-dense m-0 mr-1"
            @click="changeCurrentMovie(item['id'])"
          >
            播放
            <PlayIcon class="inline-block" width="18px" />
          </button>
          <button
            v-if="can(RoomMemberPermission.PermissionEditMovie)"
            class="btn btn-dense btn-warning m-0 mr-1"
            @click="openEditDialog(item)"
          >
            编辑
            <EditIcon class="inline-block" width="16px" height="16px" />
          </button>
          <el-popconfirm
            v-if="can(RoomMemberPermission.PermissionDeleteMovie)"
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
        <button
          v-if="selectMovies.length === 2 && can(RoomMemberPermission.PermissionAddMovie)"
          class="btn mr-2"
          @click="swapMovie"
        >
          交换位置
        </button>

        <el-popconfirm
          v-if="can(RoomMemberPermission.PermissionDeleteMovie)"
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
        @size-change="getMovies()"
        @current-change="getMovies()"
      />

      <div></div>
      <div>
        <el-popconfirm
          v-if="room.currentMovie.id && can(RoomMemberPermission.PermissionSetCurrentMovie)"
          width="220"
          confirm-button-text="是"
          cancel-button-text="否"
          title="你确定要取消正在播放的影片吗？!"
          @confirm="confirmCancelPlayback"
        >
          <template #reference>
            <button class="btn btn-error">取消播放</button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          v-if="can(RoomMemberPermission.PermissionDeleteMovie)"
          width="220"
          confirm-button-text="是"
          cancel-button-text="否"
          title="你确定要清空影片列表吗？!"
          @confirm="confirmClear"
        >
          <template #reference>
            <button class="btn btn-error mx-2">清空列表</button>
          </template>
        </el-popconfirm>
        <button class="btn btn-success" @click="getMovies()">更新列表</button>
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
        class="rounded-lg p-3 w-full bg-zinc-50 hover:bg-zinc-100 transition-all dark:bg-zinc-700 hover:dark:bg-zinc-800 cursor-pointer mb-2"
        @click="customHeadersDialog?.openDialog()"
      >
        <span class="text-sm min-w-fit"> 自定义 header </span>
      </div>
      <div
        class="rounded-lg p-3 w-full bg-zinc-50 hover:bg-zinc-100 transition-all dark:bg-zinc-700 hover:dark:bg-zinc-800 cursor-pointer"
        @click="customSubtitlesDialog?.openDialog()"
      >
        <span class="text-sm min-w-fit"> 字幕列表 </span>
      </div>
      <div class="p-3"><b>温馨提示：</b>编辑后，需要重新点击播放才可应用</div>
    </el-form>
    <template #footer>
      <button class="btn mr-2" @click="editDialog = false">取消</button>
      <button class="btn btn-success contrast-50" disabled v-if="editMovieInfoLoading">
        请求中...
      </button>
      <button class="btn btn-success" @click="confirmEdit()" v-else>确定修改</button>
    </template>
  </el-dialog>

  <!-- 编辑 Header -->
  <customHeaders
    ref="customHeadersDialog"
    :customHeader="cMovieInfo.headers"
    @updateHeaders="updateHeaders"
  />

  <!-- 编辑字幕 -->
  <customSubtitles
    ref="customSubtitlesDialog"
    :custom-subtitles="cMovieInfo.subtitles ?? {}"
    @updateSubtitles="updateSubtitles"
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
          :value="`rtmp://${liveInfo?.host}/${liveInfo?.app}/`"
        />
      </el-form-item>
      <el-form-item label="推流密钥：">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" :value="liveInfo?.token" />
      </el-form-item>
    </el-form>

    <template #footer>
      <button class="btn btn-success" @click="liveInfoDialog = false">我已知晓</button>
    </template>
  </el-dialog>
</template>
