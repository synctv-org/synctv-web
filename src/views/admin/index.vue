<script setup lang="ts">
import { ref, watch, shallowRef, type Component, onMounted } from "vue";
import { userStore } from "@/stores/user";
import { ElNotification } from "element-plus";
import { roomStore } from "@/stores/room";
import { useScreen } from "@/hooks/useScreen";
import { ROLE } from "@/types/User";

import UserManager from "./settings/UserManager.vue";
import RoomsManager from "./settings/RoomsManager.vue";
import SiteSetting from "./settings/SiteSetting.vue";

const { info: userInfo } = userStore();
const room = roomStore();
const { isPhone } = useScreen();

interface Tabs {
  name: string;
  icon: string;
  component: Component;
}

const tabs: Tabs[] = [
  {
    name: "用户管理",
    icon: "🐵",
    component: UserManager
  },
  {
    name: "房间管理",
    icon: "🏡",
    component: RoomsManager
  },
  {
    name: "站点设置",
    icon: "🌏",
    component: SiteSetting
  }
];

const activeTab = shallowRef<Tabs>({
  name: "房间管理",
  icon: "🏡",
  component: RoomsManager
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
    <transition name="slide-to-left">
      <div class="w-96 relative menu-drawer" v-show="menu">
        <div class="card" style="height: 85vh">
          <div class="card-body py-5">
            <div
              v-for="menu in tabs"
              :key="menu.name"
              class="menu-item cursor-pointer"
              :class="activeTab.name === menu.name && 'menu-item-active'"
              @click="switchTab(menu)"
            >
              <span class="icon"> {{ menu.icon }} </span>
              {{ menu.name }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="w-full right-content">
      <component :is="activeTab.component" :title="activeTab.name" />
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
</style>
