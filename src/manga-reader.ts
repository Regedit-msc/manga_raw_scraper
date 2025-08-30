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
  // Use browser-like headers to avoid server serving a reduced/JS-dependent page
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    Referer: source,
  } as const;

  const res = await fetch(source + chapterUrl, { headers });
  const html = await res.text();
  const $ = cheerio.load(html);
  const imageChapterContainer = $("#chapter-reader").toArray();
  const chapterListContainer = $(".chapternav").toArray()[0];
  const chapterListMainContainer = $(chapterListContainer)
    .find("select > option")
    .toArray();
  const chapterList: {
    chapterUrl: string;
    chapterTitle: string;
    mangaSource: string;
  }[] = [];
  $(chapterListMainContainer).each((_, e) => {
    const chapter = $(e).attr("value");
    if (chapter) {
      chapterList.push({
        chapterUrl: chapter,
        chapterTitle: $(e).text(),
        mangaSource: source,
      });
    }
  });
  const finalImageArray: string[] = [];
  let chapter = $("title").text();
  // Collect images accounting for lazy-loading attributes and <picture>/<source>
  const addImage = (url?: string | null) => {
    if (!url) return;
    let u = url.trim();
    if (!u) return;
    // Normalize relative URLs
    try {
      if (!/^https?:\/\//i.test(u)) {
        u = new URL(u, source).href;
      }
    } catch {
      // ignore malformed URLs
    }
    finalImageArray.push(u);
  };

  const container = $(imageChapterContainer);
  // 1) Standard <img> tags (src, data-src, data-original, data-lazy-src, srcset)
  container.find("img").each((_, e) => {
    const $img = $(e);
    const src =
      $img.attr("src") ||
      $img.attr("data-src") ||
      $img.attr("data-original") ||
      $img.attr("data-lazy-src");
    addImage(src);

    const srcset = $img.attr("srcset") || $img.attr("data-srcset");
    if (srcset) {
      const first = srcset.split(",")[0]?.trim().split(" ")[0];
      addImage(first);
    }
  });

  // 2) <picture><source srcset=...></picture>
  container.find("picture source").each((_, e) => {
    const srcset = $(e).attr("srcset") || $(e).attr("data-srcset");
    if (srcset) {
      const first = srcset.split(",")[0]?.trim().split(" ")[0];
      addImage(first);
    }
  });

  // 3) Some sites include <noscript> fallbacks with <img>; parse those too
  container.find("noscript").each((_, e) => {
    const inner = $(e).html();
    if (!inner) return;
    const _$ = cheerio.load(inner);
    _$("img").each((__, ie) => {
      const $img = _$(ie);
      const src =
        $img.attr("src") ||
        $img.attr("data-src") ||
        $img.attr("data-original") ||
        $img.attr("data-lazy-src");
      addImage(src);
      const srcset = $img.attr("srcset") || $img.attr("data-srcset");
      if (srcset) {
        const first = srcset.split(",")[0]?.trim().split(" ")[0];
        addImage(first);
      }
    });
  });

  // Dedupe while preserving order
  const seen = new Set<string>();
  const deduped = finalImageArray.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
  return { chapter, images: deduped, chapterList, mangaSource: source };
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
