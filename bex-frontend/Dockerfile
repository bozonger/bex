# ===== Build Angular =====
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=production


# ===== Serve with Nginx =====
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add SPA config
RUN printf "server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files \$uri \$uri/ /index.html;\n\
  }\n\
}\n" > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/bex-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]