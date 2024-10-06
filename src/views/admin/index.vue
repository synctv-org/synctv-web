<script setup lang="ts">
import { ref, watch, shallowRef, type Component, onMounted } from "vue";
import { useScreen } from "@/hooks/useScreen";
import type { settingGroupName } from "@/hooks/useSettings";

import UserManager from "./settings/UserManager.vue";
import RoomsManager from "./settings/RoomsManager.vue";
import SiteSetting from "./settings/SiteSetting.vue";
import VendorManager from "./settings/VendorManager.vue";

import {
  User,
  House,
  VideoCamera,
  Setting,
  DataAnalysis,
  Connection,
  Film,
  Key,
  Message,
  Tools,
  List,
  Monitor,
  Avatar
} from "@element-plus/icons-vue";

const { isPhone } = useScreen();

interface Tabs {
  name: string;
  icon: Component;
  component: Component;
  showType?: settingGroupName;
}

const tabs: Tabs[] = [
  {
    name: "用户管理",
    icon: User,
    component: UserManager
  },
  {
    name: "房间管理",
    icon: House,
    component: RoomsManager
  },
  {
    name: "视频解析管理",
    icon: VideoCamera,
    component: VendorManager
  },
  {
    name: "用户设置",
    icon: Avatar,
    component: SiteSetting,
    showType: "user"
  },
  {
    name: "房间设置",
    icon: Setting,
    component: SiteSetting,
    showType: "room"
  },
  {
    name: "数据库设置",
    icon: DataAnalysis,
    component: SiteSetting,
    showType: "database"
  },
  {
    name: "代理设置",
    icon: Connection,
    component: SiteSetting,
    showType: "proxy"
  },
  {
    name: "RTMP设置",
    icon: Film,
    component: SiteSetting,
    showType: "rtmp"
  },
  {
    name: "网站设置",
    icon: Monitor,
    component: SiteSetting,
    showType: "user"
  },
  {
    name: "OAuth2 管理",
    icon: Key,
    component: SiteSetting,
    showType: "oauth2"
  },
  {
    name: "邮箱设置",
    icon: Message,
    component: SiteSetting,
    showType: "email"
  },
  {
    name: "系统设置",
    icon: Tools,
    component: SiteSetting,
    showType: "server"
  },
  {
    name: "所有设置",
    icon: List,
    component: SiteSetting,
    showType: "all"
  }
];

const activeTab = shallowRef<Tabs>({
  name: "用户管理",
  icon: User,
  component: UserManager
});

const switchTab = (tab: Tabs) => {
  activeTab.value = tab;
  if (!isPhone.value) return;
  menu.value = false;
};

const menu = ref(!isPhone.value);
const menuToggle = () => {
  menu.value = !menu.value;
};

onMounted(() => {
  watch(
    () => isPhone.value,
    () => {
      menu.value = !isPhone.value;
    }
  );
});
</script>

<template>
  <div class="menu-toggle" @click="menuToggle"></div>
  <div class="container mx-auto flex gap-5">
    <Transition name="slide-to-left">
      <div class="w-96 relative menu-drawer" v-show="menu">
        <div class="card" style="height: 85vh; overflow-y: auto">
          <div class="card-body py-5">
            <div
              v-for="menu in tabs"
              :key="menu.name"
              class="menu-item cursor-pointer"
              :class="activeTab.name === menu.name && 'menu-item-active'"
              @click="switchTab(menu)"
            >
              <el-icon class="icon">
                <component :is="menu.icon" />
              </el-icon>
              {{ menu.name }}
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="w-full right-content">
      <component
        :key="activeTab.name"
        :is="activeTab.component"
        :title="activeTab.name"
        :show-type="activeTab.showType"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.right-content {
  max-width: calc(100% - 20rem);
}

@media (max-width: 768px) {
  .right-content {
    max-width: 100%;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 18px;
}
</style>
