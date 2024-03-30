import { serverConfiguration } from '../ServerConfigurations';
import { PreProcessorServer } from '@preprocessor/PreProcessorServer';


const server = new PreProcessorServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.preprocessor
);

try {
  server.startServer();
} catch (err) { console.log(err); }