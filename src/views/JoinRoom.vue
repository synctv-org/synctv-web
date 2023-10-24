<script setup lang="ts">
import { ref, computed } from "vue";
import { ElNotification } from "element-plus";
import { roomStore } from "@/stores/room";
import router from "@/router/index";
import { useRoute } from "vue-router";
import { joinRoomApi } from "@/services/apis/room";
import { strLengthLimit } from "@/utils/utils";
const route = useRoute();
const room = roomStore();

// 是否为弹窗加载
const isModal = computed(() => {
  return route.name === "joinRoom" ? false : true;
});

const props = defineProps<{
  item?: {
    roomId: string;
    password: string;
  };
}>();

const formData = ref({
  roomId: localStorage.getItem("roomId") || "",
  password: localStorage.getItem("password") || ""
});

if (props.item) formData.value = props.item;

const savePwd = ref(localStorage.getItem("uPasswd") ? true : false);

const { state: joinRoomInfo, execute: reqJoinRoomApi } = joinRoomApi();

const JoinRoom = async () => {
  if (formData.value?.roomId === "") {
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
      data: formData.value
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

    savePwd.value && localStorage.setItem("password", formData.value.password);

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
</script>

<template>
  <div :class="isModal ? 'room-dialog' : 'room'">
    <form @submit.prevent="" :class="!isModal && 'sm:w-96 ' + 'w-full'">
      <input class="l-input" type="text" v-model="formData.roomId" placeholder="房间名" required />
      <br />
      <input class="l-input" type="password" v-model="formData.password" placeholder="房间密码" />
      <br />
      <div class="text-sm"><b>注意：</b>所有输入框最大只可输入32个字符</div>
      <div>
        <input class="w-auto" type="checkbox" v-model="savePwd" />
        <label title="明文保存到本机哦~">&nbsp;记住密码</label>
      </div>
      <button class="btn m-[10px]" @click="JoinRoom()">加入</button>
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
