import type { MovieInfo, MovieStatus } from "./Movie";

export interface RoomList {
  roomId: string;
  peopleNum: number;
  needPassword: boolean;
  creator: string;
  createdAt: number;
}

export interface RoomInfo {}
