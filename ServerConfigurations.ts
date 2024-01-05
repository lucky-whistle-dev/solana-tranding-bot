import { 
  ServerConfigMapping, ServerConfigurations,ServerConfiguration 
} from '@core/baseServer/core/types/ServerConfiguration';


export const systems: ServerConfigurations<Record<string, ServerConfiguration>> = {
  solt: {
    port: 1234,
    name: 'SolT API',
    numOfCpus: 1,
    version: '0.0.1-dev'
  }
};

export const serverConfiguration: ServerConfigMapping = {
  basePath: '/b_v1',
  systems
};