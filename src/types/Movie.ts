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
  moreSource?: {
    [key: string]: string;
  };
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

export interface EditMovieInfo extends BaseMovieInfo {
  id: string;
}

export interface VendorInfo {
  vendor: string;
  bilibili?: BilibiliVendorInfo;
  backend?: string;
}

export interface BilibiliBaseInfo {
  bvid?: string;
  cid?: number;
  epid?: number;
  shared: boolean;
}

export interface BilibiliVendorInfo extends BilibiliBaseInfo {
  quality?: number;
}

export interface BilibiliVideoInfos extends BilibiliBaseInfo {
  name: string;
  live: boolean;
  coverImage: string;
  proxy: boolean;
}
