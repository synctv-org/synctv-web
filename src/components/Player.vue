<script setup lang="ts">
import Artplayer from "artplayer";
import type { HlsConfig, FragmentLoaderConstructor, FragmentLoaderContext } from "hls.js";
import type { Option } from "artplayer/types/option";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import type { PropType, Ref, WatchStopHandle } from "vue";
import { destroyOldCustomPlayLib } from "@/utils";
import type { P2pConfig as HlsP2pConfig, TrackerZone as TrackerZoneHls } from "@swarmcloud/hls";
import type {
  P2pConfig as DashP2pConfig,
  TrackerZone as TrackerZoneDash
} from "@swarmcloud/dashjs";
import { useLocalStorage } from "@vueuse/core";
import P2PEngineMedia, {
  type P2pConfig as P2pConfigMedia,
  type TrackerZone as TrackerZoneMedia
} from "@swarmcloud/media";

const watchers: WatchStopHandle[] = [];

onBeforeUnmount(() => {
  watchers.forEach((watcher) => watcher());
});

Artplayer.USE_RAF = true;
Artplayer.DBCLICK_FULLSCREEN = false;
Artplayer.SEEK_STEP = 5;
Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5].reverse();
Artplayer.FAST_FORWARD_VALUE = 3; // 设置长按倍速的速率
Artplayer.FAST_FORWARD_TIME = 1000; // 设置长按加速的延迟时间（毫秒）

let art: Artplayer;
let p2pEngine: Ref<p2pOperationType | undefined> = ref(undefined);
const p2pStats = ref<p2pStatsType>();

const resetP2P = () => {
  p2pEngine.value = undefined;
  p2pStats.value = undefined;
};

const p2pOperation = {
  enableP2P: () => {
    defaultP2PEnabled.value = true;
    if (p2pEngine.value) {
      p2pEngine.value.enableP2P();
      p2pStats.value = undefined;
    }
  },
  disableP2P: () => {
    defaultP2PEnabled.value = false;
    if (p2pEngine.value) {
      p2pEngine.value.disableP2P();
      p2pStats.value = undefined;
    }
  }
};

export type { p2pOperation };

export interface options {
  url: string;
  isLive?: boolean;
  type?: string;
  headers?: Record<string, string>;
  plugins?: ((art: Artplayer) => unknown)[];
  p2pZone?: string;
}

const defaultP2PEnabled = useLocalStorage("defaultP2PEnabled", true);

export interface p2pOperationType {
  enableP2P(): void;
  disableP2P(): void;
  destroy(): void;
}

export interface p2pStatsType {
  totalHTTPDownloaded: number;
  totalP2PDownloaded: number;
  totalP2PUploaded: number;
  p2pDownloadSpeed: number;
}

const Props = defineProps({
  options: {
    type: Object as PropType<options>,
    required: true
  }
});

const Emits = defineEmits(["get-instance"]);

const playMedia = async (player: HTMLMediaElement, url: string, art: any) => {
  const p2pConfig: P2pConfigMedia = {
    swFile: "sw.media.js",
    p2pEnabled: defaultP2PEnabled.value,
    trackerZone: Props.options.p2pZone as TrackerZoneMedia
  };
  const engine = new P2PEngineMedia(p2pConfig);
  engine
    .getProxiedUrl(url)
    .then((proxiedUrl) => {
      console.log(proxiedUrl);
      player.src = proxiedUrl;
    })
    .catch((err) => {
      console.error(err);
      player.src = url;
    });
  engine.on("stats", (stats) => {
    console.group("p2p stats");
    console.log(stats);
    console.groupEnd();
    p2pStats.value = {
      totalHTTPDownloaded: stats.totalHTTPDownloaded,
      totalP2PDownloaded: stats.totalP2PDownloaded,
      totalP2PUploaded: stats.totalP2PUploaded,
      p2pDownloadSpeed: stats.p2pDownloadSpeed
    };
  });
  p2pEngine.value = engine;
};

const playMpd = async (player: HTMLMediaElement, url: string, art: any) => {
  const dashjs = await import("dashjs");
  const P2pEngineDash = (await import("@swarmcloud/dashjs")).default;

  if (!dashjs.supportsMediaSource()) {
    art.notice.show = "Unsupported playback format: mpd";
    return;
  }

  destroyOldCustomPlayLib(art);

  const d = dashjs.MediaPlayer().create();
  d.initialize(player, url, false);
  art.dash = d;
  art.mpd = d;

  if (!P2pEngineDash.isSupported()) {
    return;
  }
  var p2pConfig: DashP2pConfig = {
    p2pEnabled: defaultP2PEnabled.value,
    trackerZone: Props.options.p2pZone as TrackerZoneDash,
    signalConfig: {
      main: "wss://gz.swarmcloud.net",
      backup: "wss://signal.cdnbye.com"
    }
  };
  const engine = new P2pEngineDash(d, p2pConfig);
  engine.on("stats", (stats) => {
    console.group("p2p stats");
    console.log(stats);
    console.groupEnd();
    p2pStats.value = {
      totalHTTPDownloaded: stats.totalHTTPDownloaded,
      totalP2PDownloaded: stats.totalP2PDownloaded,
      totalP2PUploaded: stats.totalP2PUploaded,
      p2pDownloadSpeed: stats.p2pDownloadSpeed
    };
  });
  d.on(dashjs.MediaPlayer.events.PROTECTION_DESTROYED, () => {
    engine.destroy();
    resetP2P();
  });
  p2pEngine.value = engine;
};

const playFlv = async (player: HTMLMediaElement, url: string, art: Artplayer) => {
  const mpegts = await import("mpegts.js").then((m) => m.default);

  if (!mpegts.isSupported()) {
    art.notice.show = "Unsupported playback format: flv";
    return;
  }

  destroyOldCustomPlayLib(art);

  const Config: Record<string, any> = {};

  if (Props.options.headers) Config["headers"] = Props.options.headers;

  const flv = mpegts.createPlayer({ type: "flv", url, isLive: art.option.isLive }, Config);
  flv.attachMediaElement(player);
  flv.load();
  art.flv = flv;
};

const playMse = async (player: HTMLMediaElement, url: string, art: Artplayer) => {
  const mse = await import("mpegts.js").then((m) => m.default);

  if (!mse.isSupported()) {
    art.notice.show = "Unsupported playback format: mse";
    return;
  }

  destroyOldCustomPlayLib(art);

  const Config: Record<string, any> = {};

  if (Props.options.headers) Config["headers"] = Props.options.headers;

  const mes = mse.createPlayer({ type: "mse", url, isLive: art.option.isLive }, Config);

  mes.attachMediaElement(player);
  mes.load();
  art.flv = mes;
};

const playMpegts = async (player: HTMLMediaElement, url: string, art: Artplayer) => {
  const mpegts = await import("mpegts.js").then((m) => m.default);

  if (!mpegts.isSupported()) {
    art.notice.show = "Unsupported playback format: mpegts";
    return;
  }

  destroyOldCustomPlayLib(art);

  const Config: Record<string, any> = {};

  if (Props.options.headers) Config["headers"] = Props.options.headers;

  const ts = mpegts.createPlayer({ type: "mpegts", url, isLive: art.option.isLive }, Config);

  ts.attachMediaElement(player);
  ts.load();
  art.ts = ts;
};

const playM2ts = async (player: HTMLMediaElement, url: string, art: Artplayer) => {
  const mpegts = await import("mpegts.js").then((m) => m.default);

  if (!mpegts.isSupported()) {
    art.notice.show = "Unsupported playback format: m2ts";
    return;
  }

  destroyOldCustomPlayLib(art);

  const Config: Record<string, any> = {};

  if (Props.options.headers) Config["headers"] = Props.options.headers;

  const m2ts = mpegts.createPlayer({ type: "m2ts", url, isLive: art.option.isLive }, Config);

  m2ts.attachMediaElement(player);
  m2ts.load();
  art.flv = m2ts;
};

const playM3u8 = async (player: HTMLMediaElement, url: string, art: Artplayer) => {
  const Hls = (await import("hls.js")).default;
  const P2pEngineHls = (await import("@swarmcloud/hls")).default;

  var p2pConfig: HlsP2pConfig = {
    swFile: "sw.js",
    live: art.option.isLive,
    p2pEnabled: defaultP2PEnabled.value,
    trackerZone: Props.options.p2pZone as TrackerZoneHls,
    signalConfig: {
      main: "wss://gz.swarmcloud.net",
      backup: "wss://signal.cdnbye.com"
    }
  };

  if (!Hls.isSupported()) {
    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      const engine = new P2pEngineHls(p2pConfig);
      engine.on("stats", (stats) => {
        console.group("p2p stats");
        console.log(stats);
        console.groupEnd();
        p2pStats.value = {
          totalHTTPDownloaded: stats.totalHTTPDownloaded,
          totalP2PDownloaded: stats.totalP2PDownloaded,
          totalP2PUploaded: stats.totalP2PUploaded,
          p2pDownloadSpeed: stats.p2pDownloadSpeed
        };
      });
      engine
        .registerServiceWorker()
        .catch(() => {})
        .finally(() => {
          if (!player.src) player.src = url;
        });
      art.once("destroy", () => {
        engine.destroy();
        resetP2P();
      });
      p2pEngine.value = engine;
    } else {
      art.notice.show = "Unsupported playback format: m3u8";
    }
    return;
  }

  destroyOldCustomPlayLib(art);

  class fLoader extends (Hls.DefaultConfig.loader as FragmentLoaderConstructor) {
    constructor(config: HlsConfig) {
      super(config);
      var load = this.load.bind(this);
      this.load = function (context: FragmentLoaderContext, config, callbacks): void {
        if (context.responseType === "arraybuffer") {
          var onSuccess = callbacks.onSuccess;
          callbacks.onSuccess = function (response, stats, context, networkDetails): void {
            // ignore when response encrypted
            if (context.frag.levelkeys?.identity.encrypted) {
              onSuccess(response, stats, context, networkDetails);
              return;
            }

            if (context.responseType === "arraybuffer" && response.data instanceof ArrayBuffer) {
              var data = new Uint8Array(response.data);
              var pre = 0;
              while (pre >= 0 && pre < 512 && pre < data.length) {
                var currnet = data.indexOf(0x47, pre + 1);
                if (currnet - pre === 188) {
                  response.data = response.data.slice(pre);
                  break;
                }
                pre = currnet;
              }
            }

            onSuccess(response, stats, context, networkDetails);
          };
        }
        load(context, config, callbacks);
      };
    }
  }

  function newHlsConfig(headers?: Record<string, string>): Partial<HlsConfig> {
    return {
      xhrSetup: function (xhr: XMLHttpRequest, url: string): void | Promise<void> {
        for (const key in headers) {
          xhr.setRequestHeader(key, headers[key]);
        }
      },
      startLevel: -1,
      fLoader: fLoader
    };
  }

  const hls = new Hls(newHlsConfig(Props.options.headers));

  p2pConfig.hlsjsInstance = hls;

  const engine = new P2pEngineHls(p2pConfig);

  engine.on("stats", (stats) => {
    console.group("p2p stats");
    console.log(stats);
    console.groupEnd();
    p2pStats.value = {
      totalHTTPDownloaded: stats.totalHTTPDownloaded,
      totalP2PDownloaded: stats.totalP2PDownloaded,
      totalP2PUploaded: stats.totalP2PUploaded,
      p2pDownloadSpeed: stats.p2pDownloadSpeed
    };
  });

  hls.once(Hls.Events.DESTROYING, () => {
    engine.destroy();
    resetP2P();
  });
  p2pEngine.value = engine;

  hls.loadSource(url);
  hls.attachMedia(player);
  art.hls = hls;
};

const newPlayerOption = (html: HTMLDivElement): Option => {
  const opts: Option = {
    url: Props.options.url,
    isLive: Props.options.isLive,
    container: html,
    volume: 0.3, // 音量
    autoSize: false, // 隐藏黑边
    autoMini: false,
    theme: "#00a1d6",
    loop: false, // 循环播放
    flip: true, // 显示视频翻转功能
    playbackRate: true, // 显示视频播放速度功能
    aspectRatio: true, // 显示视频长宽比功能
    screenshot: false, // 显示视频截图功能
    setting: true,
    hotkey: true, // 快捷键
    pip: true, // 显示画中画按钮
    mutex: true, // 互斥，阻止多个播放器同时播放
    fullscreen: true, // 全屏按钮
    fullscreenWeb: true, // 网页全屏
    subtitleOffset: true, // 显示字幕偏移功能
    miniProgressBar: true, // 迷你进度条,播放器失去焦点后且正在播放时出现
    playsInline: true, // 在移动端是否使用 playsInline 模式
    lock: true, // 移动端显示锁定按钮
    fastForward: true, // 移动端添加长按视频快进功能
    autoPlayback: false, // 使用自动回放功能
    autoOrientation: true, // 移动端的网页全屏时，根据视频尺寸和视口尺寸，旋转播放器
    airplay: false, // 隔空播放
    type: Props.options.type,
    plugins: Props.options.plugins,
    subtitle: {
      encoding: "utf-8",
      escape: false
    },
    moreVideoAttr: {
      controls: false,
      preload: "auto",
      playsInline: true
    },
    customType: {
      mp4: playMedia,
      mkv: playMedia,
      flv: playFlv,
      m3u8: playM3u8,
      m3u: playM3u8,
      mpd: playMpd,
      mes: playMse,
      ts: playMpegts,
      m2ts: playM2ts,
      m2t: playM2ts,
      mts: playM2ts,
      mpegts: playMpegts
    }
  };
  return opts;
};

const father = ref<HTMLDivElement>();

const mountPlayer = () => {
  if (art) {
    console.log("player destroy");
    art.destroy();
  }
  const newDiv = document.createElement("div");
  newDiv.setAttribute("class", "artplayer-app");
  while (father.value!.firstChild) {
    father.value!.removeChild(father.value!.firstChild);
  }
  father.value!.appendChild(newDiv);
  art = new Artplayer(newPlayerOption(newDiv));
  art.on("destroy", () => {
    destroyOldCustomPlayLib(art);
    if (p2pEngine.value) {
      p2pEngine.value.destroy();
      p2pEngine.value = undefined;
    }
  });
  // addHotKeyEvnet(art);
  Emits("get-instance", art);
};

const cleanHotKeyEvent = (art: Artplayer, keys: number[]) => {
  keys.forEach((key) => {
    art.hotkey.keys[key] = [];
  });
};

// const addHotKeyEvnet = (art: Artplayer) => {
//   cleanHotKeyEvent(art, [32, 37, 39]);

//   let fastForwardTimer: number | null = null;
//   let originalPlaybackRate: number | null = null;
//   let isLongPress = false;

//   const newStartFastForward = (rate: number) => {
//     return () => {
//       originalPlaybackRate = art.playbackRate;
//       art.playbackRate = rate;
//       isLongPress = true;
//     };
//   };

//   const stopFastForward = () => {
//     if (fastForwardTimer) {
//       clearTimeout(fastForwardTimer);
//       fastForwardTimer = null;
//     }
//     if (originalPlaybackRate) {
//       art.playbackRate = originalPlaybackRate;
//     }
//     isLongPress = false;
//   };

//   const keydownEvent = (e: KeyboardEvent) => {
//     if (document.activeElement !== document.body && document.activeElement) return;
//     switch (e.key) {
//       case "ArrowLeft":
//         if (!fastForwardTimer) {
//           fastForwardTimer = window.setTimeout(
//             newStartFastForward(1 / Artplayer.FAST_FORWARD_VALUE),
//             Artplayer.FAST_FORWARD_TIME
//           );
//         }
//         break;
//       case "ArrowRight":
//         if (!fastForwardTimer) {
//           fastForwardTimer = window.setTimeout(
//             newStartFastForward(Artplayer.FAST_FORWARD_VALUE),
//             Artplayer.FAST_FORWARD_TIME
//           );
//         }
//         break;
//       case " ":
//         art.toggle();
//         e.preventDefault();
//         break;
//     }
//   };

//   const keyupEvent = (e: KeyboardEvent) => {
//     if (document.activeElement !== document.body && document.activeElement) return;
//     switch (e.key) {
//       case "ArrowLeft":
//         if (!isLongPress) {
//           art.seek = art.currentTime - Artplayer.SEEK_STEP;
//         }
//         stopFastForward();
//         break;
//       case "ArrowRight":
//         if (!isLongPress) {
//           art.seek = art.currentTime + Artplayer.SEEK_STEP;
//         }
//         stopFastForward();
//         break;
//     }
//   };

//   art.once("ready", () => {
//     window.addEventListener("keydown", keydownEvent);
//     window.addEventListener("keyup", keyupEvent);
//     art.once("destroy", () => {
//       window.removeEventListener("keydown", keydownEvent);
//       window.removeEventListener("keyup", keyupEvent);
//     });
//   });
// };

// 格式化字节数的函数
const formatKBytes = (kB: number) => {
  if (kB === 0) return "0 KB";
  const k = 1024;
  const sizes = ["KB", "MB", "GB"];
  const i = Math.floor(Math.log(kB) / Math.log(k));
  return `${parseFloat((kB / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const toggleP2P = (e: boolean) => {
  if (!p2pEngine.value) return;
  if (e) {
    p2pEngine.value.enableP2P();
  } else {
    p2pEngine.value.disableP2P();
  }
};

onMounted(() => {
  mountPlayer();

  watchers.push(
    watch(
      () => Props.options,
      () => {
        mountPlayer();
      }
    )
  );
});

onBeforeUnmount(() => {
  art.destroy();
});
</script>

<template>
  <div ref="father"></div>

  <div v-if="p2pEngine" class="p2p-panel mt-2 px-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <el-switch
          v-model="defaultP2PEnabled"
          @change="toggleP2P"
          active-text="启用P2P"
          inactive-text="关闭P2P"
        />
      </div>
      <div v-if="defaultP2PEnabled && p2pStats" class="flex space-x-4 text-sm">
        <div class="flex items-center space-x-1">
          <el-tooltip content="HTTP下载量">
            <span>↓HTTP: {{ formatKBytes(p2pStats.totalHTTPDownloaded) }}</span>
          </el-tooltip>
        </div>
        <div class="flex items-center space-x-1">
          <el-tooltip content="P2P下载量">
            <span>↓P2P: {{ formatKBytes(p2pStats.totalP2PDownloaded) }}</span>
          </el-tooltip>
        </div>
        <div class="flex items-center space-x-1">
          <el-tooltip content="P2P上传量">
            <span>↑P2P: {{ formatKBytes(p2pStats.totalP2PUploaded) }}</span>
          </el-tooltip>
        </div>
        <div class="flex items-center space-x-1">
          <el-tooltip content="P2P下载速度">
            <span>Speed: {{ formatKBytes(p2pStats.p2pDownloadSpeed) }}/s</span>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.p2p-panel {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  padding: 8px;
}
</style>
