import { InferType } from '@core/types/Infer';


export type Etcd3PrefixedKey<K, PRF = unknown> = 
  PRF extends string 
  ? `${PRF}/${K extends string ? K : string}` 
  : K extends string ? K : string;

export type EtcdModel<V, K, PRF = undefined | unknown> =
  PRF extends string
  ? {
    KeyType: Etcd3PrefixedKey<K, PRF>
    ValueType: InferType<V> 
    Prefix: PRF
  }
  : PRF extends undefined | unknown
    ? {
      KeyType: Etcd3PrefixedKey<K, PRF>
      ValueType: InferType<V> 
    }
  : never;

export class ValueSerializer {
  static serialize = <V, K, PRF = unknown>(value: EtcdModel<V, K, PRF>['ValueType']): Buffer => {
    return Buffer.from(JSON.stringify(value));
  };

  static deserialize = <V, K, PRF = unknown>(encoded: Buffer): EtcdModel<V, K, PRF>['ValueType'] => {
    return JSON.parse(encoded.toString('utf8'));
  };
}