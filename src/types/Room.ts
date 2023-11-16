export interface RoomList {
  roomId: string;
  roomName: string;
  peopleNum: number;
  needPassword: boolean;
  creator: string;
  createdAt: number;
  creatorId: string;
  status: number;
}

export enum RoomStatus {
  Unknown = 0,
  Banned = 1,
  Pending = 2,
  Active = 3
}

export const roomStatus = {
  [RoomStatus.Unknown]: "Unknown",
  [RoomStatus.Banned]: "Banned",
  [RoomStatus.Pending]: "Pending",
  [RoomStatus.Active]: "Active"
};
