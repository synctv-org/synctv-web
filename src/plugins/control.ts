import Artplayer from "artplayer";

// SVG icons
const qualityIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="18">
    <path fill="#fff" d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
</svg>`;

const audioIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="18">
    <path fill="#fff" d="M256 80C149.9 80 62.4 159.4 49.6 262c9.4-3.8 19.6-6 30.4-6c26.5 0 48 21.5 48 48l0 128c0 26.5-21.5 48-48 48c-44.2 0-80-35.8-80-80l0-16 0-48 0-48C0 146.6 114.6 32 256 32s256 114.6 256 256l0 48 0 48 0 16c0 44.2-35.8 80-80 80c-26.5 0-48-21.5-48-48l0-128c0-26.5 21.5-48 48-48c10.8 0 21 2.1 30.4 6C449.6 159.4 362.1 80 256 80z"/>
</svg>`;

function uniqBy(array: any[], property: string) {
  const seen = new Map();
  return array.filter((item) => {
    const key = item[property];
    if (key === undefined) {
      return true;
    }
    return !seen.has(key) && seen.set(key, 1);
  });
}

interface QualityLevel {
  height?: number;
  name?: string;
  qualityIndex?: number;
  level?: number;
}

interface AudioTrack {
  id?: number;
  name?: string;
  lang?: string;
  language?: string;
}

interface MediaProvider {
  getQualities(): QualityLevel[];
  getCurrentQuality(): number;
  setQuality(level: number | string): void;
  isAutoQuality?(): boolean;
  setAutoQuality?(enabled: boolean): void;

  getAudioTracks(): AudioTrack[];
  getCurrentAudioTrack(): number;
  setAudioTrack(trackId: number): void;
}

// Provider implementations
class HLSProvider implements MediaProvider {
  constructor(private hls: any) {}

  getQualities() {
    return this.hls.levels || [];
  }

  getCurrentQuality() {
    return this.hls.currentLevel;
  }

  setQuality(level: number) {
    this.hls.currentLevel = level;
  }

  getAudioTracks() {
    return this.hls.audioTracks || [];
  }

  getCurrentAudioTrack() {
    return this.hls.audioTrack;
  }

  setAudioTrack(trackId: number) {
    this.hls.audioTrack = trackId;
  }
}

class DASHProvider implements MediaProvider {
  constructor(private dash: any) {}

  getQualities() {
    return this.dash.getBitrateInfoListFor("video") || [];
  }

  getCurrentQuality() {
    return this.dash.getQualityFor("video");
  }

  isAutoQuality() {
    return this.dash.getSettings().streaming.abr.autoSwitchBitrate["video"];
  }

  setQuality(level: number | string) {
    if (level === "auto") {
      this.setAutoQuality(true);
    } else {
      this.setAutoQuality(false);
      this.dash.setQualityFor("video", level as number);
    }
  }

  setAutoQuality(enabled: boolean) {
    this.dash.updateSettings({
      streaming: {
        abr: {
          autoSwitchBitrate: {
            video: enabled
          }
        }
      }
    });
  }

  getAudioTracks() {
    return this.dash.getTracksFor("audio") || [];
  }

  getCurrentAudioTrack() {
    const current = this.dash.getCurrentTrackFor("audio");
    const tracks = this.getAudioTracks();
    return tracks.findIndex((track: any) => track === current);
  }

  setAudioTrack(trackId: number) {
    const tracks = this.getAudioTracks();
    this.dash.setCurrentTrack(tracks[trackId]);
  }
}

export default function artplayerPluginMediaControl() {
  return (art: Artplayer) => {
    const isMobile = Artplayer.utils.isMobile;

    function getProvider(): MediaProvider | null {
      if (art.hls) {
        return new HLSProvider(art.hls);
      }
      if ((art as any).dash) {
        return new DASHProvider((art as any).dash);
      }
      return null;
    }

    function updateQualityControl(provider: MediaProvider) {
      const qualities = provider.getQualities();
      if (!qualities.length) return;

      const auto = "自动";
      const title = "画质";

      const getName = (level: QualityLevel) => {
        if (level.name) return level.name;
        return level.height ? `${level.height}P` : auto;
      };

      const currentQuality = provider.getCurrentQuality();
      const isAuto = provider.isAutoQuality?.() ?? currentQuality === -1;
      const defaultLevel = qualities[currentQuality];
      const defaultHtml = isAuto ? auto : getName(defaultLevel);

      const selector = uniqBy(
        qualities.map((item, index) => ({
          html: getName(item),
          value: index,
          default: currentQuality === index && !isAuto
        })),
        "html"
      ).sort((a, b) => b.value - a.value);

      if (provider.setAutoQuality) {
        selector.push({
          html: auto,
          value: -1,
          default: isAuto
        });
      }

      updateControl("quality", title, defaultHtml, selector, qualityIcon, (item: any) => {
        provider.setQuality(item.value);
        art.loading.show = true;
        art.notice.show = `${title}: ${item.html}`;
        return item.html;
      });
    }

    function updateAudioControl(provider: MediaProvider) {
      const tracks = provider.getAudioTracks();
      if (!tracks.length) return;

      const title = "音轨";

      const getName = (track: AudioTrack) => {
        return track.name || track.lang || track.language || "未知";
      };

      const currentTrack = provider.getCurrentAudioTrack();
      const defaultTrack = tracks[currentTrack];
      const defaultHtml = getName(defaultTrack);

      const selector = uniqBy(
        tracks.map((item, index) => ({
          html: getName(item),
          value: index,
          default: currentTrack === index
        })),
        "html"
      );

      updateControl("audio", title, defaultHtml, selector, audioIcon, (item: any) => {
        provider.setAudioTrack(item.value);
        art.loading.show = true;
        art.notice.show = `${title}: ${item.html}`;
        return item.html;
      });
    }

    function updateControl(
      name: string,
      title: string,
      defaultHtml: string,
      selector: any[],
      icon: string,
      onSelect: (item: any) => string
    ) {
      if (selector.length <= 1) {
        if (art.controls[name]) art.controls.remove(name);
        if (art.setting.find(name)) art.setting.remove(name);
        return;
      }

      const updateControls = () => {
        if (!isMobile || art.fullscreen) {
          art.controls.update({
            name,
            position: "right",
            html: defaultHtml,
            style: { padding: "0 10px" },
            selector,
            onSelect
          });
        } else if (art.controls[name]) {
          art.controls.remove(name);
        }
      };

      updateControls();

      art.setting.update({
        name,
        tooltip: defaultHtml,
        html: title,
        icon,
        width: 200,
        selector,
        onSelect
      });
    }

    function update() {
      const provider = getProvider();
      if (!provider) return;

      updateQualityControl(provider);
      updateAudioControl(provider);
    }

    art.on("ready", update);
    art.on("restart", update);

    if (isMobile) {
      art.on("fullscreen", update);
    }

    return {
      name: "artplayerPluginMediaControl",
      update
    };
  };
}
