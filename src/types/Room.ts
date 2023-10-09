import type { MovieInfo, MovieStatus } from "./Movie";

export interface RoomList {
  roomId: string;
  peopleNum: number;
  needPassword: boolean;
  creator: string;
  createAt: number;
}

export interface RoomInfo {}

export interface WsMessage {
  type: number;

  sender: string;
  message: string;

  rate: number;
  seek: number;

  movies: MovieInfo[];

  current: {
    movie: MovieInfo;
    status: MovieStatus;
  };

  peopleNum: number;
}

export enum WsMessageType {
  Error = 1,
  ChatMessage,
  Play,
  Pause,
  CheckSeek,
  TooFast,
  TooSlow,
  ChangeRate,
  ChangeSeek,
  ChangeCurrent,
  ChangeMovieList,
  ChangePeopleNum
}
