import { InferType } from '@core/types/Infer';
import { SupportedChain, Timeframe, TokenAddress } from '@common/types/token/Token';


type __baseRequest = { address: TokenAddress, type: Timeframe };
export type BirdeyeTokenRequest<T extends 'point' | 'range'> = 
  T extends 'point'
  ? __baseRequest
  : __baseRequest & { time_from: Date, time_to: Date };

export interface BirdeyeResponse<T> {
  data: InferType<T>;
  success: boolean;
}

export interface BirdeyeGetHeaders {
  accept: 'application/json';
  'x-chain': SupportedChain;
  'X-API-KEY': string;
}