<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import _ from "lodash";

interface SubtitleList {
  name: string;
  type: string;
  url: string;
}

const props = defineProps<{
  customSubtitles: Record<
    string,
    {
      url: string;
      type: string;
    }
  >;
}>();

const subtitleList = ref<SubtitleList[]>([]);

const removeItem = (item: SubtitleList) => {
  subtitleList.value.splice(subtitleList.value.indexOf(item), 1);
  if (subtitleList.value.length === 0) addItem();
};

const addItem = () => {
  subtitleList.value.push({
    name: "",
    type: "",
    url: ""
  });
};

const isLastItem = (item: SubtitleList) => {
  const index = subtitleList.value.indexOf(item);
  return index === subtitleList.value.length - 1;
};

const emit = defineEmits(["updateSubtitles"]);
const submit = async () => {
  try {
    const merged = subtitleList.value.reduce(
      (
        acc: Record<
          string,
          {
            url: string;
            type: string;
          }
        >,
        subtitle: SubtitleList
      ) => {
        acc[subtitle.name] = {
          url: subtitle.url.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
          type: subtitle.type
        };
        return acc;
      },
      {}
    );
    emit("updateSubtitles", merged);
    open.value = false;
    return ElNotification({
      type: "success",
      title: "设置成功"
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

const open = ref(false);
const openDialog = () => {
  subtitleList.value = Object.entries(props.customSubtitles).map(([name, subtitle]) => ({
    name,
    ...subtitle
  }));
  if (subtitleList.value.length === 0) addItem();
  open.value = true;
};

defineExpose({
  openDialog
});
</script>

<template>
  <el-dialog
    v-model="open"
    title="字幕列表"
    class="rounded-lg dark:bg-zinc-800 w-3/7 max-sm:w-full"
  >
    <div class="grid grid-cols-7 gap-4 mb-2 text-center">
      <div class="col-span-1">名称</div>
      <div class="col-span-4">URL</div>
      <div class="col-span-1">类型</div>
      <div class="col-span-1 text-center">操作</div>
    </div>
    <div v-for="(item, i) in subtitleList" :key="i" class="grid grid-cols-7 gap-4 mb-2">
      <div class="col-span-1">
        <el-input type="text" class="w-full" v-model="item.name" />
      </div>
      <div class="col-span-4">
        <el-input type="text" class="w-full" v-model="item.url" />
      </div>
      <div class="col-span-1">
        <el-select class="w-full" v-model="item.type" placeholder="请选择">
          <el-option label="srt" value="srt" />
          <el-option label="ass" value="ass" />
          <el-option label="vtt" value="vtt" />
        </el-select>
      </div>
      <div class="text-center col-span-1 flex justify-around">
        <button v-if="isLastItem(item)" class="btn btn-dense" @click="addItem()">添加</button>
        <button class="btn btn-dense btn-error" @click="removeItem(item)">移除</button>
      </div>
    </div>

    <template #footer>
      <button class="btn mr-4" @click="open = false">取消</button>
      <button class="btn btn-success" @click="submit()">保存</button>
    </template>
  </el-dialog>
</template>
