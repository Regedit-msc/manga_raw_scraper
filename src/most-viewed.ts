import * as cheerio from "cheerio";
import { batoToBaseUrl, mangaGeckoBaseUrl } from "./config";

type MostViewed = {
  mangaUrl: string;
  imageUrl: string;
  title: string;
  status: string;
  mangaSource: string;
};

const mostViewedBatoTo = async () => {
  const res = await fetch(batoToBaseUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mostViewed = $(".home-popular");
  const mainList = $(mostViewed).find(".item").toArray();
  const mostViewedMangaList = mainList.map((m) => {
    const title =
      $(m).find(".item-text > .item-text-inner > .item-title").text() || "";
    const mangaUrl = $(m).find("a").attr("href") || "No Info";
    const imageUrl = $(m).find("a > img").attr("src") || "";
    const status = "No info";
    return {
      mangaUrl,
      imageUrl,
      title,
      status,
      mangaSource: batoToBaseUrl,
    };
  });
  return mostViewedMangaList;
};

export async function mostViewedMangaGecko() {
  const res = await fetch(`${mangaGeckoBaseUrl}/jumbo/manga/`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mostViewed = $(".section-body").toArray()[0];
  const mainList = $(mostViewed).find("div > ul .novel-item").toArray();
  const mostViewedMangaList = mainList.map((m) => {
    const title = $(m).find("a").attr("title") || "No Info";
    const mangaUrl = $(m).find("a").attr("href") ?? "No Info";
    const imageUrl = $(m).find("a > figure > img").attr("data-src") || "";
    const status = $(m).find("a > figure > .status").text() ?? "No info";
    return {
      mangaUrl,
      imageUrl,
      title,
      status,
      mangaSource: mangaGeckoBaseUrl,
    };
  });
  return mostViewedMangaList;
}

const mostViewed = async (): Promise<MostViewed[]> => {
  const results = await Promise.all([
    mostViewedBatoTo(),
    mostViewedMangaGecko(),
  ]);
  return results.flat();
};

export default mostViewed;
