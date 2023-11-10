<script setup lang="ts">
import { ref, watch, shallowRef, type Component, onMounted } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { userStore } from "@/stores/user";
import { ElNotification } from "element-plus";
import { userInfo } from "@/services/apis/user";
import { roomStore } from "@/stores/room";
import { useScreen } from "@/hooks/useScreen";
import UserManager from "./settings/UserManager.vue";

const user = userStore();
const room = roomStore();
const { isPhone } = useScreen();

const getUserInfo = async () => {
  const { state, execute } = userInfo();
  try {
    await execute({
      headers: {
        Authorization: room.userToken
      }
    });
    if (state.value) {
      user.info = state.value;
    }
  } catch (err: any) {
    console.error(err);
    ElNotification({
      title: "错误",
      message: err.response.data.error || err.message,
      type: "error"
    });
  }
};

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
    name: "管理员设置",
    icon: "👮‍",
    component: UserManager
  }
];

const activeTab = shallowRef<Tabs>({
  name: "用户管理",
  icon: "🐵",
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
  getUserInfo();

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
        <div class="card">
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

    <div class="w-full">
      <component :is="activeTab.component" :title="activeTab.name" />
    </div>
  </div>
</template>
