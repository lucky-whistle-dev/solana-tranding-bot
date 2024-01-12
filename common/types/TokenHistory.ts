import { TokenAddressType, SupportedChain } from '@common/types/Token';
import { BirdeyeResponse, BirdeyeTokenRequest } from './Birdeye';


export interface TokenPriceHistoryHeaders {
  accept: 'application/json',
  'x-chain': SupportedChain,
  'X-API-KEY': string;
}

export interface TokenPriceHistoryRequest extends BirdeyeTokenRequest<'range'> {
  address_type: TokenAddressType;
}

type ResponseDataPayload = { items: { unixTime: number, value: number }[] };
export interface TokenPriceHistoryResponse extends BirdeyeResponse<ResponseDataPayload> {}