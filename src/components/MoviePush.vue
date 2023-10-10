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
    <div class="card-title">添加影片</div>
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

      <div class="mt-4 mb-0 flex flex-wrap justify-around w-full">
        <div>
          <input type="checkbox" v-model="newMovieInfo.live" />
          <label>&nbsp;这是一条直播流</label>
        </div>

        <div>
          <input
            type="checkbox"
            v-model="newMovieInfo.rtmpSource"
            @click="newMovieInfo.live ? true : (newMovieInfo.live = true)"
          />
          <label>&nbsp;我想创建直播</label>
        </div>

        <!-- <div>
              <input type="checkbox" v-model="newMovieInfo.proxy" />
              <label>&nbsp;isProxy</label>
            </div> -->
      </div>
    </div>
    <div class="card-footer flex-wrap pt-3" style="justify-content: space-around">
      <button class="btn" @click="pushMovie('front')">添加到列表最<b>前</b>面</button>
      <button class="btn" @click="pushMovie('back')">添加到列表最<b>后</b>面</button>
    </div>
  </div>
</template>
