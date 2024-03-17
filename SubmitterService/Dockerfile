FROM node:slim

ENV NODE_ENV development

WORKDIR /express-docker

COPY . .

RUN npm install

CMD ["npm", "start"]

EXPOSE 1000