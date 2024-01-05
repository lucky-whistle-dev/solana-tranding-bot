import { ServerConfigurations, ServerConfiguration } from '@core/baseServer/core/types/ServerConfiguration';


export const serverConfiguration: ServerConfigurations<Record<string, ServerConfiguration>> = {
  baseServer: {
    port: 7890,
    name: 'Base Server',
    numOfCpus: 1,
    version: '0.1'
  }
}