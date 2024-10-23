<script setup lang="ts">
import { computed, ref } from "vue";
import { ElNotification } from "element-plus";
import type { BaseMovieInfo } from "@/types/Movie";
import { strLengthLimit } from "@/utils";
import { pushMovieApi } from "@/services/apis/movie";
import { roomStore } from "@/stores/room";
import { getVendorBackends as biliBiliBackends } from "@/services/apis/vendor";
import customHeaders from "@/components/cinema/dialogs/customHeaders.vue";
import customSubtitles from "@/components/cinema/dialogs/customSubtitles.vue";
import bilibiliParse from "@/components/cinema/dialogs/bilibiliParse.vue";
import alist from "@/components/fileList/alist.vue";
import emby from "@/components/fileList/emby.vue";

const Emits = defineEmits(["getMovies"]);

const customHeadersDialog = ref<InstanceType<typeof customHeaders>>();
const customSubtitlesDialog = ref<InstanceType<typeof customSubtitles>>();
const bilibiliParseDialog = ref<InstanceType<typeof bilibiliParse>>();
const alistDialog = ref<InstanceType<typeof alist>>();
const embyDialog = ref<InstanceType<typeof emby>>();

const Props = defineProps<{
  token: string;
  roomId: string;
}>();

const room = roomStore();

// 新影片信息
const newMovieInfo = ref<BaseMovieInfo>({
  url: "",
  name: "",
  type: "",
  proxy: false,
  live: false,
  rtmpSource: false,
  headers: {},
  isFolder: false
});

enum pushType {
  MOVIE = 0,
  DIR,
  LIVE,
  RTMP_SOURCE,
  BILIBILI,
  ALIST,
  EMBY
}

interface movieTypeRecord {
  name: string;
  comment: string;
  advanced: boolean;
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
      advanced: true,
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
      advanced: true,
      showProxy: true,
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
      comment: "用户可自行推流",
      advanced: false,
      showProxy: false,
      defaultType: "flv",
      allowedTypes: []
    }
  ],
  [
    pushType.BILIBILI,
    {
      name: "哔哩哔哩",
      comment: "解析Bilibili视频",
      advanced: false,
      showProxy: false,
      defaultType: "",
      allowedTypes: []
    }
  ],
  [
    pushType.ALIST,
    {
      name: "AList",
      comment: "解析 AList 视频",
      advanced: false,
      showProxy: false,
      defaultType: "",
      allowedTypes: []
    }
  ],
  [
    pushType.EMBY,
    {
      name: "Emby",
      comment: "解析 Emby 视频",
      advanced: false,
      showProxy: false,
      defaultType: "",
      allowedTypes: []
    }
  ],
  [
    pushType.DIR,
    {
      name: "文件夹",
      comment: "新建文件夹",
      advanced: false,
      showProxy: false,
      defaultType: "",
      allowedTypes: [],
      isFolder: true
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
          bilibili: {
            shared: false
          }
        }
      };
      break;
    case pushType.ALIST:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: true,
        live: false,
        rtmpSource: false,
        headers: {},
        vendorInfo: {
          vendor: "alist"
        }
      };
      break;
    case pushType.EMBY:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: true,
        live: false,
        rtmpSource: false,
        headers: {},
        vendorInfo: {
          vendor: "emby"
        }
      };
      break;
    case pushType.DIR:
      newMovieInfo.value = {
        url: newMovieInfo.value.url,
        name: newMovieInfo.value.name,
        type: movieTypeRecords.get(selectedMovieType.value)?.defaultType || "",
        proxy: false,
        live: false,
        rtmpSource: false,
        headers: {},
        isFolder: true
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
  if (newMovieInfo.value.live || newMovieInfo.value.isFolder) {
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
      data: {
        ...newMovieInfo.value,
        parentId: room.lastFolderId
      },
      headers: { Authorization: Props.token, "X-Room-Id": Props.roomId }
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
    if (!biliVendors.value) {
      biliVendors.value = [""];
    } else if (biliVendors.value.indexOf("") === -1) {
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
      <div
        class="w-full"
        v-if="selectedMovieType === pushType.MOVIE || selectedMovieType === pushType.LIVE"
      >
        <input
          type="text"
          placeholder="影片名称"
          class="l-input-slate mb-2 w-full"
          v-model="newMovieInfo.name"
        />
        <input
          type="text"
          placeholder="影片Url"
          class="l-input-violet w-full"
          v-if="!(newMovieInfo.live && newMovieInfo.rtmpSource)"
          v-model="newMovieInfo.url"
        />
      </div>

      <div class="w-full" v-if="selectedMovieType === pushType.DIR">
        <input
          type="text"
          placeholder="文件夹名"
          class="l-input-slate mb-2 w-full"
          v-model="newMovieInfo.name"
        />
      </div>

      <div class="w-full" v-if="selectedMovieType === pushType.RTMP_SOURCE">
        <input
          type="text"
          placeholder="影片名称"
          class="l-input-slate w-full"
          v-model="newMovieInfo.name"
        />
      </div>
      <div class="w-full" v-if="selectedMovieType === pushType.BILIBILI">
        <input
          type="text"
          placeholder="视频Url或bv号"
          class="l-input-violet w-full"
          v-model="newMovieInfo.url"
        />
      </div>
      <div class="w-full" v-if="selectedMovieType === pushType.ALIST">
        <div class="more-option-list cursor-pointer" @click="alistDialog?.openDialog()">
          <span class="text-sm min-w-fit"> 从 AList 中选择 </span>
        </div>
      </div>
      <div class="w-full" v-if="selectedMovieType === pushType.EMBY">
        <div class="more-option-list cursor-pointer" @click="embyDialog?.openDialog()">
          <span class="text-sm min-w-fit"> 从 Emby 中选择 </span>
        </div>
      </div>
    </div>
    <div class="mx-5" v-if="movieTypeRecords.get(selectedMovieType)?.advanced">
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

      <button v-else-if="selectedMovieType < pushType.BILIBILI" class="btn" @click="pushMovie()">
        添加到列表
      </button>
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
    :room-id="roomId"
    :newMovieInfo="newMovieInfo"
    :token="token"
    :vendor="biliVendor"
  />

  <!-- AList 文件列表 -->
  <alist ref="alistDialog" :token="token" :room-id="roomId" />

  <!-- Emby 文件列表 -->
  <emby ref="embyDialog" :token="token" :room-id="roomId" />
</template>

<style lang="less" scoped>
.more-option-list {
  @apply flex justify-start mb-2 p-3 rounded-lg bg-zinc-50 hover:bg-white transition-all dark:bg-zinc-800 hover:dark:bg-neutral-800;
}
</style>
