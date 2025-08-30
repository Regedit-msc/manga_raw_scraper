import * as cheerio from "cheerio";
import { batoToBaseUrl, mangaGeckoBaseUrl } from "./config";

type MangaFromUrl = {
  mangaImage: string;
  author: string;
  chapterNo: string;
  views: string;
  status: string;
  description: string;
  summary: string;
  chapterList: {
    chapterUrl: string;
    chapterTitle: string;
    dateUploaded: string;
  }[];
  genres: {
    genre: string;
    genreUrl: string;
  }[];
  recommendations: {
    title: string;
    mangaImage: string;
    mangaUrl: string;
  }[];
  mangaSource: string;
};

async function mangaFromMangaUrlMangaGecko(source: string, mangaUrl: string) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    Referer: source,
  };

  const mainUrl = new URL(mangaUrl, source).href;
  const chaptersUrl = new URL("all-chapters", mainUrl).href;

  const res = await fetch(mainUrl, { headers });
  const chapterRes = await fetch(chaptersUrl, { headers });
  const html = await res.text();
  const chapterHtml = await chapterRes.text();
  const ch$ = cheerio.load(chapterHtml);
  const $ = cheerio.load(html);
  const mangaImageDiv = $(".fixed-img");
  const mangaImage = mangaImageDiv.find("figure > img").attr("data-src") || "";
  const author = $(".main-head").find(".author > a").attr("title") || "";
  const chapters = $(".header-stats > span> strong").text();
  const views = $(".header-stats").find(":nth-child(2) > strong").text();
  const status = $(".header-stats").find(":nth-child(4) > strong").text() || "";
  const description = $(".description").text().trim() || "";
  const summary = $(".summary").text().replace("Summary", "") || "";
  const chapterListContainer = ch$(".chapter-list > li").toArray();
  const genresList = $(".categories > ul > li").toArray();
  const recommendationsContainer = $(".section-body > ul > li").toArray();
  const recommendations = recommendationsContainer.map((e) => {
    const title = $(e).find("a").attr("title") || "";
    const mangaImage = $(e).find("a > figure > img").attr("data-src") || "";
    const mangaUrl = $(e).find("a").attr("href") || "";
    return { title, mangaImage, mangaUrl };
  });
  const genres = genresList.map((v) => {
    const genre = $(v).find("a").text().trim() || "";
    const genreUrl = $(v).find("a").attr("href") || "";
    return { genre, genreUrl };
  });
  const chapterList = chapterListContainer.map((c) => {
    const chapterUrl = ch$(c).find("a").attr("href") || "";
    const chapterTitle = ch$(c).find("a > .chapter-title").text().trim() || "";
    const dateUploaded = ch$(c).find("a > time").attr("datetime") || "";

    return { chapterUrl, chapterTitle, dateUploaded };
  });

  return {
    mangaImage,
    author,
    chapterNo: chapters ? chapters.split(" ")[1].split("-")[0] : "",
    views: views ? views.split(" ")[1].split("-")[0] : "",
    status,
    description,
    summary,
    chapterList,
    genres,
    recommendations,
    mangaSource: source,
  };
}

const mangaFromMangaUrlBatoTo = async (source: string, mangaUrl: string) => {
  const res = await fetch(source + mangaUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mangaImage = $(".attr-cover > img").attr("src") || "";
  const mangaInfoList = $(".attr-main > .attr-item").toArray();
  const episodeListContainer = $(".episode-list");
  const author = $(mangaInfoList[1]).find("a").text() || "";
  const views = $(mangaInfoList[0]).find("span").text() || "";
  const chapterNo = $(episodeListContainer)
    .find(".head > h4")
    .text()
    .split("(")[1]
    .slice(0, -1);
  const uploadStatus = $(mangaInfoList[8]).find("span").text() || "";
  const summary = $("#limit-height-body-summary > div").text() || "";

  const chapters = $(episodeListContainer).find(".main > .item").toArray();
  const chapterList = chapters.map((c) => {
    const chapterUrl = $(c).find("a").attr("href") || "";
    const chapterTitle = $(c).find("a > b").text() || "";
    const dateUploaded = $(c).find(".extra > i").text() || "";
    return { chapterUrl, chapterTitle, dateUploaded, mangaSource: source };
  });

  const genres = $(mangaInfoList[3]).find("span > span").toArray();
  const genreList = genres.map((g) => {
    const genre = $(g).text() || "";
    const genreUrl = "";
    return { genre, genreUrl };
  });

  return {
    mangaImage,
    author,
    chapterNo,
    views,
    status: uploadStatus,
    description: summary,
    summary,
    chapterList,
    genres: genreList,
    recommendations: [],
    mangaSource: source,
  };
};

const mangaFromMangaUrl = async (
  source: string,
  mangaUrl: string
): Promise<MangaFromUrl> => {
  let result: MangaFromUrl;

  switch (source) {
    case mangaGeckoBaseUrl:
      result = await mangaFromMangaUrlMangaGecko(source, mangaUrl);
      break;
    case batoToBaseUrl:
      result = await mangaFromMangaUrlBatoTo(source, mangaUrl);
      break;
    default:
      result = {
        mangaImage: "",
        author: "",
        chapterNo: "",
        views: "",
        status: "",
        description: "",
        summary: "",
        chapterList: [],
        genres: [],
        recommendations: [],
        mangaSource: "",
      };
      break;
  }

  return result;
};

export default mangaFromMangaUrl;
