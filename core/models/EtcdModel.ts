import { InferType, InferTypeDeep } from '@core/types/Util';


export type Etcd3PrefixedKey<K, PRF extends string = undefined> = 
  PRF extends undefined 
  ? InferType<K, false, string> 
  : `${PRF}/${InferType<K, false, string>}`;


export type EtcdModel<V, K, PRF = unknown> = 
  PRF extends string
  ? { 
    KeyType: Etcd3PrefixedKey<InferType<K>, InferType<PRF>>, 
    ValueType: InferTypeDeep<V>, 
    Prefix: InferType<PRF>
  } : { 
    KeyType: Etcd3PrefixedKey<InferType<K>> 
    ValueType: InferTypeDeep<V> 
  };


export class ValueSerializer {
  static serialize = <V, K, PRF extends string = undefined>(value: EtcdModel<V, K, PRF>['ValueType']): Buffer => {
    return Buffer.from(JSON.stringify(value));
  }

  static deserialize = <V, K, PRF extends string = undefined>(encoded: Buffer): EtcdModel<V, K, PRF>['ValueType'] => {
    return JSON.parse(encoded.toString('utf8'));
  }
}