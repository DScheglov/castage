import { ok } from 'resultage';
import { fromGuardAndTransform } from './engine';
import { castingErr } from './casting-error';
import {
  Caster,
  CastingError,
  ERR_MISSING_VALUE,
  UndefinedAsOptional,
} from './types';
import { isObject } from './predicates';
import { hasOwn, propertyKeys } from './tools';

type Schema<T> = { readonly schema: T };

const errMissingValue = (error: CastingError, caster: Caster<unknown>) =>
  castingErr(ERR_MISSING_VALUE, error.path, { expected: caster.name });

const defaultStructName = (casters: Record<PropertyKey, any>) =>
  `{ ${(Object.entries(casters) as [PropertyKey, Caster<any>][])
    .map(([k, v]) => `${String(k)}: ${v.name}`)
    .join(', ')} }`;

export const struct = <T extends Record<PropertyKey, any>>(
  casters: { [K in keyof T]: Caster<T[K]> },
  name = defaultStructName(casters),
): Caster<UndefinedAsOptional<T>> & Schema<{ [K in keyof T]: Caster<T[K]> }> =>
  Object.defineProperties(
    fromGuardAndTransform(
      isObject,
      (value, path) => {
        const result = {} as T;
        const keys = propertyKeys(casters);

        for (let i = 0; i < keys.length; i += 1) {
          const k = keys[i];
          const caster = casters[k] as Caster<T[typeof k]>;
          const v = value[k];

          const kResult = caster(v, [...path, String(k)]).mapErr((error) =>
            !hasOwn(value, k) ? errMissingValue(error, caster) : error,
          );

          if (kResult.isErr) return kResult;
          result[k] = kResult.unwrap();
        }

        return ok(result);
      },
      name,
    ) as Caster<T> & Schema<{ [K in keyof T]: Caster<T[K]> }>,
    {
      schema: {
        enumerable: true,
        get: () => casters,
      },
    },
  );
