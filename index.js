import cheerio from "cheerio";
import fetch from "node-fetch";
const baseUrl = "https://www.manga-raw.club";
const mangaUpdates = "/listy/manga/";
const mangasByMostUpdatedPaginated = "/listy/manga/?results=";
const search = "/lmangasearch?inputContent=";

export async function newManga() {
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

  return arrayOfManga;
}

export const mostViewed = async () => {
  const res = await fetch(baseUrl + mangaUpdates);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mostViewed = $(".section-body").toArray()[0];
  const mostViewedUl = $(mostViewed).find("div > ul .novel-item").toArray();
  const mostViewedMangaList = mostViewedUl.map((m, i) => {
    const title = $(m).find("a").attr("title");
    const mangaUrl = $(m).find("a").attr("href") ?? "No Info";
    const imageUrl = $(m).find("a > figure > img").attr("src");
    const status = $(m).find("a > figure > .status").text() ?? "No info";
    return {
      mangaUrl,
      imageUrl,
      title,
      status,
    };
  });
  return mostViewedMangaList;
};
export const mostCliked = async () => {
  const res = await fetch(baseUrl + mangaUpdates);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mostCliked = $(".section-body").toArray()[1];
  const mostClickedUl = $(mostCliked).find("div > ul .novel-item").toArray();
  const mostClickedMangaList = mostClickedUl.map((m, i) => {
    const title = $(m).find("a").attr("title");
    const mangaUrl = $(m).find("a").attr("href") ?? "No Info";
    const imageUrl = $(m).find("a > figure > img").attr("data-src");
    const score = $(m).find("a > figure > .score").text() ?? "No info";
    return {
      mangaUrl,
      imageUrl,
      title,
      score,
    };
  });
  return mostClickedMangaList;
};

export const mangasByMostUpdated = async (page) => {
  const res = await fetch(baseUrl + mangasByMostUpdatedPaginated + page);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mangas = $(".novel-list.grid > .novel-item").toArray();
  const theMangas = mangas.map((m, i) => {
    const title = $(m).find("a").attr("title");
    const mangaUrl = $(m).find("a").attr("href") ?? "No Info";
    const imageUrl = $(m)
      .find("a >.cover-wrap > figure > img")
      .attr("data-src");
    const status =
      $(m).find("a > .cover-wrap> figure > .status").text() ?? "No info";
    return {
      mangaUrl,
      imageUrl,
      title,
      status,
    };
  });
  return theMangas;
};

export const mangaFromMangaUrl = async (mangaUrl) => {
  const res = await fetch(baseUrl + mangaUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mangaImageDiv = $(".fixed-img");
  const mangaImage = mangaImageDiv.find("figure > img").attr("data-src");
  const author = $(".main-head").find(".author > a").attr("title");
  const chapters = $(".header-stats > span> strong").text();
  const views = $(".header-stats").find(":nth-child(2) > strong").text();
  const status = $(".header-stats").find(":nth-child(4) > strong").text();
  const description = $(".description").text();
  const summary = $(".summary").text().replace("Summary", "");
  const chapterListContainer = $(".chapter-list > li").toArray();
  const genresList = $(".categories > ul > li").toArray();
  const genres = genresList.map((v, i) => {
    const genre = $(v).find("a").text().trim();
    const genreUrl = $(v).find("a").attr("href");
    return {
      genre,
      genreUrl,
    };
  });
  const chapterList = chapterListContainer.map((c, i) => {
    const chapterUrl = $(c).find("a").attr("href");
    const chapterTitle = $(c).find("a").attr("title");
    const dateUploaded = $(c).find("a > time").attr("datetime");
    return {
      chapterUrl,
      chapterTitle,
      dateUploaded,
    };
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
  };
};

export const mangaReader = async (chapterUrl) => {
  const res = await fetch(baseUrl + chapterUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const imageChapterContainer = $(".page-in >div").toArray()[1];
  const finalImageArray = [];
  let chapter;
  $(imageChapterContainer)
    .find("center>img")
    .each((i, e) => {
      const image = $(e).attr("src");
      chapter = $(e).attr("alt");
      console.log(image);
      finalImageArray.push(image);
    });
  return { chapter, images: finalImageArray };
};

export const mangaByGenre = async (genreUrl) => {
  const res = await fetch(baseUrl + genreUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const genreMangaContainer = $(".novel-list > li").toArray();
  const mangas = genreMangaContainer.map((v, i) => {
    const mangaUrl = $(v).find("a").attr("href");
    const mangaTitle = $(v).find("a").attr("title");
    const mangaImage = $(v).find("a > .cover-wrap > figure > img").attr("src");
    const author = $(v).find("a> h6").text().trim();
    const stats = $(v).find("a > .novel-stats > strong").text().trim();
    const summary = $(v).find("a > .summary").text().trim();
    return { mangaUrl, mangaTitle, mangaImage, author, stats, stats, summary };
  });
  return mangas;
};

export const mangaSearch = async (term) => {
  const res = await fetch(baseUrl + search + term);
  const json = await res.json();
  const $ = cheerio.load(json.resultview);
  const listOfResults = $(".novel-list.grid > .novel-item").toArray();
  const results = listOfResults.map((v, i) => {
    const mangaUrl = $(v).find("a").attr("href");
    const title = $(v).find("a").attr("title");
    const imageUrl = $(v).find("figure > img").attr("src");
    return { mangaUrl, title, imageUrl };
  });
  return results;
};