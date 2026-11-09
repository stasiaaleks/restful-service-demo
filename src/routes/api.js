import express from 'express';
import articleRoutes from './articles.js';

const router = express.Router();
router.use(express.json());

router.use('/articles', articleRoutes);

export default router;
