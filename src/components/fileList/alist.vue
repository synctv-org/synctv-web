<script setup lang="ts">
import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import index from "./index.vue";
import { getAListFileList } from "@/services/apis/vendor";
import { pushMoviesApi } from "@/services/apis/movie";
import { userStore } from "@/stores/user";
import type { BaseMovieInfo } from "@/types/Movie";
import type { FileItem } from "@/types/Vendor";

interface AListItem extends FileItem {
  size: number;
  modified: number;
}

const props = defineProps<{
  roomToken: string;
}>();

const FileList = ref<InstanceType<typeof index>>();
const { token: userToken } = userStore();
const open = ref(false);
const openDialog = () => {
  open.value = true;
};

const { execute, state, isLoading } = getAListFileList();

const getFileList = async (path: string, page: number, max: number) => {
  try {
    await execute({
      headers: { Authorization: userToken.value },
      data: {
        path: path
      },
      params: {
        page: page,
        max: max
      }
    });
  } catch (err: any) {
    return ElNotification({
      type: "error",
      title: "错误",
      message: err.response.data.error || err.message
    });
  }
};

const { execute: reqPushMoviesApi, isLoading: pushMovieLoading } = pushMoviesApi();
const submit = async () => {
  const selectedItems = FileList.value?.selectedItems;
  try {
    if (!selectedItems) return;
    if (selectedItems.length === 0) return ElMessage.error("请选择视频");
    await reqPushMoviesApi({
      headers: { Authorization: props.roomToken },
      data: selectedItems.map(
        (item) =>
          <BaseMovieInfo>{
            name: item.name,
            url: "",
            live: false,
            rtmpSource: false,
            type: "",
            headers: {},
            proxy: false,
            vendorInfo: {
              vendor: "alist",
              alist: {
                path: item.path
              }
            }
          }
      )
    });
    open.value = false;
    FileList.value?.removeAll();
    return ElNotification({
      type: "success",
      title: "添加成功"
    });
  } catch (err: any) {
    console.error(err.message);
    return ElNotification({
      type: "error",
      title: "错误",
      message: err.message
    });
  }
};

defineExpose({
  openDialog
});
</script>
<template>
  <el-dialog v-model="open" title="文件列表" class="rounded-lg dark:bg-zinc-800 max-sm:w-full">
    <index
      ref="FileList"
      :fileList="state"
      @to-dir="getFileList"
      :is-loading="isLoading"
      :enable-search="false"
    >
      <template #footer>
        <el-button
          v-if="FileList && FileList.selectedItems.length > 0"
          type="success"
          @click="submit"
          :loading="pushMovieLoading"
          >添加到列表</el-button
        >
      </template>
      <template #field>
        <p class="w-20">大小</p>
        <p class="ml-8 w-40 hidden xl:block">修改日期</p>
      </template>
      <template #item="{ item }">
        <div class="w-24 text-center">
          {{ item.isDir ? "" : ((item as AListItem).size / 1024 / 1024).toFixed(2) + " MB" }}
        </div>
        <div class="mx-4 w-40 text-left hidden xl:block">
          {{ new Date((item as AListItem).modified).toLocaleString() }}
        </div>
      </template>
    </index>
  </el-dialog>
</template>
