export const propertyKeys = <T extends object>(obj: T) =>
  [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj),
  ] as (keyof T)[];

export const allEntries = <T extends object>(
  obj: T,
): (readonly [keyof T, T[keyof T]])[] =>
  propertyKeys(obj).map((key) => [key, obj[key]] as const);

export const hasOwn = <
  T extends Record<PropertyKey, unknown>,
  K extends PropertyKey,
  // eslint-disable-next-line @typescript-eslint/ban-types
>(
  obj: T,
  key: K,
): obj is T & Record<K, T[K] & {}> => // eslint-disable-line @typescript-eslint/ban-types
  Object.prototype.hasOwnProperty.call(obj, key);
