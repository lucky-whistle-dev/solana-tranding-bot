export interface ServerConfiguration<T extends string> {
  name: `${T} api`;
  port: number;
  numOfCpus: number;
  version: string;
  staticFilesDir?: string;
}

export interface ServerConfigMapping<T extends string> { 
  basePath: `/${string}`; 
  systems: { [server in T]: ServerConfiguration<server> };
}