import { serverConfiguration } from '../ServerConfigurations';
import { PostProcessorServer } from '@postprocessor/PostProcessorServer';


const server = new PostProcessorServer(serverConfiguration.systems.postprocessor);

try {
  server.startServer();
} catch (err) { console.log(err); }