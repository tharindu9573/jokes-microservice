ARG RMQ_URL

FROM node:slim

ENV NODE_ENV development
ENV RMQ_URL=$RMQ_URL

WORKDIR /express-docker

COPY . .

RUN npm install

CMD ["npm", "start"]

EXPOSE 3001