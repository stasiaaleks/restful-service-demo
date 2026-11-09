import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import CONFIG from '../src/constants/config.js';
import { connectDB, closeDB } from '../src/db/connection.js';

const articles = JSON.parse(await readFile(new URL('./articles.json', import.meta.url), 'utf8'));

const db = await connectDB();
const collection = db.collection(CONFIG.COLLECTIONS.ARTICLES);

const now = new Date();
await collection.deleteMany({});
await collection.insertMany(
  articles.map((article) => ({
    ...article,
    publishedAt: article.status === CONFIG.STATUS.DRAFT ? null : now,
    lock: null,
    createdAt: now,
    updatedAt: now
  }))
);

console.log(`Seeded ${articles.length} articles`);
await closeDB();
