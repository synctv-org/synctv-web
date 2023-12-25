<script setup lang="ts">
import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import index from "./index.vue";
import { getEmbyFileList } from "@/services/apis/vendor";
import { pushMoviesApi } from "@/services/apis/movie";
import { userStore } from "@/stores/user";
import type { BaseMovieInfo } from "@/types/Movie";
import { useLocalStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";

const FileList = ref<InstanceType<typeof index>>();
const roomID = useRouteParams<string>("roomId");
const roomToken = useLocalStorage<string>(`room-${roomID.value}-token`, "");
const { token: userToken } = userStore();
const open = ref(false);
const openDialog = () => {
  open.value = true;
  getFileList();
};

const { execute, state, isLoading } = getEmbyFileList();
const currentPage = ref(1);
const pageSize = ref(10);
const dir = ref("");
const getFileList = async (paths?: string) => {
  if (paths || paths === "") dir.value = paths;
  try {
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
      headers: { Authorization: roomToken.value },
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
              vendor: "emby",
              emby: {
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
    <index ref="FileList" :fileList="state" @to-dir="getFileList" :is-loading="isLoading" />
    <template #footer>
      <div class="flex justify-between items-center flex-wrap gap-3 -mt-7">
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
          <el-button type="success" @click="submit" :loading="pushMovieLoading"
            >添加到列表</el-button
          >
        </div>
      </div>
    </template>
  </el-dialog>
</template>
