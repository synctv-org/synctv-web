import type Artplayer from "artplayer";

interface artplayPluginSource {
  html: string;
  url: string;
  type: string;
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
        art.option.type = item.type;
        art.url = item.url;
        return "源";
      }
    });
    return {
      name: "source"
    };
  };
}
