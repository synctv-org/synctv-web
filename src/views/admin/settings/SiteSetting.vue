<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, type WatchStopHandle } from "vue";
import { ElNotification, ElMessage } from "element-plus";
import { userStore } from "@/stores/user";
import { allSettingsApi } from "@/services/apis/admin";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import _ from "lodash";

const props = defineProps<{
  title: string;
}>();

const { token } = userStore();
const { state, isLoading, updateSet } = useUpdateSettings();

interface settingType {
  valueType: string;
  value: any;
  isFloat?: boolean;
  name?: string;
}

interface settingGroup {
  name?: string;
  value: Map<string, settingType>;
}

const defaultSettings = new Map([
  [
    "room",
    {
      name: "房间设置",
      value: new Map([
        [
          "create_room_need_review",
          { valueType: "boolean", value: false, name: "创建房间需要审核" }
        ],
        ["disable_create_room", { valueType: "boolean", value: false, name: "禁止创建房间" }],
        [
          "room_must_need_pwd",
          { valueType: "boolean", value: false, name: "创建房间必须填写密码" }
        ],
        [
          "room_ttl",
          { valueType: "number", value: 172800000000000, isFloat: false, name: "房间过期时间" }
        ]
      ])
    }
  ]
]);

const settings = ref<Map<string, settingGroup>>(defaultSettings);

const getAllSettings = async () => {
  const { state, execute } = allSettingsApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      }
    });
    if (state.value) {
      for (const group in state.value) {
        if (!settings.value.has(group)) {
          settings.value.set(group, { value: new Map() });
        } else if (!settings.value.get(group)?.value) {
          settings.value.get(group)!.value = new Map();
        }
        for (const setting in state.value[group]) {
          if (settings.value.get(group)!.value.has(setting)) {
            settings.value.get(group)!.value.get(setting)!.value = state.value[group][setting];
          } else {
            settings.value.get(group)!.value.set(setting, {
              valueType: typeof state.value[group][setting],
              value: state.value[group][setting]
            });
          }
        }
      }
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

onMounted(async () => {
  await getAllSettings();
});
</script>

<template>
  <el-row :gutter="20">
    <el-col v-for="group in settings" :xs="24" :md="12" class="mb-5">
      <div class="card">
        <div class="card-title">{{ group[1].name || group[0] }}</div>
        <div class="card-body">
          <el-form :inline="true">
            <el-form-item v-for="setting in group[1].value" :label="setting[1].name || setting[0]">
              <el-switch
                v-if="setting[1].valueType === 'boolean'"
                :loading="isLoading"
                @click="updateSet(setting[0], setting[1].value)"
                v-model="setting[1].value"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
