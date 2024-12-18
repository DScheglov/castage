import { describe, it, expect } from '@jest/globals';
import { ok } from 'resultage';
import { int, string, number } from './primitives';
import { array, nonEmptyArray } from './array';
import { ERR_INVALID_VALUE, ERR_INVALID_VALUE_TYPE } from './types';
import { isInteger, isNumber } from './predicates';
import { castErr, castingErr } from './casting-error';

describe('array', () => {
  describe('array(int)', () => {
    const arrayType = array(int);
    it.each([[[]], [[0]], [[1, 2, 3]]])('returns ok(%p)', (value) => {
      expect(arrayType(value)).toEqual(ok(value));
    });

    it.each([false, true, '', '0', '1', '1.5', {}, null, undefined])(
      'returns err(ERR_INVALID_VALUE_TYPE) for %j',
      (value) => {
        expect(arrayType(value)).toEqual(
          castErr(ERR_INVALID_VALUE_TYPE, [], {
            expected: 'Array<int>',
            received: value,
          }),
        );
      },
    );

    it.each([
      [[0, 1, 2, 4, '']],
      [[1.5]],
      [[{}]],
      [[[]]],
      [[null]],
      [[undefined]],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %j', (value) => {
      const idx = value.findIndex((v) => !isInteger(v));
      expect(arrayType(value, ['list'])).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, ['list', idx.toString()], {
          expected: 'int',
          received: value[idx],
        }),
      );
    });
  });

  describe('array(string)', () => {
    const arrayType = array(string);
    it.each([[[]], [['']], [['a', 'b', 'c']]])('returns ok(%p)', (value) => {
      expect(arrayType(value)).toEqual(ok(value));
    });

    it.each([false, true, 0, 1, 1.5, {}, null, undefined])(
      'returns err(ERR_INVALID_VALUE_TYPE) for %j',
      (value) => {
        expect(arrayType(value)).toEqual(
          castErr(ERR_INVALID_VALUE_TYPE, [], {
            expected: 'Array<string>',
            received: value,
          }),
        );
      },
    );

    it.each([
      [['a', 'b', 'c', 1]],
      [[0]],
      [[1.5]],
      [[{}]],
      [[[]]],
      [[null]],
      [[undefined]],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %j', (value) => {
      const idx = value.findIndex((v) => typeof v !== 'string');
      expect(arrayType(value, ['list'])).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, ['list', idx.toString()], {
          expected: 'string',
          received: value[idx],
        }),
      );
    });
  });

  describe('nonEmptyArray(number)', () => {
    const arrayType = nonEmptyArray(number);
    it.each([[[0]], [[1, 2, 3]]])('returns ok(%p)', (value) => {
      expect(arrayType(value)).toEqual(ok(value));
    });

    it.each([[[]]])('returns err(ERR_INVALID_VALUE) for %j', (value) => {
      expect(arrayType(value)).toEqual(
        castErr(ERR_INVALID_VALUE, [], {
          expected: '[number, ...]',
          received: value,
        }),
      );
    });

    it.each([
      [false],
      [true],
      [''],
      ['0'],
      ['1'],
      ['1.5'],
      [{}],
      [null],
      [undefined],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %j', (value) => {
      expect(arrayType(value)).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, [], {
          expected: 'NonEmptyArray<number>',
          received: value,
        }),
      );
    });

    it.each([
      [[0, 1, 2, 4, '']],
      [[1.5, Number.NaN]],
      [[{}]],
      [[[]]],
      [[null]],
      [[undefined]],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %j', (value) => {
      const idx = value.findIndex((v) => !isNumber(v));
      expect(arrayType(value, ['list'])).toEqual(
        castErr(ERR_INVALID_VALUE_TYPE, ['list', idx.toString()], {
          expected: 'number',
          received: value[idx],
        }),
      );
    });
  });
});

describe('array.parse', () => {
  describe('array(int)', () => {
    const arrayType = array(int);
    it.each([[[]], [[0]], [[1, 2, 3]]])('returns ok(%p)', (value) => {
      expect(arrayType.parse(value, [])).toEqual(ok(value));
    });

    it.each([false, true, '', '0', '1', '1.5', {}, null, undefined])(
      'returns err(ERR_INVALID_VALUE_TYPE[]) for %j',
      (value) => {
        expect.assertions(3);
        const result = arrayType.parse(value, []);

        expect(result.isErr).toBe(true);
        if (result.isErr) {
          expect(result.error).toHaveLength(1);
          expect(result.error[0]).toEqual(
            castingErr(ERR_INVALID_VALUE_TYPE, [], {
              expected: 'Array<int>',
              received: value,
            }),
          );
        }
      },
    );

    it.each([
      [[0, 1, 2, 4, ''], 4],
      [[1.5], 0],
      [[{}], 0],
      [[[]], 0],
      [[null], 0],
      [[undefined], 0],
    ])('returns err(ERR_INVALID_VALUE_TYPE[]) for %j', (value, failedIndex) => {
      expect.assertions(3);

      const result = arrayType.parse(value, ['list']);

      expect(result.isErr).toBe(true);

      if (result.isErr) {
        expect(result.error).toHaveLength(1);
        expect(result.error[0]).toEqual(
          castingErr(ERR_INVALID_VALUE_TYPE, ['list', failedIndex.toString()], {
            expected: 'int',
            received: value[failedIndex],
          }),
        );
      }
    });
  });
});
