# node base image
FROM node:22-alpine AS vite-build

# set work directory
WORKDIR /frontend

# set environment variables
ENV PATH ./node_modules/.bin$PATH

# copy project
COPY . ./

# install and build vite app
RUN yarn install
RUN yarn build

# start and configure nginx 
FROM nginx:stable-alpine
COPY --from=vite-build /frontend/dist /usr/share/nginx/html
COPY /deployment/nginx.default.conf /etc/nginx/conf.d/default.conf