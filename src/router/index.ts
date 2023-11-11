import { createRouter, createWebHistory } from "vue-router";
import { start, close } from "@/utils/nprogress";
import { ROLE } from "@/types/User";
import { userStore } from "@/stores/user";

const Base_Title = "SyncTV";

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASEURL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { title: "首页", permission: ROLE.Visitor }
    },
    {
      path: "/oauth2/callback/:platform",
      name: "callback",
      component: () => import("../views/oAuth2/callback.vue"),
      meta: { title: "Oauth", permission: ROLE.Visitor }
    },
    {
      path: "/auth/login",
      name: "login",
      component: () => import("../views/auth/Login.vue"),
      meta: { title: "登录", permission: ROLE.Visitor }
    },
    {
      path: "/createRoom",
      name: "createRoom",
      component: () => import("../views/CreateRoom.vue"),
      meta: { title: "创建房间", permission: ROLE.User }
    },
    {
      path: "/joinRoom/:roomId?",
      name: "joinRoom",
      component: () => import("../views/JoinRoom.vue"),
      meta: { title: "加入房间", permission: ROLE.User }
    },
    {
      path: "/rooms",
      name: "rooms",
      component: () => import("../views/Rooms.vue"),
      meta: { title: "房间列表", permission: ROLE.Visitor }
    },
    {
      path: "/cinema/:roomId",
      name: "cinema",
      component: () => import("../views/Cinema.vue"),
      meta: { title: "影厅", permission: ROLE.User }
    },
    {
      path: "/search",
      name: "search",
      component: () => import("../views/SearchPage.vue"),
      meta: { title: "搜索", permission: ROLE.Visitor }
    },
    {
      path: "/user/me",
      name: "myself",
      component: () => import("../views/user/Info.vue"),
      meta: { title: "个人信息", permission: ROLE.User }
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/admin/index.vue"),
      meta: { title: "管理后台", permission: ROLE.Admin }
    },
    {
      path: "/403",
      name: "403",
      component: () => import("../views/error/403.vue"),
      meta: { title: "Forbidden", permission: ROLE.Visitor }
    },
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: () => import("../views/error/404.vue"),
      meta: { title: "404 Not Found", permission: ROLE.Visitor }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    return {
      top: 0
    };
  }
});

router.beforeEach((to: any, from: any, next) => {
  start();
  const { info } = userStore();
  const permission = info.value?.role ?? -1;
  if (to.meta.permission <= permission) {
    window.document.title = Base_Title + " - " + to.meta.title;
    next();
  } else {
    next("/403");
  }
});

router.afterEach(() => {
  close();
});

export default router;
