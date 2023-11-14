<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, type WatchStopHandle } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import { userSettingsApi, roomSettingsApi } from "@/services/apis/admin";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import _ from "lodash";

const props = defineProps<{
  title: string;
}>();

const watchers: WatchStopHandle[] = [];
const { token } = userStore();
const { state, isLoading, updateSet } = useUpdateSettings();

const userSetsForm = ref({
  disable_user_signup: false,
  signup_need_review: false
});

const roomSetsForm = ref({
  create_room_need_review: false,
  disable_create_room: false,
  room_must_need_pwd: false,
  room_ttl: 172800000000000,
  user_max_room_count: 3
});

const getUserSettings = async () => {
  const { state, execute } = userSettingsApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      }
    });
    if (state.value) {
      userSetsForm.value = state.value;
      // watchers.push(watch(userSetsForm.value, () => updateSet(userSetsForm.value)));
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取用户设置列表失败",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

const getRoomSettings = async () => {
  const { state, execute } = roomSettingsApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      }
    });
    if (state.value) {
      roomSetsForm.value = state.value;
      watchers.push(watch(roomSetsForm.value, () => updateSet(roomSetsForm.value)));
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取房间设置列表失败",
      type: "error",
      message: err.response.data.error || err.message
    });
  }
};

onMounted(async () => {
  await getUserSettings();
  await getRoomSettings();
});

onBeforeUnmount(() => {
  watchers.forEach((watcher) => watcher());
});
</script>

<template>
  <el-row :gutter="20">
    <el-col :xs="24" :md="12" class="mb-5">
      <div class="card">
        <div class="card-title">登陆注册</div>
        <div class="card-body">
          <el-form :inline="true">
            <el-form-item label="禁止用户注册">
              <el-switch v-model="userSetsForm.disable_user_signup" :loading="isLoading" />
            </el-form-item>
            <el-form-item label="注册需要审核">
              <el-switch v-model="userSetsForm.signup_need_review" :loading="isLoading" />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
    <el-col :xs="24" :md="12">
      <div class="card">
        <div class="card-title">房间设置</div>
        <div class="card-body">
          <el-form label-width="160px">
            <el-form-item label="创建房间需要审核">
              <el-switch
                v-model="roomSetsForm.create_room_need_review"
                :loading="isLoading"
                @click="updateSet(roomSetsForm)"
              />
            </el-form-item>
            <el-form-item label="禁止创建房间">
              <el-switch
                v-model="roomSetsForm.disable_create_room"
                :loading="isLoading"
                @click="updateSet(roomSetsForm)"
              />
            </el-form-item>
            <el-form-item label="创建房间必须填写密码">
              <el-switch
                v-model="roomSetsForm.room_must_need_pwd"
                :loading="isLoading"
                @click="updateSet(roomSetsForm)"
              />
            </el-form-item>
            <el-form-item label="房间过期时间">
              <el-input v-model.trim.lazy="roomSetsForm.room_ttl" @change="updateSet(roomSetsForm)">
                <template #append>单位（纳秒）</template>
              </el-input>
            </el-form-item>
            <el-form-item label="用户最大创建房间数">
              <el-input
                v-model.trim.lazy="roomSetsForm.user_max_room_count"
                @change="updateSet(roomSetsForm)"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
