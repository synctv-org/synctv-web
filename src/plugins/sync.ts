import { ref, watch } from "vue";
import { roomStore } from "@/stores/room";
import { devLog } from "@/utils/utils";
import { useDebounceFn } from "@vueuse/core";
import { WsMessageType } from "@/types/Room";
import { ElNotification } from "element-plus";
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
    const publishSeek = useDebounceFn((currentTime: number) => {
      if (!room.currentMovie.live)
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
      art.off("seek", publishSeek);
      art.seek = seek;
      art.once("seek", () => {
        art.on("seek", publishSeek);
      });
    };

    const publishPlayOrPause = useDebounceFn(() => {
      // devLog("视频播放,seek:", art.currentTime);
      if (room.currentMovie.live) return;
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
        art.play();
        art.once("play", () => {
          art.on("play", publishPlayOrPause);
        });
      } else {
        art.off("pause", publishPlayOrPause);
        art.pause();
        art.once("pause", () => {
          art.on("pause", publishPlayOrPause);
        });
      }
    };

    const publishRate = () => {
      if (!room.currentMovie.live)
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
      art.playbackRate = rate;
      art.once("video:ratechange", () => {
        art.on("video:ratechange", publishRate);
      });
    };

    watch(
      () => room.currentMovieStatus.playing,
      () => {
        if (!art.option.isLive) {
          if (room.currentMovieStatus.playing === art.playing) return;
          setAndNoPublishPlayOrPause(room.currentMovieStatus.playing);
        }
      }
    );

    watch(
      () => room.currentMovieStatus.seek,
      () => {
        devLog("seek变了：", room.currentMovieStatus.seek);
        if (!room.currentMovie.live) setAndNoPublishSeek(room.currentMovieStatus.seek);
      }
    );

    watch(
      () => room.currentMovieStatus.rate,
      () => {
        devLog("rate变了：", room.currentMovieStatus.rate);

        if (!room.currentMovie.live) {
          room.currentMovieStatus.rate === art.playbackRate
            ? void 0
            : setAndNoPublishRate(room.currentMovieStatus.rate);
        }
      }
    );

    devLog("art.seek:", art.currentTime);
    devLog("room.seek:", room.currentMovieStatus.seek);

    art.once("ready", () => {
      // 必须设置静音，否则无法自动播放
      art.muted = true;
      ElNotification({
        title: "温馨提示",
        message: "由于浏览器限制，播放器已静音，请手动开启声音",
        type: "info"
      });

      if (!room.currentMovie.live) {
        setAndNoPublishSeek(room.currentMovieStatus.seek);
        console.log("seek同步成功:", art.currentTime);
      }

      // room.currentMovieStatus.playing
      //   ? setAndNoPublishPlayOrPause(true)
      //   : setAndNoPublishPlayOrPause(false);
      cbk["ws-send"]("PLAYER：视频已就绪");

      art.on("play", publishPlayOrPause);

      // 视频暂停
      art.on("pause", publishPlayOrPause);

      // 空降

      art.on("seek", publishSeek);

      // 倍速
      art.on("video:ratechange", publishRate);
    });
  };
};
