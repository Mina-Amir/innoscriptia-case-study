# Running with Docker

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose v2)
- No local `npm install` required to run via Docker

## Dev mode (hot reload)

Vite dev server with bind-mounted source for hot module replacement.

### With Docker Compose

```bash
npm run docker:dev
```

Or:

```bash
docker compose --profile dev up --build
```

### Without Docker Compose

```bash
docker build --target dev -t innoscriptia-case-study:dev .
docker run --rm -it \
  -p 5173:5173 \
  -v "$(pwd):/app" \
  -v innoscriptia_node_modules:/app/node_modules \
  --name innoscriptia-dev \
  innoscriptia-case-study:dev
```

- **URL:** http://localhost:5173
- **Stop (Compose):** `Ctrl+C` or `docker compose --profile dev down`
- **Stop (plain Docker):** `Ctrl+C` or `docker stop innoscriptia-dev`
- **Rebuild after dependency changes:** rebuild the image (`docker build --target dev ...`)

## Prod mode (nginx)

Builds static assets and serves them with nginx.

### With Docker Compose

```bash
npm run docker:prod
```

Or:

```bash
docker compose --profile prod up --build
```

### Without Docker Compose

```bash
docker build --target prod -t innoscriptia-case-study:prod .
docker run --rm -it \
  -p 8080:80 \
  --name innoscriptia-prod \
  innoscriptia-case-study:prod
```

- **URL:** http://localhost:8080
- **Stop (Compose):** `Ctrl+C` or `docker compose --profile prod down`
- **Stop (plain Docker):** `Ctrl+C` or `docker stop innoscriptia-prod`

## Useful commands

### Docker Compose

```bash
# Run in background
docker compose --profile dev up -d --build

# View logs
docker compose --profile dev logs -f

# Tear down
docker compose --profile dev down

# Build prod image only
docker compose --profile prod build
```

### Plain Docker

```bash
# Run dev in background (add -d to the docker run command above)

# View logs
docker logs -f innoscriptia-dev

# Remove named volume (stale deps)
docker volume rm innoscriptia_node_modules

# List running containers
docker ps
```

## Troubleshooting

- **Port already in use:** change the host port in `docker-compose.yml` (e.g. `5174:5173`) or use `-p 5174:5173` with plain Docker
- **HMR not updating:** ensure `vite.config.ts` has `server.watch.usePolling: true`
- **Stale `node_modules` in dev (Compose):** `docker compose --profile dev down -v` then restart
- **Stale `node_modules` in dev (plain Docker):** `docker volume rm innoscriptia_node_modules` then restart
