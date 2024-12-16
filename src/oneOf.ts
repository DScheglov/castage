import { fromGuardAndTransform } from './engine';
import { castErr } from './casting-error';
import {
  Caster,
  CasterFn,
  CastingError,
  ERR_INVALID_VALUE_TYPE,
} from './types';

export const oneOf = <T extends unknown[]>(
  ...casters: {
    [K in keyof T]: CasterFn<T[K]>;
  }
): Caster<T[number]> => {
  const name = `(${casters.map((c) => c.name).join(' | ')})`;

  return fromGuardAndTransform(
    (value): value is unknown => true,
    (value, path) => {
      const errors: CastingError[] = [];
      for (let i = 0; i < casters.length; i += 1) {
        const caster = casters[i] as CasterFn<T[number]>;
        const result = caster(value, path);
        if (result.isOk) return result;
        errors.push(result.unwrapErr());
      }

      return castErr(ERR_INVALID_VALUE_TYPE, path, {
        expected: name,
        received: value,
        causes: errors,
      });
    },
    name,
  );
};
