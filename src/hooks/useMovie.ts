import { computed, ref } from "vue";
import { ElNotification } from "element-plus";
import { roomStore } from "@/stores/room";
import {
  moviesApi,
  currentMovieApi,
  editMovieInfoApi,
  delMovieApi,
  swapMovieApi,
  changeCurrentMovieApi,
  clearMovieListApi,
  liveInfoApi
} from "@/services/apis/movie";
import type { EditMovieInfo, MovieInfo } from "@/types/Movie";
import { strLengthLimit } from "@/utils";

// 获取房间信息
const room = roomStore();

export const useMovieApi = (roomToken: string) => {
  // 获取影片列表和正在播放的影片
  const currentPage = ref(1);
  const pageSize = ref(10);
  const dynamic = ref(false);

  const subPath = computed(() => {
    return room.movieList && room.movieList[room.movieList.length - 1].subPath;
  });

  const switchDir = (id: string, subPath: string) => {
    if (!room.movieList) return;

    const file = room.movieList
      .filter((item) => item.id === id)
      .find((item) => item.subPath === subPath);

    if (!file) {
      const movie = room.movies
        .filter((movie) => movie.id === id)
        .find((movie) => movie.subPath === subPath);
      room.movieList.push({
        label: movie?.base.name || "",
        subPath: movie?.subPath || "",
        id: movie?.id || ""
      });
    } else {
      room.movieList = room.movieList.slice(0, room.movieList.indexOf(file) + 1);
    }
    currentPage.value = 1;
    return getMovies(id, subPath);
  };

  // 获取影片列表
  const { state: movies, isLoading: moviesLoading, execute: reqMoviesApi } = moviesApi();
  const getMovies = async (id?: string, subPath?: string) => {
    id = id || room.movieList[room.movieList.length - 1].id;
    subPath = subPath || room.movieList[room.movieList.length - 1].subPath;
    try {
      await reqMoviesApi({
        params: {
          page: currentPage.value,
          max: pageSize.value,
          subPath,
          id
        },
        headers: { Authorization: roomToken }
      });

      if (movies.value) {
        room.movies = movies.value.movies;
        room.totalMovies = movies.value.total;
      }
      dynamic.value = movies.value?.dynamic || false;
    } catch (err: any) {
      console.log(err);
      ElNotification({
        title: "获取影片列表失败",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 获取正在播放的影片
  const { state: currentMovie, execute: reqCurrentMovieApi } = currentMovieApi();
  const getCurrentMovie = async () => {
    try {
      await reqCurrentMovieApi({
        headers: { Authorization: roomToken }
      });

      if (!currentMovie.value) return;

      room.currentMovie = currentMovie.value.movie;
      room.currentStatus = currentMovie.value.status;
      room.currentExpireId = currentMovie.value.expireId;

      if (currentMovie.value.movie.base.url.startsWith("/")) {
        currentMovie.value.movie.base.url = `${window.location.origin}${currentMovie.value.movie.base.url}`;
      }

      for (let key in currentMovie.value.movie.base.moreSource) {
        if (currentMovie.value.movie.base.moreSource[key].startsWith("/")) {
          currentMovie.value.movie.base.moreSource[key] =
            `${window.location.origin}${currentMovie.value.movie.base.moreSource[key]}`;
        }
      }

      for (let key in currentMovie.value.movie.base.subtitles) {
        if (currentMovie.value.movie.base.subtitles[key].url.startsWith("/")) {
          currentMovie.value.movie.base.subtitles[key].url =
            `${window.location.origin}${currentMovie.value.movie.base.subtitles[key].url}`;
        }
      }
      room.currentMovie.base.subtitles = currentMovie.value.movie.base.subtitles;
    } catch (err: any) {
      console.log(err);
      ElNotification({
        title: "获取影片列表失败",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 交换两个影片的位置
  const selectMovies = ref<string[]>([]);
  const { execute: reqSwapMovieApi } = swapMovieApi();
  const swapMovie = async () => {
    try {
      await reqSwapMovieApi({
        data: {
          id1: selectMovies.value[0],
          id2: selectMovies.value[1]
        },
        headers: { Authorization: roomToken }
      });

      ElNotification({
        title: "交换成功",
        type: "success"
      });
      selectMovies.value = [];
      getMovies();
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "交换失败",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 设置当前正在播放的影片
  const { execute: reqChangeCurrentMovieApi, isLoading: changeCurrentMovieLoading } =
    changeCurrentMovieApi();
  const changeCurrentMovie = async (id: string, showMsg = true, subPath = "") => {
    try {
      await reqChangeCurrentMovieApi({
        data: {
          id: id,
          subPath: subPath
        },
        headers: { Authorization: roomToken }
      });

      showMsg &&
        ElNotification({
          title: "设置成功",
          type: "success"
        });
    } catch (err: any) {
      console.error(err);
      showMsg &&
        ElNotification({
          title: "设置失败",
          message: err.response.data.error || err.message,
          type: "error"
        });
    }
  };

  // 当前影片信息
  const cMovieInfo = ref<EditMovieInfo>({
    id: "",
    url: "",
    name: "",
    live: false,
    proxy: false,
    rtmpSource: false,
    type: "",
    headers: {},
    subtitles: void 0,
    vendorInfo: void 0
  });

  // 编辑 Headers
  const updateHeaders = (header: { [key: string]: string }) => {
    cMovieInfo.value.headers = header;
  };

  // 编辑字幕
  const updateSubtitles = (
    subtitles: Record<
      string,
      {
        url: string;
        type: string;
      }
    >
  ) => {
    cMovieInfo.value.subtitles = subtitles;
  };

  // 编辑影片信息
  const { isLoading: editMovieInfoLoading, execute: reqEditMovieInfoApi } = editMovieInfoApi();
  const editMovieInfo = async () => {
    try {
      for (const key in cMovieInfo.value) {
        if (key === "headers" || key === "subtitles" || key === "vendorInfo") continue;
        strLengthLimit(key, 32);
      }
      await reqEditMovieInfoApi({
        data: cMovieInfo.value,
        headers: { Authorization: roomToken }
      });
      ElNotification({
        title: "更新成功",
        type: "success"
      });
    } catch (err: any) {
      console.error(err.message);
      ElNotification({
        title: "更新失败",
        type: "error",
        message: err.response.data.error || err.message
      });
    }
  };

  // 删除影片
  const { execute: reqDelMovieApi, isLoading: deleteMovieLoading } = delMovieApi();
  const deleteMovie = async (ids: Array<string>) => {
    try {
      await reqDelMovieApi({
        data: {
          ids: ids
        },
        headers: { Authorization: roomToken }
      });
      for (const id of ids) {
        room.movies.splice(
          room.movies.findIndex((movie: MovieInfo) => movie["id"] === id),
          1
        );
      }

      ElNotification({
        title: "删除成功",
        type: "success"
      });
      selectMovies.value = [];
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "删除失败",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 清空影片列表
  const { execute: reqClearMovieListApi, isLoading: clearMovieListLoading } = clearMovieListApi();
  const clearMovieList = async () => {
    try {
      await reqClearMovieListApi({
        headers: { Authorization: roomToken },
        data: {
          parentId: room.movieList[room.movieList.length - 1].id
        }
      });
      await changeCurrentMovie("", false);
      ElNotification({
        title: "已清空",
        type: "success"
      });
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "错误",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  // 获取推流信息
  const { state: liveInfo, execute: reqLiveInfoApi } = liveInfoApi();
  const getLiveInfo = async (id: string) => {
    try {
      await reqLiveInfoApi({
        data: {
          id: id
        },
        headers: { Authorization: roomToken }
      });
    } catch (err: any) {
      console.error(err);
      ElNotification({
        title: "获取失败",
        message: err.response.data.error || err.message,
        type: "error"
      });
    }
  };

  return {
    currentPage,
    pageSize,
    subPath,
    // movieList,

    getMovies,
    movies,
    moviesLoading,

    getCurrentMovie,
    currentMovie,

    selectMovies,
    swapMovie,

    changeCurrentMovie,
    changeCurrentMovieLoading,

    cMovieInfo,
    updateHeaders,
    updateSubtitles,
    editMovieInfo,
    editMovieInfoLoading,

    deleteMovie,
    deleteMovieLoading,

    clearMovieList,
    clearMovieListLoading,

    getLiveInfo,
    liveInfo,

    switchDir,
    dynamic
  };
};
