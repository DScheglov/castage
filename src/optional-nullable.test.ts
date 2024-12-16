import { describe, it, expect } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { ok } from 'resultage';
import { OkType } from './types';
import { int, number, string } from './primitives';
import { struct } from './struct';
import { tuple } from './tuple';
import { castErr } from './casting-error';

describe('optionals', () => {
  describe('int.optional', () => {
    const maybeInt = int.optional;

    type MaybeInt = OkType<typeof maybeInt>;

    it('produces correct type', () => {
      type Check = Expect<Equal<MaybeInt, number | undefined>>;

      const result: Check = true;

      expect(result).toEqual(true);
    });

    it('must have correct name', () => {
      expect(maybeInt.name).toEqual('int | undefined');
    });

    it.each([
      [Number.MIN_SAFE_INTEGER],
      [-1000],
      [0],
      [1],
      [-1],
      [1000],
      [Number.MAX_SAFE_INTEGER],
      [undefined],
    ])('returns ok(%p)', (value) => {
      expect(maybeInt(value)).toEqual(ok(value));
    });

    it.each([
      [false],
      [true],
      [{}],
      [[]],
      [''],
      ['bla-bla'],
      [1.5],
      [123n],
      [null],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %p', (value) => {
      expect(maybeInt(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', [], {
          expected: 'int | undefined',
          received: value,
        }),
      );
    });
  });

  describe('optional fields', () => {
    const User = struct({
      name: string,
      age: int.optional,
    });

    type TUser = OkType<typeof User>;

    it('produces correct type', () => {
      type Check = Expect<
        Equal<
          TUser,
          {
            name: string;
            age?: number | undefined;
          }
        >
      >;

      const result: Check = true;

      expect(result).toEqual(true);
    });

    it('must have correct name', () => {
      expect(User.name).toEqual('{ name: string, age: int | undefined }');
    });

    it.each([
      [{ name: 'John', age: 30 }],
      [{ name: 'John', age: undefined }],
      [{ name: 'John' }],
    ])('returns ok(%p)', (value) => {
      expect(User(value)).toEqual(ok(value));
    });

    it.each([
      [{ name: 'John', age: '30' }],
      [{ name: 'John', age: true }],
      [{ name: 'John', age: {} }],
      [{ name: 'John', age: [] }],
      [{ name: 'John', age: 1.5 }],
      [{ name: 'John', age: 123n }],
      [{ name: 'John', age: null }],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %p', (value) => {
      expect(User(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', ['age'], {
          expected: 'int | undefined',
          received: value.age,
        }),
      );
    });
  });

  describe('tuple with optional items', () => {
    const coords = tuple(number, number.optional, number.optional);

    type TCoords = OkType<typeof coords>;

    it('produces correct type', () => {
      type Check = Expect<
        Equal<TCoords, [number, number | undefined, number | undefined]>
      >;

      const result: Check = true;

      expect(result).toEqual(true);
    });

    it('must have correct name', () => {
      expect(coords.name).toEqual(
        '[number, number | undefined, number | undefined]',
      );
    });

    it.each([
      [[0, 0, 0]],
      [[1, 2, 3]],
      [[-1, -2, -3]],
      [[1.5, 2.5, 3.5]],
      [[1.5, undefined, 3.5]],
      [[1.5, undefined, undefined]],
      [[0]],
      [[1, 2.2]],
      [[2.2, undefined]],
    ])('returns ok(%p)', (value) => {
      expect(coords(value)).toEqual(ok(value));
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
      expect(coords(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', [], {
          expected: '[number, number | undefined, number | undefined]',
          received: value,
        }),
      );
    });

    it.each([
      [[0, 0, '0']],
      [[0, 0, true]],
      [[0, 0, {}]],
      [[0, 0, []]],
      [[0, 0, null]],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %p', (value) => {
      expect(coords(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', ['2'], {
          expected: 'number | undefined',
          received: value[2],
        }),
      );
    });

    it.each([
      [[null, 0, '0']],
      [[undefined, 0, true]],
      [['', 0, {}]],
      [[[], 0, []]],
      [[{}, 0, null]],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %p', (value) => {
      expect(coords(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', ['0'], {
          expected: 'number',
          received: value[0],
        }),
      );
    });
  });

  describe('string.nullable', () => {
    const nullableString = string.nullable;

    type NullableString = OkType<typeof nullableString>;

    it('produces correct type', () => {
      type Check = Expect<Equal<NullableString, string | null>>;

      const result: Check = true;

      expect(result).toEqual(true);
    });

    it('must have correct name', () => {
      expect(nullableString.name).toEqual('string | null');
    });

    it.each(['', 'bla-bla', null])('returns ok(%p)', (value) => {
      expect(nullableString(value)).toEqual(ok(value));
    });

    it.each([false, true, {}, [], 0, 1, 1.5, 123n, undefined])(
      'returns err(ERR_INVALID_VALUE_TYPE) for %p',
      (value) => {
        expect(nullableString(value)).toEqual(
          castErr('ERR_INVALID_VALUE_TYPE', [], {
            expected: 'string | null',
            received: value,
          }),
        );
      },
    );
  });
});
