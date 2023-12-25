<script setup lang="ts">
import { ref } from "vue";
import type { FileList, FileItems } from "@/types/Vendor";
import { ArrowRight, Folder, Document } from "@element-plus/icons-vue";

const props = defineProps<{
  fileList: FileList | undefined;
  isLoading: boolean;
}>();

const emit = defineEmits(["toDir"]);

const breadcrumb = () => {
  if (!props.fileList) return;
  return props.fileList.paths.map((item, index) => {
    const name = item.name || "🏠主页";
    const path = item.path || "";
    return { path, name };
  });
};

const selectedItems = ref<FileItems[]>([]);
const selectItem = (item: FileItems) => {
  selectedItems.value.push(item);
};

const findItem = (item: FileItems) => {
  return selectedItems.value.find((i) => i.path === item.path);
};

const removeItem = (item: FileItems) => {
  const i = selectedItems.value.findIndex((i) => i.path === item.path);
  selectedItems.value.splice(i, 1);
};

const removeAll = () => {
  selectedItems.value = [];
};

const selectOrToDir = (item: FileItems) => {
  if (item.isDir) {
    emit("toDir", item.path);
  } else {
    findItem(item) ? removeItem(item) : selectItem(item);
  }
};

defineExpose({
  selectedItems,
  removeAll
});
</script>
<template>
  <el-breadcrumb class="-mt-5 mb-2" :separator-icon="ArrowRight">
    <el-breadcrumb-item v-for="(item, i) in breadcrumb()" :key="i">
      <template #default>
        <span v-if="props.fileList!.paths[props.fileList!.paths.length - 1].path === item.path">{{
          item.name
        }}</span>
        <b v-else class="cursor-pointer" @click="emit('toDir', item.path)">{{ item.name }}</b>
      </template>
    </el-breadcrumb-item>
  </el-breadcrumb>
  <div v-loading="!fileList || isLoading">
    <div class="flex justify-between px-1 py-1">
      <p>名称</p>
      <p>类型</p>
    </div>
    <div
      class="flex items-center justify-between p-2 bg-slate-50 my-2 rounded-md cursor-pointer transition-all duration-300 hover:bg-slate-100 hover:shadow-md hover:scale-[1.02] shadow-slate-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
      :class="
        findItem(item) &&
        ' bg-slate-200 hover:shadow-none hover:bg-slate-300 hover:scale-100 dark:bg-neutral-900 dark:hover:bg-stone-800'
      "
      v-for="(item, i) in fileList?.items"
      :key="i"
      @click="selectOrToDir(item)"
    >
      <p class="truncate overflow-hidden mr-2 max-w-[80%]">
        <el-icon v-if="item.isDir" class="mr-2"><Folder /></el-icon>
        <el-icon v-else class="mr-2"><Document /></el-icon>
        {{ item.name }}
      </p>
      {{ item.isDir ? "文件夹" : "文件" }}
    </div>
  </div>
  <div v-if="selectedItems.length > 0" class="flex justify-between items-center flex-wrap gap-3">
    <p>已选择：{{ selectedItems.length }} 个项目</p>
    <el-popconfirm
      confirm-button-text="是"
      cancel-button-text="否"
      title="你确定要清空已选中的吗？!"
      @confirm="removeAll"
    >
      <template #reference>
        <a href="javascript:;">清空选中</a>
      </template>
    </el-popconfirm>
  </div>
</template>
