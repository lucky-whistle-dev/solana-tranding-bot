import { ServerConfiguration } from '@core/baseServer/core/types/ServerConfiguration';


type ApplicableServers = 'baseServer';

export const serverConfiguration: { [server in ApplicableServers]: ServerConfiguration<server> } = {
  baseServer: {
    port: 7890,
    name: 'baseServer api',
    numOfCpus: 1,
    version: '0.1'
  }
};