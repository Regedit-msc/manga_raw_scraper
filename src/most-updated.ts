import * as cheerio from "cheerio";
import { mangaGeckoBaseUrl } from "./config";

type MostUpdated = {
  mangaUrl: string;
  imageUrl: string;
  title: string;
  status: string;
  mangaSource: string;
};

const mostUpdatedMangaGecko = async (page: string) => {
  const res = await fetch(`${mangaGeckoBaseUrl}/jumbo/manga/?results=${page}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mangas = $(".novel-list.grid > .novel-item").toArray();
  const theMangas = mangas.map((m) => {
    const title = $(m).find("a").attr("title") || "";
    const mangaUrl = $(m).find("a").attr("href") || "No Info";
    const imageUrl =
      $(m).find("a >.cover-wrap > figure > img").attr("data-src") || "";
    const status =
      $(m).find("a > .cover-wrap> figure > .status").text() || "No info";
    return {
      mangaUrl,
      imageUrl,
      title,
      status,
      mangaSource: mangaGeckoBaseUrl,
    };
  });
  return theMangas;
};

const mangasByMostUpdated = async (page: string): Promise<MostUpdated[]> => {
  const results = await Promise.all([mostUpdatedMangaGecko(page)]);
  return results.flat();
};

export default mangasByMostUpdated;
