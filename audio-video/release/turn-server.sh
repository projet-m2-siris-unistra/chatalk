#!/bin/sh

# from: https://github.com/boldt/turn-server-docker-image
export MIN_PORT=50100
export MAX_PORT=50200
docker run \
  -d \
  -p 3478:3478 \
  -p 3478:3478/udp \
  -p ${MIN_PORT}-${MAX_PORT}:${MIN_PORT}-${MAX_PORT}/udp \
  -e USERNAME=chatalk \
  -e PASSWORD=xongah3ieR4ashie7aekeija \
  -e REALM=chatalk-fr \
  -e MIN_PORT=${MIN_PORT} \
  -e MAX_PORT=${MAX_PORT} \
  --restart=always \
  --name coturn \
  ludovicm67/coturn
