FROM buildapi

COPY core ./core
COPY common ./common
COPY config ./config
COPY analyzer ./analyzer

RUN npm run build:all

EXPOSE 1236

CMD ["npm", "run", "start:analyzer"]