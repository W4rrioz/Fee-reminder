# Production Dockerfile for EduManage Backend API
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY server ./server
COPY uploads ./uploads

EXPOSE 5000

ENV NODE_ENV=production
ENV USE_SUPABASE=true

CMD ["node", "server/index.js"]
