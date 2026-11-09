import ArticleService from '../services/articleService.js';
import CONFIG from '../constants/config.js';

// Express 5 leaves req.body undefined when a request has no JSON body
const body = (req) => req.body ?? {};

class ArticleController {
  // Handlers are arrow functions, not regular methods
  // The router calls them (e.g. router.get('/', controller.getAll)),
  // and a regular method called that way loses `this`, so `this.service` would be undefined
  // Arrow functions always keep `this` pointing to the controller
  service = new ArticleService();

  getAll = async (req, res) => {
    res.json(await this.service.getAllArticles());
  };

  getById = async (req, res) => {
    res.json(await this.service.getArticleById(req.params.id));
  };

  create = async (req, res) => {
    const article = await this.service.addArticle(body(req));
    res.status(CONFIG.HTTP_STATUS.CREATED).json(article);
  };

  update = async (req, res) => {
    const { user, ...fields } = body(req);
    res.json(await this.service.updateArticle(req.params.id, user, fields));
  };

  delete = async (req, res) => {
    const deleted = await this.service.deleteArticle(req.params.id, body(req).user);
    res.json({ deleted });
  };

  lock = async (req, res) => {
    res.json(await this.service.lockArticle(req.params.id, body(req).user));
  };

  unlock = async (req, res) => {
    res.json(await this.service.unlockArticle(req.params.id, body(req).user));
  };

  publish = async (req, res) => {
    res.json(await this.service.publishArticle(req.params.id, body(req).user));
  };

  unpublish = async (req, res) => {
    res.json(await this.service.unpublishArticle(req.params.id, body(req).user));
  };

  archive = async (req, res) => {
    res.json(await this.service.archiveArticle(req.params.id, body(req).user));
  };
}

export default ArticleController;
