export const isInteger = (value: any): value is number =>
  Number.isInteger(value);

export const isString = (value: any): value is string =>
  typeof value === 'string';

export const isBoolean = (value: any): value is boolean =>
  typeof value === 'boolean';

export const isNumber = (value: any): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

export const isObject = (value: any): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isArray = (value: any): value is Array<unknown> =>
  Array.isArray(value);

export const isNull = (value: any): value is null => value === null;

export const isUndefined = (value: any): value is undefined =>
  value === undefined;
