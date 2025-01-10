import * as cheerio from "cheerio";
import { batoToBaseUrl, mangaGeckoBaseUrl } from "./config";

type MangaReader = {
  chapter: string;
  images: string[];
  chapterList: {
    chapterUrl: string;
    chapterTitle: string;
  }[];
  mangaSource: string;
};

async function mangaReaderMangaGecko(source: string, chapterUrl: string) {
  const res = await fetch(source + chapterUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const imageChapterContainer = $("#chapter-reader").toArray();
  const chapterListContainer = $(".chapternav").toArray()[0];
  const chapterListMainContainer = $(chapterListContainer)
    .find("select > option")
    .toArray();
  const chapterList: { chapterUrl: string; chapterTitle: string }[] = [];
  $(chapterListMainContainer).each((_, e) => {
    const chapter = $(e).attr("value");
    if (chapter) {
      chapterList.push({ chapterUrl: chapter, chapterTitle: $(e).text() });
    }
  });
  const finalImageArray: string[] = [];
  let chapter = $("title").text();
  $(imageChapterContainer)
    .find("img")
    .each((_, e) => {
      const image = $(e).attr("src");
      if (image) {
        finalImageArray.push(image);
      }
    });
  return { chapter, images: finalImageArray, chapterList, mangaSource: source };
}

const mangaReaderBatoTo = async (source: string, chapterUrl: string) => {
  const res = await fetch(source + chapterUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  let chapter;
  const chapterList: { chapterUrl: string; chapterTitle: string }[] = [];
  $(".nav-epis > select > optgroup > option").each((_, e) => {
    const chapterLink = "/chapter/" + $(e).attr("value") || "";
    const chapterTitle = $(e).text().trim();
    if (chapterUrl.includes(chapterLink)) {
      chapter = chapterTitle;
    }
    chapterList.push({ chapterUrl: chapterLink, chapterTitle });
  });

  const images: string[] = [];
  const imageScript = $("script:not([src])").toArray();
  const imageScriptCode = imageScript[1].children[0];

  const imageScriptCodeText = (imageScriptCode as unknown as { data: string })
    .data;
  if (imageScriptCodeText) {
    const imageCode = imageScriptCodeText
      .split("imgHttps = [")[1]
      .split("];")[0];
    const imageList = imageCode.split(",");
    imageList.forEach((image) => {
      const imageUrl = image.replace(/"/g, "");
      images.push(imageUrl);
    });
  }
  return {
    chapter: chapter || "",
    images,
    chapterList,
    mangaSource: source,
  };
};

const mangaReader = async (
  source: string,
  chapterUrl: string
): Promise<MangaReader> => {
  let result: MangaReader;

  switch (source) {
    case mangaGeckoBaseUrl:
      result = await mangaReaderMangaGecko(source, chapterUrl);
      break;
    case batoToBaseUrl:
      result = await mangaReaderBatoTo(source, chapterUrl);
      break;
    default:
      result = {
        chapter: "",
        images: [],
        chapterList: [],
        mangaSource: source,
      };
      break;
  }

  return result;
};

export default mangaReader;
