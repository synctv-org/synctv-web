import { ref, watch } from "vue";
import type { WatchStopHandle } from "vue";
import { roomStore } from "@/stores/room";
import { devLog } from "@/utils/utils";
import Notify from "@/utils/notify";
import { useDebounceFn } from "@vueuse/core";
import { WsMessageType } from "@/types/Room";
import { ElNotification, ElMessage } from "element-plus";
const room = roomStore();

interface callback {
  "set-player-status": (
    data: string | ArrayBuffer | Blob,
    useBuffer?: boolean | undefined
  ) => boolean;
  "ws-send": (msg: string) => void;
}

const debounceTime = 250;

export const sync = (cbk: callback) => {
  return (art: Artplayer) => {
    if (!art.option.isLive) {
      const publishSeek = useDebounceFn((currentTime: number) => {
        cbk["set-player-status"](
          JSON.stringify({
            Type: WsMessageType.SEEK,
            Seek: currentTime,
            Rate: art.playbackRate
          })
        );
        devLog("视频空降，:", art.currentTime);
      }, debounceTime);

      const setAndNoPublishSeek = (seek: number) => {
        art.currentTime = seek;
      };

      const publishPlayOrPause = useDebounceFn(() => {
        // devLog("视频播放,seek:", art.currentTime);
        if (art.playing) {
          cbk["set-player-status"](
            JSON.stringify({
              Type: WsMessageType.PLAY,
              Seek: art.currentTime,
              Rate: art.playbackRate
            })
          );
        } else {
          cbk["set-player-status"](
            JSON.stringify({
              Type: WsMessageType.PAUSE,
              Seek: art.currentTime,
              Rate: art.playbackRate
            })
          );
        }
      }, debounceTime);

      const setAndNoPublishPlayOrPause = (playing: boolean) => {
        devLog("视频播放(no publish),seek:", art.currentTime);
        if (playing) {
          art.off("play", publishPlayOrPause);
          art.once("play", () => {
            art.on("play", publishPlayOrPause);
          });
          art.play().catch(() => {
            art.muted = true;
            art.play();
            ElNotification({
              title: "温馨提示",
              message: "由于浏览器限制，播放器已静音，请手动开启声音"
            });
          });
        } else {
          art.off("pause", publishPlayOrPause);
          art.once("pause", () => {
            art.on("pause", publishPlayOrPause);
          });
          art.pause();
        }
      };

      const publishRate = () => {
        cbk["set-player-status"](
          JSON.stringify({
            Type: WsMessageType.RATE,
            Seek: art.currentTime,
            Rate: art.playbackRate
          })
        );
        devLog("视频倍速,seek:", art.currentTime);
      };

      const setAndNoPublishRate = (rate: number) => {
        art.off("video:ratechange", publishRate);
        art.once("video:ratechange", () => {
          art.on("video:ratechange", publishRate);
        });
        art.playbackRate = rate;
      };
      setTimeout(() => {
        setAndNoPublishSeek(room.currentMovieStatus.seek);
        console.log("seek同步成功:", art.currentTime);

        setAndNoPublishRate(room.currentMovieStatus.rate);
        console.log("rate同步成功:", art.playbackRate);

        setAndNoPublishPlayOrPause(room.currentMovieStatus.playing);
        cbk["ws-send"]("PLAYER：视频已就绪");
      }, 0);

      art.on("play", publishPlayOrPause);

      // 视频暂停
      art.on("pause", publishPlayOrPause);

      // 空降

      art.on("seek", publishSeek);

      // 倍速
      art.on("video:ratechange", publishRate);

      const watchers: WatchStopHandle[] = [];

      watchers.push(
        watch(
          () => room.currentMovieStatus.playing,
          () => {
            if (room.currentMovieStatus.playing === art.playing) return;
            setAndNoPublishPlayOrPause(room.currentMovieStatus.playing);
          }
        )
      );

      watchers.push(
        watch(
          () => room.currentMovieStatus.seek,
          () => {
            devLog("seek变了：", room.currentMovieStatus.seek);
            setAndNoPublishSeek(room.currentMovieStatus.seek);
          }
        )
      );

      watchers.push(
        watch(
          () => room.currentMovieStatus.rate,
          () => {
            devLog("rate变了：", room.currentMovieStatus.rate);
            room.currentMovieStatus.rate === art.playbackRate
              ? void 0
              : setAndNoPublishRate(room.currentMovieStatus.rate);
          }
        )
      );

      art.on("destroy", () => {
        art.off("play", publishPlayOrPause);
        art.off("pause", publishPlayOrPause);
        art.off("seek", publishSeek);
        art.off("video:ratechange", publishRate);
        watchers.forEach((watcher) => watcher());
      });
    } else {
      art.play().catch(() => {
        art.muted = true;
        art.play();
        ElNotification({
          title: "温馨提示",
          message: "由于浏览器限制，播放器已静音，请手动开启声音"
        });
      });
      cbk["ws-send"]("PLAYER：视频已就绪");
    }
  };
};
