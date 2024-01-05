export type ServerConfigurations<T> = { [ K in keyof T ]: ServerConfiguration };

export interface ServerConfiguration {
  port: number;
  name: string;
  numOfCpus: number;
  version: string;
}

export interface ServerConfigMapping { 
  basePath: `/${string}`; 
  systems: ServerConfigurations<Record<string, ServerConfiguration>>;
}