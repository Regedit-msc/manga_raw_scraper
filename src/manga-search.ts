import * as cheerio from "cheerio";
import { mangaGeckoBaseUrl } from "./config";

type MangaSearch = {
  mangaUrl: string;
  imageUrl: string;
  title: string;
  mangaSource: string;
};

const mangaSearchMangaGecko = async (term: string) => {
  const res = await fetch(mangaGeckoBaseUrl + "/search/?search=" + term);
  const html = await res.text();
  const $ = cheerio.load(html);
  const listOfResults = $(".novel-list > .novel-item").toArray();
  const results = listOfResults.map((v) => {
    const mangaUrl = $(v).find("a").attr("href") || "";
    const title = $(v).find("a").attr("title") || "";
    const imageUrl = $(v).find("figure > img").attr("data-src") || "";
    return { mangaUrl, title, imageUrl, mangaSource: mangaGeckoBaseUrl };
  });
  return results;
};

const mangaSearch = async (term: string): Promise<MangaSearch[]> => {
  const results = await Promise.all([mangaSearchMangaGecko(term)]);
  return results.flat();
};

export default mangaSearch;
