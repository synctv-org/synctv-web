import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useRouteParams } from "@vueuse/router";
import { useLocalStorage } from "@vueuse/core";
import type { CurrentMovie, MovieInfo } from "@/types/Movie";
import { userStore } from "@/stores/user";
import type { Status } from "@/proto/message";
import type { MyInfo } from "@/types/Room";
import type { MoviePath } from "@/services/apis/movie";
const { token: userToken } = userStore();
export const roomStore = defineStore("roomStore", () => {
  const isDarkMode = useStorage<boolean>("isDarkMode", localStorage.isDarkMode === "true");

  const login = computed(() => {
    return userToken.value !== "";
  });

  const myInfo = ref<MyInfo>();

  // 影片列表
  const movies = ref<MovieInfo[]>([]);

  // roomID
  const roomID = computed(() => {
    return useRouteParams<string>("roomId");
  });

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
    creator: "",
    subPath: ""
  });
  const currentStatus = ref<Status>({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1
  });
  const currentExpireId = ref<number>(0);

  // 是否主动上报
  const play = ref(true);

  // 在线人数
  const peopleNum = ref(1);

  const folder = ref<MoviePath[]>();

  const lastFolderId = computed(() => {
    return folder.value && folder.value.length > 0 ? folder.value[folder.value.length - 1].id : "";
  });
  const lastFolderSubPath = computed(() => {
    return folder.value && folder.value.length > 0
      ? folder.value[folder.value.length - 1].subPath
      : "";
  });

  return {
    isDarkMode,
    movies,
    totalMovies,
    currentMovie,
    currentStatus,
    currentExpireId,
    play,
    peopleNum,
    login,
    myInfo,
    roomID,
    folder,
    lastFolderId,
    lastFolderSubPath
  };
});
