import type Artplayer from "artplayer";

interface artplayPluginSource {
  url: string;
  html: string;
}

export function artplayPluginSource(option: artplayPluginSource[]) {
  return (art: Artplayer) => {
    art.controls.add({
      position: "right",
      html: "源",
      selector: option,
      onSelect: function (item: artplayPluginSource) {
        const status = art.plugins["syncPlugin"].currentStatus();
        art.once("video:canplay", () => {
          art.plugins["syncPlugin"].setAndNoPublishStatus(status);
        });
        art.url = item.url;
        return "源";
      }
    });
    return {
      name: "source"
    };
  };
}
