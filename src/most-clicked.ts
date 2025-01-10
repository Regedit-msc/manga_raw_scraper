import * as cheerio from "cheerio";
import { mangaGeckoBaseUrl } from "./config";

type MostClicked = {
  mangaUrl: string;
  imageUrl: string;
  title: string;
  score: string;
  mangaSource: string;
};

const mostClickedMangaGecko = async () => {
  const res = await fetch(`${mangaGeckoBaseUrl}/jumbo/manga/`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mostClicked = $(".section-body").toArray()[1];
  const mostClickedUl = $(mostClicked).find("div > ul .novel-item").toArray();
  const mostClickedMangaList = mostClickedUl.map((m) => {
    const title = $(m).find("a").attr("title") || "";
    const mangaUrl = $(m).find("a").attr("href") || "No Info";
    const imageUrl = $(m).find("a > figure > img").attr("data-src") || "";
    const score = $(m).find("a > figure > .score").text() || "No info";
    return { mangaUrl, imageUrl, title, score, mangaSource: mangaGeckoBaseUrl };
  });
  return mostClickedMangaList;
};

const mostClicked = async (): Promise<MostClicked[]> => {
  const results = await Promise.all([mostClickedMangaGecko()]);
  return results.flat();
};

export default mostClicked;
