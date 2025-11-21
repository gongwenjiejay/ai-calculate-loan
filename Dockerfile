# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and run build
COPY . .

# Run the application build (This creates the 'dist' folder)
RUN npm run build

# --- DEBUGGING STEP ---
# This command is added temporarily to confirm the contents of the 'dist' folder.
# If the path is wrong or empty, the build process failed.
RUN ls -l /app/dist 

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration file
# (Ensure this file contains the fix from the previous step: root /usr/share/nginx/html;)
COPY nginx.conf /etc/nginx/nginx.conf

# *** CRITICAL FIX/CONFIRMATION ***
# Copy the built application from the build stage to the correct location
# Nginx expects the files to be in /usr/share/nginx/html/ailoan
COPY --from=build /app/dist /usr/share/nginx/html/ailoan

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]