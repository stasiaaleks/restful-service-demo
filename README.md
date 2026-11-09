# Articles RESTful Service

REST API for articles on Node.js, Express 5 and MongoDB: CRUD, a publish workflow and pessimistic locking.

## Run

```bash
cp .env.example .env
make install
make db-up    # MongoDB on localhost:27018
make seed     # sample articles (wipes the collection)
make dev      # http://localhost:3002/api/articles
```

## API

Base URL: `http://localhost:3002/api`

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/articles` | | All articles |
| GET | `/articles/:id` | | One article |
| POST | `/articles` | `title, author, content, tags?` | Create a draft |
| PUT | `/articles/:id` | `user, title, author, content, tags?` | Edit a draft |
| DELETE | `/articles/:id` | `user` | Delete |
| POST | `/articles/:id/lock` | `user` | Lock for editing |
| DELETE | `/articles/:id/lock` | `user` | Unlock |
| POST | `/articles/:id/publish` | `user` | draft → published |
| POST | `/articles/:id/unpublish` | `user` | published → draft |
| POST | `/articles/:id/archive` | `user` | published → archived |

## Business logic

**Workflow:** `draft → published → archived`, plus `published → draft`. Only drafts can be edited.

**Locking:** to edit, delete or change status, the user must lock the article first. A successful change releases the lock, so the next change needs a new lock. To give up a lock without saving, call `DELETE /articles/:id/lock`. The lock expires after `LOCK_TTL_MINUTES` (default 5). While one user holds the lock, everyone else gets `423 Locked`. Locking is a single atomic `findOneAndUpdate`, so two users can never get the same lock at once.

Errors are returned as `{ "error": "..." }` with status 400, 404, 409 or 423.

## Postman

Import `postman_collection.json` and run the collection in order. Each request checks its expected status code.
