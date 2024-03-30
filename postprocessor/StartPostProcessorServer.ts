import { serverConfiguration } from '../ServerConfigurations';
import { PostProcessorServer } from '@postprocessor/PostProcessorServer';


const server = new PostProcessorServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.postprocessor
);

try {
  server.startServer();
} catch (err) { console.log(err); }