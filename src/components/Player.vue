<script setup lang="ts">
import { roomStore } from "@/stores/room";
import Artplayer from "artplayer";
import type { Option } from "artplayer/types/option";
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import type { PropType, WatchStopHandle } from "vue";
import { deepEqualObject } from "@/utils/utils";
const room = roomStore();

const watchers: WatchStopHandle[] = [];

onBeforeUnmount(() => {
  watchers.forEach((watcher) => watcher());
});

Artplayer.DBCLICK_FULLSCREEN = false;

const artplayer = ref<HTMLDivElement>();

let art: Artplayer;

interface options {
  url: string;
  isLive: boolean;
  type: string;
  headers: { [key: string]: string };
  plugins: ((art: Artplayer) => unknown)[];
}

const Props = defineProps({
  options: {
    type: Object as PropType<options>,
    required: true
  }
});

const Emits = defineEmits(["get-instance"]);

// 监听弹幕变化
watchers.push(
  watch(
    () => room.danmuku,
    () => {
      art.plugins.artplayerPluginDanmuku.emit(room.danmuku);
    }
  )
);

const playMpd = (player: HTMLMediaElement, url: string, art: any) => {
  import("dashjs")
    .then((dashjs) => dashjs.default)
    .then((dashjs) => {
      if (dashjs.supportsMediaSource()) {
        const dash = dashjs.MediaPlayer().create();
        dash.initialize(player, url, false);
        art.dash = dash;
        art.on("destroy", () => dash.reset());
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

const playerOption = computed<Option>(() => {
  return {
    container: artplayer.value!,
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
    subtitleOffset: false, // 显示字幕偏移功能
    miniProgressBar: true, // 迷你进度条,播放器失去焦点后且正在播放时出现
    playsInline: true, // 在移动端是否使用 playsInline 模式
    lock: true, // 移动端显示锁定按钮
    fastForward: false, // 移动端添加长按视频快进功能
    autoPlayback: false, // 使用自动回放功能
    autoOrientation: true, // 移动端的网页全屏时，根据视频尺寸和视口尺寸，旋转播放器
    airplay: false, // 隔空播放
    ...Props.options,
    customType: {
      flv: playFlv,
      m3u8: playM3u8,
      mpd: playMpd,
      mes: playMse,
      ts: playMpegts,
      m2ts: playM2ts,
      m2t: playM2ts,
      mts: playM2ts
    }
  };
});

console.log(Props.options);

const father = ref<HTMLDivElement>();

onMounted(() => {
  art = new Artplayer(playerOption.value);

  Emits("get-instance", art);
  const needDestroy = (oldOption: options, newOption: options) => {
    return (
      oldOption.isLive !== newOption.isLive ||
      oldOption.type !== newOption.type ||
      oldOption.url !== newOption.url ||
      !deepEqualObject(oldOption.headers, newOption.headers)
    );
  };

  watchers.push(
    watch(
      () => Props.options,
      (old, current) => {
        if (needDestroy(old, current)) {
          console.log("destroy");
          art.destroy();
          const newDiv = document.createElement("div");
          newDiv.setAttribute("class", "artplayer-app");
          newDiv.setAttribute("ref", "artplayer");
          while (father.value!.firstChild) {
            father.value!.removeChild(father.value!.firstChild);
          }
          father.value!.appendChild(newDiv);
          artplayer.value = newDiv;
          art = new Artplayer(playerOption.value);
          Emits("get-instance", art);
        } else {
          //
        }
      }
    )
  );
});

onBeforeUnmount(() => {
  art.destroy();
});
</script>

<template>
  <div ref="father">
    <div class="artplayer-app" ref="artplayer"></div>
  </div>
</template>

<style></style>
