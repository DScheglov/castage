import { isErr, unwrap, ok, Result, err } from 'resultage';
import { fromGuardAndTransform } from './engine.js';
import { castingErr } from './casting-error.js';
import {
  Caster,
  CasterFn,
  CastingError,
  ERR_INVALID_VALUE_TYPE,
  ERR_MISSING_VALUE,
} from './types.js';
import { isArray } from './predicates.js';

export const tuple = <T extends unknown[]>(
  ...casters: {
    [K in keyof T]: Caster<T[K]>;
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
        const result = caster(value, currentPath).mapErr((err) =>
          i >= list.length
            ? castingErr(ERR_MISSING_VALUE, currentPath, {
                expected: caster.name,
              })
            : err,
        );

        if (isErr(result)) return result;
        if (i < list.length) {
          items.push(unwrap(result));
        }
      }

      return ok(items);
    },
    `[${casters.map((c) => c.name).join(', ')}]`,
    ERR_INVALID_VALUE_TYPE,
    (list, path): Result<T, CastingError[]> => {
      const items = [] as unknown as T;
      const errors: CastingError[] = [];

      for (let i = 0; i < casters.length; i += 1) {
        const caster = casters[i] as Caster<T>;
        const value = i < list.length ? list[i] : undefined;
        const currentPath = [...path, i.toString()];
        const result = caster.parse(value, currentPath).mapErr((errors) =>
          errors.map((err) =>
            i >= list.length
              ? castingErr(ERR_MISSING_VALUE, currentPath, {
                  expected: caster.name,
                })
              : err,
          ),
        );

        if (isErr(result)) {
          errors.push(...result.error);
          continue;
        }

        if (i < list.length) {
          items.push(result.value);
        }
      }

      return errors.length === 0 ? ok(items) : err(errors);
    },
  );
