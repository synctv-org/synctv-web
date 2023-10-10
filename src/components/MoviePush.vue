<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import type { BaseMovieInfo } from "@/types/Movie";
import { strLengthLimit } from "@/utils/utils";
import { pushMovieApi } from "@/services/apis/movie";
import customHeaders from "@/components/dialogs/customHeaders.vue";

const Emits = defineEmits(["getMovies"]);

const customHeadersDialog = ref<InstanceType<typeof customHeaders>>();

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

enum pushType {
  MOVIE = 0,
  LIVE,
  RTMP_SOURCE
}

interface movieTypeRecord {
  name: string;
  defaultType: string;
  allowedTypes: Array<{ name: string; value: string }>;
}

const movieTypeRecords: Map<pushType, movieTypeRecord> = new Map([
  [
    pushType.MOVIE,
    {
      name: "视频直链",
      defaultType: "",
      allowedTypes: [
        {
          name: "auto",
          value: ""
        },
        {
          name: "mp4",
          value: "mp4"
        },
        {
          name: "flv",
          value: "flv"
        },
        {
          name: "m3u8",
          value: "m3u8"
        },
        {
          name: "ts",
          value: "mpegts"
        },
        {
          name: "mpd",
          value: "mpd"
        }
      ]
    }
  ],
  [
    pushType.LIVE,
    {
      name: "直播流",
      defaultType: "",
      allowedTypes: [
        {
          name: "auto",
          value: ""
        },
        {
          name: "flv",
          value: "flv"
        },
        {
          name: "m3u8",
          value: "m3u8"
        }
      ]
    }
  ],
  [
    pushType.RTMP_SOURCE,
    {
      name: "创建直播",
      defaultType: "flv",
      allowedTypes: [
        {
          name: "flv",
          value: "flv"
        },
        {
          name: "m3u8",
          value: "m3u8"
        }
      ]
    }
  ]
]);

const selectedMovieType = ref(pushType.MOVIE);

const selectPushType = () => {
  switch (selectedMovieType.value) {
    case pushType.MOVIE:
      newMovieInfo.value.live = newMovieInfo.value.proxy = newMovieInfo.value.rtmpSource = false;
      break;
    case pushType.LIVE:
      newMovieInfo.value.live = true;
      newMovieInfo.value.proxy = newMovieInfo.value.rtmpSource = false;
      break;
    case pushType.RTMP_SOURCE:
      newMovieInfo.value.proxy = false;
      newMovieInfo.value.live = newMovieInfo.value.rtmpSource = true;
      newMovieInfo.value.headers = {};
  }
  newMovieInfo.value.type = movieTypeRecords.get(selectedMovieType.value)!.defaultType;
};

const selectMovieType = () => {
  newMovieInfo.value.type =
    movieTypeRecords
      .get(selectedMovieType.value)
      ?.allowedTypes.find((v) => v.value === newMovieInfo.value.type)?.value ||
    movieTypeRecords.get(selectedMovieType.value)!.defaultType;
};

const stringHeader = ref(JSON.stringify(newMovieInfo.value.headers));

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
    console.log(stringHeader.value);
    console.log(JSON.parse(stringHeader.value));

    newMovieInfo.value.headers = JSON.parse(stringHeader.value);
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
      <select
        @change="selectPushType"
        v-model="selectedMovieType"
        class="bg-transparent p-0 text-base"
      >
        <option v-for="v in movieTypeRecords" :value="v[0]">{{ v[1].name }}</option>
      </select>
    </div>
    <div class="card-body flex justify-around flex-wrap">
      <Transition name="fade">
        <input
          type="text"
          placeholder="影片Url"
          class="l-input-violet mb-1.5 w-full"
          v-if="!(newMovieInfo.live && newMovieInfo.rtmpSource)"
          v-model="newMovieInfo.url"
        />
      </Transition>

      <input
        type="text"
        placeholder="影片名称"
        class="l-input-slate mt-1.5 w-full"
        v-model="newMovieInfo.name"
      />
    </div>
    <div class="mx-5">
      <el-collapse @change="" class="bg-transparent" style="background: #aaa0 !important">
        <el-collapse-item>
          <template #title><div class="text-base font-medium">高级选项</div></template>
          <div class="more-option-list">
            <span class="text-sm min-w-fit"> 视频类型： </span>

            <select
              @change="selectMovieType"
              v-model="newMovieInfo.type"
              class="bg-transparent p-0 text-base w-full h-5"
            >
              <option
                v-for="allowedType in movieTypeRecords.get(selectedMovieType)?.allowedTypes"
                :value="allowedType.value"
              >
                {{ allowedType.name }}
              </option>
            </select>
          </div>
          <Transition name="fade">
            <div
              class="more-option-list cursor-pointer"
              v-if="!newMovieInfo.rtmpSource"
              @click="customHeadersDialog?.openDialog()"
            >
              <span class="text-sm min-w-fit"> 自定义 header </span>
            </div>
          </Transition>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div class="card-footer flex-wrap pt-3" style="justify-content: space-around">
      <button class="btn" @click="pushMovie('front')">添加到列表最<b>前</b>面</button>
      <button class="btn" @click="pushMovie('back')">添加到列表最<b>后</b>面</button>
    </div>
  </div>

  <!-- 自定义Header对话框 -->
  <customHeaders ref="customHeadersDialog" :customHeader="newMovieInfo.headers" />
</template>

<style lang="less" scoped>
.more-option-list {
  @apply flex justify-start mb-2 p-3 rounded-lg bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800;
}
</style>
