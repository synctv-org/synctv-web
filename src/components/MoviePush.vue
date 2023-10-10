<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import type { BaseMovieInfo } from "@/types/Movie";
import { strLengthLimit } from "@/utils/utils";
import { pushMovieApi } from "@/services/apis/movie";

const Emits = defineEmits(["getMovies"]);

// 新影片信息
let newMovieInfo = ref<BaseMovieInfo>({
  name: "",
  live: false,
  proxy: false,
  url: "",
  rtmpSource: false,
  type: "",
  headers: {}
});

enum AddType {
  NORMAL = 0,
  LIVE = 1,
  RTMP_SOURCE = 2
}

const addType = ref(AddType.NORMAL);

const selectAddType = () => {
  console.log(addType.value);

  switch (addType.value) {
    case AddType.NORMAL:
      newMovieInfo.value.live = newMovieInfo.value.proxy = newMovieInfo.value.rtmpSource = false;
      break;
    case AddType.LIVE:
      newMovieInfo.value.live = true;
      newMovieInfo.value.proxy = newMovieInfo.value.rtmpSource = false;
      break;
    case AddType.RTMP_SOURCE:
      newMovieInfo.value.proxy = false;
      newMovieInfo.value.live = newMovieInfo.value.rtmpSource = true;
  }
};

// 把视频链接添加到列表
const { execute: reqPushMovieApi } = pushMovieApi();
const pushMovie = async (dir: string) => {
  if (newMovieInfo.value.live) {
    if (newMovieInfo.value.name === "")
      return ElNotification({
        title: "添加失败",
        message: "请填写表单完整",
        type: "error"
      });
  } else {
    if (newMovieInfo.value.url === "" || newMovieInfo.value.name === "")
      return ElNotification({
        title: "添加失败",
        message: "请填写表单完整",
        type: "error"
      });
  }

  try {
    for (const key in newMovieInfo.value) {
      strLengthLimit(key, 32);
    }
    await reqPushMovieApi({
      params: {
        pos: dir
      },
      data: newMovieInfo.value,
      headers: { Authorization: localStorage.token }
    });

    ElNotification({
      title: "添加成功",
      type: "success"
    });
    newMovieInfo.value.name = newMovieInfo.value.url = "";
    Emits("getMovies");
  } catch (err: any) {
    console.log(err);
    ElNotification({
      title: "添加失败",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

onMounted(() => {});
</script>

<template>
  <div class="card max-sm:rounded-none">
    <div class="card-title">
      添加影片
      <select @change="selectAddType" v-model="addType" class="bg-transparent p-0 text-base">
        <option :value="0">普通视频</option>
        <option :value="1">直播流</option>
        <option :value="2">创建直播</option>
      </select>
    </div>
    <div class="card-body flex justify-around flex-wrap">
      <input
        type="text"
        placeholder="影片Url"
        class="l-input-violet mb-1.5 w-full"
        v-if="!(newMovieInfo.live && newMovieInfo.rtmpSource)"
        v-model="newMovieInfo.url"
      />
      <input
        type="text"
        placeholder="影片名称"
        class="l-input-slate mt-1.5 w-full"
        v-model="newMovieInfo.name"
      />
    </div>
    <div class="card-footer flex-wrap pt-3" style="justify-content: space-around">
      <button class="btn" @click="pushMovie('front')">添加到列表最<b>前</b>面</button>
      <button class="btn" @click="pushMovie('back')">添加到列表最<b>后</b>面</button>
    </div>
  </div>
</template>
