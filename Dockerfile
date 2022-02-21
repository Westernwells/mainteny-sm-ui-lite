FROM nginx:1.20.2

ARG ENV=stage
COPY build/ /usr/share/nginx/html
COPY "nginx.${ENV}.conf" /etc/nginx/nginx.conf
