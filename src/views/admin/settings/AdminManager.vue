<script lang="ts" setup>
import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import { addAdminApi } from "@/services/apis/admin";

const props = defineProps<{
  title: string;
}>();

const { token } = userStore();
const userId = ref("");
const addAdmin = async () => {
  if (userId.value === "") return ElMessage.error("请输入用户ID");
  const { execute } = addAdminApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      },
      data: {
        id: userId.value
      }
    });
    ElNotification({
      title: "添加成功",
      type: "success"
    });
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "添加失败",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};
</script>

<template>
  <div class="card">
    <div class="card-title">{{ props.title }}</div>
    <div class="card-body">
      添加管理员：<input
        v-model="userId"
        class="l-input bg-transparent py-1"
        type="text"
        placeholder="用户ID"
      />
      <button class="btn" @click="addAdmin">添加</button>
    </div>
  </div>
</template>
