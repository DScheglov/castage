import { unwrap, ok } from 'resultage';
import { fromGuardAndTransform } from './engine.js';
import type { Caster, CasterFn } from './types';
import { isObject } from './predicates.js';

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * Combines multiple casters into a single caster that applies all of them.
 * The resulting caster will validate and transform a value using each of the provided casters,
 * and merge the results into a single object.
 *
 * @template T - A tuple of object types that the casters will handle.
 * @param {...{ [K in keyof T]: Caster<T[K]> }} casters - An array of casters to be combined.
 * @returns {Caster<UnionToIntersection<T[number]>>} A caster that applies all provided casters and merges their results.
 */
export const allOf = <T extends object[]>(
  ...casters: {
    [K in keyof T]: Caster<T[K]>;
  }
): Caster<UnionToIntersection<T[number]>> => {
  const name = `(${casters.map((c) => c.name).join(' & ')})`;

  return fromGuardAndTransform(
    isObject,
    (value, path) => {
      const resultedValue = {} as UnionToIntersection<T[number]>;

      for (let i = 0; i < casters.length; i += 1) {
        const caster = casters[i] as CasterFn<T[number]>;
        const result = caster(value, path);
        if (result.isErr) return result;

        const v = unwrap(result);
        Object.assign(resultedValue as object, v);
      }

      return ok(resultedValue);
    },
    name,
  );
};
