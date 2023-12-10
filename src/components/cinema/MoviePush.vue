<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElNotification } from "element-plus";
import type { BaseMovieInfo, VendorInfo, BilibiliVendorInfo } from "@/types/Movie";
import { strLengthLimit } from "@/utils";
import { pushMovieApi } from "@/services/apis/movie";
import { getVendorBackends as biliBiliBackends } from "@/services/apis/vendor";
import customHeaders from "@/components/dialogs/customHeaders.vue";
import customSubtitles from "@/components/dialogs/customSubtitles.vue";
import bilibiliParse from "@/components/dialogs/bilibiliParse.vue";

const Emits = defineEmits(["getMovies"]);

const customHeadersDialog = ref<InstanceType<typeof customHeaders>>();
const customSubtitlesDialog = ref<InstanceType<typeof customSubtitles>>();
const bilibiliParseDialog = ref<InstanceType<typeof bilibiliParse>>();

const Props = defineProps<{
  token: string;
}>();

// 新影片信息
let newMovieInfo = ref<BaseMovieInfo>({
  url: "",
  name: "",
  type: "",
  proxy: false,
  live: false,
  rtmpSource: false,
  headers: {}
});

enum pushType {
  MOVIE = 0,
  LIVE,
  PROXY_LIVE,
  RTMP_SOURCE,
  BILIBILI
}

interface movieTypeRecord {
  name: string;
  comment: string;
  showProxy: boolean;
  defaultType: string;
  allowedTypes: Array<{ name: string; value: string }>;
}

const movieTypeRecords: Map<pushType, movieTypeRecord> = new Map([
  [
    pushType.MOVIE,
    {
      name: "视频直链",
      comment: "",
      showProxy: true,
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
      comment: "",
      showProxy: false,
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
    pushType.PROXY_LIVE,
    {
      name: "代理直播流",
      comment: "仅支持rtmp和flv代理",
      showProxy: false,
      defaultType: "",
      allowedTypes: []
    }
  ],
  [
    pushType.RTMP_SOURCE,
    {
      name: "创建直播",
      comment: "用户可自行推流",
      showProxy: false,
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
  ],
  [
    pushType.BILIBILI,
    {
      name: "哔哩哔哩",
      comment: "解析Bilibili视频",
      showProxy: false,
      defaultType: "",
      allowedTypes: []
    }
  ]
]);

const selectedMovieType = ref(pushType.MOVIE);

const selectPushType = () => {
  switch (selectedMovieType.value) {
    case pushType.MOVIE:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: false,
        live: false,
        rtmpSource: false,
        headers: {}
      };
      break;
    case pushType.LIVE:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: false,
        live: true,
        rtmpSource: false,
        headers: {}
      };
      break;
    case pushType.RTMP_SOURCE:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: false,
        live: true,
        rtmpSource: true,
        headers: {}
      };
      break;
    case pushType.PROXY_LIVE:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: true,
        live: true,
        rtmpSource: false,
        headers: {}
      };
    case pushType.BILIBILI:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: false,
        live: false,
        rtmpSource: false,
        headers: {},
        vendorInfo: {
          vendor: "bilibili",
          shared: true,
          bilibili: {}
        }
      };
      break;
  }

  newMovieInfo.value.type = movieTypeRecords.get(selectedMovieType.value)?.defaultType || "";
};

const stringHeader = ref(JSON.stringify(newMovieInfo.value.headers));

const updateHeaders = (header: { [key: string]: string }) => {
  newMovieInfo.value.headers = header;
};

const updateSubtitles = (
  subtitles: Record<
    string,
    {
      url: string;
      type: string;
    }
  >
) => {
  newMovieInfo.value.subtitles = subtitles;
};

const biliParse = () => {
  bilibiliParseDialog.value?.openDialog();
};

// 把视频链接添加到列表
const { execute: reqPushMovieApi } = pushMovieApi();
const pushMovie = async () => {
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
      data: newMovieInfo.value,
      headers: { Authorization: Props.token }
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

// TODO: use el-select lazy load
// @focus="getBiliBiliVendors"
// :loading="getBiliBiliVendorsLoading"
const getBiliBiliVendorsLoading = ref(true);

// 获取可用的bilibili解析接口
const { state: biliVendors, execute: reqBiliBiliVendors } = biliBiliBackends();
biliVendors.value = [""];
const biliVendor = ref<string>("");
const getBiliBiliVendors = async () => {
  if (!getBiliBiliVendorsLoading.value) return;
  try {
    await reqBiliBiliVendors({
      headers: {
        Authorization: Props.token
      },
      url: `/api/vendor/backends/bilibili`
    });
    getBiliBiliVendorsLoading.value = false;
    if (biliVendors.value) {
      biliVendors.value.push("");
    }
  } catch (err: any) {
    getBiliBiliVendorsLoading.value = false;
    console.log(err);
    ElNotification({
      title: "获取可用接口错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};
</script>

<template>
  <div class="card">
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
          :placeholder="selectedMovieType === pushType.BILIBILI ? '视频Url或bv号' : '影片Url'"
          class="l-input-violet w-full"
          v-if="!(newMovieInfo.live && newMovieInfo.rtmpSource)"
          v-model="newMovieInfo.url"
        />
      </Transition>
      <Transition name="fade">
        <input
          type="text"
          placeholder="影片名称"
          class="l-input-slate mt-2 w-full"
          v-if="selectedMovieType !== pushType.BILIBILI"
          v-model="newMovieInfo.name"
        />
      </Transition>
    </div>
    <div class="mx-5" v-if="!newMovieInfo.vendorInfo?.vendor">
      <el-collapse @change="" class="bg-transparent" style="background: #aaa0 !important">
        <el-collapse-item>
          <template #title><div class="text-base font-medium">高级选项</div></template>
          <div
            class="more-option-list"
            v-if="movieTypeRecords.get(selectedMovieType)?.allowedTypes.length != 0"
          >
            <span class="text-sm min-w-fit"> 视频类型： </span>
            <select v-model="newMovieInfo.type" class="bg-transparent p-0 text-base w-full h-5">
              <option
                v-for="allowedType in movieTypeRecords.get(selectedMovieType)!.allowedTypes"
                :value="allowedType.value"
              >
                {{ allowedType.name }}
              </option>
            </select>
          </div>
          <Transition name="fade">
            <div class="more-option-list" v-if="movieTypeRecords.get(selectedMovieType)?.showProxy">
              <label
                >代理：
                <input
                  type="checkbox"
                  v-model="newMovieInfo.proxy"
                  :value="true"
                  :unchecked-value="false"
              /></label>
            </div>
          </Transition>
          <Transition name="fade">
            <div
              class="more-option-list cursor-pointer"
              v-if="!newMovieInfo.rtmpSource"
              @click="customHeadersDialog?.openDialog()"
            >
              <span class="text-sm min-w-fit"> 自定义 header </span>
            </div>
          </Transition>
          <Transition name="fade">
            <div
              class="more-option-list cursor-pointer"
              v-if="!newMovieInfo.live"
              @click="customSubtitlesDialog?.openDialog()"
            >
              <span class="text-sm min-w-fit"> 添加字幕</span>
            </div>
          </Transition>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div class="card-footer pt-3">
      <div
        v-if="selectedMovieType === pushType.BILIBILI"
        class="flex flex-wrap justify-between w-full"
      >
        <select
          v-model="biliVendor"
          class="bg-transparent p-0 text-base"
          @focus="getBiliBiliVendors"
        >
          <option v-for="item in biliVendors" :value="item">
            {{ item === "" ? "默认" : item }}
          </option>
        </select>
        <button class="btn btn-warning" @click="biliParse()">解析</button>
      </div>

      <button v-else class="btn" @click="pushMovie()">添加到列表</button>
    </div>
  </div>

  <!-- 自定义Header对话框 -->
  <customHeaders
    ref="customHeadersDialog"
    :custom-header="newMovieInfo.headers"
    @updateHeaders="updateHeaders"
  />

  <!-- 自定义字幕列表对话框 -->
  <customSubtitles
    ref="customSubtitlesDialog"
    :custom-subtitles="newMovieInfo.subtitles ?? {}"
    @updateSubtitles="updateSubtitles"
  />

  <!-- B站视频解析对话框 -->
  <bilibiliParse
    ref="bilibiliParseDialog"
    :newMovieInfo="newMovieInfo"
    :token="token"
    :vendor="biliVendor"
  />
</template>

<style lang="less" scoped>
.more-option-list {
  @apply flex justify-start mb-2 p-3 rounded-lg bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800;
}
</style>
