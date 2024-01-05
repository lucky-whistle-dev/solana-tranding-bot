import { InitBaseServer } from '@core/baseServer/core/InitBaseServer';
import { serverConfiguration } from '@core/baseServer/ServerConfiguration';


const server = new InitBaseServer(
  serverConfiguration.baseServer.name,
  serverConfiguration.baseServer.port,
  serverConfiguration.baseServer.version,
  serverConfiguration.baseServer.numOfCpus,
);

server.startServer();