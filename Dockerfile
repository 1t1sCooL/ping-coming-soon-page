# syntax=docker/dockerfile:1.7

FROM node:latest AS builder

COPY package.json ./

RUN --mount=type=secret,id=netrc,target=/root/.netrc \
    npm install

COPY . .

RUN --mount=type=secret,id=netrc,target=/root/.netrc \
    npm run build

FROM nginx

COPY --from=builder /dist /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d
COPY nginx/.htpasswd /etc/nginx/

RUN chown 1000:1000 -R /usr/share \
 && chmod 755 -R /usr/share \
 && chown 1000:1000 -R /var/cache \
 && chmod 777 -R /var/cache \
 && chown 1000:1000 -R /etc/nginx \
 && chown 1000:1000 -R /var/log/nginx \
 && touch /var/run/nginx.pid \
 && chown 1000:1000 /var/run/nginx.pid

EXPOSE 8090
