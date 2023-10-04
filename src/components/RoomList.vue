<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios, { type AxiosResponse } from "axios";
import { ElNotification } from "element-plus";
import { roomStore } from "@/stores/room";
import router from "@/router";
import { roomListApi, joinRoomApi } from "@/services/apis/room";
import type { RoomList } from "@/types/Room";
import JoinRoom from "@/views/JoinRoom.vue";

const room = roomStore();
const __roomList = ref<RoomList[]>([
  // { roomid: "1", peoplenum: 0, needpassword: false },
  // { roomid: "OPPPPPPPPPPPPPPPPPPPPPPPPPPP", peoplenum: 10, needpassword: false },
  // { roomid: "1asdsadasdz", peoplenum: 114514, needpassword: true },
  // { roomid: "1sdfgdgscv", peoplenum: 114114514514, needpassword: false },
  // { roomid: "ewadfds1", peoplenum: 114514, needpassword: true },
  // { roomid: "asdfsaddf1", peoplenum: 114114514114514514, needpassword: false },
  // { roomid: "1fadfsf", peoplenum: 114514, needpassword: true },
  // { roomid: "sdxccvrsd1", peoplenum: 114114514514, needpassword: false },
  // { roomid: "fsddfsd1", peoplenum: 114114514114514514, needpassword: false },
  // { roomid: "sfdsff1", peoplenum: 114514, needpassword: false },
  // { roomid: "cdc1", peoplenum: 114514, needpassword: false },
  // { roomid: "aDS1", peoplenum: 0, needpassword: true },
  // { roomid: "df", peoplenum: 0, needpassword: true },
  // { roomid: "sdaXdasd1", peoplenum: 0, needpassword: false },
  // { roomid: "3WAQsdwq1", peoplenum: 0, needpassword: false },
  // { roomid: "asdsdAD1", peoplenum: 0, needpassword: false },
  // { roomid: "ad1", peoplenum: 0, needpassword: false },
  // { roomid: "aDxasds1", peoplenum: 0, needpassword: false },
  // { roomid: "adsds1", peoplenum: 0, needpassword: false },
  // { roomid: "SADDASDS1", peoplenum: 0, needpassword: false }
]);

const JoinRoomDialog = ref(false);

const formData = ref({
  // uname: "",
  // RoomID: "",
  // password: "",
  // hasPwd: false
  roomId: "",
  password: "",
  username: localStorage.getItem("uname") || "",
  userPassword: localStorage.getItem("uPasswd") || ""
});

const openJoinRoomDialog = (item: RoomList) => {
  // if (!hasPwd && hasUname) return joinRoom(localStorage.uname, RoomID, "");

  formData.value.roomId = item.roomId;
  JoinRoomDialog.value = true;
};

const { state: roomList, execute: reqRoomList } = roomListApi();
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const sort = ref("peopleNum");
const order = ref("desc");

const getRoomList = async (showMsg = false) => {
  __roomList.value = [];
  try {
    await reqRoomList({
      params: {
        page: currentPage.value,
        max: pageSize.value,
        sort: sort.value,
        order: order.value
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
  <div class="card mx-auto lg:w-9/12 max-sm:rounded-none">
    <div class="card-title flex flex-wrap justify-between">
      <div>房间列表（{{ __roomList.length }}）</div>
      <div class="text-base">
        排序方式：<el-select
          v-model="sort"
          class="m-2"
          placeholder="排序方式"
          @change="getRoomList(false)"
        >
          <el-option label="房间ID" value="roomId" />
          <el-option label="房间人数" value="peopleNum" />
          <el-option label="创建人首字母" value="creator" />
          <el-option label="创建时间" value="createAt" />
          <el-option label="是否有密码" value="needPassword" />
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
    <div class="card-body flex flex-wrap justify-center">
      <el-empty v-if="__roomList.length === 0" description="无房间，去创建一个吧~" />
      <div
        v-else
        v-for="item in __roomList"
        :key="item.roomId"
        class="flex flex-wrap m-2 rounded-lg bg-stone-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800 max-w-[220px]"
      >
        <div class="overflow-hidden text-ellipsis m-auto p-2 w-full">
          <b class="block text-base font-semibold truncate"> {{ item["roomId"] }}</b>
        </div>
        <div class="text-sm p-2">
          <div class="inline mr-2">
            在线人数：<span :class="item.peopleNum > 0 ? 'text-green-500' : 'text-red-500'">{{
              item["peopleNum"]
            }}</span>
          </div>
          <div class="inline">创建者：{{ item.creator }}</div>
          <hr />
          <div>创建时间：{{ new Date(item.createAt).toLocaleString() }}</div>
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

  <el-dialog
    v-model="JoinRoomDialog"
    :title="'加入房间 ' + formData.roomId"
    class="rounded-lg dark:bg-zinc-800 w-[443px] max-sm:w-[90%]"
  >
    <!-- <el-form
      label-position="top"
      ref="form"
      @submit.prevent="joinRoom(formData.uname, formData.RoomID, formData.password)"
    >
      <el-form-item label="设置一个用户名：" v-if="!hasUname">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" v-model="formData.uname" />
      </el-form-item>
      <el-form-item label="房间密码：" v-if="formData.hasPwd">
        <input type="text" class="l-input m-0 p-0 pl-2 w-full" v-model="formData.password" />
      </el-form-item>
    </el-form> -->
    <JoinRoom :item="formData" />
    <!-- <template #footer>
      <button
        class="btn btn-success"
        @click="joinRoom(formData.uname, formData.RoomID, formData.password)"
      >
        加入
      </button>
    </template> -->
  </el-dialog>
</template>
