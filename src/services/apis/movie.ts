import { useDefineApi } from "@/stores/useDefineApi";
import type { EditMovieInfo } from "@/types/Movie";
import type { MovieStatus } from "@/proto/message";
import type { BaseMovieInfo, MovieInfo, CurrentMovie } from "@/types/Movie";
// 获取影片列表，包括正在播放
export const movieListApi = useDefineApi<
  {
    params: {
      page: number;
      max: number;
    };
    headers: { Authorization: string };
  },
  {
    current: {
      movie: MovieInfo;
      status: MovieStatus;
    };
    movies: MovieInfo[] | [];
    total: number;
  }
>({
  url: "/api/movie/list",
  method: "GET"
});

// 获取影片列表（无正在播放）
export const moviesApi = useDefineApi<
  {
    params: {
      page: number;
      max: number;
    };
    headers: { Authorization: string };
  },
  {
    movies: MovieInfo[] | [];
    total: number;
  }
>({
  url: "/api/movie/movies",
  method: "GET"
});

// 获取正在播放的影片
export const currentMovieApi = useDefineApi<
  {
    headers: { Authorization: string };
  },
  CurrentMovie
>({
  url: "/api/movie/current",
  method: "GET"
});

// 添加影片
export const pushMovieApi = useDefineApi<
  // request
  {
    data: BaseMovieInfo;
    headers: { Authorization: string };
  },
  // response
  {
    id: number;
  }
>({
  url: "/api/movie/push",
  method: "POST"
});

// 批量添加影片
export const pushMoviesApi = useDefineApi<
  {
    data: BaseMovieInfo[];
    headers: { Authorization: string };
  },
  any
>({
  url: "/api/movie/pushs",
  method: "POST"
});

// 编辑影片信息
export const editMovieInfoApi = useDefineApi<
  {
    data: EditMovieInfo;
    headers: { Authorization: string };
  },
  {}
>({
  url: "/api/movie/edit",
  method: "POST"
});

// 删除影片
export const delMovieApi = useDefineApi<
  {
    data: {
      ids: Array<string>;
    };
    headers: { Authorization: string };
  },
  {}
>({
  url: "/api/movie/delete",
  method: "POST"
});

// 交换影片位置
export const swapMovieApi = useDefineApi<
  {
    data: {
      id1: string;
      id2: string;
    };
    headers: { Authorization: string };
  },
  {}
>({
  url: "/api/movie/swap",
  method: "POST"
});

// 更改正在播放的影片
export const changeCurrentMovieApi = useDefineApi<
  {
    headers: { Authorization: string };
    data: {
      id: string;
    };
  },
  {}
>({
  url: "/api/movie/current",
  method: "POST"
});

// 清空影片列表
export const clearMovieListApi = useDefineApi<
  {
    headers: { Authorization: string };
  },
  {}
>({
  url: "/api/movie/clear",
  method: "POST"
});

// 获取直播信息
export const liveInfoApi = useDefineApi<
  {
    data: {
      id: string;
    };
    headers: { Authorization: string };
  },
  {
    app: string;
    host: string;
    token: string;
  }
>({
  url: "/api/movie/live/publishKey",
  method: "POST"
});
