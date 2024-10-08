<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useLocalStorage, type WebSocketStatus } from "@vueuse/core";
import CopyButton from "../CopyButton.vue";
import RoomManage from "@/components/cinema/RoomManage.vue";
import RoomUsers from "@/components/cinema/RoomUsers.vue";
import { userStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { checkRoomPasswordApi, roomInfoApi } from "@/services/apis/room";
import { ElMessage } from "element-plus";
import type { RoomInfo } from "@/types/Room";

const props = defineProps<{
  roomId: string;
  token: string;
  status: WebSocketStatus;
  info: RoomInfo;
}>();

const roomPwd = useLocalStorage(`room-${props.roomId}-pwd`, "");
const { isLogin } = userStore();
const router = useRouter();

const shareURL = computed(() => `${window.location.origin}/web/joinRoom/${props.roomId}`);
const shareURLWithPwd = computed(() => `${shareURL.value}?pwd=${roomPwd.value}`);

const roomManageDrawer = ref<InstanceType<typeof RoomManage>>();
const roomUsersDrawer = ref<InstanceType<typeof RoomUsers>>();

const showShareOptions = ref(false);
const inputPassword = ref(roomPwd.value);
const isPasswordCorrect = ref(true);

const { execute: checkRoomPassword } = checkRoomPasswordApi();

const shareRoom = async () => {
  if (!props.info.needPassword) {
    await shareWithoutPassword();
  } else {
    showShareOptions.value = true;
  }
};

const shareWithoutPassword = async () => {
  await navigator.clipboard.writeText(shareURL.value);
  ElMessage.success("链接已复制到剪贴板");
  showShareOptions.value = false;
};

const shareWithPassword = async () => {
  const isCorrect = await checkRoomPassword({
    data: { password: inputPassword.value },
    headers: {
      Authorization: props.token,
      "X-Room-Id": props.roomId
    }
  });

  if (isCorrect.value?.valid) {
    await navigator.clipboard.writeText(shareURLWithPwd.value);
    ElMessage.success("带密码的链接已复制到剪贴板");
    showShareOptions.value = false;
    isPasswordCorrect.value = true;
    roomPwd.value = inputPassword.value;
  } else {
    isPasswordCorrect.value = false;
    inputPassword.value = "";
  }
};

const goToLogin = () => router.push("/login");
</script>

<template>
  <div class="card">
    <div class="card-title">房间信息</div>
    <div class="card-body">
      <table class="table-auto i-table">
        <tbody>
          <tr>
            <td width="100">连接状态</td>
            <td :class="status === 'OPEN' ? 'text-green-500' : 'text-red-500 font-medium'">
              {{ status }}
            </td>
          </tr>
          <tr>
            <td>房间ID</td>
            <td>
              <div class="overflow-hidden flex text-ellipsis max-w-[150px]">
                <span class="truncate">{{ props.roomId }}</span>
                <CopyButton class="border-0" size="small" :value="props.roomId" />
              </div>
            </td>
          </tr>
          <tr>
            <td>分享链接</td>
            <td>
              <div class="overflow-hidden flex text-ellipsis max-w-[150px]">
                <button class="btn btn-primary" @click="shareRoom">分享</button>
              </div>
            </td>
          </tr>
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

  <!-- 分享选项对话框 -->
  <div
    v-if="showShareOptions"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white p-4 rounded-lg">
      <h3 class="text-lg font-bold mb-4">选择分享方式</h3>
      <div class="flex flex-col gap-4">
        <button class="btn btn-primary" @click="shareWithoutPassword">不携带密码分享</button>
        <button class="btn btn-success" @click="shareWithPassword">携带密码分享</button>
        <div v-if="props.info.needPassword && (!isPasswordCorrect || !roomPwd)" class="mt-2">
          <input
            v-model="inputPassword"
            type="password"
            placeholder="请输入房间密码"
            class="input input-bordered w-full"
          />
        </div>
        <p v-if="!isPasswordCorrect" class="text-red-500">密码不正确，请重试</p>
      </div>
      <button class="btn btn-ghost mt-4" @click="showShareOptions = false">取消</button>
    </div>
  </div>

  <!-- 用户列表 -->
  <RoomUsers v-if="isLogin" ref="roomUsersDrawer" :room-id="props.roomId" :token="props.token" />

  <!-- 房间设置 -->
  <RoomManage v-if="isLogin" ref="roomManageDrawer" :room-id="props.roomId" :token="props.token" />
</template>

<style lang="less" scoped>
.i-table {
  td {
    padding: 2px 0 2px;
  }
}
</style>
