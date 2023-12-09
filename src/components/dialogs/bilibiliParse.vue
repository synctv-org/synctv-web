<script setup lang="ts">
import { ref } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import type { BaseMovieInfo, BilibiliVendorInfo, VendorInfo } from "@/types/Movie";
import { parseBiliBiliVideo } from "@/services/apis/vendor";
import { pushMoviesApi } from "@/services/apis/movie";
import { userStore } from "@/stores/user";

const Props = defineProps<{
  newMovieInfo: BaseMovieInfo;
  token: string;
  vendor: string;
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
const { token: userToken } = userStore();
const biliVideos = ref<BilibiliVideo[]>([]);
const open = ref(false);
const { state, execute } = parseBiliBiliVideo();
const openDialog = async () => {
  if (Props.newMovieInfo.url) {
    try {
      ElMessage.info("正在解析中，成功后将会弹窗显示");
      await execute({
        headers: { Authorization: userToken.value },
        data: {
          url: Props.newMovieInfo.url
        },
        params: {
          vendor: Props.vendor
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
        totalItems.value = biliVideos.value.length;
      }
    } catch (err: any) {
      console.log(err);
      return ElNotification({
        type: "error",
        title: "解析失败",
        message: err.response.data.error || err.message
      });
    }
  } else {
    return ElNotification({
      type: "error",
      title: "错误",
      message: "请输入视频地址或 AV、BV、SS 号"
    });
  }
};

const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const selectedItems = ref<BilibiliVideo[]>([]);

const selectItem = (item: BilibiliVideo) => {
  selectedItems.value.push(item);
};

const findItem = (item: BilibiliVideo) => {
  return selectedItems.value.find((i) => i.name === item.name);
};

const removeItem = (item: BilibiliVideo) => {
  selectedItems.value.splice(selectedItems.value.indexOf(item), 1);
};

const selectAll = () => {
  for (const item of biliVideos.value) {
    selectedItems.value.push(item);
  }
};

const removeAll = () => {
  selectedItems.value = [];
};

const isAllProxy = ref(false);
const allProxy = () => {
  isAllProxy.value = !isAllProxy.value;
  for (const item of biliVideos.value) {
    item.proxy = isAllProxy.value;
  }
};

const isAllShared = ref(false);
const allShared = () => {
  isAllShared.value = !isAllShared.value;
  for (const item of biliVideos.value) {
    item.shared = isAllShared.value;
  }
};

const { execute: reqPushMoviesApi } = pushMoviesApi();
const submit = async () => {
  try {
    if (selectedItems.value.length === 0) return ElMessage.error("请选择视频");
    await reqPushMoviesApi({
      headers: { Authorization: Props.token },
      data: selectedItems.value.map(
        (item) =>
          <BaseMovieInfo>{
            name: item.name,
            proxy: item.proxy,
            vendorInfo: {
              vendor: "bilibili",
              shared: item.shared,
              bilibili: {
                bvid: item.bvid,
                cid: item.cid,
                epid: item.epid
              },
              backend: Props.vendor
            }
          }
      )
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
    <p>
      <b>说明：</b>
      当share或proxy勾选时，将会共享创建者的bilibili账号
    </p>
    <div class="flex flex-wrap justify-between items-center">
      <p>
        <b>快捷操作：</b>
        <a
          href="javascript:;"
          class="mr-3"
          v-if="selectedItems.length < biliVideos.length"
          @click="selectAll"
          >选中所有视频</a
        >
        <a href="javascript:;" class="mr-3" v-else @click="removeAll">取消选中所有视频</a>
        <a href="javascript:;" class="mr-3" v-if="!biliVideos[0].epid" @click="allProxy()">
          所有视频 开启/关闭 proxy
        </a>
        <a href="javascript:;" class="mr-3" v-if="!biliVideos[0].epid" @click="allShared"
          >所有视频 开启/关闭 shared</a
        >
      </p>
      <el-pagination
        v-if="biliVideos.length != 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :pager-count="4"
        layout="sizes, prev, pager, next, jumper"
        :total="totalItems"
        class="flex-wrap"
      />
    </div>

    <el-row :gutter="20">
      <el-col
        v-for="(item, i) in biliVideos.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
        :key="i"
        :md="biliVideos.length === 1 ? 24 : 12"
      >
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
    <template #footer>
      <div class="flex flex-wrap justify-between items-center">
        <el-pagination
          v-if="biliVideos.length != 0"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :pager-count="5"
          layout="sizes, prev, pager, next, jumper"
          :total="totalItems"
          class="flex-wrap"
        />
        <div>
          <button class="btn mr-4" @click="open = false">取消</button>
          <button v-if="selectedItems.length > 0" class="btn btn-success" @click="submit()">
            添加到列表
          </button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
