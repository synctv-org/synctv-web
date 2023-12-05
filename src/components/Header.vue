<script setup lang="ts">
import {ref, computed} from "vue";
import {RouterLink} from "vue-router";
import {userStore} from "@/stores/user";
import DarkModeSwitcher from "@/components/DarkModeSwitcher.vue";
import router from "@/router";

const mobileMenu = ref(false);

const {isLogin, info} = userStore();

const limitedUsername = computed(() => {
  if (info.value?.username && info.value?.username.length > 7) {
    return info.value?.username.substring(0, 7) + '...'; // 超出长度截断
  }
  return info.value?.username || ''; // 不需要截断直接返回
});

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

  if (isLogin.value) {
    const loginLinks = [
      {
        name: "加入房间",
        to: "/joinRoom"
      },
      {
        name: "创建房间",
        to: "/createRoom"
      },
    ];
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
        <span class="-m-1.5 p-1.5 font-bold"> SyncTV </span>
      </div>

      <div class="flex lg:hidden items-center">
        <span class="p-2">
          <DarkModeSwitcher/>
        </span>

        <span>
          <PersonIcon v-if="isLogin" class="cursor-pointer" @click="toUserInfo"/>
        </span>

        <span @click="toUserInfo" class="cursor-pointer" v-if="isLogin">
          {{ limitedUsername }}
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
          }}
        </RouterLink>
      </div>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <DarkModeSwitcher/>
        <PersonIcon class="ml-4 cursor-pointer" @click="toUserInfo"/>
      </div>
      <div class="hidden lg:flex lg:justify-end cursor-pointer" @click="toUserInfo" v-if="isLogin">
        {{ limitedUsername }}
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
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6 moblie-menu">
              <RouterLink
                  v-for="(link, index) in menuLinks"
                  :key="index"
                  :to="link.to"
                  @click="mobileMenu = false"
              >{{ link.name }}
              </RouterLink
              >
            </div>
            <!--            <div class="py-6">-->
            <!--              <a href="javascript:">关于此项目</a>-->
            <!--            </div>-->
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
    @apply text-sm font-normal leading-6 text-zinc-600 dark: text-ellipsis dark: text-zinc-200;

      &:hover {
      @apply text-blue-600 dark: text-sky-500;
      }

      &.router-link-exact-active {
      @apply font-medium text-blue-700 dark: text-sky-400;
      }
    }
  }

  .moblie-menu {
    a {
    @apply -mx-3 block rounded-lg px-3 py-2 text-base font-normal leading-7 text-gray-900 dark: text-zinc-200;

      &:hover,
      &.router-link-exact-active {
      @apply bg-gray-100 font-semibold dark: text-zinc-200 dark: bg-zinc-700;
      }
    }
  }
}
</style>
