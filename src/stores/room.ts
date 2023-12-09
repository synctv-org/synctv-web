import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import type { Status } from "@/proto/message";
import type { MovieInfo } from "@/types/Movie";
import { userStore } from "@/stores/user";
const { token: userToken } = userStore();
export const roomStore = defineStore("roomStore", () => {
  const isDarkMode = useStorage<boolean>("isDarkMode", localStorage.isDarkMode === "true");

  const login = computed(() => {
    return userToken.value !== "";
  });

  // 影片列表
  const movies = ref<MovieInfo[]>([]);

  const totalMovies = ref(0);

  // 设置播放当前影片
  const currentMovie = ref<MovieInfo>({
    id: "",
    base: {
      name: "",
      live: false,
      proxy: false,
      url: "",
      rtmpSource: false,
      type: "",
      headers: {},
      subtitles: void 0,
      vendorInfo: void 0
    },
    createdAt: Date.now(),
    creator: "SYSTEM"
  });

  // 当前影片播放状态
  const currentMovieStatus = ref<Status>({
    playing: false,
    rate: 1,
    seek: 0
  });

  // 是否主动上报
  const play = ref(true);

  // 在线人数
  const peopleNum = ref(1);

  const danmuku = ref({});

  return {
    isDarkMode,
    movies,
    totalMovies,
    currentMovie,
    currentMovieStatus,
    play,
    danmuku,
    peopleNum,
    login
  };
});
