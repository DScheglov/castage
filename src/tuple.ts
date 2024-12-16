import { isErr, unwrap, ok, Result, mapErr } from 'resultage';
import { pipe } from 'resultage/fn';
import { fromGuardAndTransform } from './engine';
import { castingErr } from './casting-error';
import { Caster, CasterFn, CastingError, ERR_MISSING_VALUE } from './types';
import { isArray } from './predicates';

export const tuple = <T extends unknown[]>(
  ...casters: {
    [K in keyof T]: CasterFn<T[K]>;
  }
): Caster<T> =>
  fromGuardAndTransform(
    isArray,
    (list, path): Result<T, CastingError> => {
      const items = [] as unknown as T;

      for (let i = 0; i < casters.length; i += 1) {
        const caster = casters[i] as CasterFn<T>;
        const value = i < list.length ? list[i] : undefined;
        const currentPath = [...path, i.toString()];
        const result = pipe(
          caster(value, currentPath),
          mapErr((err) =>
            i >= list.length
              ? castingErr(ERR_MISSING_VALUE, currentPath, {
                  expected: caster.name,
                })
              : err,
          ),
        );

        if (isErr(result)) return result;
        if (i < list.length) {
          items.push(unwrap(result));
        }
      }

      return ok(items);
    },
    `[${casters.map((c) => c.name).join(', ')}]`,
  );
