# Running with Docker

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose v2)
- No local `npm install` required to run via Docker
- A `.env` file in the project root (see [Environment variables](#environment-variables))

## Environment variables

API keys are loaded from a `.env` file in the project root. Vite only exposes variables prefixed with `VITE_` to the client bundle.

1. Copy the template: `cp .env.example .env`
2. Replace placeholder values with your real API keys (see [`.env.example`](.env.example) for variable names)
3. Restart or rebuild after any change:
   - **Dev:** stop the container and run `docker compose --profile dev up` again
   - **Prod:** rebuild the image — env vars are baked in at build time, not at nginx runtime

| Mode | How env is loaded |
|------|-------------------|
| Dev (`docker:dev`) | `.env` is bind-mounted into the container; Vite reads it on dev-server start |
| Prod (`docker:prod`) | `VITE_*` values are passed as Docker build args from your host `.env` during `npm run build` inside the image |

For plain Docker prod builds (without Compose), pass build args explicitly:

```bash
docker build --target prod \
  --build-arg VITE_NEWS_API_KEY="$VITE_NEWS_API_KEY" \
  --build-arg VITE_THE_GUARDIAN_API_KEY="$VITE_THE_GUARDIAN_API_KEY" \
  --build-arg VITE_NEW_YORK_TIMES_API_KEY="$VITE_NEW_YORK_TIMES_API_KEY" \
  -t innoscriptia-case-study:prod .
```

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

- **Missing env vars on startup:** ensure `.env` exists (`cp .env.example .env`) and all `VITE_*` keys are set, then restart dev or rebuild prod
- **Prod env changes not applied:** rebuild with `docker compose --profile prod build --no-cache` — runtime `env_file` does not affect the static client bundle
- **Port already in use:** change the host port in `docker-compose.yml` (e.g. `5174:5173`) or use `-p 5174:5173` with plain Docker
- **HMR not updating:** ensure `vite.config.ts` has `server.watch.usePolling: true`
- **Stale `node_modules` in dev (Compose):** `docker compose --profile dev down -v` then restart
- **Stale `node_modules` in dev (plain Docker):** `docker volume rm innoscriptia_node_modules` then restart
