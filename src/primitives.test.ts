import { describe, it, expect } from '@jest/globals';
import { ok } from 'resultage';
import * as t from './primitives';
import { ERR_INVALID_VALUE_TYPE } from './types';
import { castErr } from './casting-error';

describe('primitives', () => {
  describe('boolean', () => {
    it.each([false, true])('returns ok(%p)', (value) => {
      expect(t.boolean(value)).toEqual(ok(value));
    });

    it.each([0, 1, '', 'true', 'false', {}, [], null, undefined])(
      'returns err(ERR_INVALID_VALUE_TYPE) for %j',
      (value) => {
        expect(t.boolean(value)).toEqual(
          castErr(ERR_INVALID_VALUE_TYPE, [], {
            expected: 'boolean',
            received: value,
          }),
        );
      },
    );
  });

  describe('number', () => {
    it.each([
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1.5,
      1000,
      Number.MAX_SAFE_INTEGER,
      Number.POSITIVE_INFINITY,
    ])('returns ok(%p)', (value) => {
      expect(t.number(value)).toEqual(ok(value));
    });

    it.each([
      false,
      true,
      '',
      '0',
      '1',
      '1.5',
      {},
      [],
      Number.NaN,
      null,
      undefined,
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %s', (value) => {
      expect(t.number(value)).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, [], {
          expected: 'number',
          received: value,
        }),
      );
    });
  });

  describe('int', () => {
    it.each([
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1000,
      Number.MAX_SAFE_INTEGER,
    ])('returns ok(%p)', (value) => {
      expect(t.int(value)).toEqual(ok(value));
    });

    it.each([
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      1.5,
      false,
      true,
      '',
      '0',
      '1',
      '1.5',
      {},
      [],
      Number.NaN,
      null,
      undefined,
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %s', (value) => {
      expect(t.int(value)).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, [], {
          expected: 'int',
          received: value,
        }),
      );
    });
  });

  describe('string', () => {
    it.each([
      '',
      '0',
      '1',
      '1.5',
      'true',
      'false',
      'Hello, World!',
      'null',
      'undefined',
    ])('returns ok(%p)', (value) => {
      expect(t.string(value)).toEqual(ok(value));
    });

    it.each([
      false,
      true,
      {},
      [],
      null,
      undefined,
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1.5,
      1000,
      Number.MAX_SAFE_INTEGER,
      Number.POSITIVE_INFINITY,
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %s', (value) => {
      expect(t.string(value)).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, [], {
          expected: 'string',
          received: value,
        }),
      );
    });
  });

  describe('object', () => {
    it.each([
      {},
      { foo: 'bar' },
      { foo: 1, bar: 2 },
      { length: 1, 1: 0 },
      { ...[] },
    ])('returns ok(%p)', (value) => {
      expect(t.object(value)).toEqual(ok(value));
    });

    it.each([
      false,
      true,
      '',
      '0',
      '1',
      '1.5',
      'true',
      'false',
      [],
      null,
      undefined,
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1.5,
      1000,
      Number.MAX_SAFE_INTEGER,
      Number.POSITIVE_INFINITY,
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %s', (value) => {
      expect(t.object(value)).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, [], {
          expected: 'object',
          received: value,
        }),
      );
    });
  });

  describe('nill', () => {
    it.each([null])('returns ok(%p)', (value) => {
      expect(t.nill(value)).toEqual(ok(value));
    });

    it.each([
      false,
      true,
      '',
      '0',
      '1',
      '1.5',
      'true',
      'false',
      {},
      [],
      undefined,
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1.5,
      1000,
      Number.MAX_SAFE_INTEGER,
      Number.POSITIVE_INFINITY,
      'null',
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %s', (value) => {
      expect(t.nill(value)).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, [], {
          expected: 'null',
          received: value,
        }),
      );
    });
  });

  describe('undef', () => {
    it.each([undefined])('returns ok(%p)', (value) => {
      expect(t.undef(value)).toEqual(ok(value));
    });

    it.each([
      false,
      true,
      '',
      '0',
      '1',
      '1.5',
      'true',
      'false',
      {},
      [],
      null,
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1.5,
      1000,
      Number.MAX_SAFE_INTEGER,
      Number.POSITIVE_INFINITY,
      'undefined',
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %s', (value) => {
      expect(t.undef(value)).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, [], {
          expected: 'undefined',
          received: value,
        }),
      );
    });
  });

  describe('any', () => {
    it.each([
      false,
      true,
      '',
      '0',
      '1',
      '1.5',
      'true',
      'false',
      {},
      [],
      null,
      undefined,
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1.5,
      1000,
      Number.MAX_SAFE_INTEGER,
      Number.POSITIVE_INFINITY,
    ])('returns ok(%p)', (value) => {
      expect(t.any(value)).toEqual(ok(value));
    });
  });

  describe('unknown', () => {
    it.each([
      false,
      true,
      '',
      '0',
      '1',
      '1.5',
      'true',
      'false',
      {},
      [],
      null,
      undefined,
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER,
      -1000,
      -1,
      0,
      1,
      1.5,
      1000,
      Number.MAX_SAFE_INTEGER,
      Number.POSITIVE_INFINITY,
    ])('returns ok(%p)', (value) => {
      expect(t.unknown(value)).toEqual(ok(value));
    });
  });
});
