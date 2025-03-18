import { ok } from 'resultage';
import { fromGuard, casterApi } from './engine.js';
import {
  isBoolean,
  isInteger,
  isNull,
  isNumber,
  isObject,
  isString,
  isUndefined,
} from './predicates.js';

export const int = fromGuard(isInteger, 'int');
export const string = fromGuard(isString, 'string');
export const boolean = fromGuard(isBoolean, 'boolean');
export const number = fromGuard(isNumber, 'number');
export const object = fromGuard(isObject, 'object');
export const nill = fromGuard(isNull, 'null');
export const undef = fromGuard(isUndefined, 'undefined');
export const any = fromGuard((value): value is any => true, 'any');
export const unknown = casterApi((value: unknown) => ok(value), 'unknown');
