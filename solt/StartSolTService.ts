import { SoltServer } from '@solt/SoltServer';
import { serverConfiguration } from '../ServerConfigurations';


const server = new SoltServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.solt.name,
  serverConfiguration.systems.solt.port,
  serverConfiguration.systems.solt.version,
  serverConfiguration.systems.solt.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }