<script setup lang="ts">
import Artplayer from "artplayer";
import type { HlsConfig, FragmentLoaderConstructor, FragmentLoaderContext } from "hls.js";
import type { Option } from "artplayer/types/option";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import type { PropType, WatchStopHandle } from "vue";
import { destroyOldCustomPlayLib } from "@/utils";

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

export interface options {
  url: string;
  isLive?: boolean;
  type?: string;
  headers?: Record<string, string>;
  plugins?: ((art: Artplayer) => unknown)[];
}

const Props = defineProps({
  options: {
    type: Object as PropType<options>,
    required: true
  }
});

const Emits = defineEmits(["get-instance"]);

const playMpd = async (player: HTMLMediaElement, url: string, art: any) => {
  const dashjs = await import("dashjs");

  if (!dashjs.supportsMediaSource()) {
    art.notice.show = "Unsupported playback format: mpd";
    return;
  }

  destroyOldCustomPlayLib(art);

  const d = dashjs.MediaPlayer().create();
  d.initialize(player, url, false);
  art.dash = d;
  art.mpd = d;
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

  if (!Hls.isSupported()) {
    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      if (!player.src) player.src = url;
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
</template>

<style></style>
