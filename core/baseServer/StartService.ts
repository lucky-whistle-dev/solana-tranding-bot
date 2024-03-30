import { InitBaseServer } from '@core/baseServer/InitBaseServer';
import { serverConfiguration } from '@core/baseServer/ServerConfiguration';


const server = new InitBaseServer(serverConfiguration.baseServer);

try {
  server.startServer();
} catch (err) { console.log(err); }