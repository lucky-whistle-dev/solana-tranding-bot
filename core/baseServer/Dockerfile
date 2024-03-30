FROM buildapi

COPY core ./core

RUN npm run build:all

EXPOSE 7890

CMD [ "npm", "run", "start:baseServer"]