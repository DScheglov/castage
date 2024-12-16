import { unwrap, ok } from 'resultage';
import { fromGuardAndTransform } from './engine';
import { castingErr } from './casting-error';
import { Caster, CasterFn, ERR_INVALID_VALUE } from './types';
import { isArray } from './predicates';

export const array = <T>(
  caster: CasterFn<T>,
  name = `Array<${caster.name}>`,
): Caster<T[]> =>
  fromGuardAndTransform(
    (value): value is T[] => isArray(value),
    (list, path) => {
      const items: T[] = [];

      for (let i = 0; i < list.length; i += 1) {
        const result = caster(list[i], [...path, i.toString()]);

        if (result.isErr) return result;

        items.push(unwrap(result));
      }

      return ok(items);
    },
    name,
  );

export const nonEmptyArray = <T>(
  caster: CasterFn<T>,
  name = `NonEmptyArray<${caster.name}>`,
): Caster<[T, ...T[]]> =>
  array(caster, name).validate(
    (value): value is [T, ...T[]] => value.length > 0,
    name,
    (value, path) =>
      castingErr(ERR_INVALID_VALUE, path, {
        expected: `[${caster.name}, ...]`,
        received: value,
      }),
  );
