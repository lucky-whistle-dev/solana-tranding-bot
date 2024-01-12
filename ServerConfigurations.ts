import { ServerConfigMapping, ServerConfiguration } from '@core/baseServer/core/types/ServerConfiguration';


type ApplicableSystems = 'trader' | 'preprocessor' | 'analyzer';

export const systems: { [server in ApplicableSystems]: ServerConfiguration<server> } = {
  trader: {
    port: 1234,
    name: 'trader api',
    numOfCpus: 1,
    version: '0.0.1-dev'
  },
  preprocessor: {
    port: 1235,
    name: 'preprocessor api',
    numOfCpus: 1,
    version: '0.0.1-dev'
  },
  analyzer: {
    port: 1236,
    name: 'analyzer api',
    numOfCpus: 1,
    version: '0.0.1-dev'
  }
};

export const serverConfiguration: ServerConfigMapping<ApplicableSystems> = {
  basePath: '/b_v1',
  systems
};