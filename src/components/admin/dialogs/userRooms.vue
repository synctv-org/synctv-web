<script setup lang="ts">
import { ref } from "vue";
import { ElNotification } from "element-plus";
import { userRoomListApi } from "@/services/apis/admin";
import { roomStatus, type RoomList } from "@/types/Room";
import JoinRoom from "@/views/JoinRoom.vue";
import { userStore } from "@/stores/user";
import { Search } from "@element-plus/icons-vue";
import { useTimeAgo } from "@vueuse/core";

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

const open = ref(false);
const userId = ref("");
const openDialog = async (id: string) => {
  open.value = true;
  userId.value = id;
  await getRoomList();
};

defineExpose({ openDialog });

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

const { state: roomList, execute: reqUserRoomListApi, isLoading } = userRoomListApi();
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
    await reqUserRoomListApi({
      headers: {
        Authorization: token.value
      },
      params: {
        page: currentPage.value,
        max: pageSize.value,
        sort: sort.value,
        order: order.value,
        status: status.value,
        search: search.value,
        keyword: keyword.value,
        id: userId.value
      }
    });

    if (roomList.value && roomList.value.list) {
      totalItems.value = roomList.value.total;
      __roomList.value = roomList.value.list;
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
</script>

<template>
  <el-dialog
    v-model="open"
    :title="`用户房间列表（${__roomList.length}）`"
    :close-on-click-modal="false"
    class="rounded-lg dark:bg-zinc-800 w-3/7 max-sm:w-full"
  >
    <template #header>
      <div class="flex flex-wrap justify-between items-center -my-1 text-base mr-4">
        <div class="max-sm:mb-3 text-lg font-medium">用户房间列表（{{ __roomList.length }}）</div>
        <div class="">
          排序方式：<el-select
            v-model="sort"
            class="mr-2"
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
    </template>
    <template #default>
      <div class="m-auto w-96 -my-5 mb-3 flex">
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
        <el-empty v-if="__roomList.length === 0" description="此处空空如也" />
        <div
          v-else
          v-for="item in __roomList"
          :key="item.roomId"
          class="flex flex-wrap m-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-all dark:bg-neutral-700 hover:dark:bg-zinc-900 max-w-[225px]"
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
            <div>创建时间：{{ useTimeAgo(new Date(item.createdAt)).value }}</div>
          </div>
          <div class="flex p-2 w-full justify-between items-center">
            <el-tag disabled :type="item.needPassword ? 'danger' : 'success'">
              {{ item.needPassword ? "有密码" : "无密码" }}
            </el-tag>
            <button class="btn btn-dense" @click="openJoinRoomDialog(item)">
              加入房间
              <PlayIcon class="inline-block" width="18px" />
            </button>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-wrap justify-between overflow-hidden">
        <el-button type="success" @click="getRoomList(true)" :loading="isLoading"
          >更新列表</el-button
        >

        <!-- <button class="btn btn-success max-sm:mb-4" @click="getRoomList(true)">更新列表</button> -->
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
    </template>
  </el-dialog>

  <el-dialog v-model="JoinRoomDialog" class="rounded-lg dark:bg-zinc-800 w-[443px] max-sm:w-[90%]">
    <template #header>
      <div class="overflow-hidden text-ellipsis">
        <span class="truncate">加入房间</span>
      </div>
    </template>
    <JoinRoom :item="formData" />
  </el-dialog>
</template>
