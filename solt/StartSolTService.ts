import { InitSolTService } from '@solt/InitSolTService';
import { serverConfiguration } from '../ServerConfigurations';


const server = new InitSolTService(
  serverConfiguration.basePath,
  serverConfiguration.systems.solt.name,
  serverConfiguration.systems.solt.port,
  serverConfiguration.systems.solt.version,
  serverConfiguration.systems.solt.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }