export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type InferType<T = unknown, STRCT extends boolean = false, TYP = unknown>  = 
  T extends infer R 
    ? R extends TYP ? R : TYP
    : STRCT extends true 
      ? never 
      : T extends TYP ? T : TYP
    


export type InferMappedType<MTYP, STRCT extends boolean = true> = { 
  [K in keyof MTYP]: MTYP[K] extends infer U 
    ? InferTypeDeep<U, STRCT>
    : MTYP[K];
}

export type InferTypeDeep<T, STRCT = false, OPTNL = false> =
  T extends infer R
  ? (
      OPTNL extends true 
        ? MakeOptional<InferMappedType<R, STRCT extends boolean ? STRCT : never>, keyof R> 
        : InferMappedType<R, STRCT extends boolean ? STRCT : never> 
    )
  : InferType<T, STRCT extends boolean ? STRCT : never>;