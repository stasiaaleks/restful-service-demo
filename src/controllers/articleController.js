import ArticleService from '../services/articleService.js';
import CONFIG from '../constants/config.js';

// ? Known limitation: 
// Express 5 leaves req.body undefined when a request has no JSON body
// (no body, or Content-Type is not application/json)
// Reading req.body.user then throws and the client gets 500 instead of 400
// Not handled here, can be added later on demand
// https://github.com/expressjs/express/issues/6432

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
    const article = await this.service.addArticle(req.body);
    res.status(CONFIG.HTTP_STATUS.CREATED).json(article);
  };

  update = async (req, res) => {
    const { user, ...fields } = req.body;
    res.json(await this.service.updateArticle(req.params.id, user, fields));
  };

  delete = async (req, res) => {
    await this.service.deleteArticle(req.params.id, req.body.user);
    res.status(CONFIG.HTTP_STATUS.NO_CONTENT).end();
  };

  lock = async (req, res) => {
    res.json(await this.service.lockArticle(req.params.id, req.body.user));
  };

  unlock = async (req, res) => {
    res.json(await this.service.unlockArticle(req.params.id, req.body.user));
  };

  publish = async (req, res) => {
    res.json(await this.service.publishArticle(req.params.id, req.body.user));
  };

  unpublish = async (req, res) => {
    res.json(await this.service.unpublishArticle(req.params.id, req.body.user));
  };

  archive = async (req, res) => {
    res.json(await this.service.archiveArticle(req.params.id, req.body.user));
  };
}

export default ArticleController;
