FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npx", "nodemon", "--legacy-watch", "src/index.js"]
