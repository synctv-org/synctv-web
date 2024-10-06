<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRouteParams, useRouteQuery } from "@vueuse/router";
import { useRoomApi } from "@/hooks/useRoom";
import { indexStore } from "@/stores";
import { userStore } from "@/stores/user";

const { settings } = indexStore();
const { isLogin } = userStore();
const route = useRoute();
const router = useRouter();
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

const { joinRoom } = useRoomApi();

const init = () => {
  if (props.item) formData.value = props.item;
  else {
    if (roomID) formData.value.roomId = roomID.value as string;
    if (pwd) formData.value.password = pwd.value as string;
  }
  if (formData.value.roomId) joinRoom(formData.value.roomId, formData.value.password);
};

const handleJoinRoom = () => {
  if (!settings?.guestEnable && !isLogin) {
    router.push("/login");
  } else {
    joinRoom(formData.value.roomId, formData.value.password);
  }
};

defineExpose({ init });

onMounted(() => {
  init();
});
</script>

<template>
  <div :class="isModal ? 'room-dialog' : 'room'">
    <form @submit.prevent="handleJoinRoom" :class="!isModal && 'sm:w-96 ' + 'w-full'">
      <input
        class="l-input"
        type="text"
        v-model="formData.roomId"
        placeholder="房间ID"
        required
        autocomplete="off"
      />
      <br />
      <input
        class="l-input"
        type="password"
        v-model="formData.password"
        placeholder="房间密码"
        autocomplete="new-password"
      />
      <br />

      <button class="btn my-[10px]" type="submit">
        {{ settings?.guestEnable && !isLogin ? "以访客身份加入" : "加入" }}
      </button>
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
