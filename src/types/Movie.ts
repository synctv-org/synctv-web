import type { MovieStatus } from "@/proto/message";

export interface MovieInfo {
  id: string;
  base: BaseMovieInfo;
  createdAt: number;
  creator: string;
}

export interface CurrentMovie {
  movie: MovieInfo;
  status: MovieStatus;
  expireId: number;
}

export interface Subtitles {
  [key: string]: {
    url: string;
    type: string;
  };
}

export interface BaseMovieInfo {
  url: string;
  name: string;
  live: boolean;
  proxy: boolean;
  rtmpSource: boolean;
  type: string;
  headers: {
    [key: string]: string;
  };
  vendorInfo?: VendorInfo;
  subtitles?: Subtitles;
}

export interface VendorInfo {
  vendor: string;
  bilibili?: BilibiliVendorInfo;
  backend?: string;
}

export interface BilibiliVendorInfo {
  bvid?: string;
  cid?: number;
  epid?: number;
  quality?: number;
  shared: boolean;
}

export interface EditMovieInfo extends BaseMovieInfo {
  id: string;
}

export interface BilibiliVideoInfos {
  bvid?: string;
  cid?: number;
  epid?: number;
  name: string;
  coverImage: string;
}
