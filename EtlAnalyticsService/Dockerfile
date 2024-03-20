ARG BASE_URL
ARG RMQ_URL

FROM node:slim

ENV BASE_URL=$BASE_URL
ENV RMQ_URL=$RMQ_URL
ENV NODE_ENV development

WORKDIR /express-docker

COPY . .

RUN npm install

CMD ["npm", "start"]

EXPOSE 3301