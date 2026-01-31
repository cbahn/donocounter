# DonoCounter

Simple Express + MongoDB service for tracking and streaming donation cards.

## Requirements

- Node.js 24+
- MongoDB 6+

## Install

```sh
npm install
```

## Environment

Copy `.env.example` to `.env` and update as needed.

Required/used variables:

- `MONGO_URL` (default: `mongodb://localhost:27017/cards_app`)
- `DONATION_WEBHOOK_KEY` (default: `012345`)
- `PORT` (default: `3000`)
- `NODE_ENV` (default: `development`)

## Run (local)

```sh
npm run dev
```

Server listens on `http://localhost:3000` by default.

## Build + run (production)

```sh
npm run build
npm start
```

## Docker

The provided `docker-compose.yml` expects a MongoDB container already running
on an external network named `mynet`.

```sh
docker compose up --build
```

## Utilities

```sh
npm run seed
npm run init-indexes
```

## Health check

- `GET /healthz` verifies Mongo connectivity.
