// import type { RoomAdminPermission, RoomMemberPermission } from "@/hooks/useRoom";

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

// 房间权限（默认用户）
export enum RoomMemberPermission {
  PermissionGetMovieList = 1 << 0,
  PermissionAddMovie = 1 << 1,
  PermissionDeleteMovie = 1 << 2,
  PermissionEditMovie = 1 << 3,
  PermissionSetCurrentMovie = 1 << 4,
  PermissionSetCurrentStatus = 1 << 5,
  PermissionSendChatMessage = 1 << 6,

  // AllPermissions = (2 ^ 32) - 1,
  NoPermission = 0
  // DefaultPermissions = RoomMemberPermission.PermissionGetMovieList |
  //   RoomMemberPermission.PermissionSendChatMessage
}

// 房间权限（管理员）
export enum RoomAdminPermission {
  PermissionApprovePendingMember = 1 << 0,
  PermissionBanRoomMember = 1 << 1,
  PermissionSetUserPermission = 1 << 2,
  PermissionSetRoomSettings = 1 << 3,
  PermissionSetRoomPassword = 1 << 4,
  PermissionDeleteRoom = 1 << 5,

  // AllAdminPermissions = (2 ^ 32) - 1,
  NoAdminPermission = 0
  // DefaultAdminPermissions = RoomAdminPermission.PermissionApprovePendingMember |
  //   RoomAdminPermission.PermissionBanRoomMember |
  //   RoomAdminPermission.PermissionSetUserPermission |
  //   RoomAdminPermission.PermissionSetRoomSettings |
  //   RoomAdminPermission.PermissionSetRoomPassword
}

export interface MyInfo {
  userId: string;
  roomId: string;
  joinAt: number;
  role: ROLE;
  permissions: RoomMemberPermission;
  adminPermissions: RoomAdminPermission;
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
