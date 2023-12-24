import { debounces } from "@/utils";
import { useDebounceFn } from "@vueuse/core";
import { watch, type WatchStopHandle } from "vue";
import { ElementMessage, ElementMessageType } from "@/proto/message";
import type Artplayer from "artplayer";
import type { Status } from "@/proto/message";
import { ElNotification } from "element-plus";

export const artPlay = (art: Artplayer) => {
  art.play().catch(() => {
    art.muted = true;
    art
      .play()
      .then(() => {
        ElNotification({
          title: "温馨提示",
          type: "info",
          message: "由于浏览器限制，播放器已静音，请手动开启声音"
        });
      })
      .catch((e) => {
        ElNotification({
          title: "播放失败",
          type: "error",
          message: e
        });
      });
  });
};

interface resould {
  name: string;
  setAndNoPublishSeek: (seek: number) => void;
  setAndNoPublishPlay: () => void;
  setAndNoPublishPause: () => void;
  setAndNoPublishRate: (rate: number) => void;
}

const debounceTime = 500;

export const newSyncPlugin = (
  publishStatus: (msg: ElementMessage) => boolean,
  dynamicStatus: Status
) => {
  return (art: Artplayer): resould => {
    const playingStatusDebounce = debounces(debounceTime);

    let lastestSeek = 0;

    const publishSeek = () => {
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHANGE_SEEK,
          seek: art.currentTime,
          rate: art.playbackRate
        })
      );
      console.log("视频空降，:", art.currentTime);
    };

    const __publishSeekDebounce = useDebounceFn(publishSeek, debounceTime);

    const publishSeekDebounce = function () {
      lastestSeek = Date.now();
      __publishSeekDebounce();
    };

    const setAndNoPublishSeek = (seek: number) => {
      lastestSeek = Date.now();
      if (art.option.isLive || Math.abs(art.currentTime - seek) < 2) return;
      art.currentTime = seek;
    };

    const publishPlay = () => {
      console.log("视频播放,seek:", art.currentTime);
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.PLAY,
          seek: art.currentTime,
          rate: art.playbackRate
        })
      );
    };

    const publishPlayDebounce = playingStatusDebounce(publishPlay);

    const setAndNoPublishPlay = () => {
      if (art.option.isLive || art.playing) return;
      art.off("play", publishPlayDebounce);
      art.once("play", () => {
        art.on("play", publishPlayDebounce);
      });
      artPlay(art);
    };

    const publishPause = () => {
      console.log("视频暂停,seek:", art.currentTime);
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.PAUSE,
          seek: art.currentTime,
          rate: art.playbackRate
        })
      );
    };

    const publishPauseDebounce = playingStatusDebounce(publishPause);

    const setAndNoPublishPause = () => {
      if (art.option.isLive || !art.playing) return;
      art.off("pause", publishPauseDebounce);
      art.once("pause", () => {
        art.on("pause", publishPauseDebounce);
      });
      art.pause();
    };

    const publishRate = () => {
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHANGE_RATE,
          seek: art.currentTime,
          rate: art.playbackRate
        })
      );
      console.log("视频倍速,seek:", art.currentTime);
    };

    const setAndNoPublishRate = (rate: number) => {
      if (art.option.isLive || art.playbackRate === rate) return;
      art.off("video:ratechange", publishRate);
      art.once("video:ratechange", () => {
        art.on("video:ratechange", publishRate);
      });
      art.playbackRate = rate;
    };

    const checkSeek = () => {
      // 距离上一次seek超过10s后才会检查seek
      if (Date.now() - lastestSeek < 10000 || art.option.isLive) return;
      art.duration - art.currentTime > 5 &&
        publishStatus(
          ElementMessage.create({
            type: ElementMessageType.CHECK_SEEK,
            seek: art.currentTime,
            rate: art.playbackRate
          })
        );
    };

    if (!art.option.isLive) {
      art.once("ready", () => {
        console.log("同步进度中...");
        art.currentTime = dynamicStatus.seek;
        art.playbackRate = dynamicStatus.rate;
        if (dynamicStatus.playing) {
          artPlay(art);
        }

        const intervals: number[] = [];
        const watchers: WatchStopHandle[] = [];

        intervals.push(setInterval(checkSeek, 10000));
        watchers.push(
          watch(
            dynamicStatus,
            (newStatus) => {
              newStatus.playing ? setAndNoPublishPlay() : setAndNoPublishPause();
              setAndNoPublishSeek(newStatus.seek);
              setAndNoPublishRate(newStatus.rate);
            },
            { deep: true }
          )
        );

        art.on("play", publishPlayDebounce);

        // 视频暂停
        art.on("pause", publishPauseDebounce);

        // 空降
        art.on("seek", publishSeekDebounce);

        // 倍速
        art.on("video:ratechange", publishRate);

        art.on("destroy", () => {
          intervals.forEach((interval) => {
            clearInterval(interval);
          });
          watchers.forEach((watcher) => {
            watcher();
          });
          art.off("play", publishPlayDebounce);
          art.off("pause", publishPauseDebounce);
          art.off("seek", publishSeekDebounce);
          art.off("video:ratechange", publishRate);
        });
      });
    } else {
      art.once("ready", () => {
        artPlay(art);
      });
    }

    return {
      name: "sync",
      setAndNoPublishSeek,
      setAndNoPublishPlay,
      setAndNoPublishPause,
      setAndNoPublishRate
    };
  };
};
