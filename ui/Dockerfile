# multi-stage builds

## first part: build the app (need build dependencies)
FROM node:12.13-alpine AS build
ENV NPM_CONFIG_LOGLEVEL warn
ENV REACT_APP_ENDPOINT __BACKEND_URL__
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

## second part: expose the builded app (only static files)
FROM nginx:1.17-alpine
EXPOSE 80
WORKDIR /usr/share/nginx/html
COPY --from=build /app/build .
RUN sed -i \
  '/index.htm/a try_files $uri $uri/ /index.html =404;' \
  /etc/nginx/conf.d/default.conf
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY init.sh .
RUN chmod +x init.sh
CMD [ "./init.sh" ]
