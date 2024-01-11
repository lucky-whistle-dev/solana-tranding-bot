import { env } from 'process';
import { EventEmitter } from 'events';
import { hostname } from 'os';
import { Etcd3, Lease, ILeaseKeepAliveResponse, IWatchResponse, IKeyValue, IOptions, Watcher } from 'etcd3';

import { LogProvider } from '@core/providers/LogProvider';
import { 
  ElectionEvent, ElectionListener, WatchEvent, WatchListener,
  GetAllResponse, WatchRespListener, KeyValListener,
  InitWatchOpts, KeyWatchOpts, CreateLeaseOptions,
  ELECTION_EVENTS, WATCH_EVENTS, ELECTION_ERROR_TIMEOUT_IN_MS
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

  onWatch(event: WatchEvent, listener: WatchListener) {
    if (event === 'data') return super.on(event, listener as WatchRespListener);
    return super.on(event, listener as KeyValListener);
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

  async startWatcher(opts: InitWatchOpts): Promise<Watcher> {
    const watcher = await (async (): Promise<Watcher> => {
      if ('prefix' in opts) return this.client.watch().prefix(opts.prefix).create();
      return this.client.watch().key(opts.key).create();
    })();

    watcher.on('connected', () => this.zLog.info('watcher successfully connected'));
    watcher.on('disconnected', () => this.zLog.info('watcher disconnected'));
    watcher.on('error', err => this.zLog.error(`error on watcher: ${err.message}`));

    watcher.on('data', data => this.emitMutatedKeyEvent(WATCH_EVENTS.data, data as IWatchResponse));
    watcher.on('delete', res => this.emitMutatedKeyEvent(WATCH_EVENTS.delete, res as IKeyValue));
    watcher.on('put', res => this.emitMutatedKeyEvent(WATCH_EVENTS.put, res as IKeyValue));

    return watcher;
  }

  async startWatcherForLeasE(watchOpts: KeyWatchOpts, leaseOpts: CreateLeaseOptions): Promise<Watcher> {
    await this.createLease(watchOpts.key, leaseOpts);
    return this.startWatcher(watchOpts);
  }

  async put(key: string, value: string, prefix?: string): Promise<boolean> {
    const prefixedKey = this.generatePrefixedKey(key, prefix);
    await this.client.put(prefixedKey).value(value);
    return true;
  }

  async get(key: string, prefix?: string): Promise<string> {
    const prefixedKey = this.generatePrefixedKey(key, prefix); 
    return this.client.get(prefixedKey).string();
  }

  async delete(key: string, prefix?: string): Promise<boolean> {
    const prefixedKey = this.generatePrefixedKey(key, prefix);
    await this.client.delete().key(prefixedKey);
    return true;
  }

  async getAllForPrefix(prefix: string): Promise<GetAllResponse> {
    return this.client.getAll().prefix(prefix).strings();
  }

  async createLease(existingKey: string, opts: CreateLeaseOptions): Promise<Lease> {
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

  private generatePrefixedKey = (key: string, prefix?: string): string => {
    if (prefix) return `${prefix}/${key}`;
    return key
  }

  private emitElectionEvent = (event: ElectionEvent, elected: boolean) => super.emit(event, elected);
  private emitMutatedKeyEvent = (event: WatchEvent, data: IWatchResponse | IKeyValue) => super.emit(event, data);
}


export const DEFAULT_OPTS: IOptions = (() => {
  const hosts: string[] = ((): string[] => {
    const listAsString = env.ETCDHOSTS;
    return listAsString?.split(',') ?? null;
  })();

  return { hosts };
})();