<script setup lang="ts">
import { ref } from "vue";
import { ElNotification } from "element-plus";
import { roomListApi } from "@/services/apis/room";
import type { RoomList } from "@/types/Room";
import JoinRoom from "./JoinRoom.vue";
import { roomStore } from "@/stores/room";
import { useTimeAgo } from "@vueuse/core";

const room = roomStore();
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
  if (!room.login){
    ElNotification({
      title: "错误",
      message: "请先登录",
      type: "error"
    })
    router.push("/auth/login")
    return
  }

  formData.value.roomId = item.roomId;
  JoinRoomDialog.value = true;
};

const { state: roomList, execute: reqRoomList } = roomListApi();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("desc");
const sort = ref("name");
const search = ref("all");
const keyword = ref("");

const getRoomList = async (showMsg = false) => {
  try {
    await reqRoomList({
      params: {
        page: currentPage.value,
        max: pageSize.value,
        sort: sort.value,
        order: order.value,
        search: search.value,
        keyword: keyword.value
      }
    });
    if (roomList.value && roomList.value.list) {
      totalItems.value = roomList.value.total;
      __roomList.value = roomList.value.list;
    }
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
  <div class="text-center">
    <div class="lg:w-5/12 mx-auto">
      <div class="inline-block mb-2 l-input">
        <select v-model="search" @change="getRoomList(false)">
          <option value="all">综合</option>
          <option value="name">房间名称</option>
          <option value="creator">创建者</option>
        </select>
        <input
          v-model="keyword"
          class="m-0 ml-1 bg-transparent text-base transition-all duration-500 hover:px-5 outline-none focus:outline-none"
          type="text"
          placeholder="搜索"
          required
          @keyup.enter="getRoomList(false)"
        />
      </div>
    </div>
    <el-empty v-if="__roomList.length === 0" description="查无此房间" />
    <div v-else class="lg:w-9/12 mx-auto flex flex-wrap justify-center mb-5">
      <div
        v-for="item in __roomList"
        :key="item.roomId"
        class="flex flex-wrap m-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800 max-w-[225px] max-sm:max-w-full justify-center relative"
      >
        <div class="overflow-hidden text-ellipsis m-auto sm:p-2 w-full max-sm:mt-2">
          <!-- <el-tag disabled type="warning" class="text-sm absolute left-2" title="RoomID">
            {{ item["roomId"] }}
          </el-tag> -->
          <b class="text-base font-semibold truncate"> {{ item["roomName"] }}</b>
        </div>
        <div class="overflow-hidden text-ellipsis text-sm p-2">
          <div>
            在线人数：<span :class="item.peopleNum > 0 ? 'text-green-500' : 'text-red-500'">{{
              item["peopleNum"]
            }}</span>
          </div>
          <div class="truncate">创建者：{{ item.creator }}</div>
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
    <div class="mx-auto flex flex-wrap justify-center">
      <el-pagination
        v-if="__roomList.length >= 10"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        class="flex-wrap"
        :total="totalItems"
        @size-change="getRoomList(false)"
        @current-change="getRoomList(false)"
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

<style lang="less" scoped>
.room {
  text-align: center;
  margin-top: 5vmax;

  .login-box {
    // width: 443px;
    margin: auto;

    .btn {
      padding: 10px 15px;

      &:hover {
        padding: 12px 15px;
      }
    }
  }
}
</style>
