const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="18">
    <path fill="#fff" d="M256 80C149.9 80 62.4 159.4 49.6 262c9.4-3.8 19.6-6 30.4-6c26.5 0 48 21.5 48 48l0 128c0 26.5-21.5 48-48 48c-44.2 0-80-35.8-80-80l0-16 0-48 0-48C0 146.6 114.6 32 256 32s256 114.6 256 256l0 48 0 48 0 16c0 44.2-35.8 80-80 80c-26.5 0-48-21.5-48-48l0-128c0-26.5 21.5-48 48-48c10.8 0 21 2.1 30.4 6C449.6 159.4 362.1 80 256 80z"/>
</svg>`;

export default function artplayerPluginAudioTrack() {
  return (art: any) => {
    function update() {
      const hls = art.hls;
      const auto = "自动";
      const title = "音轨";

      let defaultTrack: any;
      let defaultHtml;
      let currentTrack;
      let selector: any;
      let onSelect: any;
      if (hls) {
        const audioTracks = hls.audioTracks;
        currentTrack = hls.audioTrack;
        defaultTrack = audioTracks[currentTrack];
        const getName = (track: any) => {
          return track.name || track.lang || track.language || auto;
        };
        defaultHtml = defaultTrack ? getName(defaultTrack) : auto;
        selector = audioTracks.map((item: any, index: any) => {
          return {
            html: getName(item),
            id: item.id,
            default: defaultTrack === item
          };
        });
        onSelect = (item: any) => {
          hls.audioTrack = item.id;
          art.loading.show = true;
          return item.html;
        };
      }

      if (!selector || selector.length <= 1) {
        if (art.controls["audio"]) art.controls.remove("audio");
        if (art.setting.find("audio")) art.setting.remove("audio");
        return;
      }

      art.controls.update({
        name: "audio",
        position: "right",
        html: defaultHtml,
        style: { padding: "0 10px" },
        selector,
        onSelect
      });

      art.setting.update({
        name: "audio",
        tooltip: defaultHtml,
        html: title,
        icon: image,
        width: 200,
        selector,
        onSelect
      });
    }

    art.on("ready", update);
    art.on("restart", update);

    return {
      name: "artplayerPluginAudioTrack"
    };
  };
}
