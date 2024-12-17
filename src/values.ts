import { fromGuard } from './engine';
import { Caster } from './types';

export const value = <T extends string | number | boolean>(
  value: T,
): Caster<T> => fromGuard((v): v is T => v === value, `${value.toString()}`);

export const values = <T extends string | number | boolean>(
  ...values: T[]
): Caster<T> => {
  const valuesSet = new Set<unknown>(values);
  return fromGuard(
    (value): value is T => valuesSet.has(value),
    `${values.map((v) => JSON.stringify(v)).join(' | ')}`,
  );
};