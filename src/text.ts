import { ok } from 'resultage';

import { fromGuardAndTransform, is } from './engine.js';
import { castErr } from './casting-error.js';
import { ERR_INVALID_VALUE } from './types.js';
import { isString } from './predicates.js';
import { boolean, int, number } from './primitives.js';
import { oneOf } from './oneOf.js';
import { values } from './values.js';

export const textInt = fromGuardAndTransform(
  (value): value is string => isString(value) && /^-?\d+$/.test(value),
  (value, path) => {
    const result = +value;
    return Number.isInteger(result)
      ? ok(result)
      : castErr(ERR_INVALID_VALUE, path, {
          expected: 'text::int',
          received: value,
        });
  },
  'text::int',
);

export const textNumber = fromGuardAndTransform(
  (value): value is string =>
    isString(value) && value.trim() !== '' && !Number.isNaN(+value),
  (value, path) => {
    const result = +value;
    return Number.isNaN(result)
      ? castErr(ERR_INVALID_VALUE, path, {
          expected: 'text::number',
          received: value,
        })
      : ok(result);
  },
  'text::number',
);

const boolValues = values('true', 'false');

export const textBool = fromGuardAndTransform(
  is(boolValues),
  (value) => ok(value === 'true'),
  'text::boolean',
);

export const text = {
  int: textInt,
  number: textNumber,
  bool: textBool,
};

export const possibleTextInt = oneOf(int, textInt);
export const possibleTextNumber = oneOf(number, textNumber);
export const possibleTextBool = oneOf(boolean, textBool);

export const possibleText = {
  int: possibleTextInt,
  number: possibleTextNumber,
  bool: possibleTextBool,
};
