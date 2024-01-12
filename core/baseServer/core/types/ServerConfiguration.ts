export interface ServerConfiguration<T extends string> {
  port: number;
  name: `${T} api`;
  numOfCpus: number;
  version: string;
}

export interface ServerConfigMapping<T extends string> { 
  basePath: `/${string}`; 
  systems: { [server in T]: ServerConfiguration<server> };
}