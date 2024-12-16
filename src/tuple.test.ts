import { describe, it, expect } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { ok } from 'resultage';
import { number, string } from './primitives';

import { tuple } from './tuple';
import { OkType } from './types';
import { castErr } from './casting-error';

describe('tuple', () => {
  describe('tuple(string, number)', () => {
    const coords2d = tuple(number, number);

    type Coords2d = OkType<typeof coords2d>;

    it('produces correct type', () => {
      type Check = Expect<Equal<Coords2d, [number, number]>>;

      const result: Check = true;

      expect(result).toEqual(true);
    });

    it.each([[[0, 0]], [[1, 2]], [[-1, -2]], [[1.5, 2.5]]])(
      'returns ok(%p)',
      (value) => {
        expect(coords2d(value)).toEqual(ok(value));
      },
    );

    it.each([
      [0],
      [1],
      [-1],
      [1.5],
      ['0'],
      ['1'],
      ['-1'],
      ['1.5'],
      [true],
      [false],
      [{}],
      [null],
      [undefined],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %p', (value) => {
      expect(coords2d(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', [], {
          expected: '[number, number]',
          received: value,
        }),
      );
    });

    it.each([[[]], [[0]], [[1]], [[-1]], [[1.5]]])(
      'returns err(ERR_MISSING_VALUE) for %p',
      (value) => {
        expect(coords2d(value)).toEqual(
          castErr('ERR_MISSING_VALUE', [value.length.toString()], {
            expected: 'number',
          }),
        );
      },
    );

    it.each([
      [['a']],
      [[0, 'b']],
      [[1, true]],
      [[undefined, -1]],
      [[null, 1.5]],
      [[null, null]],
      [[undefined, undefined]],
      [new Array(2)],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %p', (value: any[]) => {
      const firstNotNumber = value.findIndex((v) => typeof v !== 'number');
      expect(coords2d(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', [firstNotNumber.toString()], {
          expected: 'number',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          received: value[firstNotNumber],
        }),
      );
    });
  });

  describe('tuple(string, number, number)', () => {
    const namedCoords2d = tuple(string, number, number);

    type NamedCoords2d = OkType<typeof namedCoords2d>;

    it('produces correct type', () => {
      type Check = Expect<Equal<NamedCoords2d, [string, number, number]>>;

      const result: Check = true;

      expect(result).toEqual(true);
    });

    it.each([
      [['foo', 0, 0]],
      [['bar', 1, 2]],
      [['baz', -1, -2]],
      [['qux', 1.5, 2.5]],
    ])('returns ok(%p)', (value) => {
      expect(namedCoords2d(value)).toEqual(ok(value));
    });

    it.each([
      [0],
      [1],
      [-1],
      [1.5],
      ['0'],
      ['1'],
      ['-1'],
      ['1.5'],
      [true],
      [false],
      [{}],
      [null],
      [undefined],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %p', (value) => {
      expect(namedCoords2d(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', [], {
          expected: '[string, number, number]',
          received: value,
        }),
      );
    });
  });
});
