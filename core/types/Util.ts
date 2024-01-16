export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type InferType<T, STRCT, TYP = unknown>  = 
  T extends infer R 
  ? R extends TYP 
    ? R : TYP
  : STRCT extends true 
    ? never 
    : T extends TYP 
      ? T : TYP;
    
type InferMappedType<MTYP, STRCT> = { 
  [K in keyof MTYP]: 
    MTYP[K] extends infer U 
    ? InferTypeDeep<U, STRCT> 
    : MTYP[K]
}

export type InferTypeDeep<T, STRCT = false, OPTNL = false> =
  T extends infer R 
  ? OPTNL extends true
    ? MakeOptional<InferMappedType<R, STRCT>, keyof R>
    : InferMappedType<R, STRCT>
  : InferType<T, STRCT>;