import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import type { CurrentMovie, MovieInfo } from "@/types/Movie";
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
  const current = ref<CurrentMovie>({
    movie: {
      id: "",
      base: {
        url: "",
        name: "",
        live: false,
        proxy: false,
        rtmpSource: false,
        type: "",
        headers: {}
      },
      createdAt: 0,
      creator: ""
    },
    status: {
      playing: false,
      seek: 0,
      rate: 1
    },
    expireId: 0
  });

  // 是否主动上报
  const play = ref(true);

  // 在线人数
  const peopleNum = ref(1);

  return {
    isDarkMode,
    movies,
    totalMovies,
    current,
    play,
    peopleNum,
    login
  };
});
