import { unwrap, ok, mapErr } from 'resultage';
import { pipe } from 'resultage/fn';
import { fromGuardAndTransform } from './engine';
import { Caster, CasterFn, ERR_INVALID_KEY } from './types';
import { isObject } from './predicates';
import { propertyKeys } from './tools';
import { updateError } from './casting-error';

export const record = <K extends PropertyKey, T>(
  key: CasterFn<K>,
  value: CasterFn<T>,
  name = `Record<${key.name}, ${value.name}>`,
): Caster<Record<K, T>> =>
  fromGuardAndTransform(
    (value): value is Record<K, T> => isObject(value),
    (val, path) => {
      const result: Record<K, T> = {} as Record<K, T>;
      const keys = propertyKeys(val);

      for (let i = 0; i < keys.length; i += 1) {
        const k = keys[i];
        const v = val[k];

        const keyResult = pipe(
          key(k, path),
          mapErr(updateError({ code: ERR_INVALID_KEY, path })),
        );

        if (keyResult.isErr) return keyResult;

        const valueResult = value(v, [...path, String(k)]);

        if (valueResult.isErr) return valueResult;

        result[unwrap(keyResult)] = unwrap(valueResult);
      }

      return ok(result);
    },
    name,
  );
