import { ObjectId } from 'mongodb';
import { getDB } from './connection.js';

// Generic DAO: the only layer that talks to MongoDB directly
class Repository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getCollection() {
    return getDB().collection(this.collectionName);
  }

  // Invalid ids can't match any document, so callers get null -> 404 instead of a driver error
  toObjectId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  }

  async findAll(filter = {}, sort = {}) {
    return await this.getCollection().find(filter).sort(sort).toArray();
  }

  async findById(id) {
    const _id = this.toObjectId(id);
    if (!_id) return null;
    return await this.getCollection().findOne({ _id });
  }

  async create(data) {
    const now = new Date();
    const document = { ...data, createdAt: now, updatedAt: now };
    const result = await this.getCollection().insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async update(id, data) {
    return await this.updateWhere(id, {}, { $set: data });
  }

  async delete(id) {
    return await this.deleteWhere(id, {});
  }

  // Atomic conditional update: applies only if the document also matches `conditions`
  async updateWhere(id, conditions, update) {
    const _id = this.toObjectId(id);
    if (!_id) return null;
    return await this.getCollection().findOneAndUpdate(
      { _id, ...conditions },
      { ...update, $set: { ...update.$set, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
  }

  async deleteWhere(id, conditions) {
    const _id = this.toObjectId(id);
    if (!_id) return false;
    const result = await this.getCollection().deleteOne({ _id, ...conditions });
    return result.deletedCount > 0;
  }
}

export default Repository;
