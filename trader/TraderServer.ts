import { BaseServer } from '@baseServer/core/BaseServer';

import { envLoader } from '@common/EnvLoader';
import { ETCDProvider } from '@core/providers/EtcdProvider';
import { AuditProvider } from '@common/providers/etcd/AuditProvider';
import { TokenStatsProvider } from '@common/providers/etcd/TokenStatsProvider';
import { TokenPriceProvider } from '@common/providers/token/TokenPriceProvider';
import { TokenSwapProvider } from '@common/providers/token/TokenSwapProvider';
import { SignalGeneratorRegistry  } from '@signals/SignalGeneratorRegistry';
import { AutoTraderProvider } from '@trader/providers/AutoTraderProvider';
import { RPC_ENDPOINT } from '@config/RPC';
import { SOL_TOKEN_ADDRESS } from '@config/Token';


export class TraderServer extends BaseServer {
  constructor(private basePath: string, name: string, port?: number, version?: string, numOfCpus?: number) { 
    super(name, port, version, numOfCpus); 
  }

  async initService(): Promise<boolean> {
    this.zLog.info('solt service starting...');
    return true;
  }

  async startEventListeners(): Promise<void> {
    const etcdProvider = new ETCDProvider();

    const auditProvider = new AuditProvider(etcdProvider);
    const tokenStatsProvider = new TokenStatsProvider(etcdProvider);

    const tokenPriceProvider = new TokenPriceProvider(envLoader.BIRDEYE_API_KEY, 'solana');
    const tokenSwapProvider = new TokenSwapProvider(RPC_ENDPOINT);

    const signalGenerator = SignalGeneratorRegistry.generators(auditProvider, tokenStatsProvider).hybridtrend;
    const autoTrader: AutoTraderProvider = new AutoTraderProvider(signalGenerator, tokenPriceProvider, tokenSwapProvider);

    try {
      etcdProvider.startElection(TraderServer.name);
      etcdProvider.onElection('elected', elected => {
        try {
          if (elected) {
            autoTrader.start({
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