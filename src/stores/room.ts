import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { MovieInfo, MovieStatus } from "@/types/Movie";
export const roomStore = defineStore("roomStore", () => {
  const login = ref(false);

  const isDarkMode = ref(false);

  // 影片列表
  const movieList = ref({});

  // 设置播放当前影片
  const currentMovie = ref<MovieInfo>({
    name: "",
    live: false,
    proxy: false,
    url: "",
    rtmpSource: false,
    type: "",
    headers: null,
    createAt: Date.now(),
    creator: "SYSTEM",
    id: 1,
    lastEditAt: Date.now()
  });

  // 当前影片播放状态
  const currentMovieStatus = ref<MovieStatus>({
    playing: false,
    rate: 1,
    seek: 0
  });

  // 是否主动上报
  const play = ref(true);

  const count = ref(3);

  // 在线人数
  const peopleNum = ref(1);

  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }

  const danmuku = ref({});

  return {
    count,
    isDarkMode,
    login,
    movieList,
    currentMovie,
    currentMovieStatus,
    play,
    doubleCount,
    increment,
    danmuku,
    peopleNum
  };
});
