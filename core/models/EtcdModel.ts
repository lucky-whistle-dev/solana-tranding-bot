import { InferType } from '@core/types/Infer';


export type Etcd3PrefixedKey<K extends string, PRF = unknown> = 
  PRF extends string ? `${PRF}/${K}` : K;

interface __baseEtcModel<V, K extends string, PRF = unknown> { 
  KeyType: Etcd3PrefixedKey<K, PRF>
  ValueType: InferType<V>
}

export type EtcdModel<V, K extends string, PRF = unknown> =
  PRF extends string ? __baseEtcModel<V, K, PRF> & { Prefix: PRF } : __baseEtcModel<V, K, PRF>;

export class ValueSerializer {
  static serialize = <V, K extends string, PRF = unknown>(value: EtcdModel<V, K, PRF>['ValueType']): Buffer => {
    return Buffer.from(JSON.stringify(value));
  };

  static deserialize = <V, K extends string, PRF = unknown>(encoded: Buffer): EtcdModel<V, K, PRF>['ValueType'] => {
    return JSON.parse(encoded.toString('utf8'));
  };
}