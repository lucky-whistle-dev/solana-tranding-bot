import { LogProvider } from '@core/providers/LogProvider';
import { WebSocketProvider } from '@core/providers/WebSocketProvider';
import { SupportedChain } from '@common/types/token/Token';
import { PriceEvent, TokenPriceObject, TokenPriceRequestPayload, TokenPriceResponsePayload } from '@common/types/token/TokenPrice';
import { BIRDEYE_SOCKET_ENDPOINT, PROTOCOL, ORIGIN } from '@config/BirdEye';


export class TokenPriceProvider extends WebSocketProvider {
  constructor(apiKey: string, chain: SupportedChain) {
    const endpoint = [ BIRDEYE_SOCKET_ENDPOINT, `${chain}?x-api-key=${apiKey}` ].join('/');
    super({ endpoint, requestedProtocols: PROTOCOL, origin: ORIGIN }, new LogProvider(TokenPriceProvider.name));
  }

  startPriceListener(event: PriceEvent, request: TokenPriceObject<TokenPriceRequestPayload>) {
    this.startListener(event, request);
  }

  onPriceData(event: PriceEvent, listener: (data: TokenPriceObject<TokenPriceResponsePayload>) => void) {
    this.on(event, listener)
  }
}