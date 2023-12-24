<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import index from "./index.vue";
import { getAListFileList } from "@/services/apis/vendor";
import { userStore } from "@/stores/user";

const { token: userToken } = userStore();
const open = ref(false);
const openDialog = () => {
  open.value = true;
  getFileList();
};

const { execute, state, isLoading } = getAListFileList();
const getFileList = async (dir = "") => {
  await execute({
    headers: { Authorization: userToken.value },
    data: {
      path: dir
    }
  });
};

defineExpose({
  openDialog
});

onMounted(async () => {
  openDialog();
});
</script>
<template>
  <el-dialog v-model="open" title="文件列表" class="rounded-lg dark:bg-zinc-800 max-sm:w-full">
    <index :fileList="state" @to-dir="getFileList" :is-loading="isLoading" />
  </el-dialog>
</template>
