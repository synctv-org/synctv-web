import type { Status } from "@/proto/message";

export interface MovieInfo {
  id: string;
  base: BaseMovieInfo;
  createdAt: number;
  creator: string;
  subPath: string;
}

export interface CurrentMovie {
  movie: MovieInfo;
  status: Status;
  expireId: number;
}

export interface Subtitles {
  [key: string]: {
    url: string;
    type: string;
  };
}

export interface MoreSource {
  name: string;
  url: string;
  type: string;
}

export interface BaseMovieInfo {
  url: string;
  moreSources?: MoreSource[];
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
  isFolder?: boolean;
  parentId?: string;
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
