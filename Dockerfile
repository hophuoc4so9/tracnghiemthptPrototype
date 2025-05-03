# filepath: d:\MY-WORKPLACE\[2] code-projects\[1] school-projects\[2] test-projects\2025-05-03_prototype_TracNghiemTiengAnh\Dockerfile
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the backend folder into the container
COPY backend ./backend

# Copy the .env file
COPY .env .env

COPY wait-for-it.sh /app/wait-for-it.sh

RUN chmod +x /app/wait-for-it.sh
# Set the working directory to the backend folder
WORKDIR /app/backend

# Expose the application port
EXPOSE 5000

# Command to start the server
CMD ["nodemon", "app.js"]