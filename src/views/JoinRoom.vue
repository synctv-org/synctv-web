<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElNotification } from "element-plus";
import router from "@/router/index";
import { useRoute } from "vue-router";
import { joinRoomApi, checkRoomApi } from "@/services/apis/room";
import { strLengthLimit } from "@/utils";
import { useRouteParams, useRouteQuery } from "@vueuse/router";
import { userStore } from "@/stores/user";
const route = useRoute();
const roomID = useRouteParams("roomId");
const pwd = useRouteQuery("pwd");

const { isLogin } = userStore();

// 是否为弹窗加载
const isModal = computed(() => {
  return route.name !== "joinRoom";
});

const props = defineProps<{
  item?: {
    roomId: string;
    password: string;
  };
}>();

const formData = ref<{
  roomId: string;
  password: string;
}>({
  roomId: (roomID.value as string) ?? "",
  password: pwd.value as string
});

if (props.item) formData.value = props.item;

const { token } = userStore();

const { state: joinRoomInfo, execute: reqJoinRoomApi } = joinRoomApi();
const JoinRoom = async () => {
  if (!formData.value?.roomId) {
    ElNotification({
      title: "错误",
      message: "请填写表单完整",
      type: "error"
    });
    return;
  }
  for (const key in formData.value) {
    strLengthLimit(key, 32);
  }
  try {
    await reqJoinRoomApi({
      data: formData.value,
      headers: {
        Authorization: token.value
      }
    });
    if (!joinRoomInfo.value)
      return ElNotification({
        title: "错误",
        message: "服务器并未返回token",
        type: "error"
      });
    localStorage.setItem(`room-${joinRoomInfo.value.roomId}-token`, joinRoomInfo.value?.token);
    ElNotification({
      title: "加入成功",
      type: "success"
    });

    router.replace(`/cinema/${joinRoomInfo.value.roomId}`);
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

const { state: thisRoomInfo, execute: reqCheckRoomApi } = checkRoomApi();
const checkRoom = async () => {
  try {
    await reqCheckRoomApi({
      params: {
        roomId: formData.value.roomId
      }
    });
    if (thisRoomInfo.value) {
      if (localStorage.uname === thisRoomInfo.value.creator) {
        return await JoinRoom();
      }
      if (thisRoomInfo.value.needPassword) {
        if (pwd.value) return await JoinRoom();
      } else {
        return await JoinRoom();
      }
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

onMounted(() => {
  if (formData.value.roomId) checkRoom();
});
</script>

<template>
  <div :class="isModal ? 'room-dialog' : 'room'">
    <form @submit.prevent="" :class="!isModal && 'sm:w-96 ' + 'w-full'">
      <input class="l-input" type="text" v-model="formData.roomId" placeholder="房间ID" required />
      <br />
      <input class="l-input" type="password" v-model="formData.password" placeholder="房间密码" />
      <br />
      <button class="btn m-[10px]" @click="JoinRoom()">加入</button>
      <div class="text-sm">
        <b>注意：</b>所有输入框最大只可输入32个字符
        <br />
        如果你是该房间所有者，则无需输入密码
      </div>
    </form>
  </div>
</template>

<style lang="less" scoped>
.room {
  text-align: center;
  margin-top: 5vmax;

  form {
    margin: auto;

    input {
      width: 70%;

      &:hover {
        padding: 10px 15px;
        width: 74%;
      }
    }

    .btn {
      padding: 10px 15px;
      width: 70%;

      &:hover {
        padding: 12px 15px;
      }
    }
  }
}

.room-dialog {
  text-align: center;

  form {
    margin: auto;

    input {
      width: 80%;

      &:hover {
        padding: 10px 15px;
        width: 84%;
      }
    }

    .btn {
      padding: 10px 15px;
      width: 80%;

      &:hover {
        padding: 12px 15px;
      }
    }
  }
}
</style>
