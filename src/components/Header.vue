<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { roomStore } from "@/stores/room";
import DarkModeSwitcher from "@/components/DarkModeSwitcher.vue";
const room = roomStore();
const mobileMenu = ref(false);
</script>
<template>
  <header class="bg-gray-50 h-16 dark:bg-zinc-900 dark:text-zinc-100">
    <nav
      class="flex mx-auto max-w-7xl items-center justify-between lg:px-8 p-4 lg:p-5 px-6"
    >
      <div class="flex lg:flex-1">
        <span class="-m-1.5 p-1.5 font-bold"> SyncTV </span>
      </div>

      <div class="flex lg:hidden">
        <span class="p-2 mr-2">
          <DarkModeSwitcher />
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
        <RouterLink to="/"> 首&nbsp;&nbsp;&nbsp;&nbsp;页 </RouterLink>
        <RouterLink to="/joinRoom"> 加入房间 </RouterLink>
        <RouterLink to="/createRoom"> 创建房间 </RouterLink>
        <RouterLink to="/cinema" v-if="room.login">
          影&nbsp;&nbsp;&nbsp;&nbsp;厅
        </RouterLink>
      </div>
      <div class="hidden lg:flex lg:flex-1 lg:justify-end">
        <DarkModeSwitcher />
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6 moblie-menu">
              <RouterLink to="/" @click="mobileMenu = false">
                首&nbsp;&nbsp;&nbsp;&nbsp;页
              </RouterLink>
              <RouterLink to="/joinRoom" @click="mobileMenu = false">
                加入房间
              </RouterLink>
              <RouterLink to="/createRoom" @click="mobileMenu = false">
                创建房间
              </RouterLink>
              <RouterLink
                to="/cinema"
                @click="mobileMenu = false"
                v-if="room.login"
              >
                影&nbsp;&nbsp;&nbsp;&nbsp;厅
              </RouterLink>
            </div>
            <!-- <div class="py-6">
              <a href="javascript::">关于此项目</a>
            </div> -->
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

  .moblie-menu {
    a {
      @apply -mx-3 block rounded-lg px-3 py-2 text-base font-normal leading-7 text-gray-900 dark:text-zinc-200;

      &:hover,
      &.router-link-exact-active {
        @apply bg-gray-100 font-semibold dark:text-zinc-200 dark:bg-zinc-700;
      }
    }
  }
}

// 移动端菜单动画
.slide-to-bottom-enter-from,
.slide-to-bottom-leave-to {
  transform: translateY(-100%);
}

.slide-to-bottom-enter-to,
.slide-to-bottom-leave-from {
  transform: translateY(0%);
}

.slide-to-bottom-enter-active,
.slide-to-bottom-leave-active {
  transition: all 0.6s ease;
}
</style>
