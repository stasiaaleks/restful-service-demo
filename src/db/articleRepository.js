import Repository from './repository.js';
import CONFIG from '../constants/config.js';

class ArticleRepository extends Repository {
  constructor() {
    super(CONFIG.COLLECTIONS.ARTICLES);
  }

  // Lock is held by `user` and has not expired yet
  heldBy(user) {
    return { 'lock.owner': user, 'lock.expiresAt': { $gt: new Date() } };
  }

  async findAllSorted(filter = {}) {
    return await this.findAll(filter, { createdAt: -1 });
  }

  // Succeeds if the article is unlocked, the lock expired, or `user` already holds it (renewal).
  // A single findOneAndUpdate makes check-and-set atomic, so two users can't both get the lock.
  async acquireLock(id, user, ttlMs) {
    const now = new Date();
    return await this.updateWhere(
      id,
      { $or: [{ lock: null }, { 'lock.expiresAt': { $lte: now } }, { 'lock.owner': user }] },
      { $set: { lock: { owner: user, acquiredAt: now, expiresAt: new Date(now.getTime() + ttlMs) } } }
    );
  }

  async releaseLock(id, user) {
    return await this.updateWhere(id, { 'lock.owner': user }, { $set: { lock: null } });
  }

  async updateLocked(id, user, requiredStatus, fields) {
    return await this.updateWhere(id, { ...this.heldBy(user), status: requiredStatus }, { $set: fields });
  }

  async deleteLocked(id, user) {
    return await this.deleteWhere(id, this.heldBy(user));
  }
}

export default ArticleRepository;
