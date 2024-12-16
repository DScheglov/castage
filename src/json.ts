import { Result, ok } from 'resultage';
import { fromGuardAndTransform } from './engine';
import { castErr } from './casting-error';
import {
  Caster,
  CastingError,
  ERR_INVALID_VALUE,
  UndefinedAsOptional,
} from './types';
import { isObject, isString } from './predicates';
import { struct } from './struct';

export const json = fromGuardAndTransform(
  isString,
  (value, path): Result<unknown, CastingError> => {
    try {
      return ok(JSON.parse(value) as unknown);
    } catch (error) {
      const err = error as Error;
      return castErr(ERR_INVALID_VALUE, path, {
        expected: 'JSON',
        received: value,
        reason: JSON.stringify(err.message).slice(1, -1),
      });
    }
  },
  'JSON',
);

export const jsonObject = json.validate(isObject, 'Object');

export const jsonStruct = <T extends Record<string, any>>(
  casters: {
    [K in keyof T]: Caster<T[K]>;
  },
  name = `Json({ ${(Object.entries(casters) as [string, Caster<any>][])
    .map(([k, v]) => `${k}: ${v.name}`)
    .join(', ')} })`,
): Caster<UndefinedAsOptional<T>> => json.chain(struct(casters, name), name);
