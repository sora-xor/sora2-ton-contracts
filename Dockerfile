FROM nginxinc/nginx-unprivileged:1.27.0-alpine3.19

COPY ./dapp/dist /usr/share/nginx/html