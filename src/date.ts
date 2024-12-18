import { ok } from 'resultage';
import { fromGuardAndTransform } from './engine.js';
import { castErr } from './casting-error.js';
import { isNumber } from './predicates.js';
import type { Caster } from './types';

const parseDate = (
  value: string | number | Date,
  path: string[],
  typeName: string,
) => {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime())
    ? castErr('ERR_INVALID_VALUE', path, {
        expected: typeName,
        received: value,
      })
    : ok(date);
};

export const date = fromGuardAndTransform(
  (value) =>
    value instanceof Date ||
    typeof value === 'string' ||
    typeof value === 'number',
  (value, path) => parseDate(value, path, 'JsDate'),
  'JsDate',
) as Caster<Date> & { iso: Caster<Date> };

export const unixDateTimeStamp = fromGuardAndTransform(
  isNumber,
  (value, path) => parseDate(value * 1000, path, 'UnixDateTimeStamp'),
  'UnixDateTimeStamp',
);

export const jsDateTimeStamp = fromGuardAndTransform(
  isNumber,
  (value, path) => parseDate(value, path, 'JsDateTimeStamp'),
  'JsDateTimeStamp',
);

const isoRegex =
  /^\d{4}(-\d{2}(-\d{2})?)?([T\s]\d{2}(:\d{2}(:\d{2}(\.\d+)?)?)?)?(Z|[-+]\d+(:\d+)?)?$/;

export const isoDate = fromGuardAndTransform(
  (value): value is string => typeof value === 'string',
  (value, path) =>
    isoRegex.test(value)
      ? parseDate(value, path, 'IsoDate')
      : castErr('ERR_INVALID_VALUE', path, {
          expected: 'IsoDate',
          received: value,
        }),
  'IsoDate',
);

date.iso = isoDate;

export const dateTimeStamp = {
  unix: unixDateTimeStamp,
  js: jsDateTimeStamp,
};
