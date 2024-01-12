export type Etcd3PrefixedKey<T extends string, PRF extends string = undefined> = PRF extends undefined ? T : `${PRF}/${T}`;

export type EtcdSchema<T extends string, V, PRF extends string = undefined> = {
  formattedKeyType: Etcd3PrefixedKey<T, PRF>;
  parsedValueType: V;
  prefix?: PRF;
};

export class ValueSerializer {
  static serialize = <T extends string, V, PRF extends string = undefined>(value: (EtcdSchema<T, V, PRF>)['parsedValueType']): Buffer => {
    return Buffer.from(JSON.stringify(value));
  }

  static deserialize = <T extends string, V, PRF extends string = undefined>(buff: Buffer): (EtcdSchema<T, V, PRF>)['parsedValueType'] => {
    return JSON.parse(buff.toString('utf8'));
  }
}