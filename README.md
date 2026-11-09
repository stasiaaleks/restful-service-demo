# Articles RESTful Service

A REST API for articles built with Node.js, Express 5 and MongoDB. It has standard CRUD, a **publish workflow** and **pessimistic locking** for edits.

## Stack

- **Backend**: Node.js 20+ and Express 5 (ES modules)
- **Database**: MongoDB 7 (Docker) with the native `mongodb` driver
- **Build**: Make

## Architecture

```
routes/api.js                  route table -> controller methods
controllers/articleController  HTTP in/out (req -> service -> res)
services/articleService        validation + business rules (workflow, locks)
db/articleRepository           article-specific DAO queries
db/repository                  generic DAO (CRUD + atomic conditional update)
db/connection                  MongoClient singleton
```

Only the `db/` layer talks to MongoDB. Errors are thrown as `HttpError`, and `middleware/errorHandler` turns them into JSON:
`{ "error": "...", "timestamp": "..." }`.

## Installation

```bash
cp .env.example .env   # defaults work out of the box
make install
make db-up             # MongoDB on localhost:27018
make seed              # optional: 8 sample articles (wipes the collection)
make dev               # http://localhost:3002/api/articles
```

Other targets: `make db-down`, `make db-reset` (deletes data), `make db-shell`.

## API

Base URL: `http://localhost:3002/api`. All bodies are JSON (`Content-Type: application/json`).

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/articles` | – | All articles, newest first |
| GET | `/articles/:id` | – | One article |
| POST | `/articles` | `title, author, content, tags?` | Create (always a `draft`) |
| PUT | `/articles/:id` | `user, title, author, content, tags?` | Replace fields. Requires the lock and status `draft` |
| DELETE | `/articles/:id` | `user` | Delete. Requires the lock |
| POST | `/articles/:id/lock` | `user` | Acquire or renew the edit lock |
| DELETE | `/articles/:id/lock` | `user` | Release the lock (owner only) |
| POST | `/articles/:id/publish` | `user` | `draft` → `published`, sets `publishedAt` |
| POST | `/articles/:id/unpublish` | `user` | `published` → `draft` |
| POST | `/articles/:id/archive` | `user` | `published` → `archived` (read-only from then on) |

### Article

```json
{
  "_id": "6af1824fe392e336af16278e",
  "title": "Designing RESTful URLs",
  "author": "Maksym Bondarenko",
  "content": "...",
  "tags": ["rest", "api"],
  "status": "draft",
  "publishedAt": null,
  "lock": { "owner": "alice", "acquiredAt": "...", "expiresAt": "..." },
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Business logic

### Publish workflow

```
draft --publish--> published --archive--> archived
  ^                    |
  +-----unpublish------+
```

Only drafts can be edited. To change a published article, unpublish it first. Archived articles can only be deleted.

### Pessimistic locking

Every change to an existing article (edit, delete, status change) requires the caller to **hold the lock** first:

1. `POST /articles/:id/lock` with `{ "user": "alice" }` grants the lock for `LOCK_TTL_MINUTES` (default 5).
2. Alice edits and publishes, passing `"user": "alice"` in each request.
3. `DELETE /articles/:id/lock` releases the lock. If she forgets, it expires on its own.

While Alice holds the lock, every attempt by anyone else (including locking) gets **423 Locked**, along with the owner and expiry time. If the lock owner calls lock again, the TTL is renewed.

Acquiring a lock and every locked change are each a single `findOneAndUpdate` with the lock condition in the filter. Check and write happen atomically, so two concurrent `lock` requests can never both succeed.

### Status codes

| Code | When |
|---|---|
| 200 / 201 | Success / created |
| 400 | Missing or invalid fields, missing `user`, malformed JSON |
| 404 | Article doesn't exist (including malformed ids) |
| 409 | Status doesn't allow the operation (e.g. editing a published article) |
| 423 | Caller doesn't hold the lock, or someone else does |

## Testing with Postman

1. `GET {{baseUrl}}/articles` and copy the `_id` of a draft.
2. `POST {{baseUrl}}/articles/<id>/lock`, body `{ "user": "alice" }`.
3. Repeat step 2 with `"bob"`. You get `423`.
4. `PUT {{baseUrl}}/articles/<id>`, body `{ "user": "alice", "title": "...", "author": "...", "content": "..." }`.
5. `POST {{baseUrl}}/articles/<id>/publish`, then try the `PUT` again. You get `409`.
6. `DELETE {{baseUrl}}/articles/<id>/lock`, body `{ "user": "alice" }`.

For `DELETE` requests with a body, choose **Body → raw → JSON** in Postman.
