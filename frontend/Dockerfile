FROM node:20-bullseye

WORKDIR /app


# Copy dependency files first (better caching)
COPY package.json .

# Clear npm cache and install dependenci
RUN npm install


COPY . .

EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]
