import { serverConfiguration } from '../ServerConfigurations';
import { AnalyzerServer } from '@analyzer/AnalyzerServer';


const server = new AnalyzerServer(
  serverConfiguration.basePath,
  serverConfiguration.systems.analyzer.name,
  serverConfiguration.systems.analyzer.port,
  serverConfiguration.systems.analyzer.version,
  serverConfiguration.systems.analyzer.numOfCpus
);

try {
  server.startServer();
} catch (err) { console.log(err); }