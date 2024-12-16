import { ok } from 'resultage';

import { fromGuardAndTransform, is } from './engine';
import { castErr } from './casting-error';
import { ERR_INVALID_VALUE } from './types';
import { isString } from './predicates';
import { boolean, int, number } from './primitives';
import { oneOf } from './oneOf';
import { values } from './values';

export const textInt = fromGuardAndTransform(
  isString,
  (value, path) => {
    const result = +value;
    return Number.isInteger(result)
      ? castErr(ERR_INVALID_VALUE, path, {
          expected: 'text::int',
          received: value,
        })
      : ok(result);
  },
  'text::int',
);

export const textNumber = fromGuardAndTransform(isString, (value, path) => {
  const result = +value;
  return Number.isNaN(result)
    ? castErr(ERR_INVALID_VALUE, path, {
        expected: 'text::number',
        received: value,
      })
    : ok(result);
});

const boolValues = values('true', 'false');

export const textBool = fromGuardAndTransform(is(boolValues), (value, path) => {
  switch (value) {
    case 'true':
      return ok(true);
    case 'false':
      return ok(false);
    default:
      return castErr(ERR_INVALID_VALUE, path, {
        expected: 'text::boolean',
        received: value,
      });
  }
});

export const possibleTextInt = oneOf(int, textInt);
export const possibleTextNumber = oneOf(number, textNumber);
export const possibleTextBool = oneOf(boolean, textBool);
