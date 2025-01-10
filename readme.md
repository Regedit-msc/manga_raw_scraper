# Manga Raw Scraper

## Overview
This codebase scrapes manga data from multiple sources using TypeScript and Cheerio.

## Features
- Fetches newest and most viewed manga
- Retrieves manga by genre or query term
- Provides chapter details, manga metadata, and cover images

## Requirements
- Node.js >= 16
- Yarn (recommended) or npm

## Installation
```bash
   yarn
```
3. Build: 
```bash
yarn build
```

## Scripts
- __dev__: Run with `ts-node`
- __watch__: Watch and rebuild

## Usage
```js
import { mostViewed, newManga, mangaByGenre } from "@regedit-msc/manga_raw_scraper";

(async () => {
  const data = await mostViewed();
  console.log(data);
})();
```

## Contributing
1. Fork and clone
2. Create a feature branch
3. Open a PR

## License
MIT