import { serverConfiguration } from '../ServerConfigurations';
import { PreProcessorServer } from '@preprocessor/PreProcessorServer';


const server = new PreProcessorServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.preprocessor.name,
  serverConfiguration.systems.preprocessor.port,
  serverConfiguration.systems.preprocessor.version,
  serverConfiguration.systems.preprocessor.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }