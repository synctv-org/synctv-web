<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRouteParams, useRouteQuery } from "@vueuse/router";
import { useRoomApi } from "@/hooks/useRoom";
const route = useRoute();
const roomID = useRouteParams("roomId");
const pwd = useRouteQuery("pwd");

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

const { checkRoom, joinRoom } = useRoomApi(formData.value.roomId);

onMounted(() => {
  if (formData.value.roomId) checkRoom(pwd.value as string);
});
</script>

<template>
  <div :class="isModal ? 'room-dialog' : 'room'">
    <form @submit.prevent="" :class="!isModal && 'sm:w-96 ' + 'w-full'">
      <input class="l-input" type="text" v-model="formData.roomId" placeholder="房间ID" required />
      <br />
      <input class="l-input" type="password" v-model="formData.password" placeholder="房间密码" />
      <br />
      <button class="btn m-[10px]" @click="joinRoom(formData)">加入</button>
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
