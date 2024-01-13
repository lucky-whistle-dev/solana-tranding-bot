FROM buildapi

COPY core ./core
COPY common ./common
COPY config ./config
COPY trader ./trader
COPY signals ./signals

RUN npm run build:all

EXPOSE 1234

CMD ["npm", "run", "start:trader"]