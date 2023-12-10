<script setup lang="ts">
import { ref } from "vue";
import { ElNotification } from "element-plus";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { updateRoomPasswordApi, delRoomApi } from "@/services/apis/room";
import { roomStore } from "@/stores/room";
import { strLengthLimit } from "@/utils";

const props = defineProps<{
  status: string;
}>();

// 获取房间信息
const room = roomStore();
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage<string>(`room-${roomID.value}-token`, "");

// 显示房间密码
let isShowPassword = ref(false);

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
      headers: { Authorization: roomToken.value }
    });

    if (newToken.value) {
      ElNotification({
        title: "更新成功",
        type: "success"
      });
      roomToken.value = newToken.value.token;
      setTimeout(() => {
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

// 删除房间
const { execute: reqDelRoomApi } = delRoomApi();
const deleteRoom = async () => {
  try {
    await reqDelRoomApi({
      data: {
        roomId: roomID.value
      },
      headers: { Authorization: roomToken.value }
    });

    ElNotification({
      title: "删除成功",
      type: "success"
    });
    roomToken.value = "";
    setTimeout(() => {
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
</script>

<template>
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
</template>
