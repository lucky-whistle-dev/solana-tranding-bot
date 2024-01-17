type UpdateSubsetTypeAction = 'ENFORCE' | 'OPTIONAL' | 'OMIT' | 'PICK';
type UpdatTypeAction = 'REQUIRE ALL' | 'PARTIAL';
type InferTypeAction = UpdateSubsetTypeAction | UpdatTypeAction;

type __enforcedFields<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;
type __optionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type __inferType<T, STRCT = false> = 
  T extends infer R 
  ? R 
  : STRCT extends true 
  ? never 
  : T;

type __isMappedType<T> = T extends { [K in keyof T]: T[K] } ? true : false;

type __inferMappedType<T, STRCT = false> = 
  T extends infer R ? { 
    [K in keyof R]: 
      R[K] extends infer U ? 
      __inferType<U, STRCT> : 
      R[K] 
  } : never;

type __inferTypeDeep<T, MUT = unknown, KEYS = unknown, STRCT = false> =
  T extends infer P
    ? __isMappedType<P> extends true
      ? MUT extends UpdateSubsetTypeAction
        ? KEYS extends keyof __inferMappedType<P>
          ? MUT extends 'OPTIONAL' 
          ? __optionalFields<__inferMappedType<P>, KEYS>
          : MUT extends 'ENFORCE'
          ? __enforcedFields<__inferMappedType<P>, KEYS>
          : MUT extends 'OMIT' 
          ? Omit<__inferMappedType<P>, KEYS>
          : Pick<__inferMappedType<P>, KEYS>
        : __inferMappedType<P>
      : MUT extends UpdatTypeAction
        ? MUT extends 'REQUIRE ALL' 
        ? Required<__inferMappedType<P>>
        : Partial<__inferMappedType<P>>
      : never
    : __inferType<P, STRCT>
  : __inferType<T, STRCT>

export type InferType<T, MUT extends InferTypeAction = undefined, KEYS extends keyof T = undefined, STRCT extends boolean = false> = 
  MUT extends UpdatTypeAction 
  ? __inferTypeDeep<T, MUT, unknown, STRCT>
  : MUT extends UpdateSubsetTypeAction 
  ? __inferTypeDeep<T, MUT, KEYS, STRCT>
  : __inferTypeDeep<T, unknown, unknown, STRCT>;