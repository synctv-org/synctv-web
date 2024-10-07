import { debounces } from "@/utils";
import { useDebounceFn } from "@vueuse/core";
import { watch, type WatchStopHandle } from "vue";
import { ElementMessage, ElementMessageType } from "@/proto/message";
import type Artplayer from "artplayer";
import type { MovieStatus } from "@/proto/message";
import { ElNotification } from "element-plus";

const artPlay = async (art: Artplayer) => {
  let retry = false;
  await art.video.play().catch(() => {
    art.muted = true;
    retry = true;
  });
  if (retry)
    await art.video
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
          title: "自动播放失败，请手动点击同步按钮",
          type: "error",
          message: e
        });
      });
};

interface syncPlugin {
  name: string;
  setAndNoPublishSeek: (seek: number) => void;
  setAndNoPublishPlay: () => void;
  setAndNoPublishPause: () => void;
  setAndNoPublishRate: (rate: number) => void;
  setAndNoPublishStatus: (status: MovieStatus) => void;
  currentStatus: () => MovieStatus;
}

const debounceTime = 500;

const newSyncControl = (art: Artplayer, publishStatus: (msg: ElementMessage) => boolean) => {
  if (art.controls.syncControl) {
    art.controls.remove("syncControl");
  }
  art.controls.add({
    name: "syncControl",
    html: "同步",
    position: "right",
    click: function () {
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.SYNC_MOVIE_STATUS
        })
      );
    }
  });
  art.setting.add({
    html: "同步状态",
    selector: [
      {
        default: true,
        html: "点击同步"
      }
    ],
    onSelect: function () {
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.SYNC_MOVIE_STATUS
        })
      );
    }
  });
};

export const newSyncPlugin = (
  publishStatus: (msg: ElementMessage) => boolean,
  initStatus: MovieStatus,
  dynamicCurrentExpireId: () => number
) => {
  return (art: Artplayer): syncPlugin => {
    const playingStatusDebounce = debounces(debounceTime);

    let lastestSeek = 0;

    const publishSeek = () => {
      console.groupCollapsed("广播视频空降");
      console.log("seek:", art.currentTime);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHANGE_SEEK,
          time: Date.now(),
          changeMovieStatusReq: {
            playing: !art.video.paused,
            seek: art.currentTime,
            rate: art.playbackRate
          }
        })
      );
    };

    const __publishSeekDebounce = useDebounceFn(publishSeek, debounceTime);

    const publishSeekDebounce = function () {
      lastestSeek = Date.now();
      __publishSeekDebounce();
    };

    const setAndNoPublishSeek = (seek: number) => {
      lastestSeek = Date.now();
      if (art.option.isLive || Math.abs(art.currentTime - seek) < 2) return;
      console.groupCollapsed("设置seek(非广播)");
      console.log("seek:", seek);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      art.currentTime = seek;
    };

    const publishPlay = () => {
      console.groupCollapsed("广播视频播放");
      console.log("seek:", art.currentTime);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.PLAY,
          time: Date.now(),
          changeMovieStatusReq: {
            playing: true,
            seek: art.currentTime,
            rate: art.playbackRate
          }
        })
      );
    };

    const publishPlayDebounce = playingStatusDebounce(publishPlay);

    const setAndNoPublishPlay = async () => {
      if (!art.video.paused) return;
      console.groupCollapsed("设置播放(非广播)");
      console.log("seek:", art.currentTime);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      await artPlay(art);
    };

    const publishPause = () => {
      console.groupCollapsed("广播视频暂停");
      console.log("seek:", art.currentTime);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.PAUSE,
          time: Date.now(),
          changeMovieStatusReq: {
            playing: false,
            seek: art.currentTime,
            rate: art.playbackRate
          }
        })
      );
    };

    const publishPauseDebounce = playingStatusDebounce(publishPause);

    const setAndNoPublishPause = () => {
      if (art.video.paused) return;
      console.groupCollapsed("设置暂停(非广播)");
      console.log("seek:", art.currentTime);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      art.video.pause();
    };

    const publishRate = () => {
      console.groupCollapsed("广播视频倍速");
      console.log("seek:", art.currentTime);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHANGE_RATE,
          time: Date.now(),
          changeMovieStatusReq: {
            playing: !art.video.paused,
            seek: art.currentTime,
            rate: art.playbackRate
          }
        })
      );
    };

    const setAndNoPublishRate = (rate: number) => {
      if (art.option.isLive || art.playbackRate === rate) return;
      art.off("video:ratechange", publishRate);
      art.once("video:ratechange", () => {
        art.on("video:ratechange", publishRate);
      });
      console.groupCollapsed("设置倍速(非广播)");
      console.log("rate:", rate);
      console.groupEnd();
      art.playbackRate = rate;
    };

    const checkStatus = () => {
      // 距离上一次seek超过10s后才会检查seek
      if (
        Date.now() - lastestSeek < 10000 ||
        art.option.isLive ||
        art.duration - art.currentTime < 5
      ) {
        return;
      }
      console.groupCollapsed("检查状态");
      console.log("seek:", art.currentTime);
      console.log("rate:", art.playbackRate);
      console.log("playing:", !art.video.paused);
      console.groupEnd();
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHECK_STATUS,
          time: Date.now(),
          checkStatusReq: {
            playing: !art.video.paused,
            seek: art.currentTime,
            rate: art.playbackRate
          }
        })
      );
    };

    const checkExpire = () => {
      console.groupCollapsed("检查过期");
      console.log("expireId:", dynamicCurrentExpireId());
      console.groupEnd();
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHECK_EXPIRED,
          time: Date.now(),
          expireId: dynamicCurrentExpireId()
        })
      );
    };

    const setAndNoPublishStatus = async (status: MovieStatus) => {
      console.groupCollapsed("设置状态(不广播)");
      console.log("seek:", status.seek);
      console.log("rate:", status.rate);
      console.log("playing:", status.playing);
      console.groupEnd();
      if (!art.option.isLive) {
        setAndNoPublishRate(status.rate);
        setAndNoPublishSeek(status.seek);
      }
      status.playing ? await setAndNoPublishPlay() : setAndNoPublishPause();
    };

    const currentStatus = (): MovieStatus => {
      return {
        playing: !art.video.paused,
        seek: art.currentTime,
        rate: art.playbackRate
      };
    };

    const intervals: number[] = [];
    const watchers: WatchStopHandle[] = [];
    art.on("destroy", () => {
      intervals.forEach((interval) => {
        clearInterval(interval);
      });
      watchers.forEach((watcher) => {
        watcher();
      });
    });

    if (!art.option.isLive) {
      art.once("ready", async () => {
        console.groupCollapsed("同步状态");
        console.log("seek:", initStatus.seek);
        console.log("rate:", initStatus.rate);
        console.log("playing:", initStatus.playing);
        console.groupEnd();
        art.currentTime = initStatus.seek;
        art.playbackRate = initStatus.rate;
        if (initStatus.playing) {
          await artPlay(art);
        }

        intervals.push(setInterval(checkStatus, 10000));
        intervals.push(setInterval(checkExpire, 10000));

        newSyncControl(art, publishStatus);

        art.on("play", publishPlayDebounce);

        // 视频暂停
        art.on("pause", publishPauseDebounce);

        // 空降
        art.on("seek", publishSeekDebounce);

        // 倍速
        art.on("video:ratechange", publishRate);

        art.on("destroy", () => {
          art.off("play", publishPlayDebounce);
          art.off("pause", publishPauseDebounce);
          art.off("seek", publishSeekDebounce);
          art.off("video:ratechange", publishRate);
        });
      });
    } else {
      art.once("ready", () => {
        setAndNoPublishPlay();
        intervals.push(setInterval(checkExpire, 10000));
      });
    }

    return {
      name: "syncPlugin",
      setAndNoPublishSeek,
      setAndNoPublishPlay,
      setAndNoPublishPause,
      setAndNoPublishRate,
      setAndNoPublishStatus,
      currentStatus
    };
  };
};
