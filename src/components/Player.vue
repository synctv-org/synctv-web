<script setup lang="ts">
import Artplayer from "artplayer";
import type { Option } from "artplayer/types/option";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import type { PropType, WatchStopHandle } from "vue";

const watchers: WatchStopHandle[] = [];

onBeforeUnmount(() => {
  watchers.forEach((watcher) => watcher());
});

Artplayer.USE_RAF = true;
Artplayer.DBCLICK_FULLSCREEN = false;
Artplayer.SEEK_STEP = 5;
Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5].reverse();

let art: Artplayer;

export interface options {
  url: string;
  isLive: boolean;
  type?: string;
  headers: Record<string, string>;
  plugins: ((art: Artplayer) => unknown)[];
}

const Props = defineProps({
  options: {
    type: Object as PropType<options>,
    required: true
  }
});

const Emits = defineEmits(["get-instance"]);

const playMpd = (player: HTMLMediaElement, url: string, art: any) => {
  import("@/utils/dash").then((dash) => {
    if (dash.isSupported()) {
      if (!art.plugins.artplayerPluginDashQuality) dash.newDashQualityPlugin()(art);
      const d = dash.newDash();
      d.initialize(player, url, false);
      art.dash = d;
      art.on("destroy", d.destroy);
    } else {
      art.notice.show = "Unsupported playback format: mpd";
    }
  });
};

const playFlv = (player: HTMLMediaElement, url: string, art: any) => {
  import("mpegts.js")
    .then((mpegts) => mpegts.default)
    .then((mpegts) => {
      if (mpegts.isSupported()) {
        const Config: Record<string, Record<string, string>> = {};
        Config["headers"] = Props.options.headers;

        const flv = mpegts.createPlayer({ type: "flv", url, isLive: art.option.isLive }, Config);

        flv.attachMediaElement(player);
        flv.load();
        art.flv = flv;
        art.on("destroy", () => flv.destroy());
      } else {
        art.notice.show = "Unsupported playback format: flv";
      }
    });
};

const playMse = (player: HTMLMediaElement, url: string, art: any) => {
  import("mpegts.js")
    .then((mpegts) => mpegts.default)
    .then((mpegts) => {
      if (mpegts.isSupported()) {
        const Config: Record<string, Record<string, string>> = {};
        Config["headers"] = Props.options.headers;

        const mse = mpegts.createPlayer({ type: "mse", url, isLive: art.option.isLive }, Config);

        mse.attachMediaElement(player);
        mse.load();
        art.flv = mse;
        art.on("destroy", () => mse.destroy());
      } else {
        art.notice.show = "Unsupported playback format: mse";
      }
    });
};

const playMpegts = (player: HTMLMediaElement, url: string, art: any) => {
  import("mpegts.js")
    .then((mpegts) => mpegts.default)
    .then((mpegts) => {
      if (mpegts.isSupported()) {
        const Config: Record<string, Record<string, string>> = {};
        Config["headers"] = Props.options.headers;

        const mpegtsPlayer = mpegts.createPlayer(
          { type: "mpegts", url, isLive: art.option.isLive },
          Config
        );

        mpegtsPlayer.attachMediaElement(player);
        mpegtsPlayer.load();
        art.flv = mpegtsPlayer;
        art.on("destroy", () => mpegtsPlayer.destroy());
      } else {
        art.notice.show = "Unsupported playback format: mpegts";
      }
    });
};

const playM2ts = (player: HTMLMediaElement, url: string, art: any) => {
  import("mpegts.js")
    .then((mpegts) => mpegts.default)
    .then((mpegts) => {
      if (mpegts.isSupported()) {
        const Config: Record<string, Record<string, string>> = {};
        Config["headers"] = Props.options.headers;

        const m2ts = mpegts.createPlayer({ type: "m2ts", url, isLive: art.option.isLive }, Config);

        m2ts.attachMediaElement(player);
        m2ts.load();
        art.flv = m2ts;
        art.on("destroy", () => m2ts.destroy());
      } else {
        art.notice.show = "Unsupported playback format: m2ts";
      }
    });
};

const playM3u8 = (player: HTMLMediaElement, url: string, art: any) => {
  import("@/utils/hls").then((Hls) => {
    if (Hls.isSupported()) {
      if (!art.plugins.artplayerPluginHlsQuality) Hls.newHlsQualityPlugin()(art);
      if (art.hls) art.hls.destroy();
      const hls = Hls.newHls(Props.options.headers);
      hls.loadSource(url);
      hls.attachMedia(player);
      art.hls = hls;
      art.on("destroy", () => hls.destroy());
    } else {
      art.notice.show = "Unsupported playback format: m3u8";
    }
  });
};

const newPlayerOption = (html: HTMLDivElement): Option => {
  const opts: Option = {
    url: Props.options.url,
    isLive: Props.options.isLive,
    container: html,
    volume: 0, // 音量
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
    fastForward: false, // 移动端添加长按视频快进功能
    autoPlayback: false, // 使用自动回放功能
    autoOrientation: true, // 移动端的网页全屏时，根据视频尺寸和视口尺寸，旋转播放器
    airplay: false, // 隔空播放
    type: Props.options.type,
    plugins: Props.options.plugins,
    subtitle: {
      encoding: "utf-8",
      escape: true
    },
    customType: {
      flv: playFlv,
      m3u8: playM3u8,
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
  Emits("get-instance", art);
  addKeyEvnet(art);
};

// 全局快捷键
const addKeyEvnet = (art: Artplayer) => {
  const event = (e: KeyboardEvent) => {
    if (document.activeElement !== document.body && document.activeElement) return;
    switch (e.key) {
      case "ArrowLeft":
        art.seek = art.currentTime - Artplayer.SEEK_STEP;
        break;
      case "ArrowRight":
        art.seek = art.currentTime + Artplayer.SEEK_STEP;
        break;
      case " ":
        art.toggle();
        e.preventDefault();
        break;
    }
  };
  art.on("ready", () => {
    window.addEventListener("keydown", event);
    art.on("destroy", () => {
      window.removeEventListener("keydown", event);
    });
    art.on("blur", () => {
      window.addEventListener("keydown", event);
    });
    art.on("focus", () => {
      window.removeEventListener("keydown", event);
    });
  });
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
</template>

<style></style>
