/*
  Infer

  Infer is a utility type that utilizes the power of Typescript's type system.
  Creates dynamic type that can infer the type of other typed objects or the structure of values.
  The type annotation also allows for mutating the structure of the object directly in the type itself.

  Example:
    let myVariable = { hello: 1, world: 'hi', nested: { inner: 'inner', second: 'hi' }}; // any type

    const inferredVariable: InferType<typeof myVariable['nested'], 'OPTIONAL', 'inner'> = {
      inner: 'my inferred inner',
      second: 'new value'
    }; // this variable now has the structure of the nested inner object, with the inner field being optional
*/

type UpdateSubsetTypeAction = 'ENFORCE' | 'OPTIONAL' | 'OMIT' | 'PICK';
type UpdatTypeAction = 'REQUIRE ALL' | 'PARTIAL';
type InferTypeAction = UpdateSubsetTypeAction | UpdatTypeAction;

/*
  __enforcedFields
    Create dynamically enforced fields by extracting the target fields from T onto a separate strict object and then merging with original.
*/
type __enforcedFields<T, K = unknown> = 
  K extends keyof T  ? __inferTypeStrict<Omit<T, K> & Required<Pick<T, K>>> : __inferTypeStrict<Required<T>>;

/*
  __optionalFields
    Create dynamic partial fields by first removing the keys from the original object and then performing a partial pick on them.
*/
type __optionalFields<T, K = unknown> = 
  K extends keyof T ? __inferTypeStrict<Omit<T, K> & Partial<Pick<T, K>>> : __inferTypeStrict<Partial<T>>;

type __updateFields<MUT extends 'OMIT' | 'PICK', T, K extends keyof T> = 
  MUT extends 'OMIT' ? __inferTypeStrict<Omit<T, keyof K>> : __inferTypeStrict<Pick<T, K>>;

/*
  __inferType
    Determine the\ type of an object and the level of strictness on the object.
    Infer the type of generic T through R.
*/
type __inferTypeStrict<T> = T extends infer R ? R : never;

type __isMappedType<T> = T extends { [K in keyof T]: T[K] } ? true : false;

/*
  __inferMappedType
    If the inference comes across a mapped object type, or structure, it will deeply project the keys and nested objects within.
*/
type __inferMappedType<T> = 
  T extends infer R ? { [K in keyof R]: R[K] extends infer U ? __inferTypeStrict<U> : R[K] } : never;

/*
  __inferTypeDeep
    Determine if the current position in the object being inferred is a mapped type or a value.
    Apply any object structure changes here.
    Recursively infer the types of sub objects within the object.
*/
type __inferTypeDeep<T, MUT = unknown, KEYS = unknown> =
  T extends infer R
  ? __isMappedType<R> extends true
    ? KEYS extends keyof __inferMappedType<R>
      ? MUT extends 'OPTIONAL' ? __optionalFields<__inferMappedType<R>, KEYS>
      : MUT extends 'OMIT' ? __updateFields<MUT, __inferMappedType<R>, KEYS>
      : MUT extends 'ENFORCE' ? __enforcedFields<__inferMappedType<R>, KEYS>
      : MUT extends 'PICK' ? __updateFields<MUT, __inferMappedType<R>, KEYS>
      : never
    : KEYS extends undefined | unknown
      ? MUT extends 'REQUIRE ALL' ? __enforcedFields<__inferMappedType<R>>
      : MUT extends 'PARTIAL' ? __optionalFields<__inferMappedType<R>>
      : MUT extends unknown ? __inferMappedType<R>
      : never
    : __inferTypeStrict<R>
  : __inferTypeStrict<T>
  : never;

/*
  InferType
    Used to strictly type generic params and create types from objects.
    It also allows for manipulation of the object directly in the type signature.
    No additional functions are required.
*/
export type InferType<T, MUT extends InferTypeAction = undefined, KEYS extends keyof T = undefined> = 
  MUT extends UpdatTypeAction ? __inferTypeDeep<T, MUT, unknown>
  : MUT extends UpdateSubsetTypeAction ? __inferTypeDeep<T, MUT, KEYS>
  : __inferTypeDeep<T, unknown, unknown>;