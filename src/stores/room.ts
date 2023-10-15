import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { MovieInfo, Status } from "@/proto/message";
export const roomStore = defineStore("roomStore", () => {
  const login = ref(false);

  const isDarkMode = ref(false);

  // 影片列表
  const movies = ref<MovieInfo[]>([]);

  const totalMovies = ref(0);

  // 设置播放当前影片
  const currentMovie = ref<MovieInfo>({
    base: {
      name: "",
      live: false,
      proxy: false,
      url: "",
      rtmpSource: false,
      type: "",
      headers: {}
    },
    pullKey: "",
    createdAt: Date.now(),
    creator: "SYSTEM",
    id: 1
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
    login,
    movies,
    totalMovies,
    currentMovie,
    currentMovieStatus,
    play,
    danmuku,
    peopleNum
  };
});
