import type { BaseMovieInfo } from "@/proto/message";

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
