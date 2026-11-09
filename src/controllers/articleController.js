import ArticleService from '../services/articleService.js';
import CONFIG from '../constants/config.js';

// Express 5 leaves req.body undefined when a request has no JSON body
const body = (req) => req.body ?? {};

class ArticleController {
  constructor() {
    this.service = new ArticleService();
  }

  async getAll(req, res) {
    res.json(await this.service.getAllArticles());
  }

  async getById(req, res) {
    res.json(await this.service.getArticleById(req.params.id));
  }

  async create(req, res) {
    const article = await this.service.addArticle(body(req));
    res.status(CONFIG.HTTP_STATUS.CREATED).json(article);
  }

  async update(req, res) {
    const { user, ...fields } = body(req);
    res.json(await this.service.updateArticle(req.params.id, user, fields));
  }

  async delete(req, res) {
    const deleted = await this.service.deleteArticle(req.params.id, body(req).user);
    res.json({ deleted });
  }

  async lock(req, res) {
    res.json(await this.service.lockArticle(req.params.id, body(req).user));
  }

  async unlock(req, res) {
    res.json(await this.service.unlockArticle(req.params.id, body(req).user));
  }

  async publish(req, res) {
    res.json(await this.service.publishArticle(req.params.id, body(req).user));
  }

  async unpublish(req, res) {
    res.json(await this.service.unpublishArticle(req.params.id, body(req).user));
  }

  async archive(req, res) {
    res.json(await this.service.archiveArticle(req.params.id, body(req).user));
  }
}

export default ArticleController;
