FROM node:20-alpine AS build
ARG NG_CONFIG=production
WORKDIR /app

COPY package*.json ./
# --legacy-peer-deps: karma-jasmine-html-reporter@2.0.0 pins jasmine-core@^4
# while the project uses jasmine-core@5. These are test-only deps and don't
# affect the prod build output, so ignore the conflict at install time.
RUN npm ci --legacy-peer-deps

COPY . ./

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
