FROM node:16 as downloader
WORKDIR /tmp

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
RUN npm run build

FROM nginx

COPY --from=downloader /tmp/build /usr/share/nginx/html