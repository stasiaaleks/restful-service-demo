import ArticleRepository from '../db/articleRepository.js';
import CONFIG from '../constants/config.js';
import HttpError from '../errors/httpError.js';

const { DRAFT, PUBLISHED, ARCHIVED } = CONFIG.STATUS;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

class ArticleService {
  constructor() {
    this.repository = new ArticleRepository();
  }

  validateFields({ title, author, content, tags = [] }) {
    if (![title, author, content].every(isNonEmptyString)) {
      throw HttpError.badRequest(CONFIG.ERRORS.REQUIRED_FIELDS);
    }
    if (!Array.isArray(tags) || !tags.every(isNonEmptyString)) {
      throw HttpError.badRequest(CONFIG.ERRORS.INVALID_TAGS);
    }
    return { title: title.trim(), author: author.trim(), content, tags: tags.map((tag) => tag.trim()) };
  }

  validateUser(user) {
    if (!isNonEmptyString(user)) {
      throw HttpError.badRequest(CONFIG.ERRORS.USER_REQUIRED);
    }
  }

  // Locked operations are a single conditional update; when it matches nothing, find out why
  async explainFailure(id, user, requiredStatus, statusMessage) {
    const article = await this.getArticleById(id);
    const { lock } = article;
    const now = new Date();

    if (lock && lock.owner !== user && lock.expiresAt > now) {
      const until = lock.expiresAt.toISOString().slice(0, 19).replace('T', ' ');
      throw HttpError.locked(`Article is locked by ${lock.owner} until ${until} UTC`);
    }
    if (lock?.owner !== user || lock.expiresAt <= now) {
      throw HttpError.locked(CONFIG.ERRORS.LOCK_REQUIRED);
    }
    if (requiredStatus && article.status !== requiredStatus) {
      throw HttpError.conflict(statusMessage ?? `Article is ${article.status}, expected ${requiredStatus}`);
    }
    throw HttpError.conflict('Article was modified concurrently, try again');
  }

  async getAllArticles() {
    return await this.repository.findAllSorted();
  }

  async getArticleById(id) {
    const article = await this.repository.findById(id);
    if (!article) {
      throw HttpError.notFound(CONFIG.ERRORS.ARTICLE_NOT_FOUND);
    }
    return article;
  }

  async addArticle(data) {
    const fields = this.validateFields(data);
    return await this.repository.create({ ...fields, status: DRAFT, publishedAt: null, lock: null });
  }

  async updateArticle(id, user, data) {
    this.validateUser(user);
    const fields = this.validateFields(data);
    const updated = await this.repository.updateLocked(id, user, DRAFT, fields);
    return updated ?? (await this.explainFailure(id, user, DRAFT, CONFIG.ERRORS.NOT_EDITABLE));
  }

  async deleteArticle(id, user) {
    this.validateUser(user);
    const deleted = await this.repository.deleteLocked(id, user);
    return deleted || (await this.explainFailure(id, user));
  }

  async lockArticle(id, user) {
    this.validateUser(user);
    const locked = await this.repository.acquireLock(id, user, CONFIG.LOCK_TTL_MS);
    return locked ?? (await this.explainFailure(id, user));
  }

  async unlockArticle(id, user) {
    this.validateUser(user);
    const unlocked = await this.repository.releaseLock(id, user);
    return unlocked ?? (await this.explainFailure(id, user));
  }

  async changeStatus(id, user, action, from, to, extraFields = {}) {
    this.validateUser(user);
    const updated = await this.repository.updateLocked(id, user, from, { status: to, ...extraFields });
    return updated ?? (await this.explainFailure(id, user, from, `Cannot ${action}: article must be ${from}`));
  }

  async publishArticle(id, user) {
    return await this.changeStatus(id, user, 'publish', DRAFT, PUBLISHED, { publishedAt: new Date() });
  }

  async unpublishArticle(id, user) {
    return await this.changeStatus(id, user, 'unpublish', PUBLISHED, DRAFT, { publishedAt: null });
  }

  async archiveArticle(id, user) {
    return await this.changeStatus(id, user, 'archive', PUBLISHED, ARCHIVED);
  }
}

export default ArticleService;
