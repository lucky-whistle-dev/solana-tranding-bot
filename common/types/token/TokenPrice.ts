import { InferType } from '@core/types/Infer';
import { TokenAddress, TokenSymbol, TokenPricePayloadEventType, Currency, Timeframe } from '@common/types/token/Token';
import { BirdeyeResponse, BirdeyeTokenRequest } from '@common/types/external/Birdeye';


export type TokenPriceEvents = 'SUBSCRIBE_PRICE' | 'PRICE_DATA' | 'WELCOME';
export type WebSocketQueryType = 'simple';

export interface TokenPriceRequestPayload {
  queryType: WebSocketQueryType;
  chartType: Timeframe;
  address: TokenAddress;
  currency: Currency
}

export interface TokenPriceResponsePayload {
  o: number;
  h: number;
  l: number;
  c: number;
  eventType: TokenPricePayloadEventType;
  type: Timeframe;
  unixTime: number;
  v: number;
  symbol: TokenSymbol;
  address: TokenAddress;
}

export interface TokenPriceObject<T extends TokenPriceRequestPayload | TokenPriceResponsePayload> {
  type: TokenPriceEvents;
  data: InferType<T>;
}

export interface TokenOHLCRequest extends BirdeyeTokenRequest<'range'> {}

type ResponseDataPayload = { 
  items: InferType<TokenPriceResponsePayload, 'ENFORCE', 'o' | 'h' | 'l' | 'c' | 'v' | 'address' | 'unixTime' | 'type'>[]
};

export interface TokenOHLCResponse extends BirdeyeResponse<ResponseDataPayload> {}

export type PriceEvent = 'price_data';