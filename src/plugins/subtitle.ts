import { roomStore } from "@/stores/room";

const room = roomStore();
const SubtitleHtml =
  "<span style='background-color:#fff;color:#000;padding:2px 6px;border-radius:5px;font-size:14px;'>字幕</span>";

export const subtitle = (art: Artplayer) => {
  if (room.currentMovie.base.subtitles) {
    art.controls.add({
      name: "subtitle",
      html: SubtitleHtml,
      position: "right",
      selector: Object.keys(room.currentMovie.base.subtitles).map((key) => {
        return {
          html: key,
          url: room.currentMovie.base.subtitles![key].url
        };
      }),
      onSelect: function (item: { html: string; url: string }, $dom: any) {
        art.subtitle.switch(item.url);
        console.info(item, $dom);
        console.log(art.subtitle);

        return SubtitleHtml;
      }
    });
  }

  art.on("destroy", () => {
    if (art.controls["subtitle"]) art.controls.remove("subtitle");
  });

  return {
    name: "subtitles"
  };
};
