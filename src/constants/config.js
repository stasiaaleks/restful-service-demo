const CONFIG = {
  PORT: process.env.PORT || 3002,
  MONGODB_URI: process.env.MONGODB_URI,
  LOCK_TTL_MS: (Number(process.env.LOCK_TTL_MINUTES) || 5) * 60 * 1000,

  COLLECTIONS: {
    ARTICLES: 'articles'
  },

  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },

  ERRORS: {
    REQUIRED_FIELDS: 'Title, author and content are required',
    INVALID_TAGS: 'Tags must be an array of strings',
    USER_REQUIRED: 'Field "user" is required',
    ARTICLE_NOT_FOUND: 'Article not found',
    LOCK_REQUIRED: 'You must hold the lock on this article to change it',
    NOT_EDITABLE: 'Only draft articles can be edited',
    DB_NOT_INITIALIZED: 'Database not initialized. Call connectDB first.'
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    LOCKED: 423,
    INTERNAL_SERVER_ERROR: 500
  }
};

export default CONFIG;
