FROM node:18

RUN apt-get update
RUN apt-get install -y curl

WORKDIR /usr/src/baseserver

COPY ./core ./core
COPY package.json gruntfile.js tsconfig.json ./

RUN npm install
RUN npm run build:all

EXPOSE 7890

CMD [ "npm", "run", "start:baseServer"]