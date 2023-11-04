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

export interface BaseMovieInfo {
  url: string;
  name: string;
  live: boolean;
  proxy: boolean;
  rtmpSource: boolean;
  type: string;
  headers: { [key: string]: string };
  vendorInfo: VendorInfo | undefined;
}

export interface BaseMovieInfo_HeadersEntry {
  key: string;
  value: string;
}

export interface MovieInfo {
  id: string;
  base: BaseMovieInfo | undefined;
  createdAt: number;
  creator: string;
}

export interface Status {
  seek: number;
  rate: number;
  playing: boolean;
}

export interface Current {
  movie: MovieInfo | undefined;
  status: Status | undefined;
}

export interface VendorInfo {
  vendor: string;
  shared: boolean;
  bilibili?: BilibiliVendorInfo | undefined;
}

export interface BilibiliVendorInfo {
  bvid: string;
  cid: number;
  epid: number;
  quality: number;
}

export interface ElementMessage {
  type: ElementMessageType;
  sender: string;
  message: string;
  rate: number;
  seek: number;
  current?: Current | undefined;
  peopleNum: number;
  time: number;
}

function createBaseBaseMovieInfo(): BaseMovieInfo {
  return {
    url: "",
    name: "",
    live: false,
    proxy: false,
    rtmpSource: false,
    type: "",
    headers: {},
    vendorInfo: undefined,
  };
}

export const BaseMovieInfo = {
  encode(message: BaseMovieInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.live === true) {
      writer.uint32(24).bool(message.live);
    }
    if (message.proxy === true) {
      writer.uint32(32).bool(message.proxy);
    }
    if (message.rtmpSource === true) {
      writer.uint32(40).bool(message.rtmpSource);
    }
    if (message.type !== "") {
      writer.uint32(50).string(message.type);
    }
    Object.entries(message.headers).forEach(([key, value]) => {
      BaseMovieInfo_HeadersEntry.encode({ key: key as any, value }, writer.uint32(58).fork()).ldelim();
    });
    if (message.vendorInfo !== undefined) {
      VendorInfo.encode(message.vendorInfo, writer.uint32(66).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BaseMovieInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBaseMovieInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.url = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.live = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.proxy = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.rtmpSource = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.type = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          const entry7 = BaseMovieInfo_HeadersEntry.decode(reader, reader.uint32());
          if (entry7.value !== undefined) {
            message.headers[entry7.key] = entry7.value;
          }
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.vendorInfo = VendorInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BaseMovieInfo {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      live: isSet(object.live) ? globalThis.Boolean(object.live) : false,
      proxy: isSet(object.proxy) ? globalThis.Boolean(object.proxy) : false,
      rtmpSource: isSet(object.rtmpSource) ? globalThis.Boolean(object.rtmpSource) : false,
      type: isSet(object.type) ? globalThis.String(object.type) : "",
      headers: isObject(object.headers)
        ? Object.entries(object.headers).reduce<{ [key: string]: string }>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
        : {},
      vendorInfo: isSet(object.vendorInfo) ? VendorInfo.fromJSON(object.vendorInfo) : undefined,
    };
  },

  toJSON(message: BaseMovieInfo): unknown {
    const obj: any = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.live === true) {
      obj.live = message.live;
    }
    if (message.proxy === true) {
      obj.proxy = message.proxy;
    }
    if (message.rtmpSource === true) {
      obj.rtmpSource = message.rtmpSource;
    }
    if (message.type !== "") {
      obj.type = message.type;
    }
    if (message.headers) {
      const entries = Object.entries(message.headers);
      if (entries.length > 0) {
        obj.headers = {};
        entries.forEach(([k, v]) => {
          obj.headers[k] = v;
        });
      }
    }
    if (message.vendorInfo !== undefined) {
      obj.vendorInfo = VendorInfo.toJSON(message.vendorInfo);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BaseMovieInfo>, I>>(base?: I): BaseMovieInfo {
    return BaseMovieInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BaseMovieInfo>, I>>(object: I): BaseMovieInfo {
    const message = createBaseBaseMovieInfo();
    message.url = object.url ?? "";
    message.name = object.name ?? "";
    message.live = object.live ?? false;
    message.proxy = object.proxy ?? false;
    message.rtmpSource = object.rtmpSource ?? false;
    message.type = object.type ?? "";
    message.headers = Object.entries(object.headers ?? {}).reduce<{ [key: string]: string }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = globalThis.String(value);
      }
      return acc;
    }, {});
    message.vendorInfo = (object.vendorInfo !== undefined && object.vendorInfo !== null)
      ? VendorInfo.fromPartial(object.vendorInfo)
      : undefined;
    return message;
  },
};

function createBaseBaseMovieInfo_HeadersEntry(): BaseMovieInfo_HeadersEntry {
  return { key: "", value: "" };
}

export const BaseMovieInfo_HeadersEntry = {
  encode(message: BaseMovieInfo_HeadersEntry, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BaseMovieInfo_HeadersEntry {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBaseMovieInfo_HeadersEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.value = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BaseMovieInfo_HeadersEntry {
    return {
      key: isSet(object.key) ? globalThis.String(object.key) : "",
      value: isSet(object.value) ? globalThis.String(object.value) : "",
    };
  },

  toJSON(message: BaseMovieInfo_HeadersEntry): unknown {
    const obj: any = {};
    if (message.key !== "") {
      obj.key = message.key;
    }
    if (message.value !== "") {
      obj.value = message.value;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BaseMovieInfo_HeadersEntry>, I>>(base?: I): BaseMovieInfo_HeadersEntry {
    return BaseMovieInfo_HeadersEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BaseMovieInfo_HeadersEntry>, I>>(object: I): BaseMovieInfo_HeadersEntry {
    const message = createBaseBaseMovieInfo_HeadersEntry();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseMovieInfo(): MovieInfo {
  return { id: "", base: undefined, createdAt: 0, creator: "" };
}

export const MovieInfo = {
  encode(message: MovieInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.base !== undefined) {
      BaseMovieInfo.encode(message.base, writer.uint32(18).fork()).ldelim();
    }
    if (message.createdAt !== 0) {
      writer.uint32(24).int64(message.createdAt);
    }
    if (message.creator !== "") {
      writer.uint32(34).string(message.creator);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MovieInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMovieInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.base = BaseMovieInfo.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.createdAt = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.creator = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): MovieInfo {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      base: isSet(object.base) ? BaseMovieInfo.fromJSON(object.base) : undefined,
      createdAt: isSet(object.createdAt) ? globalThis.Number(object.createdAt) : 0,
      creator: isSet(object.creator) ? globalThis.String(object.creator) : "",
    };
  },

  toJSON(message: MovieInfo): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.base !== undefined) {
      obj.base = BaseMovieInfo.toJSON(message.base);
    }
    if (message.createdAt !== 0) {
      obj.createdAt = Math.round(message.createdAt);
    }
    if (message.creator !== "") {
      obj.creator = message.creator;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<MovieInfo>, I>>(base?: I): MovieInfo {
    return MovieInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<MovieInfo>, I>>(object: I): MovieInfo {
    const message = createBaseMovieInfo();
    message.id = object.id ?? "";
    message.base = (object.base !== undefined && object.base !== null)
      ? BaseMovieInfo.fromPartial(object.base)
      : undefined;
    message.createdAt = object.createdAt ?? 0;
    message.creator = object.creator ?? "";
    return message;
  },
};

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

function createBaseCurrent(): Current {
  return { movie: undefined, status: undefined };
}

export const Current = {
  encode(message: Current, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.movie !== undefined) {
      MovieInfo.encode(message.movie, writer.uint32(10).fork()).ldelim();
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Current {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCurrent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.movie = MovieInfo.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.status = Status.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Current {
    return {
      movie: isSet(object.movie) ? MovieInfo.fromJSON(object.movie) : undefined,
      status: isSet(object.status) ? Status.fromJSON(object.status) : undefined,
    };
  },

  toJSON(message: Current): unknown {
    const obj: any = {};
    if (message.movie !== undefined) {
      obj.movie = MovieInfo.toJSON(message.movie);
    }
    if (message.status !== undefined) {
      obj.status = Status.toJSON(message.status);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Current>, I>>(base?: I): Current {
    return Current.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Current>, I>>(object: I): Current {
    const message = createBaseCurrent();
    message.movie = (object.movie !== undefined && object.movie !== null)
      ? MovieInfo.fromPartial(object.movie)
      : undefined;
    message.status = (object.status !== undefined && object.status !== null)
      ? Status.fromPartial(object.status)
      : undefined;
    return message;
  },
};

function createBaseVendorInfo(): VendorInfo {
  return { vendor: "", shared: false, bilibili: undefined };
}

export const VendorInfo = {
  encode(message: VendorInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.vendor !== "") {
      writer.uint32(10).string(message.vendor);
    }
    if (message.shared === true) {
      writer.uint32(16).bool(message.shared);
    }
    if (message.bilibili !== undefined) {
      BilibiliVendorInfo.encode(message.bilibili, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VendorInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVendorInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.vendor = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.shared = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.bilibili = BilibiliVendorInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): VendorInfo {
    return {
      vendor: isSet(object.vendor) ? globalThis.String(object.vendor) : "",
      shared: isSet(object.shared) ? globalThis.Boolean(object.shared) : false,
      bilibili: isSet(object.bilibili) ? BilibiliVendorInfo.fromJSON(object.bilibili) : undefined,
    };
  },

  toJSON(message: VendorInfo): unknown {
    const obj: any = {};
    if (message.vendor !== "") {
      obj.vendor = message.vendor;
    }
    if (message.shared === true) {
      obj.shared = message.shared;
    }
    if (message.bilibili !== undefined) {
      obj.bilibili = BilibiliVendorInfo.toJSON(message.bilibili);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<VendorInfo>, I>>(base?: I): VendorInfo {
    return VendorInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<VendorInfo>, I>>(object: I): VendorInfo {
    const message = createBaseVendorInfo();
    message.vendor = object.vendor ?? "";
    message.shared = object.shared ?? false;
    message.bilibili = (object.bilibili !== undefined && object.bilibili !== null)
      ? BilibiliVendorInfo.fromPartial(object.bilibili)
      : undefined;
    return message;
  },
};

function createBaseBilibiliVendorInfo(): BilibiliVendorInfo {
  return { bvid: "", cid: 0, epid: 0, quality: 0 };
}

export const BilibiliVendorInfo = {
  encode(message: BilibiliVendorInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bvid !== "") {
      writer.uint32(10).string(message.bvid);
    }
    if (message.cid !== 0) {
      writer.uint32(16).uint64(message.cid);
    }
    if (message.epid !== 0) {
      writer.uint32(24).uint64(message.epid);
    }
    if (message.quality !== 0) {
      writer.uint32(32).uint32(message.quality);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BilibiliVendorInfo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBilibiliVendorInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.bvid = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.cid = longToNumber(reader.uint64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.epid = longToNumber(reader.uint64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.quality = reader.uint32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BilibiliVendorInfo {
    return {
      bvid: isSet(object.bvid) ? globalThis.String(object.bvid) : "",
      cid: isSet(object.cid) ? globalThis.Number(object.cid) : 0,
      epid: isSet(object.epid) ? globalThis.Number(object.epid) : 0,
      quality: isSet(object.quality) ? globalThis.Number(object.quality) : 0,
    };
  },

  toJSON(message: BilibiliVendorInfo): unknown {
    const obj: any = {};
    if (message.bvid !== "") {
      obj.bvid = message.bvid;
    }
    if (message.cid !== 0) {
      obj.cid = Math.round(message.cid);
    }
    if (message.epid !== 0) {
      obj.epid = Math.round(message.epid);
    }
    if (message.quality !== 0) {
      obj.quality = Math.round(message.quality);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BilibiliVendorInfo>, I>>(base?: I): BilibiliVendorInfo {
    return BilibiliVendorInfo.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BilibiliVendorInfo>, I>>(object: I): BilibiliVendorInfo {
    const message = createBaseBilibiliVendorInfo();
    message.bvid = object.bvid ?? "";
    message.cid = object.cid ?? 0;
    message.epid = object.epid ?? 0;
    message.quality = object.quality ?? 0;
    return message;
  },
};

function createBaseElementMessage(): ElementMessage {
  return { type: 0, sender: "", message: "", rate: 0, seek: 0, current: undefined, peopleNum: 0, time: 0 };
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
    if (message.current !== undefined) {
      Current.encode(message.current, writer.uint32(50).fork()).ldelim();
    }
    if (message.peopleNum !== 0) {
      writer.uint32(56).int64(message.peopleNum);
    }
    if (message.time !== 0) {
      writer.uint32(64).int64(message.time);
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
          if (tag !== 50) {
            break;
          }

          message.current = Current.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.peopleNum = longToNumber(reader.int64() as Long);
          continue;
        case 8:
          if (tag !== 64) {
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
      current: isSet(object.current) ? Current.fromJSON(object.current) : undefined,
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
    if (message.current !== undefined) {
      obj.current = Current.toJSON(message.current);
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
    message.current = (object.current !== undefined && object.current !== null)
      ? Current.fromPartial(object.current)
      : undefined;
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

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
