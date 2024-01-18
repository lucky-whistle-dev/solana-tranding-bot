import { env } from 'process';
import { EventEmitter } from 'events';
import { hostname } from 'os';
import { Etcd3, Lease, ILeaseKeepAliveResponse, IOptions, Watcher, MultiRangeBuilder, Range } from 'etcd3';
import lodash from 'lodash';
const { transform } = lodash;

import { LogProvider } from '@core/providers/LogProvider';
import { EtcdModel, ValueSerializer } from '@core/models/EtcdModel';
import { 
  ElectionEvent, ElectionListener, WatchEvent, WatchListener,
  InitWatchOpts, WatchEventData, CreateLeaseOptions, GetAllResponse,
  ELECTION_EVENTS, WATCH_EVENTS, ELECTION_ERROR_TIMEOUT_IN_MS, ETCDDataProcessingOpts
} from '@core/types/Etcd';


const HOSTNAME = hostname();

export class ETCDProvider extends EventEmitter {
  private client: Etcd3;
  private zLog: LogProvider = new LogProvider(ETCDProvider.name);

  constructor(private hostname = HOSTNAME, private opts = DEFAULT_OPTS) { 
    super();
    this.client = new Etcd3(this.opts);
  }

  onElection = (event: ElectionEvent, listener: ElectionListener) => super.on(event, listener);

  onWatch<EVT extends WatchEvent>(event: EVT, listener: WatchListener<EVT>) {
    return super.on(event, listener);
  }

  async startElection(electionName: string) {
    const election = this.client.election(electionName);

    const createCampaign = () => {
      const campaign = election.campaign(this.hostname);
      this.zLog.info(`campaign started for host: ${this.hostname}`);

      campaign.on('elected', () => {
        this.zLog.info('I am the new leader');
        this.emitElectionEvent(ELECTION_EVENTS.elected, true);
      });

      campaign.on('error', err => {
        this.zLog.error(`campaign error: ${err.message}`);
        setTimeout(() => createCampaign(), ELECTION_ERROR_TIMEOUT_IN_MS);
      });
    };

    const createObserver = async () => {
      const observer = await election.observe();
      this.zLog.info('leader observer started');

      observer.on('change', leader => {
        if (leader !== this.hostname) { 
          this.zLog.info(`the new leader is: ${leader}`);
          this.emitElectionEvent(ELECTION_EVENTS.elected, false);
        }
      });

      observer.on('error', err => {
        this.zLog.error(`observer error: ${err.message}`);
        setTimeout(() => createObserver, ELECTION_ERROR_TIMEOUT_IN_MS);
      });
    };

    createCampaign();
    createObserver();
  }

  async startWatcher<EVT extends 'key' | 'prefix', K extends string, PRF = unknown>(opts: InitWatchOpts<EVT, K, PRF>): Promise<Watcher> {
    const watcher = await (async (): Promise<Watcher> => {
      if ('prefix' in opts) return this.client.watch().prefix(opts.prefix).create();
      return this.client.watch().key(opts.key).create();
    })();

    watcher.on('connected', () => this.zLog.info('watcher successfully connected'));
    watcher.on('disconnected', () => this.zLog.info('watcher disconnected'));
    watcher.on('error', err => this.zLog.error(`error on watcher: ${err.message}`));

    watcher.on('data', data => this.emitMutatedKeyEvent(WATCH_EVENTS.data, data));
    watcher.on('delete', res => this.emitMutatedKeyEvent(WATCH_EVENTS.delete, res));
    watcher.on('put', res => this.emitMutatedKeyEvent(WATCH_EVENTS.put, res));

    return watcher;
  }

  async startWatcherForLease<K extends string, PRF = unknown>(watchOpts: InitWatchOpts<'key', K, PRF>, leaseOpts: CreateLeaseOptions): Promise<Watcher> {
    await this.createLease(watchOpts.key, leaseOpts);
    return this.startWatcher(watchOpts);
  }

  async put<V, K extends string, PRF = unknown>(opts: { key: EtcdModel<V, K, PRF>['KeyType'], value: EtcdModel<V, K, PRF>['ValueType'] }): Promise<boolean> {
    await this.client.put(opts.key).value(ValueSerializer.serialize(opts.value));
    return true;
  }

  async get<V, K extends string, PRF = unknown>(key: EtcdModel<V, K, PRF>['KeyType']): Promise<EtcdModel<V, K, PRF>['ValueType']> {
    const buff = await this.client.get(key).buffer();
    return ValueSerializer.deserialize(buff);
  }

  async delete<V, K extends string, PRF = unknown>(key: EtcdModel<V, K, PRF>['KeyType']): Promise<boolean> {
    await this.client.delete().key(key);
    return true;
  }

  async getAll<V, K extends string, PRF = unknown>(opts: ETCDDataProcessingOpts<V, K, PRF, 'iterate' | 'range'>): Promise<GetAllResponse<V, K, PRF>> {
    const pipeline = ((): MultiRangeBuilder => {
      let builder = this.client.getAll();
      
      if ('prefix' in opts) builder = builder.prefix(opts.prefix);
      if ('range' in opts) { 
        const range = new Range(opts.range.start, opts.range.end);
        builder = builder.inRange(range);
      }

      if ('sort' in opts) builder = builder.sort(opts.sort.on, opts.sort.direction)
      if ('limit' in opts) builder = builder.limit(opts.limit);

      return builder;
    })();

    const resp: { [key: string]: Buffer } = await pipeline.buffers();
    return transform(
      resp,
      (acc, serialized, key) => {
        const value = ValueSerializer.deserialize(serialized);
        acc[key] = value;
      },
      {} as GetAllResponse<V, K, PRF>
    );
  }

  async createLease<V, K extends string, PRF = unknown>(existingKey: EtcdModel<V, K, PRF>['KeyType'], opts: CreateLeaseOptions): Promise<Lease> {
    const lease = this.client.lease(opts.ttl, opts.opts);
    await lease.put(existingKey).exec();
    return lease;
  }

  async renewLeaseOnce(lease: Lease): Promise<ILeaseKeepAliveResponse> {
    return lease.keepaliveOnce();
  }

  async revokeLease(lease: Lease): Promise<boolean> {
    await lease.revoke();
    return true;
  }

  private emitElectionEvent = (event: ElectionEvent, elected: boolean) => super.emit(event, elected);
  private emitMutatedKeyEvent = (event: WatchEvent, data: WatchEventData<typeof event>) => super.emit(event, data);
}


type CertPath = `${string}/solt/certs`

export const DEFAULT_OPTS: IOptions = (() => {
  const hosts: string[] = ((): string[] => {
    const listAsString = env.ETCDHOSTS;
    return listAsString?.split(',') ?? null;
  })();

  return { hosts, 
    /* credentials: {
      rootCertificate: readFileSync(join(homedir(), '/solt/certs/etcd'))
    } */
  };
})();