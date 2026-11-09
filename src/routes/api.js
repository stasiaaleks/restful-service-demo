import express from 'express';
import ArticleController from '../controllers/articleController.js';

const articleController = new ArticleController();

const routes = [
  ['get', '/articles', articleController, 'getAll'],
  ['get', '/articles/:id', articleController, 'getById'],
  ['post', '/articles', articleController, 'create'],
  ['put', '/articles/:id', articleController, 'update'],
  ['delete', '/articles/:id', articleController, 'delete'],
  ['post', '/articles/:id/lock', articleController, 'lock'],
  ['delete', '/articles/:id/lock', articleController, 'unlock'],
  ['post', '/articles/:id/publish', articleController, 'publish'],
  ['post', '/articles/:id/unpublish', articleController, 'unpublish'],
  ['post', '/articles/:id/archive', articleController, 'archive'],
];

const router = express.Router();
router.use(express.json());

routes.forEach(([method, path, controller, action]) => {
  router[method](path, (req, res) => controller[action](req, res));
});

export default router;
