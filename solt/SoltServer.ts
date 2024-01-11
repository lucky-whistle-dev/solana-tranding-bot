import { BaseServer } from '@baseServer/core/BaseServer';
import { AutoTradeProvider } from '@solt/providers/AutoTradeProvider';
import { TokenPriceProvider } from '@solt/providers/token/TokenPriceProvider';
import { TokenSwaprovider } from '@solt/providers/token/TokenSwapProvider';
import { BIRDEYE_API_KEY } from '@config/BirdEye';
import { SOL_TOKEN_ADDRESS } from '@config/Token';
import { RPC_ENDPOINT } from '@config/RPC';
import { ETCDProvider } from '@core/providers/EtcdProvider';


export class SoltServer extends BaseServer {
  constructor(private basePath: string, name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('solt service starting...');
    return true;
  }

  async startEventListeners(): Promise<void> {
    const etcdProvider = new ETCDProvider();
    const tokenPriceProvider = new TokenPriceProvider(BIRDEYE_API_KEY, 'solana');
    const tokenSwapProvider = new TokenSwaprovider(RPC_ENDPOINT);
    const autoTradeProvider: AutoTradeProvider = new AutoTradeProvider(tokenPriceProvider, tokenSwapProvider);

    try {
      etcdProvider.startElection(SoltServer.name);
      etcdProvider.onElection('elected', elected => {
        try {
          if (elected) {
            autoTradeProvider.start({
              type: 'SUBSCRIBE_PRICE',
              data: {
                queryType: 'simple',
                chartType: '5m',
                address: SOL_TOKEN_ADDRESS,
                currency: 'usd'
              }
            });
          }
        } catch (err) {
          this.zLog.error(err);
          process.exit(1);
        }
      });
    } catch (err) {
      this.zLog.error(err);
      throw err;
    }
  };
}