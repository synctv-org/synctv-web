export interface EditMovieInfo {
  id: string;
  url: string;
  name: string;
  type: string;
  headers: { [key: string]: string };
}

export interface BilibiliVideoInfos {
  bvid?: string;
  cid?: number;
  epid?: number;
  name: string;
  coverImage: string;
}
