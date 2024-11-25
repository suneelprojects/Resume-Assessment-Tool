# Stage 1: Build React app
FROM node:16 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Setup Nginx
FROM nginx:alpine

# Copy the React build output (dist folder) from the build stage to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port for Nginx
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]

