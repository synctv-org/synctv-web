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
  epid?: string;
  name: string;
  coverImage: string;
}

export interface PushMovies {
  url: string;
  live: boolean;
  rtmpSource: boolean;
  type: string;

  name: string;
  proxy: boolean;
  vendorInfo: {
    vendor: string;
    shared: boolean;
    bilibili: BilibiliVideoInfos;
  };
}
