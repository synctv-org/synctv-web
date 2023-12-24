<script setup lang="ts">
import { ref, type Ref } from "vue";
import type { FileList } from "@/types/Vendor";
import { ArrowRight, Folder, Document } from "@element-plus/icons-vue";

const props = defineProps<{
  fileList: FileList | undefined;
  isLoading: boolean;
}>();

const emit = defineEmits(["toDir"]);

const breadcrumb = () => {
  if (!props.fileList) return;
  const paths = props.fileList.paths[0].path.split("/").filter(Boolean);
  return [
    { path: "/", name: "🏠主页" },
    ...paths.map((path, index) => {
      const fullPath = `/${paths.slice(0, index + 1).join("/")}`;
      const name = path || "/";
      return { path: fullPath, name };
    })
  ];
};
</script>
<template>
  <el-breadcrumb class="-mt-5 mb-2" :separator-icon="ArrowRight">
    <el-breadcrumb-item
      v-for="(item, i) in breadcrumb()"
      :key="i"
      @click="emit('toDir', item.path)"
    >
      <template #default>
        <span v-if="props.fileList!.paths[0].path === item.path">{{ item.name }}</span>
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
      class="flex items-center justify-between p-2 bg-slate-50 my-2 rounded-md cursor-pointer transition-all duration-300 hover:bg-slate-100 hover:shadow-md hover:scale-[1.02] shadow-slate-300"
      v-for="(item, i) in fileList?.items"
      :key="i"
      @click="emit('toDir', item.path)"
    >
      <p>
        <el-icon v-if="item.isDir" class="mr-2"><Folder /></el-icon>
        <el-icon v-else class="mr-2"><Document /></el-icon>
        {{ item.name }}
      </p>
      {{ item.isDir ? "文件夹" : "文件" }}
    </div>
  </div>
</template>
