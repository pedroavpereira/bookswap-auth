FROM node:20

WORKDIR /app

COPY package*.json /app

RUN npm install

ENV PORT 5000
ENV NODE_ENV development
ENV DB_URL "postgresql://postgres.qlqsmadmjmmcipubfzwo:XnfwTzAs9BJeRucn@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
ENV SALT_ROUNDS 10
ENV SECRET_TOKEN testing

COPY . /app

EXPOSE 5000

CMD [ "node", "index.js" ]
