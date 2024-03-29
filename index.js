const axios = require("axios");
const cheerio = require("cheerio");
const baseUrl = "https://www.mcreader.net";
const backUpUrl = "https://www.manga-raw.club";
const mangaUpdates = "/listy/manga/";
// const mangasByMostUpdatedPaginated1 = "/listt/manga/?results=";
const mangasByMostUpdatedPaginated = "/jumbo/manga/?results=";
const search2 = "/lmangasearch?inputContent=";
const search = "/api/v1/searchresults/?format=json&query=";
const fetch = async (url) => {
  const { data } = await axios.get(url);
  // console.log(data);
  return {
    ...data,
    text: () => {
      return data;
    },
  };
};

async function newManga() {
  const res = await fetch(baseUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const newManga = $("main > article .vspace .section-body").toArray()[0];
  // const newMangaDiv = $(newManga).children(".novel-list .grid");

  // const children = newManga.children.filter((v, i) => i !== 0);
  // const mangaListContainer = $(children[2]).children(".novel-list")[0];
  const newmangaList = $(newManga).find(".novel-item");
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
const mostViewed = async () => {
  const res = await fetch(backUpUrl + mangaUpdates);
  const html = await res.text();
  const $ = cheerio.load(html);
  const mostViewed = $(".section-body").toArray()[0];
  const mostViewedUl = $(mostViewed).find("div > ul .novel-item").toArray();
  const mostViewedMangaList = mostViewedUl.map((m, i) => {
    const title = $(m).find("a").attr("title");
    const mangaUrl = $(m).find("a").attr("href") ?? "No Info";
    const imageUrl = $(m).find("a > figure > img").attr("data-src");
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

const mostCliked = async () => {
  const res = await fetch(backUpUrl + mangaUpdates);
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

const mangasByMostUpdated = async (page) => {
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

const mangaFromMangaUrl = async (mangaUrl) => {
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
  const recommendationsContainer = $(".section-body > ul > li").toArray();
  const recommendations = recommendationsContainer.map((e, i) => {
    const title = $(e).find("a").attr("title");
    const mangaImage = $(e).find("a > figure > img").attr("data-src");
    const mangaUrl = $(e).find("a").attr("href");
    return { title, mangaImage, mangaUrl };
  });
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
  console.log({
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
  };
};

const mangaReader = async (chapterUrl) => {
  const res = await fetch(baseUrl + chapterUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  const imageChapterContainer = $(
    $("#chapter-reader").toArray()
  );
  const chapterListContainer = $(".chapternav").toArray()[0];
  const chapterListMainContainer = $(chapterListContainer)
    .find("select > option")
    .toArray();
  let chapterList = [];
  $(chapterListMainContainer).each((i, e) => {
    const chapter = $(e).attr("value");
    if (chapter != null && chapter != "") {
      chapterList.push(chapter);
    }
  });
  const finalImageArray = [];
  let chapter = $("title").text();
  $(imageChapterContainer)
    .find("img")
    .each((i, e) => {
      const image = $(e).attr("src");
      // chapter = $(e).attr("alt");
      finalImageArray.push(image);
    });
  console.log({ chapter, images: finalImageArray, chapterList });

  return { chapter, images: finalImageArray, chapterList };
};


const mangaByGenre = async (genreUrl) => {
  const res = await fetch(
    baseUrl + genreUrl.replace("/browse/", "/browse-comics/")
  );
  const html = await res.text();
  const $ = cheerio.load(html);
  const genreMangaContainer = $(".novel-list > li").toArray();
  const mangas = genreMangaContainer.map((v, i) => {
    const mangaUrl = $(v).find("a").attr("href");
    const mangaTitle = $(v).find("a").attr("title");
    const mangaImage =
      $(v).find("a > .cover-wrap > figure > img").attr("data-src") ??
      $(v).find("a > .cover-wrap > figure > img").attr("src");
    const author = $(v).find("a> h6").text().trim();
    const stats = $(v).find("a > .novel-stats > strong").text().trim();
    const summary = $(v).find("a > .summary").text().trim();
    return { mangaUrl, mangaTitle, mangaImage, author, stats, stats, summary };
  });
  return mangas;
};

const mangaSearch = async (term) => {
  const res = await fetch(backUpUrl + search2 + term);
  const $ = cheerio.load(res.resultview);
  const listOfResults = $(".novel-list.grid > .novel-item").toArray();
  const results = listOfResults.map((v, i) => {
    const mangaUrl = $(v).find("a").attr("href");
    const title = $(v).find("a").attr("title");
    const imageUrl = $(v).find("figure > img").attr("src");
    return { mangaUrl, title, imageUrl };
  });
  console.log(results);
  return results;
};


// mangaFromMangaUrl("/manga/return-of-the-legend/");
// mangaReader("/reader/en/return-of-the-legend-chapter-2-eng-li/");
// mangaSearch("work")

module.exports = {
  newManga,
  mangaByGenre,
  mangaReader,
  mangasByMostUpdated,
  mangaSearch,
  mangaFromMangaUrl,
  mostCliked,
  mostViewed,
};
