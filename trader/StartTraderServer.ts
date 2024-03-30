import { serverConfiguration } from '../ServerConfigurations';
import { TraderServer } from '@trader/TraderServer';


const server = new TraderServer(serverConfiguration.systems.trader);

try {
  server.startServer();
} catch (err) { console.log(err); }