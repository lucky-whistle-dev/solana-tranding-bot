import { LogProvider } from '@core/providers/LogProvider';
import { WebSocketProvider } from '@core/providers/WebSocketProvider';
import { asyncExponentialBackoff } from '@core/utils/AsyncExponentialBackoff';
import { SupportedChain } from '@common/types/token/Token';
import { BirdeyeGetHeaders } from '@common/types/external/Birdeye';
import { 
  PriceEvent, TokenPriceObject, TokenPriceRequestPayload, TokenPriceResponsePayload,
  TokenOHLCRequest, TokenOHLCResponse
} from '@common/types/token/TokenPrice';
import { BIRDEYE_SOCKET_ENDPOINT, PROTOCOL, ORIGIN, BIRDEYE_API_ENDPOINT } from '@config/BirdEye';
import { convertISOToUnix } from '@core/utils/Utils';
import { ISODateString } from '@core/types/ISODate';


export class TokenPriceProvider extends WebSocketProvider {
  constructor(private apiKey: string, private chain: SupportedChain) {
    const endpoint = [ BIRDEYE_SOCKET_ENDPOINT, `${chain}?x-api-key=${apiKey}` ].join('/');
    super({ endpoint, requestedProtocols: PROTOCOL, origin: ORIGIN }, new LogProvider(TokenPriceProvider.name));
  }

  startPriceListener(event: PriceEvent, request: TokenPriceObject<TokenPriceRequestPayload>) {
    this.startListener(event, request);
  }

  onPriceData(event: PriceEvent, listener: (data: TokenPriceObject<TokenPriceResponsePayload>) => void) {
    this.on(event, listener)
  }

  async getOHLC(request: TokenOHLCRequest): Promise<TokenOHLCResponse> {
    const headers: BirdeyeGetHeaders = { accept: 'application/json', 'x-chain': this.chain, 'X-API-KEY': this.apiKey };
    const options = { method: 'GET', headers };
    
    const resp = await asyncExponentialBackoff(RequestGenerator.ohlcRequest(request), 5, 500, options as any);
    return resp.json();
  } 
}

class RequestGenerator { 
  static ohlcRequest = (opts: TokenOHLCRequest): string => {
    const time_from_unix = convertISOToUnix(opts.time_from.toISOString() as ISODateString);
    const time_to_unix = convertISOToUnix(opts.time_to.toISOString() as ISODateString);

    const url = [ BIRDEYE_API_ENDPOINT, 'defi', 'ohlcv' ].join('/');
    const params = [
      `address=${opts.address}`,
      `type=${opts.type}`,
      `time_from=${time_from_unix}`,
      `time_to=${time_to_unix}`
    ].join('&');

    return [ url, params ].join('?');
  }
}