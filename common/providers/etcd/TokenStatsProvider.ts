import lodash from 'lodash';
const { first, transform } = lodash;

import { ETCDProvider } from '@core/providers/EtcdProvider';
import { LogProvider } from '@core/providers/LogProvider';
import { ETCDDataProcessingOpts, GetAllResponse } from '@core/types/Etcd';
import { ISODateString } from '@core/types/ISODate';
import { TokenStatsSchema } from '@common/models/TokenStats';


export class TokenStatsProvider {
  private zLog: LogProvider = new LogProvider(TokenStatsProvider.name);

  constructor(private etcdProvider: ETCDProvider) {}

  async insertTokenStatsEntry(
    payload: Omit<TokenStatsSchema['parsedValueType'], 'timestamp'>
  ): Promise<{ key: TokenStatsSchema['formattedKeyType'], value: TokenStatsSchema['parsedValueType'] }> {
    const now = new Date();
    const formattedNow: ISODateString = now.toISOString() as ISODateString;

    const key: TokenStatsSchema['formattedKeyType'] = `tokenStats/${formattedNow}`;
    const formattedPayload: TokenStatsSchema['parsedValueType'] = { timestamp: formattedNow, ...payload }
    await this.etcdProvider.put<TokenStatsSchema['formattedKeyType'], TokenStatsSchema['parsedValueType']>(key, formattedPayload);

    return { key, value: formattedPayload };
  }

  async getByKey(key: TokenStatsSchema['formattedKeyType']): Promise<TokenStatsSchema['parsedValueType']> {
    return this.etcdProvider.get<TokenStatsSchema['formattedKeyType'], TokenStatsSchema['parsedValueType']>(key);
  }

  async getLatest(): Promise<TokenStatsSchema['parsedValueType']> {
    const getAllResp: GetAllResponse<TokenStatsSchema['formattedKeyType'], TokenStatsSchema['parsedValueType'], TokenStatsSchema['prefix']> = await this.etcdProvider.getAll({ 
      prefix: 'tokenStats', sort: { on: 'Key', direction: 'Descend' }, limit: 1 
    });

    const latestEntry: TokenStatsSchema['parsedValueType'] = getAllResp[first(Object.keys(getAllResp))];
    return latestEntry;
  }

  async iterateFromLatest(opts: Pick<TokenStatsProcessingOpts, 'limit'>): Promise<TokenStatsSchema['parsedValueType'][]> {
    const getAllResp: GetAllResponse<TokenStatsSchema['formattedKeyType'], TokenStatsSchema['parsedValueType'], TokenStatsSchema['prefix']> = await this.etcdProvider.getAll({ 
      prefix: 'tokenStats', sort: { on: 'Key', direction: 'Descend' }, limit: opts.limit > 9 ? opts.limit : 1
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }

  async range(opts: TokenStatsProcessingOpts<'range'>): Promise<TokenStatsSchema['parsedValueType'][]> {
    const getAllResp: GetAllResponse<TokenStatsSchema['formattedKeyType'], TokenStatsSchema['parsedValueType']> = await this.etcdProvider.getAll({ 
      range: opts.range, sort: { on: 'Key', direction: 'Descend' }, limit: opts.limit > 9 ? opts.limit : 1
    });

    return transform(Object.keys(getAllResp), (acc, curr) => acc.push(getAllResp[curr]), []);
  }
}


type TokenStatsProcessingOpts<TYP extends 'iterate' | 'range' = undefined> = ETCDDataProcessingOpts<TokenStatsSchema['formattedKeyType'], TokenStatsSchema['parsedValueType'], TokenStatsSchema['prefix'], TYP>;