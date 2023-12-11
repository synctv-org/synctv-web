<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { roomStatus, type RoomList } from "@/types/Room";
import JoinRoom from "@/views/JoinRoom.vue";
import { userStore } from "@/stores/user";
import { Search } from "@element-plus/icons-vue";
import { useTimeAgo } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useRoomApi } from "@/hooks/useRoom";
import { getObjValue } from "@/utils";

const router = useRouter();
const props = defineProps<{
  isMyRoom: boolean;
  userId?: string;
}>();

const { token, isLogin } = userStore();
const thisRoomList = ref<RoomList[]>([]);
const JoinRoomDialog = ref(false);
const formData = ref<{
  roomId: string;
  password: string;
}>({
  roomId: "",
  password: ""
});

const openJoinRoomDialog = (item: RoomList) => {
  if (!isLogin.value) {
    ElNotification({
      title: "错误",
      message: "请先登录",
      type: "error"
    });
    router.replace({
      name: "login",
      query: {
        redirect: router.currentRoute.value.fullPath
      }
    });
    return;
  }
  formData.value.roomId = item.roomId;
  JoinRoomDialog.value = true;
};

const {
  totalItems,
  currentPage,
  pageSize,
  order,
  sort,
  keyword,
  search,
  status,
  getRoomList: getRoomList_,
  roomList,

  getMyRoomList,
  myRoomList
} = useRoomApi(formData.value.roomId);

const getRoomList = async (showMsg = false) => {
  if (props.isMyRoom) {
    await getMyRoomList(showMsg);
    if (myRoomList.value) thisRoomList.value = myRoomList.value.list!;
  } else {
    await getRoomList_();
    if (roomList.value) thisRoomList.value = roomList.value.list!;
  }
};

onMounted(() => {
  getRoomList();
});
</script>

<template>
  <div class="card mx-auto">
    <div class="card-title flex flex-wrap justify-between items-center">
      <div class="max-sm:mb-3">
        {{ isMyRoom ? "我创建的" : "房间列表" }}（{{ thisRoomList.length }}）
      </div>
      <div class="text-base -my-2">
        排序方式：<el-select
          v-model="sort"
          class="m-2"
          placeholder="排序方式"
          @change="getRoomList(false)"
        >
          <el-option label="房间名称" value="name" />
          <el-option label="创建时间" value="createdAt" />
        </el-select>
        <button
          class="btn btn-dense"
          @click="
            order === 'desc' ? (order = 'asc') : (order = 'desc');
            getRoomList();
          "
        >
          {{ order === "asc" ? "👆" : "👇" }}
        </button>
      </div>
    </div>
    <div class="card-body text-center">
      <div class="m-auto w-96 mb-3 flex" v-if="isMyRoom">
        <el-select
          v-model="status"
          placeholder="状态"
          style="width: 130px"
          @change="getRoomList(false)"
        >
          <el-option label="ALL" value="" />
          <el-option v-for="r in Object.values(roomStatus)" :label="r" :value="r.toLowerCase()" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索" @keyup.enter="getRoomList(false)" required>
          <template #prepend>
            <el-select
              v-model="search"
              @change="getRoomList(false)"
              placeholder="Select"
              style="width: 90px"
            >
              <el-option label="综合" value="all" />
              <el-option label="名称" value="name" />
              <el-option label="ID" value="id" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="getRoomList(false)" />
          </template>
        </el-input>
      </div>

      <div class="flex flex-wrap justify-center">
        <el-empty v-if="thisRoomList.length === 0" description="啥都没有哦~" />
        <div
          v-else
          v-for="item in thisRoomList"
          :key="item.roomId"
          class="flex flex-wrap m-2 rounded-lg bg-stone-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800 max-w-[225px]"
        >
          <div class="overflow-hidden text-ellipsis m-auto p-2 w-full">
            <b class="block text-base font-semibold truncate"> {{ item["roomName"] }}</b>
          </div>
          <div class="overflow-hidden text-ellipsis text-sm m-auto">
            <div>
              在线人数：<span :class="item.peopleNum > 0 ? 'text-green-500' : 'text-red-500'">{{
                item["peopleNum"]
              }}</span>
            </div>
            <div v-if="isMyRoom">状态：{{ getObjValue(roomStatus, item.status) }}</div>
            <div v-else class="truncate">创建者：{{ item.creator }}</div>
            <div>创建时间：{{ useTimeAgo(new Date(item.createdAt)).value }}</div>
          </div>
          <div class="flex mt-2 my-3 w-full justify-around items-center">
            <el-tag v-if="!isMyRoom" disabled :type="item.needPassword ? 'danger' : 'success'">
              {{ item.needPassword ? "有密码" : "无密码" }}
            </el-tag>
            <button class="btn btn-dense" @click="openJoinRoomDialog(item)">
              加入房间
              <PlayIcon class="inline-block" width="18px" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer justify-between flex-wrap overflow-hidden">
      <button class="btn btn-success max-sm:mb-4" @click="getRoomList(true)">更新列表</button>
      <el-pagination
        v-if="thisRoomList.length != 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        :total="totalItems"
        @size-change="getRoomList(false)"
        @current-change="getRoomList(false)"
        class="flex-wrap"
      />
    </div>
  </div>

  <el-dialog v-model="JoinRoomDialog" class="rounded-lg dark:bg-zinc-800 w-[443px] max-sm:w-[90%]">
    <template #header>
      <div class="overflow-hidden text-ellipsis">
        <span class="truncate">加入房间</span>
      </div>
    </template>
    <JoinRoom :item="formData" />
  </el-dialog>
</template>
