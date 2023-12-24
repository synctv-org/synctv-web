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
const currentPage = ref(1);
const pageSize = ref(10);
const dir = ref("");
const getFileList = async (paths?: string) => {
  if (paths) dir.value = paths;
  await execute({
    headers: { Authorization: userToken.value },
    data: {
      path: dir.value
    },
    params: {
      page: currentPage.value,
      max: pageSize.value
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
    <template #footer>
      <div class="flex justify-between items-center flex-wrap gap-3 -mt-8">
        <el-pagination
          class="flex-wrap gap-3"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :pager-count="5"
          layout="sizes, prev, pager, next, jumper"
          :total="state?.total"
          @size-change="getFileList()"
          @current-change="getFileList()"
        />
        <div>
          <button class="btn btn-success">添加</button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
