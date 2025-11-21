# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's html directory under /ailoan
# This matches the location /ailoan/ block in nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html/ailoan

# Copy custom Nginx configuration to replace the default main config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
