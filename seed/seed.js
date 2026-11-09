import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import CONFIG from '../src/constants/config.js';
import { connectDB, closeDB } from '../src/db/connection.js';
import ArticleRepository from '../src/db/articleRepository.js';

const articles = JSON.parse(await readFile(new URL('./articles.json', import.meta.url), 'utf8'));
const repository = new ArticleRepository();

await connectDB();
await repository.deleteAll();
const count = await repository.createMany(
  articles.map((article) => ({
    ...article,
    publishedAt: article.status === CONFIG.STATUS.DRAFT ? null : new Date(),
    lock: null
  }))
);

console.log(`Seeded ${count} articles`);
await closeDB();
