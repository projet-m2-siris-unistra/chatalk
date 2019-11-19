# multi-stage builds

## first part: build the app (need build dependencies)
FROM node:12.13-alpine AS build
ENV NPM_CONFIG_LOGLEVEL warn
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
COPY init.sh .
RUN chmod +x init.sh
CMD [ "./init.sh" ]
