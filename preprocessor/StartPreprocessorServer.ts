import { serverConfiguration } from '../ServerConfigurations';
import { PreprocessorServer } from '@preprocessor/PreprocessorServer';


const server = new PreprocessorServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.preprocessor.name,
  serverConfiguration.systems.preprocessor.port,
  serverConfiguration.systems.preprocessor.version,
  serverConfiguration.systems.preprocessor.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }