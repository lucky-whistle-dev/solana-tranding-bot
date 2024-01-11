export type TokenPriceEvents = 'SUBSCRIBE_PRICE' | 'PRICE_DATA';
export type WebSocketQueryType = 'simple';
export type ChartType = '1m' | '5m' | '10m' | '15m' | '1h';
export type TokenAddress = string;
export type TokenSymbol = string;
export type Currency = 'usd';
export type TokenPricePayloadEventType = 'ohlcv'

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

export type PRICE_EVENT = 'price_data';

export type SUPPORTED_CHAIN = 'ethereum' | 'solana';