FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=development /app/dist ./dist
COPY prisma ./prisma

RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main"]