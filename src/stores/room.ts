import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import type { CurrentMovie, MovieInfo } from "@/types/Movie";
import { userStore } from "@/stores/user";
import type { MovieStatus } from "@/proto/message";
const { token: userToken } = userStore();
export const roomStore = defineStore("roomStore", () => {
  const isDarkMode = useStorage<boolean>("isDarkMode", localStorage.isDarkMode === "true");

  const login = computed(() => {
    return userToken.value !== "";
  });

  // 影片列表
  const movies = ref<MovieInfo[]>([]);

  const totalMovies = ref(0);

  const currentMovie = ref<MovieInfo>({
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
  });
  const currentStatus = ref<MovieStatus>({
    playing: false,
    seek: 0,
    rate: 1
  });
  const currentExpireId = ref<number>(0);

  // 是否主动上报
  const play = ref(true);

  // 在线人数
  const peopleNum = ref(1);

  return {
    isDarkMode,
    movies,
    totalMovies,
    currentMovie,
    currentStatus,
    currentExpireId,
    play,
    peopleNum,
    login
  };
});
