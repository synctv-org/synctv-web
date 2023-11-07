import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { MovieInfo, Status } from "@/proto/message";
export const roomStore = defineStore("roomStore", () => {
  const isDarkMode = ref(false);

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
      vendorInfo: undefined
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

  // 播放结束？
  const isEnd = ref(false);

  return {
    isDarkMode,
    movies,
    totalMovies,
    currentMovie,
    currentMovieStatus,
    play,
    danmuku,
    peopleNum,
    isEnd
  };
});
