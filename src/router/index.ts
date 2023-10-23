import { createRouter, createWebHistory } from "vue-router";
import { start, close } from "@/utils/nprogress";

const Base_Title = "SyncTV";

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASEURL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { title: "首页" }
    },
    {
      path: "/oauth2/callback/:platform",
      name: "callback",
      component: () => import("../views/oAuth2/callback.vue"),
      meta: { title: "Oauth" }
    },
    {
      path: "/auth/login",
      name: "login",
      component: () => import("../views/auth/Login.vue"),
      meta: { title: "登录" }
    },
    {
      path: "/createRoom",
      name: "createRoom",
      component: () => import("../views/CreateRoom.vue"),
      meta: { title: "创建房间" }
    },
    {
      path: "/joinRoom",
      name: "joinRoom",
      component: () => import("../views/JoinRoom.vue"),
      meta: { title: "加入房间" }
    },
    {
      path: "/cinema",
      name: "selectCinema",
      component: () => import("../views/SelectCinema.vue"),
      meta: { title: "请选择房间" }
    },
    {
      path: "/cinema/:roomId",
      name: "cinema",
      component: () => import("../views/Cinema.vue"),
      meta: { title: "影厅" }
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
  window.document.title = Base_Title + " - " + to.meta.title;
  next();
});

router.afterEach(() => {
  close();
});

export default router;
