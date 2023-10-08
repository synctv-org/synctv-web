export interface MovieInfo extends BaseMovieInfo {
  createAt: number;
  creator: string;
  id: number;
  lastEditAt: number;
  pullKey?: string;
}

export interface BaseMovieInfo {
  url: string;
  name: string;
  live: boolean;
  proxy: boolean;
  rtmpSource: boolean;
  type: string;
  headers: Record<string, string>;
}

export interface EditMovieInfo {
  id: number;
  url: string;
  name: string;
  type: string;
  headers: Record<string, string>;
}

export interface MovieStatus {
  playing: boolean;
  rate: number;
  seek: number;
}
