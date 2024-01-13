import { serverConfiguration } from '../ServerConfigurations';
import { PostProcessorServer } from '@postprocessor/PostProcessorServer';


const server = new PostProcessorServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.postprocessor.name,
  serverConfiguration.systems.postprocessor.port,
  serverConfiguration.systems.postprocessor.version,
  serverConfiguration.systems.postprocessor.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }