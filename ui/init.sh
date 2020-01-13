#!/bin/sh

# replace backend URL to the one specified using env vars
sed -i "s~__BACKEND_URL__~$BACKEND_URL~g" /usr/share/nginx/html/static/js/*.js

# configure and start nginx
nginx
