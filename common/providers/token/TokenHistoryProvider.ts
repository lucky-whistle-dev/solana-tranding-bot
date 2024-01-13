import { asyncExponentialBackoff } from '@core/utils/AsyncExponentialBackoff';
import { convertISOToUnix } from '@core/utils/Utils';
import { BirdeyeGetHeaders } from '@common/types/external/Birdeye';
import { ISODateString } from '@core/types/ISODate';
import { SupportedChain } from '@common/types/token/Token';
import { TokenPriceHistoryRequest, TokenPriceHistoryResponse } from '@common/types/token/TokenHistory';
import { BIRDEYE_API_ENDPOINT } from '@config/BirdEye';


export class TokenHistoryProvider {
  constructor(private apiKey: string, private chain: SupportedChain) {}

  async getTokenPriceHistory(opts: TokenPriceHistoryRequest): Promise<TokenPriceHistoryResponse> {
    const headers: BirdeyeGetHeaders = {
      accept: 'application/json',
      'x-chain': this.chain,
      'X-API-KEY': this.apiKey
    };

    const options = { method: 'GET', headers };
    const resp = await asyncExponentialBackoff(RequestGenerator.priceHistoryRequest(opts), 5, 500, options as any);
    return resp.json();
  }
}

class RequestGenerator { 
  static priceHistoryRequest = (opts: TokenPriceHistoryRequest): string => {
    const time_from_unix = convertISOToUnix(opts.time_from.toISOString() as ISODateString);
    const time_to_unix = convertISOToUnix(opts.time_to.toISOString() as ISODateString);

    const url = [ BIRDEYE_API_ENDPOINT, 'defi', 'history_price' ].join('/');
    const params = [
      `address=${opts.address}`,
      `address_type=${opts.address_type}`,
      `type=${opts.type}`,
      `time_from=${time_from_unix}`,
      `time_to=${time_to_unix}`
    ].join('&');

    return [ url, params].join('?');
  }
}