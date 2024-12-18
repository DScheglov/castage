import { Result, ok } from 'resultage';
import { fromGuardAndTransform } from './engine.js';
import { castErr } from './casting-error.js';
import {
  type Caster,
  type CastingError,
  ERR_INVALID_VALUE,
  type UndefinedAsOptional,
} from './types.js';
import { isObject, isString } from './predicates.js';
import { struct } from './struct.js';
import { array } from './array.js';

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
) as Caster<unknown> & {
  object: Caster<Record<string, unknown>>;
  struct: <T extends Record<string, any>>(
    casters: {
      [K in keyof T]: Caster<T[K]>;
    },
    name?: string,
  ) => Caster<UndefinedAsOptional<T>>;
  array: <T>(caster: Caster<T>, name?: string) => Caster<T[]>;
};

export const jsonObject = json.validate(isObject, 'Object');

json.object = jsonObject;

export const jsonStruct = <T extends Record<string, any>>(
  casters: {
    [K in keyof T]: Caster<T[K]>;
  },
  name = `Json({ ${(Object.entries(casters) as [string, Caster<any>][])
    .map(([k, v]) => `${k}: ${v.name}`)
    .join(', ')} })`,
): Caster<UndefinedAsOptional<T>> => json.chain(struct(casters, name), name);

json.struct = jsonStruct;

export const jsonArray = <T>(
  caster: Caster<T>,
  name = `JsonArray(${caster.name})`,
): Caster<T[]> => json.chain(array(caster, name), name);

json.array = jsonArray;
