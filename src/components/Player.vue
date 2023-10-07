<script setup lang="ts">
import { roomStore } from "@/stores/room";
import Artplayer from "artplayer";
import type { Option } from "artplayer/types/option";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import type { PropType } from "vue";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import mpegts from "mpegts.js";
import Hls from "hls.js";
const room = roomStore();

const artplayer = ref<HTMLDivElement>();

let art: Artplayer;

interface options {
  url: string;
}

const Props = defineProps({
  options: {
    type: Object as PropType<options>,
    required: true
  }
});

const Emits = defineEmits(["get-instance"]);

// 监听当前正在播放影片变化
// watch(
//   () => room.currentMovie,
//   () => {
//     const jsonData = room.currentMovie;

//     setTimeout(() => {
//       if (jsonData.url === "") {
//         art.switchUrl("https://live.lazy.ink/hd.mp4");
//        devLog("视频为空！");
//       } else {
//         devLog("变了！", jsonData.url);

//         art.option.type = "";

//         if (jsonData.live) {
//           art.option.type = "flv";

//           jsonData.url = `${window.location.origin}/api/live/${jsonData.url}.flv`;
//         }

//         art.switchUrl(jsonData.url).catch((err) => {
//           ElMessage.error("视频加载失败！");
//           console.error("视频加载失败：", err);
//         });
//       }
//     }, 233);
//   }
// );

// 监听弹幕变化
watch(
  () => room.danmuku,
  () => {
    art.plugins.artplayerPluginDanmuku.emit(room.danmuku);
  }
);

const playFlv = (player: HTMLMediaElement, url: string, art: any) => {
  if (mpegts.isSupported()) {
    let flv: mpegts.Player
    if (url.startsWith(window.location.origin) && localStorage.token) {
      flv = mpegts.createPlayer(
        { type: "flv", url },
        {
          headers: {
            Authorization: localStorage.token
          }
        }
      );
    } else {
      flv = mpegts.createPlayer(
        { type: "flv", url }
      );
    }

    flv.attachMediaElement(player);
    flv.load();
    art.flv = flv;
    art.on("destroy", () => flv.destroy());
  } else {
    art.notice.show = "Unsupported playback format: flv";
  }
};

const playMse = (player: HTMLMediaElement, url: string, art: any) => {
  if (mpegts.isSupported()) {
    const mse = mpegts.createPlayer(
      { type: "mse", url }
    );

    mse.attachMediaElement(player);
    mse.load();
    art.flv = mse;
    art.on("destroy", () => mse.destroy());
  } else {
    art.notice.show = "Unsupported playback format: mse";
  }
};

const playMpegts = (player: HTMLMediaElement, url: string, art: any) => {
  if (mpegts.isSupported()) {
    const mpegtsPlayer = mpegts.createPlayer(
      { type: "mpegts", url }
    );
    mpegtsPlayer.attachMediaElement(player);
    mpegtsPlayer.load();
    art.flv = mpegtsPlayer;
    art.on("destroy", () => mpegtsPlayer.destroy());
  } else {
    art.notice.show = "Unsupported playback format: mpegts";
  }
};

const playM2ts = (player: HTMLMediaElement, url: string, art: any) => {
  if (mpegts.isSupported()) {
    const m2ts = mpegts.createPlayer(
      { type: "m2ts", url }
    );

    m2ts.attachMediaElement(player);
    m2ts.load();
    art.flv = m2ts;
    art.on("destroy", () => m2ts.destroy());
  } else {
    art.notice.show = "Unsupported playback format: m2ts";
  }
};

const playM3u8Config = {
  xhrSetup: function (xhr: XMLHttpRequest, url: string): void | Promise<void> {
    // xhr.open("GET", url, true);
    if (url.startsWith(window.location.origin) && localStorage.token) {
      xhr.setRequestHeader('Authorization', localStorage.token);
    }
  },
};

const playM3u8 = (player: HTMLMediaElement, url: string, art: any) => {
  if (Hls.isSupported()) {
    if (art.hls) art.hls.destroy();
    const hls = new Hls(playM3u8Config);
    hls.loadSource(url);
    hls.attachMedia(player);
    art.hls = hls;
    art.on("destroy", () => hls.destroy());
  } else {
    art.notice.show = "Unsupported playback format: m3u8";
  }
};

onMounted(() => {
  const option: Option = {
    container: artplayer.value!,
    volume: 0, // 音量
    autoplay: false, // 自动播放
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
    plugins: [
      artplayerPluginDanmuku({
        // 弹幕数组
        danmuku: [],
        speed: 4
      }),
    ],
    ...Props.options,
    customType: {
      flv: playFlv,
      m3u8: playM3u8,
      mes: playMse,
      ts: playMpegts,
      m2ts: playM2ts,
      m2t: playM2ts,
      mts: playM2ts,
    }
  };

  art = new Artplayer(option);

  Emits("get-instance", art);
});

onBeforeUnmount(() => {
  // art.destroy();
});
</script>

<template>
  <div class="artplayer-app" ref="artplayer"></div>
</template>

<style></style>
