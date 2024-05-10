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
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHANGE_SEEK,
          time: Date.now(),
          // seek event dont publish playing status
          // because playing status will change when seeking
          changeMovieStatusReq: {
            seek: art.currentTime,
            rate: art.playbackRate
          }
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
      if (art.playing) return;
      await artPlay(art);
    };

    const publishPause = () => {
      console.log("视频暂停,seek:", art.currentTime);
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
      if (!art.playing) return;
      art.video.pause();
    };

    const publishRate = () => {
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHANGE_RATE,
          time: Date.now(),
          changeMovieStatusReq: {
            playing: art.playing,
            seek: art.currentTime,
            rate: art.playbackRate
          }
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

    const checkStatus = () => {
      // 距离上一次seek超过10s后才会检查seek
      if (Date.now() - lastestSeek < 10000 || art.option.isLive) return;
      art.duration - art.currentTime > 5 &&
        publishStatus(
          ElementMessage.create({
            type: ElementMessageType.CHECK_STATUS,
            time: Date.now(),
            checkStatusReq: {
              playing: art.playing,
              seek: art.currentTime,
              rate: art.playbackRate
            }
          })
        );
    };

    const checkExpire = () => {
      publishStatus(
        ElementMessage.create({
          type: ElementMessageType.CHECK_EXPIRED,
          time: Date.now(),
          expireId: dynamicCurrentExpireId()
        })
      );
    };

    const setAndNoPublishStatus = async (status: MovieStatus) => {
      if (!art.option.isLive) {
        setAndNoPublishRate(status.rate);
        setAndNoPublishSeek(status.seek);
      }
      status.playing ? await setAndNoPublishPlay() : setAndNoPublishPause();
    };

    const currentStatus = (): MovieStatus => {
      return {
        playing: art.playing,
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
        console.log("同步进度中...");
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
