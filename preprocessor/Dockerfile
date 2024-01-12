FROM buildapi

COPY core ./core
COPY common ./common
COPY config ./config
COPY preprocessor ./preprocessor

RUN npm run build:all

EXPOSE 1235

CMD ["npm", "run", "start:preprocessor"]