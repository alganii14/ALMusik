# Use Node.js base image
FROM node:20-alpine

# Install yt-dlp and ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["npm", "start"]
