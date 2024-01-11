FROM node:18

RUN apt-get update
RUN apt-get install -y curl

WORKDIR /usr/src/solt

COPY core ./core
COPY solt ./solt

COPY moduleAlias.mjs \
    ServerConfigurations.ts \ 
    package.json \
    package-lock.json \
    gruntfile.cjs \
    tsconfig.json ./

RUN npm ci
RUN npm run build:all

EXPOSE 1234
CMD ["npm", "run", "start:solt"]