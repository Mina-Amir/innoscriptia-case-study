FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
ARG VITE_NEWS_API_KEY
ARG VITE_THE_GUARDIAN_API_KEY
ARG VITE_NEW_YORK_TIMES_API_KEY
ENV VITE_NEWS_API_KEY=$VITE_NEWS_API_KEY
ENV VITE_THE_GUARDIAN_API_KEY=$VITE_THE_GUARDIAN_API_KEY
ENV VITE_NEW_YORK_TIMES_API_KEY=$VITE_NEW_YORK_TIMES_API_KEY
COPY . .
RUN npm run build

FROM nginx:alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
