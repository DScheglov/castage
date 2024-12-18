import { fromGuard } from './engine.js';
import {
  isInteger,
  isString,
  isBoolean,
  isNumber,
  isObject,
  isNull,
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
