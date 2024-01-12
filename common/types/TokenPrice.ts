import { TokenAddress, TokenSymbol, TokenPricePayloadEventType, ChartType, Currency } from '@common/types/Token';


export type TokenPriceEvents = 'SUBSCRIBE_PRICE' | 'PRICE_DATA' | 'WELCOME';
export type WebSocketQueryType = 'simple';

export interface TokenPriceRequestPayload {
  queryType: WebSocketQueryType;
  chartType: ChartType;
  address: TokenAddress;
  currency: Currency
}

export interface TokenPriceResponsePayload {
  o: number;
  h: number;
  l: number;
  c: number;
  eventType: TokenPricePayloadEventType;
  type: ChartType;
  unixTime: number;
  v: number;
  symbol: TokenSymbol;
  address: TokenAddress;
}

export interface TokenPriceObject<T extends TokenPriceRequestPayload | TokenPriceResponsePayload> {
  type: TokenPriceEvents;
  data: T;
}

export type PriceEvent = 'price_data';