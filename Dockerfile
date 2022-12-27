FROM node:16

COPY package.json ./
COPY package-lock.json ./
COPY app.js ./

RUN npm i

CMD ["node", "app.js"]

