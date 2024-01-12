import { BaseServer } from '@baseServer/core/BaseServer';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { BIRDEYE_API_KEY } from '@config/BirdEye';
import { SOL_TOKEN_ADDRESS } from '@config/Token';


export class PreprocessorServer extends BaseServer {
  constructor(private basePath: string, name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('preprocessor server starting...');
    return true;
  }

  async startEventListeners(): Promise<void> {
    const etcdProvider = new ETCDProvider();
    const tokenPriceProvider = new TokenPriceProvider(BIRDEYE_API_KEY, 'solana');

    try {
      etcdProvider.startElection(PreprocessorServer.name);
      etcdProvider.onElection('elected', elected => {
        try {
          if (elected) {
            tokenPriceProvider.startPriceListener('price_data', {
              type: 'SUBSCRIBE_PRICE',
              data: {
                queryType: 'simple',
                chartType: '1d',
                address: SOL_TOKEN_ADDRESS,
                currency: 'usd'
              }
            });

            tokenPriceProvider.onPriceData('price_data', data => {
              this.zLog.info(`price data: ${JSON.stringify(data, null, 2)}`);
            })
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