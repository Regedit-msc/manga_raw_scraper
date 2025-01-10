import * as cheerio from "cheerio";
import { mangaGeckoBaseUrl } from "./config";

type MangaByGenre = {
  mangaUrl: string;
  mangaTitle: string;
  mangaImage: string;
  author: string;
  stats: string;
  summary: string;
  mangaSource: string;
};

const mangaByGenreMangaGecko = async (source: string, genreUrl: string) => {
  const res = await fetch(source + genreUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const genreMangaContainer = $(".novel-list > li").toArray();
  const mangas = genreMangaContainer.map((v) => {
    const mangaUrl = $(v).find("a").attr("href") || "";
    const mangaTitle = $(v).find("a").attr("title") || "";
    const mangaImage =
      $(v).find("a > .cover-wrap > figure > img").attr("data-src") ||
      $(v).find("a > .cover-wrap > figure > img").attr("src") ||
      "";
    const author = $(v).find("a> h6").text().trim() || "";
    const stats = $(v).find("a > .novel-stats > strong").text().trim() || "";
    const summary = $(v).find("a > .summary").text().trim() || "";
    return {
      mangaUrl,
      mangaTitle,
      mangaImage,
      author,
      stats,
      summary,
      mangaSource: source,
    };
  });
  return mangas;
};

const mangaByGenre = async (
  source: string,
  genreUrl: string
): Promise<MangaByGenre[]> => {
  let result: MangaByGenre[];

  switch (source) {
    case mangaGeckoBaseUrl:
      result = await mangaByGenreMangaGecko(source, genreUrl);
      break;
    default:
      result = [];
      break;
  }
  return result;
};

export default mangaByGenre;
