import { describe, it, expect } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { Ok, Result, isOk, ok, unwrap } from 'resultage';
import { int, number, string } from './primitives';
import { CastingError, OkType } from './types';
import { castErr } from './casting-error';

describe('validation', () => {
  describe('int.validate', () => {
    const positiveInt = int.validate((value) => value > 0, 'PositiveInt');

    it.each([
      [1, 1],
      [2, 2],
      [3, 3],
    ])('returns ok(%p) for %p', (expected, value) => {
      const result: Result<number, CastingError> = positiveInt(value);

      expect(result).toEqual(ok(expected));
    });

    it.each([
      [-1, 'PositiveInt'],
      [0, 'PositiveInt'],
      [-2, 'PositiveInt'],
      [-3, 'PositiveInt'],
    ])('returns err(ERR_INVALID_VALUE) for %p', (value, expected) => {
      const result: Result<number, CastingError> = positiveInt(value);

      expect(result).toEqual(
        castErr('ERR_INVALID_VALUE', [], { expected, received: value }),
      );
    });
  });

  describe('string.validate(isEmail)', () => {
    type Email = string & { __brand: 'Email' };
    const isEmail = (value: string): value is Email =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const email = string.validate(isEmail, 'Email');

    type TEmail = OkType<typeof email>;

    it('Ensures<typeof email> is string & { __brand: "Email" }', () => {
      type Check = Expect<Equal<TEmail, Email>>;

      expect(true as Check).toBe(true);
    });

    it.each(['user@server.com', 'user@server.com.ua'])(
      'returns ok(%p)',
      (expected) => {
        const result: Result<Email, CastingError> = email(expected);

        expect(isOk(result)).toBe(true);

        const value: Email = unwrap(result as Ok<Email>);

        expect(value).toEqual(expected);
      },
    );

    it.each(['user@server', 'user@server.'])(
      'returns err(ERR_INVALID_VALUE) for %p',
      (value) => {
        const result: Result<Email, CastingError> = email(value);

        expect(result).toEqual(
          castErr('ERR_INVALID_VALUE', [], {
            expected: 'Email',
            received: value,
          }),
        );
      },
    );
  });

  describe('negativeNumber without type name', () => {
    const negativeNumber = number.validate((value) => value < 0);

    it.each([
      [-1, -1],
      [-2, -2],
      [-3, -3],
    ])('returns ok(%p) for %p', (expected, value) => {
      const result: Result<number, CastingError> = negativeNumber(value);

      expect(result).toEqual(ok(expected));
    });

    it.each([
      [0, 'number'],
      [1, 'number'],
      [2, 'number'],
      [3, 'number'],
    ])('returns err(ERR_INVALID_VALUE) for %p', (value, expected) => {
      const result: Result<number, CastingError> = negativeNumber(value);

      expect(result).toEqual(
        castErr('ERR_INVALID_VALUE', [], { expected, received: value }),
      );
    });
  });
});
