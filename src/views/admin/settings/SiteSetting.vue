<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElNotification } from "element-plus";
import { userStore } from "@/stores/user";
import { allSettingsApi } from "@/services/apis/admin";
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

const defaultSettings = new Map([
  [
    "room",
    {
      name: "房间设置",
      value: new Map([
        ["create_room_need_review", { value: false, name: "创建房间需要审核" }],
        ["disable_create_room", { value: false, name: "禁止创建房间" }],
        ["room_must_need_pwd", { value: false, name: "创建房间必须填写密码" }],
        [
          "room_ttl",
          {
            value: 172800000000000,
            append: "纳秒",
            comment: "回收房间仅仅只是释放内存，而不是删除房间",
            name: "非活跃房间回收时间"
          }
        ],
        ["user_max_room_count", { value: 0, append: "个", name: "用户最大创建房间数" }]
      ])
    }
  ],
  [
    "proxy",
    {
      name: "代理设置",
      value: new Map([
        ["allow_proxy_to_local", { value: false, name: "允许代理到本机地址" }],
        ["live_proxy", { value: false, name: "代理直播流" }],
        ["movie_proxy", { value: false, name: "代理普通视频" }]
      ])
    }
  ],
  [
    "rtmp",
    {
      name: "RTMP设置",
      value: new Map([
        [
          "custom_publish_host",
          { value: "", placeholder: "example.com:1935", name: "自定义推流 Host" }
        ],
        [
          "rtmp_player",
          {
            value: false,
            comment: "可以通过 RTMP 协议观看直播流（无需身份验证，不安全）",
            name: "允许使用 RTMP 播放器"
          }
        ],
        ["ts_disguised_as_png", { value: false, name: "ts伪装成png图片" }]
      ])
    }
  ],
  [
    "user",
    {
      name: "用户相关",
      value: new Map([
        ["disable_user_signup", { value: false, name: "禁止用户注册" }],
        ["signup_need_review", { value: false, name: "注册需要审核" }]
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
