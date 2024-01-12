import { serverConfiguration } from '../ServerConfigurations';
import { TraderServer } from '@trader/TraderServer';


const server = new TraderServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.trader.name,
  serverConfiguration.systems.trader.port,
  serverConfiguration.systems.trader.version,
  serverConfiguration.systems.trader.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }