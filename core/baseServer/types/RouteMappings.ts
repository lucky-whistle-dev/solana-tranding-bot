import { CustomMessage, CustomMessagePayload } from '@core/types/Log';


export type Route<T extends string, V extends string> = { [route in T]: BaseRoute<route, V> };

export interface BaseRoute<T extends string, V extends string> {
  key: T;
  name: `/${T}` | '/';
  subRouteMappings?: subRouteMappings<V>;
}

interface SubRouteMap<T extends string> {
  key: T;
  name: `/${T}` | '/';
  customConsoleMessages?: CustomMessage<{ [text: string]: CustomMessagePayload<Function> }>[];
}

type subRouteMappings<T extends string> = { [subRouteMapping in T]: SubRouteMap<subRouteMapping> };