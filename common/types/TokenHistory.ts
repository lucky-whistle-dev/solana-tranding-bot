import { TokenAddress, TokenAddressType, ChartType, SupportedChain } from '@common/types/Token';


export interface TokenPriceHistoryHeaders {
  accept: 'application/json',
  'x-chain': SupportedChain,
  'X-API-KEY': string;
}

export interface TokenPriceHistoryOpts {
  address: TokenAddress;
  address_type: TokenAddressType;
  type: ChartType;
  time_from: Date;
  time_to: Date;
}