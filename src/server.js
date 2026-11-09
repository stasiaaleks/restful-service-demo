import 'dotenv/config';
import express from 'express';
import CONFIG from './constants/config.js';
import { connectDB } from './db/connection.js';
import apiRoutes from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(CONFIG.HTTP_STATUS.NOT_FOUND).json({ error: 'Not found' });
});

app.use(errorHandler);

try {
  await connectDB();
  app.listen(CONFIG.PORT, () => {
    console.log(`Server running on http://localhost:${CONFIG.PORT}/api/articles`);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
