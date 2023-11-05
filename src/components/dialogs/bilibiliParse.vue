<script setup lang="ts">
import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import type { BaseMovieInfo } from "@/proto/message";
import { parseBiliBiliVideo } from "@/services/apis/vendor";
import { pushMoviesApi } from "@/services/apis/movie";
import { useRouteParams } from "@vueuse/router";

const props = defineProps<{
  newMovieInfo: BaseMovieInfo;
}>();

interface BilibiliVideo {
  name: string;
  bvid?: string;
  cid?: number;
  epid?: number;
  coverImage: string;
  proxy: boolean;
  shared: boolean;
}

// 获取房间信息
const roomID = useRouteParams("roomId");
const roomToken = localStorage.getItem(`room-${roomID.value}-token`) ?? "";

const biliVideos = ref<BilibiliVideo[]>([]);
const open = ref(false);
const { state, execute } = parseBiliBiliVideo();
const openDialog = async () => {
  if (props.newMovieInfo.url) {
    try {
      await execute({
        headers: { Authorization: localStorage.userToken },
        data: {
          url: props.newMovieInfo.url
        }
      });
      if (state.value) {
        biliVideos.value = state.value.videoInfos.map((item) => ({
          name: item.name,
          bvid: item.bvid,
          cid: item.cid,
          epid: item.epid,
          coverImage: item.coverImage,
          proxy: item.epid ? true : false,
          shared: item.epid ? true : false
        }));
        open.value = true;
      }
    } catch (err: any) {
      ElNotification({
        type: "error",
        title: "解析失败",
        message: err.response.data.error || err.message
      });
    }
  }
};

const selectedItems = ref<BilibiliVideo[]>([]);

const selectItem = (item: BilibiliVideo) => {
  selectedItems.value.push(item);
};

const findItem = (item: BilibiliVideo) => {
  return selectedItems.value.some((i) => JSON.stringify(i) === JSON.stringify(item));
};

const removeItem = (item: BilibiliVideo) => {
  selectedItems.value.splice(selectedItems.value.indexOf(item), 1);
};

const { execute: reqPushMoviesApi } = pushMoviesApi();
const submit = async () => {
  try {
    await reqPushMoviesApi({
      headers: { Authorization: roomToken },
      data: selectedItems.value.map((item) => ({
        url: "",
        live: false,
        rtmpSource: false,
        type: "",
        name: item.name,
        proxy: item.proxy,
        headers: {},
        vendorInfo: {
          vendor: "bilibili",
          shared: item.shared,
          bilibili: {
            bvid: item.bvid ?? "",
            cid: item.cid ?? NaN,
            epid: item.epid ?? NaN,
            quality: NaN
          }
        }
      }))
    });
    open.value = false;
    selectedItems.value = [];
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
  <el-dialog
    v-model="open"
    destroy-on-close
    :title="`解析结果 (共 ${biliVideos.length} 个视频)`"
    class="rounded-lg dark:bg-zinc-800 w-full xl:w-7/12 lg:w-3/7 md:w-8/12 sm:w-full"
  >
    <h1 class="-mt-8 text-xl font-medium">{{ state?.title }}</h1>
    <p class="mt-2">UP / 主演 ：{{ state?.actors }}</p>
    <el-row :gutter="20">
      <el-col v-for="(item, i) in biliVideos" :key="i" :md="biliVideos.length === 1 ? 24 : 12">
        <div class="flex my-2">
          <img :src="item.coverImage" class="w-4/12 mr-3 object-cover rounded-sm" />
          <ul class="">
            <li>{{ item.name }}</li>
            <li v-if="item.bvid">BVID: {{ item.bvid }}</li>
            <li v-if="item.cid">CID: {{ item.cid }}</li>
            <li v-if="item.epid">EPID: {{ item.epid }}</li>
            <li class="flex items-center">
              <div class="mr-2">
                Proxy:
                <input type="checkbox" v-model="item.proxy" :disabled="item.epid ? true : false" />
              </div>
              <div class="mr-2">
                Shared:
                <input type="checkbox" v-model="item.shared" :disabled="item.epid ? true : false" />
              </div>
              <div>
                <button
                  class="btn btn-dense btn-error"
                  v-if="findItem(item)"
                  @click="removeItem(item)"
                >
                  移除
                </button>
                <button class="btn btn-dense" v-else @click="selectItem(item)">选择</button>
              </div>
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>
    <div class="flex flex-wrap"></div>
    <template #footer>
      <button class="btn mr-4" @click="open = false">取消</button>
      <button class="btn btn-success" @click="submit()">添加到列表</button>
    </template>
  </el-dialog>
</template>
