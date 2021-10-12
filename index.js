import cheerio from "cheerio";
import fetch from "node-fetch";
const baseUrl = "https://www.manga-raw.club";

async function newManga() {
  const res = await fetch(baseUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const newManga = $(".container.vspace").toArray()[1];
  const children = newManga.children.filter((v, i) => i !== 0);
  const mangaListContainer = $(children[2]).children(".novel-list")[0];
  const newmangaList = $(mangaListContainer).find(".novel-item");
  const mangaLi = newmangaList.toArray().map((m) => m);
  const arrayOfManga = mangaLi.map((m, i) => {
    const title = $(m).find("a").attr("title");
    const mangaUrl = $(m).find("a").attr("href");
    const imageUrl = $(m).find("a > figure > img").attr("data-src");
    return {
      title,
      mangaUrl,
      imageUrl,
    };
  });

  console.log(arrayOfManga, "New manga");
}
newManga();
