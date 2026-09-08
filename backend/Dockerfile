FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY index.js ./
COPY src ./src

ENV NODE_ENV=production

EXPOSE 5000

USER node

CMD ["npm", "start"]