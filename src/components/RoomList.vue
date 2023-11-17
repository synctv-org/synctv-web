<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { roomListApi } from "@/services/apis/room";
import { myRoomList } from "@/services/apis/user";
import { roomStatus, type RoomList } from "@/types/Room";
import JoinRoom from "@/views/JoinRoom.vue";
import { userStore } from "@/stores/user";
import { Search } from "@element-plus/icons-vue";

const props = defineProps<{
  isMyRoom: boolean;
}>();

const { token, isLogin } = userStore();
const __roomList = ref<RoomList[]>([]);
const JoinRoomDialog = ref(false);
const formData = ref<{
  roomId: string;
  password: string;
}>({
  roomId: "",
  password: ""
});

const openJoinRoomDialog = (item: RoomList) => {
  if (!isLogin.value)
    return ElNotification({
      title: "错误",
      message: "请先登录",
      type: "error"
    });
  formData.value.roomId = item.roomId;
  JoinRoomDialog.value = true;
};

const { state: roomList, execute: reqRoomList } = roomListApi();
const { state: myRoomList_, execute: reqMyRoomList } = myRoomList();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("desc");
const sort = ref("name");
const keyword = ref("");
const search = ref("all");
const status = ref("");

const getRoomList = async (showMsg = false) => {
  try {
    if (props.isMyRoom) {
      await reqMyRoomList({
        params: {
          page: currentPage.value,
          max: pageSize.value,
          sort: sort.value,
          order: order.value,
          search: search.value,
          keyword: keyword.value,
          status: status.value
        },
        headers: {
          Authorization: token.value
        }
      });
    } else {
      await reqRoomList({
        params: {
          page: currentPage.value,
          max: pageSize.value,
          sort: sort.value,
          order: order.value,
          search: "all",
          keyword: ""
        }
      });
    }

    if (props.isMyRoom) {
      if (myRoomList_.value && myRoomList_.value.list) {
        totalItems.value = myRoomList_.value.total;
        __roomList.value = myRoomList_.value.list;
      }
    } else {
      if (roomList.value && roomList.value.list) {
        totalItems.value = roomList.value.total;
        __roomList.value = roomList.value.list;
      }
    }

    showMsg &&
      ElNotification({
        title: `更新列表成功`,
        type: "success"
      });
  } catch (err: any) {
    console.error(err.message);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
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
        <span v-if="!isMyRoom"> 房间列表（{{ __roomList.length }}）</span>
        <span v-else>我创建的（{{ __roomList.length }}）</span>
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
    <div class="card-body">
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
        <el-empty v-if="__roomList.length === 0" description="啥都没有哦~" />
        <div
          v-else
          v-for="item in __roomList"
          :key="item.roomId"
          class="flex flex-wrap m-2 rounded-lg bg-stone-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800 max-w-[225px]"
        >
          <div class="overflow-hidden text-ellipsis m-auto p-2 w-full">
            <b class="block text-base font-semibold truncate"> {{ item["roomName"] }}</b>
          </div>
          <div class="overflow-hidden text-ellipsis text-sm p-2">
            <div>
              在线人数：<span :class="item.peopleNum > 0 ? 'text-green-500' : 'text-red-500'">{{
                item["peopleNum"]
              }}</span>
            </div>
            <div v-if="!isMyRoom" class="truncate">创建者：{{ item.creator }}</div>
            <div>创建时间：{{ new Date(item.createdAt).toLocaleString() }}</div>
          </div>
          <div class="flex p-2 w-full justify-between items-center">
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
        v-if="__roomList.length != 0"
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
