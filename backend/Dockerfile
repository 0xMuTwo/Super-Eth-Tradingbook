# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.18.0

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /usr/src/app
# Copy package.json and package-lock.json and install dependencies

COPY package*.json ./

RUN npm install
# Copy the rest of the source files

COPY . .
# Compile TypeScript to JavaScript

RUN npm run build
# Prepare production image
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV production
# Copy only the necessary files
COPY package*.json ./
RUN npm install --omit=dev
# Copy compiled JavaScript files from build stage
COPY --from=build /usr/src/app/dist /usr/src/app/dist
# Expose the port that the application listens on
EXPOSE 5001
# Run the application

CMD ["npm", "run", "start"]