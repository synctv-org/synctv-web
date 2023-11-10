export interface BaseUserInfo {
  id: string;
  username: string;
  role: ROLE;
  createdAt: number;
}

export enum ROLE {
  Visitor = -1,
  Unknown = 0,
  Banned = 1,
  Pending = 2,
  User = 3,
  Admin = 4,
  Root = 5
}

export const role = {
  [ROLE.Visitor]: "Visitor",
  [ROLE.Unknown]: "Unknown",
  [ROLE.Banned]: "Banned",
  [ROLE.Pending]: "Pending",
  [ROLE.User]: "User",
  [ROLE.Admin]: "Admin",
  [ROLE.Root]: "Root"
};
