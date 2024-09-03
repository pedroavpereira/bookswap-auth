FROM node:20

WORKDIR /app

COPY package*.json /app

RUN npm install

ENV PORT 5000
ENV NODE_ENV production

COPY . /app

EXPOSE 5000

CMD [ "node", "index.js" ]
