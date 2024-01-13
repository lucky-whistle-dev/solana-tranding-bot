export type Etcd3PrefixedKey<K extends string, PRF extends string = undefined> = PRF extends undefined ? K : `${PRF}/${K}`;

export type EtcdSchema<K extends string, V = string, PRF extends string = undefined> = 
  PRF extends string 
  ? {
      formattedKeyType: Etcd3PrefixedKey<K, PRF>;
      parsedValueType: V;
      prefix: PRF;
    }
  : {
    formattedKeyType: Etcd3PrefixedKey<K, PRF>;
    parsedValueType: V;
  };

export class ValueSerializer {
  static serialize = <K extends string, V, PRF extends string = undefined>(value: (EtcdSchema<K, V, PRF>)['parsedValueType']): Buffer => {
    return Buffer.from(JSON.stringify(value));
  }

  static deserialize = <K extends string, V, PRF extends string = undefined>(buff: Buffer): (EtcdSchema<K, V, PRF>)['parsedValueType'] => {
    return JSON.parse(buff.toString('utf8'));
  }
}