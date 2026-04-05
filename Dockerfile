FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install root dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install client dependencies and build frontend
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY client ./client/
RUN cd client && npx vite build

COPY server ./server/
COPY .env.example ./

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node server/index.js"]
