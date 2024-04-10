import type Artplayer from "artplayer";

interface artplayPluginSource {
  url: string;
  html: string;
}

function artplayPluginSource(option: [artplayPluginSource]) {
  return (art: Artplayer) => {
    const storageSource = art.storage.get("source");
    art.controls.add({
      position: "right",
      html: storageSource || "源",
      selector: option,
      onSelect: function (item: artplayPluginSource) {
        art.switchQuality(item.url);
        art.storage.set("source", item.html);
        return item.html;
      }
    });
    if (storageSource) {
      const source = option.find((item) => item.html === storageSource);
      if (source) {
        art.url = source.url;
      } else {
        art.url = option[0].url;
      }
    } else {
      art.url = option[0].url;
    }
  };
}
