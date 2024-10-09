import { useDefineApi } from "@/stores/useDefineApi";
import type { EditMovieInfo } from "@/types/Movie";
import type { Status } from "@/proto/message";
import type { BaseMovieInfo, MovieInfo, CurrentMovie } from "@/types/Movie";
// 获取影片列表，包括正在播放
export const movieListApi = useDefineApi<
  {
    params: {
      page: number;
      max: number;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
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
  url: "/api/room/movie/list",
  method: "GET"
});

export interface MoviePath {
  name: string;
  id: string;
  subPath: string;
}

// 获取影片列表（无正在播放）
export const moviesApi = useDefineApi<
  {
    params: {
      page: number;
      max: number;
      subPath?: string;
      id?: string;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {
    movies: MovieInfo[] | [];
    paths: MoviePath[];
    total: number;
    dynamic: boolean;
  }
>({
  url: "/api/room/movie/movies",
  method: "GET"
});

// 获取正在播放的影片
export const currentMovieApi = useDefineApi<
  {
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  CurrentMovie
>({
  url: "/api/room/movie/current",
  method: "GET"
});

// 添加影片
export const pushMovieApi = useDefineApi<
  // request
  {
    data: BaseMovieInfo;
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  // response
  {
    id: number;
  }
>({
  url: "/api/room/movie/push",
  method: "POST"
});

// 批量添加影片
export const pushMoviesApi = useDefineApi<
  {
    data: BaseMovieInfo[];
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  any
>({
  url: "/api/room/movie/pushs",
  method: "POST"
});

// 编辑影片信息
export const editMovieInfoApi = useDefineApi<
  {
    data: EditMovieInfo;
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {}
>({
  url: "/api/room/movie/edit",
  method: "POST"
});

// 删除影片
export const delMovieApi = useDefineApi<
  {
    data: {
      ids: Array<string>;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {}
>({
  url: "/api/room/movie/delete",
  method: "POST"
});

// 交换影片位置
export const swapMovieApi = useDefineApi<
  {
    data: {
      id1: string;
      id2: string;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {}
>({
  url: "/api/room/movie/swap",
  method: "POST"
});

// 更改正在播放的影片
export const changeCurrentMovieApi = useDefineApi<
  {
    data: {
      id: string;
      subPath?: string;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {}
>({
  url: "/api/room/movie/current",
  method: "POST"
});

// 清空影片列表
export const clearMovieListApi = useDefineApi<
  {
    data?: {
      parentId: string;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {}
>({
  url: "/api/room/movie/clear",
  method: "POST"
});

// 获取直播信息
export const liveInfoApi = useDefineApi<
  {
    data: {
      id: string;
    };
    headers: {
      Authorization: string;
      "X-Room-Id": string;
    };
  },
  {
    app: string;
    host: string;
    token: string;
  }
>({
  url: "/api/room/movie/live/publishKey",
  method: "POST"
});
