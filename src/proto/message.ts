/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "proto";

export enum ElementMessageType {
  UNKNOWN = 0,
  ERROR = 1,
  CHAT_MESSAGE = 2,
  PLAY = 3,
  PAUSE = 4,
  CHECK_SEEK = 5,
  TOO_FAST = 6,
  TOO_SLOW = 7,
  CHANGE_RATE = 8,
  CHANGE_SEEK = 9,
  CHANGE_CURRENT = 10,
  CHANGE_MOVIES = 11,
  CHANGE_PEOPLE = 12,
  UNRECOGNIZED = -1,
}

export function elementMessageTypeFromJSON(object: any): ElementMessageType {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return ElementMessageType.UNKNOWN;
    case 1:
    case "ERROR":
      return ElementMessageType.ERROR;
    case 2:
    case "CHAT_MESSAGE":
      return ElementMessageType.CHAT_MESSAGE;
    case 3:
    case "PLAY":
      return ElementMessageType.PLAY;
    case 4:
    case "PAUSE":
      return ElementMessageType.PAUSE;
    case 5:
    case "CHECK_SEEK":
      return ElementMessageType.CHECK_SEEK;
    case 6:
    case "TOO_FAST":
      return ElementMessageType.TOO_FAST;
    case 7:
    case "TOO_SLOW":
      return ElementMessageType.TOO_SLOW;
    case 8:
    case "CHANGE_RATE":
      return ElementMessageType.CHANGE_RATE;
    case 9:
    case "CHANGE_SEEK":
      return ElementMessageType.CHANGE_SEEK;
    case 10:
    case "CHANGE_CURRENT":
      return ElementMessageType.CHANGE_CURRENT;
    case 11:
    case "CHANGE_MOVIES":
      return ElementMessageType.CHANGE_MOVIES;
    case 12:
    case "CHANGE_PEOPLE":
      return ElementMessageType.CHANGE_PEOPLE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ElementMessageType.UNRECOGNIZED;
  }
}

export function elementMessageTypeToJSON(object: ElementMessageType): string {
  switch (object) {
    case ElementMessageType.UNKNOWN:
      return "UNKNOWN";
    case ElementMessageType.ERROR:
      return "ERROR";
    case ElementMessageType.CHAT_MESSAGE:
      return "CHAT_MESSAGE";
    case ElementMessageType.PLAY:
      return "PLAY";
    case ElementMessageType.PAUSE:
      return "PAUSE";
    case ElementMessageType.CHECK_SEEK:
      return "CHECK_SEEK";
    case ElementMessageType.TOO_FAST:
      return "TOO_FAST";
    case ElementMessageType.TOO_SLOW:
      return "TOO_SLOW";
    case ElementMessageType.CHANGE_RATE:
      return "CHANGE_RATE";
    case ElementMessageType.CHANGE_SEEK:
      return "CHANGE_SEEK";
    case ElementMessageType.CHANGE_CURRENT:
      return "CHANGE_CURRENT";
    case ElementMessageType.CHANGE_MOVIES:
      return "CHANGE_MOVIES";
    case ElementMessageType.CHANGE_PEOPLE:
      return "CHANGE_PEOPLE";
    case ElementMessageType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Status {
  seek: number;
  rate: number;
  playing: boolean;
}

export interface ElementMessage {
  type: ElementMessageType;
  sender: string;
  message: string;
  rate: number;
  seek: number;
  peopleNum: number;
  time: number;
}

function createBaseStatus(): Status {
  return { seek: 0, rate: 0, playing: false };
}

export const Status = {
  encode(message: Status, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.seek !== 0) {
      writer.uint32(9).double(message.seek);
    }
    if (message.rate !== 0) {
      writer.uint32(17).double(message.rate);
    }
    if (message.playing === true) {
      writer.uint32(24).bool(message.playing);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Status {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 9) {
            break;
          }

          message.seek = reader.double();
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.rate = reader.double();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.playing = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Status {
    return {
      seek: isSet(object.seek) ? globalThis.Number(object.seek) : 0,
      rate: isSet(object.rate) ? globalThis.Number(object.rate) : 0,
      playing: isSet(object.playing) ? globalThis.Boolean(object.playing) : false,
    };
  },

  toJSON(message: Status): unknown {
    const obj: any = {};
    if (message.seek !== 0) {
      obj.seek = message.seek;
    }
    if (message.rate !== 0) {
      obj.rate = message.rate;
    }
    if (message.playing === true) {
      obj.playing = message.playing;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Status>, I>>(base?: I): Status {
    return Status.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Status>, I>>(object: I): Status {
    const message = createBaseStatus();
    message.seek = object.seek ?? 0;
    message.rate = object.rate ?? 0;
    message.playing = object.playing ?? false;
    return message;
  },
};

function createBaseElementMessage(): ElementMessage {
  return { type: 0, sender: "", message: "", rate: 0, seek: 0, peopleNum: 0, time: 0 };
}

export const ElementMessage = {
  encode(message: ElementMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.message !== "") {
      writer.uint32(26).string(message.message);
    }
    if (message.rate !== 0) {
      writer.uint32(33).double(message.rate);
    }
    if (message.seek !== 0) {
      writer.uint32(41).double(message.seek);
    }
    if (message.peopleNum !== 0) {
      writer.uint32(48).int64(message.peopleNum);
    }
    if (message.time !== 0) {
      writer.uint32(56).int64(message.time);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ElementMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseElementMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.type = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.sender = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.message = reader.string();
          continue;
        case 4:
          if (tag !== 33) {
            break;
          }

          message.rate = reader.double();
          continue;
        case 5:
          if (tag !== 41) {
            break;
          }

          message.seek = reader.double();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.peopleNum = longToNumber(reader.int64() as Long);
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.time = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ElementMessage {
    return {
      type: isSet(object.type) ? elementMessageTypeFromJSON(object.type) : 0,
      sender: isSet(object.sender) ? globalThis.String(object.sender) : "",
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      rate: isSet(object.rate) ? globalThis.Number(object.rate) : 0,
      seek: isSet(object.seek) ? globalThis.Number(object.seek) : 0,
      peopleNum: isSet(object.peopleNum) ? globalThis.Number(object.peopleNum) : 0,
      time: isSet(object.time) ? globalThis.Number(object.time) : 0,
    };
  },

  toJSON(message: ElementMessage): unknown {
    const obj: any = {};
    if (message.type !== 0) {
      obj.type = elementMessageTypeToJSON(message.type);
    }
    if (message.sender !== "") {
      obj.sender = message.sender;
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.rate !== 0) {
      obj.rate = message.rate;
    }
    if (message.seek !== 0) {
      obj.seek = message.seek;
    }
    if (message.peopleNum !== 0) {
      obj.peopleNum = Math.round(message.peopleNum);
    }
    if (message.time !== 0) {
      obj.time = Math.round(message.time);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ElementMessage>, I>>(base?: I): ElementMessage {
    return ElementMessage.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ElementMessage>, I>>(object: I): ElementMessage {
    const message = createBaseElementMessage();
    message.type = object.type ?? 0;
    message.sender = object.sender ?? "";
    message.message = object.message ?? "";
    message.rate = object.rate ?? 0;
    message.seek = object.seek ?? 0;
    message.peopleNum = object.peopleNum ?? 0;
    message.time = object.time ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
