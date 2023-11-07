<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import { hotRoom } from "@/services/apis/room";
import type { RoomList } from "@/types/Room";
import JoinRoom from "@/views/JoinRoom.vue";
import { roomStore } from "@/stores/room";

const { login: isLogin } = roomStore();
const __roomList = ref<RoomList[]>([]);
const JoinRoomDialog = ref(false);
const formData = ref({
  roomId: "",
  password: ""
});

const openJoinRoomDialog = (item: RoomList) => {
  if (!isLogin)
    return ElNotification({
      title: "错误",
      message: "请先登录",
      type: "error"
    });

  formData.value.roomId = item.roomId;
  JoinRoomDialog.value = true;
};

const { state: roomList, execute: reqHotRoomList } = hotRoom();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const order = ref("peopleNum");
const sort = ref("desc");
const search = ref("all");
const keyword = ref("all");

const getRoomList = async (showMsg = false) => {
  __roomList.value = [];
  try {
    await reqHotRoomList({
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
      for (let i = 0; i < roomList.value.list.length; i++) {
        __roomList.value.push(roomList.value.list[i]);
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
    <div class="card-title flex flex-wrap justify-between">
      <div>热度榜</div>
    </div>
    <div class="card-body">
      <el-empty v-if="__roomList.length === 0" description="无房间，去创建一个吧~" />
      <div
        v-else
        v-for="(item, i) in __roomList"
        :key="i"
        class="flex max-sm:flex-wrap justify-around m-2 rounded-lg bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800 w-auto items-center"
      >
        <div class="m-auto sm:ml-5 max-sm:mt-5">
          <b> {{ i + 1 }}</b>
        </div>
        <div class="overflow-hidden text-ellipsis p-2 w-full">
          <b class="block text-base font-semibold truncate"> {{ item["roomName"] }}</b>
        </div>
        <div class="overflow-hidden text-ellipsis p-2 text-sm w-full">
          在线人数：<span :class="item.peopleNum > 0 ? 'text-green-500' : 'text-red-500'">{{
            item["peopleNum"]
          }}</span>

          <div>创建者：{{ item.creator }}</div>
        </div>
        <div class="flex p-2 w-full justify-between items-center">
          <el-tag disabled :type="item.needPassword ? 'danger' : 'success'">
            {{ item.needPassword ? "有密码" : "无密码" }}
          </el-tag>
          <button class="btn btn-dense md:ml-2" @click="openJoinRoomDialog(item)">
            加入房间
            <PlayIcon class="inline-block" width="18px" />
          </button>
        </div>
      </div>
    </div>

    <div class="card-footer justify-between flex-wrap overflow-hidden">
      <button class="btn btn-success max-sm:mb-4" @click="getRoomList(true)">更新列表</button>
      <el-pagination
        v-if="__roomList.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :pager-count="4"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
        @size-change="getRoomList(false)"
        @current-change="getRoomList(false)"
      />
    </div>
  </div>

  <el-dialog v-model="JoinRoomDialog" class="rounded-lg dark:bg-zinc-800 w-[443px] max-sm:w-[90%]">
    <template #title>
      <div class="overflow-hidden text-ellipsis">
        <span class="truncate">加入房间</span>
      </div>
    </template>
    <JoinRoom :item="formData" />
  </el-dialog>
</template>
