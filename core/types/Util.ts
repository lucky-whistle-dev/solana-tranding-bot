export type MakeOptional<T, K> = 
  Omit<T, InferType<K, false, keyof T>> & Partial<Pick<T, InferType<K, false, keyof T>>>;

export type InferType<T, STRCT = false, TYP = unknown>  = 
  T extends infer R 
  ? R extends TYP 
    ? R : TYP
  : STRCT extends true 
    ? never 
    : T extends TYP 
      ? T : TYP;
    
type InferMappedType<R, STRCT> = { 
  [K in keyof R]: 
    R[K] extends infer U 
    ? InferTypeDeep<U, STRCT> 
    : InferType<R[K]>
}

export type InferTypeDeep<T, STRCT = false, OPTNL = false> =
  T extends infer R 
  ? OPTNL extends true
    ? MakeOptional<InferMappedType<R, STRCT>, InferType<keyof R, false, keyof R>>
    : InferMappedType<R, STRCT>
  : InferType<T, STRCT>;