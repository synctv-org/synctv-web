import type Artplayer from "artplayer";
import type { ComponentOption } from "artplayer/types/component";

const newSubtitleHtml = (name: string): HTMLElement => {
  const SubtitleHtml = document.createElement("span");
  SubtitleHtml.style.backgroundColor = "#fff";
  SubtitleHtml.style.color = "#000";
  SubtitleHtml.style.padding = "2px 6px";
  SubtitleHtml.style.borderRadius = "5px";
  SubtitleHtml.style.fontSize = "14px";
  SubtitleHtml.innerText = name;
  return SubtitleHtml;
};

const newSubtitleControl = (
  subtitles: Record<
    string,
    {
      url: string;
      type: string;
    }
  >
): ComponentOption => {
  return {
    name: "subtitle",
    html: newSubtitleHtml("字幕"),
    position: "right",
    selector: Object.keys(subtitles).map((key) => {
      return {
        html: key,
        url: subtitles[key].url
      };
    }),
    onSelect(this: Artplayer, selector: any, element: HTMLElement, event: Event): void {
      console.log("切换字幕：", selector.url);
      this.subtitle.switch(selector.url);
      console.log(element);
    }
  };
};

export const newSubtitle = (
  subtitles: Record<
    string,
    {
      url: string;
      type: string;
    }
  >
): ((art: Artplayer) => unknown) => {
  return (art: Artplayer) => {
    if (!subtitles) return;
    art.once("ready", () => {
      if (art.controls["subtitle"]) {
        art.controls.remove("subtitle");
      }
      art.controls.add(newSubtitleControl(subtitles));
      return {
        name: "subtitles"
      };
    });
  };
};
