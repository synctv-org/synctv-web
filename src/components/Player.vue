<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { roomStore } from "@/stores/room";
import Artplayer from "artplayer";
import type { Option } from "artplayer/types/option";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import type { PropType } from "vue";
import artplayerPluginDanmuku from "artplayer-plugin-danmuku";
import mpegts from "mpegts.js";
import Hls, { HdcpLevels } from "hls.js";
import type { MediaKeySessionContext } from "hls.js"
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

const Emits = defineEmits(["get-instance", "set-player-status", "ws-send"]);
// 监听当前正在播放影片变化
// watch(
//   () => room.currentMovie,
//   () => {
//     const jsonData = room.currentMovie;

//     setTimeout(() => {
//       if (jsonData.url === "") {
//         art.switchUrl("https://live.lazy.ink/hd.mp4");
//         localStorage.getItem("dev") === "114514" && console.log("视频为空！");
//       } else {
//         localStorage.getItem("dev") === "114514" &&
//           console.log("变了！", jsonData.url);

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
    const flv = mpegts.createPlayer(
      { type: "flv", url },
      {
        headers: {
          Authorization: url.startsWith(window.location.origin) ? localStorage.token : ""
        }
      }
    );

    flv.attachMediaElement(player);
    flv.load();
    art.flv = flv;
    art.on("destroy", () => flv.destroy());
  } else {
    art.notice.show = "Unsupported playback format: flv";
  }
};

const playM3u8Config = {
  xhrSetup: function (xhr: XMLHttpRequest, url: string): void | Promise<void> {
    // xhr.open("GET", url, true);
    xhr.setRequestHeader('Authorization', url.startsWith(window.location.origin) ? localStorage.token : "");
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
    // isLive: room.currentMovie.live,
    plugins: [
      artplayerPluginDanmuku({
        // 弹幕数组
        danmuku: [],
        speed: 4
      })
    ],
    // type: 'm3u8',
    ...Props.options,
    // url: "",
    // type: "flv",
    customType: {
      flv: playFlv,
      m3u8: playM3u8
    }
  };

  art = new Artplayer(option);

  const isPlaying = ref(false);

  const onReady = () => {
    watch(
      () => room.currentMovieStatus.playing,
      () => {
        // 非直播流才同步
        if (!room.currentMovie.live) {
          if (room.currentMovieStatus.playing === isPlaying.value) return;
          room.currentMovieStatus.playing ? art.play() : art.pause();
        }
      }
    );

    watch(
      () => room.currentMovieStatus.seek,
      () => {
        localStorage.getItem("dev") === "114514" &&
          console.log("seek变了：", room.currentMovieStatus.seek);

        if (!room.currentMovie.live)
          room.currentMovieStatus.seek === 0 ? false : (art.seek = room.currentMovieStatus.seek);
      }
    );

    watch(
      () => room.currentMovieStatus.rate,
      () => {
        localStorage.getItem("dev") === "114514" &&
          console.log("rate变了：", room.currentMovieStatus.rate);

        if (!room.currentMovie.live) {
          room.currentMovieStatus.rate === art.playbackRate
            ? void 0
            : (art.playbackRate = room.currentMovieStatus.rate);
        }
      }
    );

    setTimeout(() => {
      if (!room.currentMovie.live) {
        art.seek = room.currentMovieStatus.seek;
        room.currentMovieStatus.playing ? art.play() : art.pause();
        console.log("seek同步成功:", room.currentMovieStatus.seek);
      }
    }, 100);

    localStorage.getItem("dev") === "114514" && console.log("art.seek:", art.currentTime);
    localStorage.getItem("dev") === "114514" &&
      console.log("room.seek:", room.currentMovieStatus.seek);

    Emits("ws-send", "PLAYER：视频已就绪");
    // art.off('ready', onReady);

    // 视频播放
    const vPlayAndPause = useDebounceFn((type: number) => {
      if (!room.currentMovie.live)
        Emits(
          "set-player-status",
          JSON.stringify({
            Type: type,
            Seek: art.currentTime,
            Rate: art.playbackRate
          })
        );
    }, 1000);

    art.on("play", () => {
      vPlayAndPause(3);
      isPlaying.value = true;
      localStorage.getItem("dev") === "114514" && console.log("视频播放,seek:", art.currentTime);
    });

    // 视频暂停
    art.on("pause", () => {
      vPlayAndPause(4);
      isPlaying.value = false;
      localStorage.getItem("dev") === "114514" &&
        console.log("视频暂停中，，seek:", art.currentTime);
    });

    // 空降
    const debouncedFn = useDebounceFn((currentTime: number) => {
      if (!room.currentMovie.live)
        Emits(
          "set-player-status",
          JSON.stringify({
            Type: 9,
            Seek: currentTime,
            Rate: art.playbackRate
          })
        );
      localStorage.getItem("dev") === "114514" && console.log("视频空降，:", art.currentTime);
    }, 1000);

    art.on("seek", (currentTime) => {
      debouncedFn(currentTime);
    });

    // 倍速
    art.on("video:ratechange", () => {
      console.log(art.playbackRate);

      isPlaying.value ? vPlayAndPause(3) : vPlayAndPause(4);
    });
  };
  art.on("ready", onReady);
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
