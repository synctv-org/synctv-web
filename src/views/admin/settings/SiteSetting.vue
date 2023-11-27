<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import { useSettings, type settingGroup,type settingGroupName } from "@/hooks/useSettings";
import { assignSettingApi } from "@/services/apis/admin";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";

const props = defineProps<{
  title: string;
  showType: settingGroupName;
}>();

const { token } = userStore();
const { updateSet } = useUpdateSettings();

const {
  roomSettingsGroup,
  proxySettingsGroup,
  OAuth2SettingGroup,
  rtmpSettingsGroup,
  userSettingsGroup
} = useSettings();

const settingsGroups = {
  room: roomSettingsGroup,
  proxy: proxySettingsGroup,
  oauth2: OAuth2SettingGroup,
  rtmp: rtmpSettingsGroup,
  user: userSettingsGroup,
  all: [
    ...roomSettingsGroup,
    ...proxySettingsGroup,
    ...rtmpSettingsGroup,
    ...userSettingsGroup,
    ...OAuth2SettingGroup
  ]
};

const settings = ref<Map<string, settingGroup>>(new Map(settingsGroups[props.showType]));

const getAllSettings = async () => {
  const { state, execute } = assignSettingApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      },
      url: `/api/admin/settings${props.showType === 'all' ? '' : '/'+props.showType}`
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
              value: state.value[group][setting]
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取设置列表失败",
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
          <el-form :inline="false" label-width="160px" label-position="left">
            <el-form-item v-for="setting in group[1].value">
              <template #label>
                <p :title="setting[1].comment">
                  {{ setting[1].name || setting[0] }}
                </p>
              </template>
              <el-switch
                v-if="typeof setting[1].value === 'boolean'"
                @click="updateSet(setting[0], setting[1].value)"
                v-model="setting[1].value"
              />
              <el-input
                v-else
                @change="updateSet(setting[0], setting[1].value)"
                v-model.trim.lazy="setting[1].value"
                :placeholder="setting[1].placeholder"
              >
                <template #append v-if="setting[1].append">{{ setting[1].append }}</template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
