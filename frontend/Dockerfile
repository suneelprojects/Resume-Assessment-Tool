# Base image
FROM node:16 AS frontend-build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Clear cache and install dependencies
RUN rm -rf node_modules package-lock.json && npm cache clean --force && npm install

# Copy the rest of the code
COPY frontend/ .

# Build the application
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built files to Nginx directory
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
