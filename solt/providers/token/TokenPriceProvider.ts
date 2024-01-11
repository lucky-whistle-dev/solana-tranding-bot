import { LogProvider } from '@core/providers/LogProvider';
import { WebSocketProvider } from '@core/providers/WebSocketProvider';
import {
  PRICE_EVENT, TokenPriceObject, TokenPriceRequestPayload, TokenPriceResponsePayload, SUPPORTED_CHAIN
} from '@solt/types/TokenPrice';
import { BIRDEYE_SOCKET_ENDPOINT, PROTOCOL, ORIGIN } from '@config/BirdEye';


export class TokenPriceProvider extends WebSocketProvider {
  constructor(apiKey: string, chain: SUPPORTED_CHAIN) {
    const endpoint = [ BIRDEYE_SOCKET_ENDPOINT, `${chain}?x-api-key=${apiKey}` ].join('/');
    super({ endpoint, requestedProtocols: PROTOCOL, origin: ORIGIN }, new LogProvider(TokenPriceProvider.name));
  }

  startPriceListener(event: PRICE_EVENT, request: TokenPriceObject<TokenPriceRequestPayload>) {
    this.startListener(event, request);
  }

  onPriceData(event: PRICE_EVENT, listener: (data: TokenPriceObject<TokenPriceResponsePayload>) => void) {
    this.on(event, listener)
  }
}