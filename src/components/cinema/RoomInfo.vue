<script setup lang="ts">
import { computed, ref } from "vue";
import { useLocalStorage, type WebSocketStatus } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import CopyButton from "../CopyButton.vue";
import RoomManage from "@/components/cinema/RoomManage.vue";
import RoomUsers from "@/components/cinema/RoomUsers.vue";
import { userStore } from "@/stores/user";
import { useRouter } from "vue-router";

const props = defineProps<{
  token: string;
  status: WebSocketStatus;
}>();

// 获取房间信息
const roomID = useRouteParams<string>("roomId");
const roomPwd = useLocalStorage(`room-${roomID.value}-pwd`, "");

const { isLogin } = userStore();
const router = useRouter();

const shareURL = computed(() => {
  return `${window.location.origin}/web/joinRoom/${roomID.value}?pwd=${roomPwd.value}`;
});

const roomManageDrawer = ref<InstanceType<typeof RoomManage>>();
const roomUsersDrawer = ref<InstanceType<typeof RoomUsers>>();

const goToLogin = () => {
  router.push("/login");
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
            <td :class="status === 'OPEN' ? ' text-green-500' : 'text-red-500 font-medium'">
              {{ status }}
            </td>
          </tr>
          <tr>
            <td>房间ID</td>
            <td>
              <div class="overflow-hidden flex text-ellipsis max-w-[150px]">
                <span class="truncate">{{ roomID }}</span>
                <CopyButton class="border-0" size="small" :value="roomID" />
              </div>
            </td>
          </tr>
          <tr>
            <td>分享链接</td>
            <td>
              <div class="overflow-hidden flex text-ellipsis max-w-[150px]">
                <CopyButton class="border-0" size="small" :value="shareURL" />
              </div>
            </td>
          </tr>

          <!-- <tr>
            <td>在线人数</td>
            <td>{{ room.peopleNum }}</td>
          </tr> -->
        </tbody>
      </table>
    </div>

    <div v-if="isLogin" class="card-footer flex-wrap justify-between">
      <button class="btn btn-success" @click="roomUsersDrawer?.openDrawer">用户列表</button>
      <button class="btn" @click="roomManageDrawer?.openDrawer">房间设置</button>
    </div>
    <div v-else class="card-footer justify-center">
      <button class="btn btn-primary" @click="goToLogin">登录</button>
    </div>
  </div>

  <!-- 用户列表 -->
  <RoomUsers v-if="isLogin" ref="roomUsersDrawer" :room-id="roomID" :token="token" />

  <!-- 房间设置 -->
  <RoomManage v-if="isLogin" ref="roomManageDrawer" :room-id="roomID" :token="token" />
</template>

<style lang="less" scoped>
.i-table {
  td {
    padding: 2px 0 2px;
  }
}
</style>
