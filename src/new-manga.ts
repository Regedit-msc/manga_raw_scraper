import * as cheerio from "cheerio";
import { mangaGeckoBaseUrl } from "./config";

type NewManga = {
  mangaUrl: string;
  imageUrl: string;
  title: string;
  mangaSource: string;
};

const newMangaMangaGecko = async () => {
  const res = await fetch(mangaGeckoBaseUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const newManga = $("main > article .vspace .section-body").toArray()[0];
  const newmangaList = $(newManga).find(".novel-item");
  const mangaLi = newmangaList.toArray().map((m) => m);
  const arrayOfManga = mangaLi.map((m) => {
    const title = $(m).find("a").attr("title") || "";
    const mangaUrl = $(m).find("a").attr("href") || "";
    const imageUrl = $(m).find("a > figure > img").attr("data-src") || "";
    return { title, mangaUrl, imageUrl, mangaSource: mangaGeckoBaseUrl };
  });
  return arrayOfManga;
};

const newManga = async (): Promise<NewManga[]> => {
  const results = await Promise.all([newMangaMangaGecko()]);
  return results.flat();
};

export default newManga;
