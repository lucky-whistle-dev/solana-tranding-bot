type MutationAction = 'REQUIRE' | 'PARTIAL' | 'OPTIONAL' | 'OMIT';
type InferMutation<T> = { action: MutationAction, keys: keyof __inferMappedType<T> };

type __makeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>> extends infer R ? R : never;

type __inferType<T> = T extends infer R ? R : never;

type __isMappedType<T> = T extends { [K in keyof T]: T[K] } ? true : false;

type __inferMappedType<T> = T extends infer R ? { [K in keyof R]: R[K] extends infer U ? __inferType<U> : never } : never;

type __inferTypeDeep<T, MUT extends InferMutation<T>> =
    __isMappedType<T> extends true
      ? MUT['action'] extends 'REQUIRE' ? Required<__inferMappedType<T>> extends infer R ? R : never
      : MUT['action'] extends 'PARTIAL' ? Partial<__inferMappedType<T>> extends infer R ? R : never
      : MUT['action'] extends 'OPTIONAL' ? __makeOptional<__inferMappedType<T>, MUT['keys']> extends infer R ? R : never
      : MUT['action'] extends 'OMIT' ? Omit<__inferMappedType<T>, MUT['keys']> extends infer R ? R : never
      : __inferMappedType<T> extends infer R ? R : never
    : __inferType<T> extends infer R ? R : never

export type InferType<T, MUT extends InferMutation<T> = undefined> = __inferTypeDeep<T, MUT> extends infer R ? R : never;