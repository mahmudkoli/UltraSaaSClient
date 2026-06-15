FROM node:20-alpine AS build
ARG NG_CONFIG=production
WORKDIR /app

COPY package*.json ./
# --legacy-peer-deps: karma-jasmine-html-reporter pins jasmine-core@^4 while the
# project uses jasmine-core@5. Test-only deps; ignore the conflict at install.
RUN npm ci --legacy-peer-deps

COPY . ./

# On small VMs (t3.micro 1 GB RAM) Node auto-detects a tiny heap (~460 MB) and
# OOMs partway through `ng build`. Bump to 2 GB; host swap absorbs spikes.
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN npx ng build --configuration $NG_CONFIG

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/fuse /usr/share/nginx/html

# SPA fallback: all routes → index.html
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
