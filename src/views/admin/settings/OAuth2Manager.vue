<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import { oAuth2SettingsApi } from "@/services/apis/admin";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";

const props = defineProps<{
  title: string;
}>();

const { token } = userStore();
const { updateSet } = useUpdateSettings();

interface settingType {
  value: any;
  append?: string;
  placeholder?: string;
  comment?: string;
  name?: string;
}

interface settingGroup {
  name?: string;
  value: Map<string, settingType>;
}

const generateSettingsMap = (name: string) => {
  return new Map([
    [name + "_enabled", { value: false, name: "是否启用" }],
    [name + "_client_id", { value: "", name: "Client ID" }],
    [name + "_client_secret", { value: "", name: "Client Secret" }],
    [name + "_redirect_url", { value: "", name: "Redirect Url" }]
  ]);
};

const defaultSettings: Map<string, settingGroup> = new Map([
  [
    "oauth2_baidu",
    {
      name: "百度",
      value: generateSettingsMap("oauth2_baidu")
    }
  ],
  [
    "oauth2_baidu-netdisk",
    {
      name: "百度网盘",
      value: generateSettingsMap("oauth2_baidu-netdisk")
    }
  ],
  [
    "oauth2_gitee",
    {
      name: "Gitee",
      value: generateSettingsMap("oauth2_gitee")
    }
  ],
  [
    "oauth2_github",
    {
      name: "GitHub",
      value: generateSettingsMap("oauth2_github")
    }
  ],
  [
    "oauth2_gitlab",
    {
      name: "GitLab",
      value: generateSettingsMap("oauth2_gitlab")
    }
  ],
  [
    "oauth2_google",
    {
      name: "Google",
      value: generateSettingsMap("oauth2_google")
    }
  ],
  [
    "oauth2_microsoft",
    {
      name: "Microsoft",
      value: generateSettingsMap("oauth2_microsoft")
    }
  ],
  [
    "oauth2_qq",
    {
      name: "QQ",
      value: generateSettingsMap("oauth2_qq")
    }
  ]
]);

const settings = ref<Map<string, settingGroup>>(defaultSettings);

const getAllSettings = async () => {
  const { state, execute } = oAuth2SettingsApi();
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
              value: state.value[group][setting]
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取 OAuth2 设置列表失败",
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
          <el-form :inline="false" label-width="100px" label-position="left">
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
