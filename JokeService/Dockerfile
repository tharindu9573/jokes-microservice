ARG BASE_URL

FROM node:slim

ENV BASE_URL=$BASE_URL
ENV NODE_ENV development

WORKDIR /express-docker

COPY . .

RUN npm install

CMD ["npm", "start"]

EXPOSE 3000