<script setup lang="ts">
import { ref } from "vue";
import { useRoomApi } from "@/hooks/useRoom";
import { roomStatus } from "@/types/Room";
import { Search } from "@element-plus/icons-vue";
import { useTimeAgo } from "@vueuse/core";
import { getObjValue } from "@/utils";

const open = ref(false);
const userId = ref("");
const openDialog = async (id: string) => {
  open.value = true;
  userId.value = id;
  await getRoomList();
};

const {
  totalItems,
  currentPage,
  pageSize,
  order,
  sort,
  keyword,
  search,
  status,

  joinRoom,

  getUserRoomList,
  userRoomList,
  userRoomListLoading
} = useRoomApi("");

const getRoomList = async (showMsg = false) => {
  await getUserRoomList(showMsg, userId.value);
};

defineExpose({ openDialog });
</script>

<template>
  <el-dialog
    v-model="open"
    :close-on-click-modal="false"
    class="rounded-lg dark:bg-zinc-800 w-3/7 max-sm:w-full"
  >
    <template #header>
      <div class="flex flex-wrap justify-between items-center -my-1 text-base mr-4">
        <div class="max-sm:mb-3 text-lg font-medium">
          用户房间列表（{{ userRoomList?.list?.length }}）
        </div>
        <div class="">
          排序方式：<el-select
            v-model="sort"
            class="mr-2"
            placeholder="排序方式"
            @change="getRoomList(false)"
          >
            <el-option label="房间名称" value="name" />
            <el-option label="创建时间" value="createdAt" />
          </el-select>
          <button
            class="btn btn-dense"
            @click="
              order === 'desc' ? (order = 'asc') : (order = 'desc');
              getRoomList();
            "
          >
            {{ order === "asc" ? "👆" : "👇" }}
          </button>
        </div>
      </div>
    </template>
    <template #default>
      <div class="m-auto w-96 -my-5 mb-3 flex">
        <el-select
          v-model="status"
          placeholder="状态"
          style="width: 130px"
          @change="getRoomList(false)"
        >
          <el-option label="ALL" value="" />
          <el-option v-for="r in Object.values(roomStatus)" :label="r" :value="r.toLowerCase()" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索" @keyup.enter="getRoomList(false)" required>
          <template #prepend>
            <el-select
              v-model="search"
              @change="getRoomList(false)"
              placeholder="Select"
              style="width: 90px"
            >
              <el-option label="综合" value="all" />
              <el-option label="名称" value="name" />
              <el-option label="ID" value="id" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="getRoomList(false)" />
          </template>
        </el-input>
      </div>
      <div class="flex flex-wrap justify-center">
        <el-empty v-if="userRoomList?.list?.length === 0" description="此处空空如也" />
        <div
          v-else
          v-for="item in userRoomList?.list"
          :key="item.roomId"
          class="flex flex-wrap m-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-all dark:bg-neutral-700 hover:dark:bg-zinc-900 max-w-[225px]"
        >
          <div class="overflow-hidden text-ellipsis m-auto p-2 w-full">
            <b class="block text-base font-semibold truncate"> {{ item["roomName"] }}</b>
          </div>
          <div class="overflow-hidden text-ellipsis text-sm p-2">
            <div>
              在线人数：<span :class="item.peopleNum > 0 ? 'text-green-500' : 'text-red-500'">{{
                item["peopleNum"]
              }}</span>
            </div>
            <div>状态：{{ getObjValue(roomStatus, item.status) }}</div>
            <div>创建时间：{{ useTimeAgo(new Date(item.createdAt)).value }}</div>
          </div>
          <div class="flex p-2 w-full justify-between items-center">
            <el-tag disabled :type="item.needPassword ? 'danger' : 'success'">
              {{ item.needPassword ? "有密码" : "无密码" }}
            </el-tag>
            <button class="btn btn-dense" @click="() => joinRoom(item.roomId, '')">
              加入房间
              <PlayIcon class="inline-block" width="18px" />
            </button>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-wrap justify-between overflow-hidden">
        <el-button type="success" @click="getRoomList(true)" :loading="userRoomListLoading"
          >更新列表</el-button
        >
        <el-pagination
          v-if="userRoomList?.list?.length != 0"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :pager-count="5"
          layout="sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="getRoomList(false)"
          @current-change="getRoomList(false)"
          class="flex-wrap"
        />
      </div>
    </template>
  </el-dialog>
</template>
