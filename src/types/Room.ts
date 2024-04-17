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
  Banned = 1,
  Pending = 2,
  Active = 3
}

export const roomStatus = {
  [RoomStatus.Banned]: "Banned",
  [RoomStatus.Pending]: "Pending",
  [RoomStatus.Active]: "Active"
};

export enum ROLE {
  Unknown = 0,
  Member = 1,
  Admin = 2,
  Creator = 3
}

export const role: Record<ROLE, string> = {
  [ROLE.Unknown]: "Unknown",
  [ROLE.Member]: "Member",
  [ROLE.Admin]: "Admin",
  [ROLE.Creator]: "Creator"
};

export enum MEMBER_STATUS {
  Unknown = 0,
  Banned = 1,
  Pending = 2,
  Active = 3
}

export const memberStatus: Record<MEMBER_STATUS, string> = {
  [MEMBER_STATUS.Unknown]: "Unknown",
  [MEMBER_STATUS.Banned]: "Banned",
  [MEMBER_STATUS.Pending]: "Pending",
  [MEMBER_STATUS.Active]: "Active"
};
