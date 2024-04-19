<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import {
  useSettings,
  type settingGroup,
  type settingGroupName,
  type settingType
} from "@/hooks/useSettings";
import { assignSettingApi, sendTestMailApi } from "@/services/apis/admin";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";

const props = defineProps<{
  title: string;
  showType: settingGroupName;
}>();

const { token, info } = userStore();
const { updateSet } = useUpdateSettings("admin", token.value);

const {
  databaseSettingsGroup,
  roomSettingsGroup,
  proxySettingsGroup,
  OAuth2SettingGroup,
  rtmpSettingsGroup,
  userSettingsGroup,
  emailSettingGroup,
  serverSettingsGroup
} = useSettings();

const settingsGroups: Record<
  settingGroupName,
  Map<string, settingGroup> | [string, settingGroup][]
> = {
  database: databaseSettingsGroup,
  room: roomSettingsGroup,
  proxy: proxySettingsGroup,
  oauth2: OAuth2SettingGroup,
  rtmp: rtmpSettingsGroup,
  user: userSettingsGroup,
  email: emailSettingGroup,
  server: serverSettingsGroup,
  all: [
    ...roomSettingsGroup,
    ...rtmpSettingsGroup,
    ...proxySettingsGroup,
    ...userSettingsGroup,
    ...OAuth2SettingGroup,
    ...databaseSettingsGroup,
    ...emailSettingGroup,
    ...serverSettingsGroup
  ]
};

const settings = ref<Map<string, settingGroup>>();

const getAllSettings = async () => {
  const { state, execute } = assignSettingApi();
  try {
    await execute({
      headers: {
        Authorization: token.value
      },
      url: `/api/admin/settings${props.showType === "all" ? "" : "/" + props.showType}`
    });
    if (!state.value) return;
    settings.value = new Map<string, settingGroup>(settingsGroups[props.showType]);
    // 更新默认设置
    for (const group in state.value) {
      if (settings.value.has(group)) {
        for (const setting in state.value[group]) {
          settings.value.get(group)!.value.set(setting, {
            ...settings.value.get(group)!.value.get(setting),
            value: state.value[group][setting]
          });
        }
      } else {
        console.log(
          `Group ${group} is not found in the defaults, it will be added to the settings.`
        );
        settings.value.set(group, {
          name: group,
          value: new Map<string, settingType>()
        });
        for (const setting in state.value[group]) {
          console.log(
            `Setting ${setting} in group ${group} is not found in the response, it will be added.`
          );
          settings.value.get(group)!.value.set(setting, {
            name: setting,
            value: state.value[group][setting]
          });
        }
      }
    }

    // 删除state中不存在的设置组和设置
    for (const group of settings.value.keys()) {
      if (!state.value.hasOwnProperty(group)) {
        console.log(
          `Group ${group} is not found in the response, it will be deleted from the settings.`
        );
        settings.value.delete(group);
      } else {
        const groupSettings = settings.value.get(group)!.value;
        for (const setting of groupSettings.keys()) {
          if (!state.value[group].hasOwnProperty(setting)) {
            console.log(
              `Setting ${setting} in group ${group} is not found in the response, it will be deleted.`
            );
            groupSettings.delete(setting);
          }
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "获取设置列表失败",
      type: "error",
      message: err.response?.data.error || err.message
    });
  }
};

const { execute, isLoading: sendTestMailBtnLoading } = sendTestMailApi();
const toSendTestMail = async () => {
  const { value } = await ElMessageBox.prompt("如果为空，将发送到绑定的邮箱", "请输入邮箱地址", {
    confirmButtonText: "确定",
    cancelButtonText: "取消"
  });
  const regex =
    /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
  if (value && !regex.test(value)) return ElMessage.error("请输入正确的邮箱地址");

  try {
    ElMessage.info("邮件发送中");
    await execute({
      headers: {
        Authorization: token.value
      },
      data: {
        email: value ?? info.value?.email
      }
    });
    ElMessage.success("邮件发送成功");
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "邮件发送失败",
      type: "error",
      message: err.response?.data.error || err.message
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
                @change="updateSet(setting[0], setting[1].value)"
                v-model="setting[1].value"
              />
              <el-input
                v-else
                @change="updateSet(setting[0], setting[1].value)"
                v-model.trim.lazy="setting[1].value"
                :placeholder="setting[1].placeholder"
                :disabled="setting[1].disabled"
                :type="setting[1].isTextarea ? 'textarea' : 'text'"
              >
                <template #append v-if="setting[1].append">{{ setting[1].append }}</template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="card-footer" v-if="props.showType === 'email'">
          <el-button type="primary" @click="toSendTestMail" :loading="sendTestMailBtnLoading"
            >发送测试邮件</el-button
          >
        </div>
      </div>
    </el-col>
  </el-row>
</template>
