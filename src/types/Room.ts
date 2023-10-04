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
  MESSAGE = 2,
  PLAY = 3,
  PAUSE = 4,
  SEEK = 9,
  CURRENT_MOVIE = 10,
  PLAY_LIST_UPDATE = 11,
  PEOPLE_NUM = 12
}
