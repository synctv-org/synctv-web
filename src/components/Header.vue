<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { userStore } from "@/stores/user";
import { indexStore } from "@/stores";
import DarkModeSwitcher from "@/components/DarkModeSwitcher.vue";
import router from "@/router";
import SyncTVLogo from "@/assets/appIcons/synctv-nobg.svg";
import { ROLE } from "@/types/User";

const mobileMenu = ref(false);
const route = useRoute();
const { settings } = indexStore();
const { isLogin, info } = userStore();

const menuLinks = computed(() => {
  const basicLinks = [
    {
      name: "首页",
      to: "/"
    },
    {
      name: "搜索",
      to: "/search"
    },
    {
      name: "房间列表",
      to: "/rooms"
    }
  ];
  let links = [
    {
      name: "登录",
      to: "/auth/login"
    }
  ];

  if (settings?.emailEnable && !settings.emailDisableUserSignup)
    links.push({
      name: "注册",
      to: "/auth/register"
    });

  if (isLogin.value) {
    const loginLinks = route.path.startsWith("/cinema")
      ? [
          {
            name: "影厅",
            to: "/cinema/" + route.params.roomId
          }
        ]
      : [
          {
            name: "加入房间",
            to: "/joinRoom"
          },
          {
            name: "创建房间",
            to: "/createRoom"
          }
        ];
    if (info.value?.role! >= ROLE.Admin) {
      loginLinks.push({
        name: "管理后台",
        to: "/admin"
      });
    }
    links = loginLinks;
  }

  return basicLinks.concat(links);
});

const toUserInfo = () => {
  router.replace("/user/me");
};
</script>
<template>
  <header class="bg-gray-50 h-16 dark:bg-zinc-900 dark:text-zinc-100">
    <nav class="flex mx-auto max-w-7xl items-center justify-between lg:px-8 p-4 lg:p-5 px-6">
      <div class="flex lg:flex-1">
        <img class="mr-2 w-6 h-6 bg-slate-500 rounded-md" :src="SyncTVLogo" />
        <span class="-m-1.5 p-1.5 font-bold"> SyncTV </span>
      </div>

      <div class="flex lg:hidden items-center gap-4">
        <span class="py-2">
          <DarkModeSwitcher />
        </span>

        <span class="cursor-pointer flex items-center">
          <PersonIcon v-if="isLogin" @click="toUserInfo" />
          <span class="ml-1 max-w-[100px] truncate overflow-hidden">{{ info?.username }}</span>
        </span>

        <button
          type="button"
          class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-zinc-100"
          @click="mobileMenu = true"
        >
          <span class="sr-only">打开菜单</span>
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      <div class="hidden lg:flex lg:gap-x-12">
        <RouterLink v-for="(link, index) in menuLinks" :key="index" :to="link.to">{{
          link.name
        }}</RouterLink>
      </div>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
        <DarkModeSwitcher />
        <div class="flex cursor-pointer items-center" @click="toUserInfo">
          <PersonIcon />
          <span class="max-w-[100px] ml-1 truncate overflow-hidden">{{ info?.username }}</span>
        </div>
      </div>
    </nav>

    <!-- 移动端菜单 -->
    <transition name="slide-to-bottom">
      <div
        class="fixed inset-y-0 right-0 z-[100] w-full overflow-y-auto bg-white px-6 py-5 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-zinc-800"
        v-show="mobileMenu"
      >
        <div class="flex items-center justify-between">
          <span class="-m-1.5 p-1.5 font-bold"> SyncTV </span>

          <button
            type="button"
            class="-m-2.5 rounded-md p-2.5 text-gray-600"
            @click="mobileMenu = false"
          >
            <span class="sr-only">关闭菜单</span>
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6 mobile-menu">
              <RouterLink
                v-for="(link, index) in menuLinks"
                :key="index"
                :to="link.to"
                @click="mobileMenu = false"
                >{{ link.name }}</RouterLink
              >
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped lang="less">
header {
  transition: background 0.5s;
  nav {
    a {
      @apply text-sm font-normal leading-6 text-zinc-600 dark:text-ellipsis dark:text-zinc-200;

      &:hover {
        @apply text-blue-600 dark:text-sky-500;
      }

      &.router-link-exact-active {
        @apply font-medium text-blue-700 dark:text-sky-400;
      }
    }
  }

  .mobile-menu {
    a {
      @apply -mx-3 block rounded-lg px-3 py-2 text-base font-normal leading-7 text-gray-900 dark:text-zinc-200;

      &:hover,
      &.router-link-exact-active {
        @apply bg-gray-100 font-semibold dark:text-zinc-200 dark:bg-zinc-700;
      }
    }
  }
}
</style>
