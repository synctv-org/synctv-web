<script setup lang="ts">
import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { roomStore } from "@/stores/room";
import router from "@/router/index";
import { createRoomApi } from "@/services/apis/room";
import { strLengthLimit } from "@/utils/utils";
const room = roomStore();

const { state: createRoomToken, execute: reqCreateRoomApi } = createRoomApi();

const formData = ref({
  roomId: "",
  password: "",
  username: localStorage.getItem("uname") || "",
  userPassword: "",
  hidden: false
});
const savePwd = ref(false);

const operateRoom = async () => {
  if (
    formData.value?.username === "" ||
    formData.value?.userPassword === "" ||
    formData.value?.roomId === ""
  ) {
    ElNotification({
      title: "错误",
      message: "请填写表单完整",
      type: "error"
    });
    return;
  }
  try {
    for (const key in formData.value) {
      strLengthLimit(key, 32);
    }
    await reqCreateRoomApi({
      data: formData.value
    });
    if (!createRoomToken.value)
      return ElNotification({
        title: "错误",
        message: "服务器并未返回token",
        type: "error"
      });
    localStorage.setItem("token", createRoomToken.value?.token);
    ElNotification({
      title: "创建成功",
      type: "success"
    });
    room.login = true;

    localStorage.setItem("uname", formData.value.username);
    savePwd.value && localStorage.setItem("uPasswd", formData.value.userPassword);
    localStorage.setItem("roomId", formData.value.roomId);
    savePwd.value && localStorage.setItem("password", formData.value.password);
    localStorage.setItem("login", "true");

    router.replace("/cinema");
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
  <div class="room">
    <form @submit.prevent="" class="sm:w-96 w-full">
      <input
        class="l-input"
        type="text"
        v-model="formData.username"
        placeholder="用户名"
        required
      />
      <br />
      <input
        class="l-input"
        type="text"
        v-model="formData.userPassword"
        placeholder="密码"
        required
      />
      <br />
      <input class="l-input" type="text" v-model="formData.roomId" placeholder="房间名" required />
      <br />
      <input class="l-input" type="password" v-model="formData.password" placeholder="房间密码" />
      <br />
      <div class="text-sm"><b>注意：</b>所有输入框最大只可输入32个字符</div>
      <div>
        <input class="w-auto" type="checkbox" v-model="formData.hidden" />
        <label class="mr-6" title="不显示在房间列表">&nbsp;是否隐藏此房间</label>
        <input class="w-auto" type="checkbox" v-model="savePwd" />
        <label title="明文保存到本机哦~">&nbsp;记住密码</label>
      </div>
      <button class="btn m-[10px]" @click="operateRoom()">创建房间</button>
    </form>
  </div>
</template>

<style lang="less" scoped>
.room {
  text-align: center;
  margin-top: 5vmax;

  form {
    // width: 443px;
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
</style>
