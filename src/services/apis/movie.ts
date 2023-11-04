import { useDefineApi } from "@/stores/useDefineApi";
import type { EditMovieInfo } from "@/types/Movie";
import type { BaseMovieInfo, MovieInfo, Status } from "@/proto/message";

// 获取影片列表
export const movieListApi = useDefineApi<
  {
    params: {
      page: number;
      max: number;
      sort?: string;
      order: string;
    };
    headers: { Authorization: string };
  },
  {
    current: {
      movie: MovieInfo;
      status: Status;
    };
    movies: MovieInfo[] | [];
    total: number;
  }
>({
  url: "/api/movie/list",
  method: "GET"
});

// 获取影片列表
export const moviesApi = useDefineApi<
  {
    params: {
      page: number;
      max: number;
      sort?: string;
      order: string;
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

// 获取影片列表
export const currentMovieApi = useDefineApi<
  {
    headers: { Authorization: string };
  },
  {
    current: {
      movie: MovieInfo;
      status: Status;
    };
  }
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

// 当前影片状态
export const movieStatusApi = useDefineApi<
  {
    headers: { Authorization: string };
  },
  {
    current: {
      movie: MovieInfo;
      status: Status;
    };
  }
>({
  url: "/api/movie/current",
  method: "GET"
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
    host: string;
    port: number;
    app: string;
    token: string;
  }
>({
  url: "/api/movie/live/publishKey",
  method: "POST"
});
