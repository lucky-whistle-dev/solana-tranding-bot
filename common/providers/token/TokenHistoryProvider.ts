import { SupportedChain } from '@common/types/token/Token';
import { TokenPriceHistoryHeaders, TokenPriceHistoryOpts } from '@common/types/token/TokenHistory';
import { BIRDEYE_API_ENDPOINT } from '@config/BirdEye';


export class TokenHistoryProvider {
  constructor(private apiKey: string, private chain: SupportedChain) {}

  async getTokenPriceHistory(opts: TokenPriceHistoryOpts) {
    const headers: TokenPriceHistoryHeaders = {
      accept: 'application/json', 'x-chain': this.chain, 'X-API-KEY': this.apiKey
    };

    const options = { method: 'GET', headers };
    const resp = await fetch(RequestGenerator.priceHistoryRequest(opts), options as any);

    const respJson = await resp.json();
    console.log('resp:', respJson);
    
    return respJson;
  }
}

class RequestGenerator { 
  static priceHistoryRequest = (opts: TokenPriceHistoryOpts): string => {
    const url = [ BIRDEYE_API_ENDPOINT, 'defi', 'history_price' ].join('/');
    const params = [
      `address=${opts.address}`,
      `address_type=${opts.address_type}`,
      `type=${opts.type}`,
      `time_from=${opts.time_from}`,
      `time_to=${opts.time_to}`
    ].join('&');

    return [ url, params].join('?');
  }
}