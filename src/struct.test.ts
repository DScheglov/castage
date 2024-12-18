import { describe, it, expect } from '@jest/globals';
import { Expect, Equal } from '@type-challenges/utils';
import { Result, ok } from 'resultage';
import { struct } from './struct';
import { number, string, boolean } from './primitives';
import { CastingError, OkType } from './types';
import { castErr, castingErr } from './casting-error';

describe('struct', () => {
  describe('simple struct', () => {
    const User = struct(
      {
        name: string,
        age: number,
        isMarried: boolean,
      },
      'User',
    );

    type TUser = OkType<typeof User>;

    it('Ensures<typeof User> is { name: string; age: number; isMarried: boolean }', () => {
      type Check = Expect<
        Equal<
          TUser,
          {
            name: string;
            age: number;
            isMarried: boolean;
          }
        >
      >;

      expect(true as Check).toBe(true);
    });

    it.each([
      [{ name: 'John', age: 42, isMarried: false } as unknown],
      [{ name: 'John', age: 42, isMarried: true } as unknown],
    ])('returns ok(%p)', (value) => {
      const result: Result<
        { name: string; age: number; isMarried: boolean },
        CastingError
      > = User(value);

      expect(result).toEqual(ok(value));
    });

    it.each([
      [{ name: 'John', age: 42 } as unknown, 'boolean', 'isMarried'],
      [{ name: 'John', isMarried: true } as unknown, 'number', 'age'],
      [{ age: 42, isMarried: true } as unknown, 'string', 'name'],
    ])('returns err(ERR_MISSING_VALUE) for %j', (value, expected, missing) => {
      const result: Result<
        { name: string; age: number; isMarried: boolean },
        CastingError
      > = User(value, ['user']);

      expect(result).toEqual(
        castErr('ERR_MISSING_VALUE', ['user', missing], { expected }),
      );
    });

    it.each([
      [
        { name: 'John', age: 42, isMarried: 123 } as unknown,
        'boolean',
        'isMarried',
      ],
      [
        { name: 'John', isMarried: true, age: 'twelve' } as unknown,
        'number',
        'age',
      ],
      [{ name: null, age: 42, isMarried: true } as unknown, 'string', 'name'],
      [
        { name: 'John', age: 42, isMarried: undefined } as unknown,
        'boolean',
        'isMarried',
      ],
      [
        { name: 'John', isMarried: true, age: undefined } as unknown,
        'number',
        'age',
      ],
      [
        { name: undefined, age: 42, isMarried: true } as unknown,
        'string',
        'name',
      ],
    ])(
      'returns err(ERR_INVALID_VALUE_TYPE) for %j',
      (value, expected, wrong) => {
        const result: Result<
          { name: string; age: number; isMarried: boolean },
          CastingError
        > = User(value, ['user']);

        expect(result).toEqual(
          castErr('ERR_INVALID_VALUE_TYPE', ['user', wrong], {
            expected,
            received: (value as any)[wrong as any],
          }),
        );
      },
    );
  });

  describe('nested struct', () => {
    const User = struct(
      {
        name: string,
        age: number,
        isMarried: boolean,
        address: struct(
          {
            street: string,
            city: string,
            zip: number,
          },
          'Address',
        ),
      },
      'User',
    );

    type TUser = OkType<typeof User>;

    it('Ensures<typeof User> is { name: string; age: number; isMarried: boolean; address: { street: string; city: string; zip: number; } }', () => {
      type Check = Expect<
        Equal<
          TUser,
          {
            name: string;
            age: number;
            isMarried: boolean;
            address: { street: string; city: string; zip: number };
          }
        >
      >;

      expect(true as Check).toBe(true);
    });

    it.each([
      [
        {
          name: 'John',
          age: 42,
          isMarried: false,
          address: {
            street: '123 Main St',
            city: 'Any Town',
            zip: 12345,
          },
        } as unknown,
      ],
      [
        {
          name: 'John',
          age: 42,
          isMarried: true,
          address: {
            street: '123 Main St',
            city: 'Any Town',
            zip: 12345,
          },
        } as unknown,
      ],
    ])('returns ok(%p)', (value) => {
      const result: Result<
        {
          name: string;
          age: number;
          isMarried: boolean;
          address: { street: string; city: string; zip: number };
        },
        CastingError
      > = User(value);

      expect(result).toEqual(ok(value));
    });

    it.each([
      [
        {
          name: 'John',
          age: 42,
          isMarried: false,
          address: {
            street: '123 Main St',
            city: 'Any Town',
            zip: '12345',
          },
        } as unknown,
        'number',
        'address',
        'zip',
      ],
    ])(
      'returns err(ERR_INVALID_VALUE_TYPE) for %j',
      (value, expected, missing, key) => {
        const result: Result<
          {
            name: string;
            age: number;
            isMarried: boolean;
            address: { street: string; city: string; zip: number };
          },
          CastingError
        > = User(value, ['user']);

        expect(result).toEqual(
          castErr('ERR_INVALID_VALUE_TYPE', ['user', missing, key], {
            expected,
            received: (value as any)[missing][key],
          }),
        );
      },
    );
    it.each([
      [
        {
          name: 'John',
          age: 42,
          isMarried: false,
          address: {
            street: '123 Main St',
            city: 'Any Town',
          },
        } as unknown,
        'number',
        'address',
        'zip',
      ],
      [
        {
          name: 'John',
          age: 42,
          isMarried: false,
          address: {
            street: '123 Main St',
            zip: 12345,
          },
        } as unknown,
        'string',
        'address',
        'city',
      ],
      [
        {
          name: 'John',
          age: 42,
          isMarried: false,
          address: {
            city: 'Any Town',
            zip: 12345,
          },
        } as unknown,
        'string',
        'address',
        'street',
      ],
    ])(
      'returns err(ERR_MISSING_VALUE) for %j',
      (value, expected, missing, key) => {
        const result: Result<
          {
            name: string;
            age: number;
            isMarried: boolean;
            address: { street: string; city: string; zip: number };
          },
          CastingError
        > = User(value, ['user']);

        expect(result).toEqual(
          castErr('ERR_MISSING_VALUE', ['user', missing, key], { expected }),
        );
      },
    );
  });
});

describe('struct.parse', () => {
  const User = struct(
    {
      name: string,
      age: number,
      isMarried: boolean,
    },
    'User',
  );

  it.each([
    [
      { name: 'John', age: 42, isMarried: false },
      { name: 'John', age: 42, isMarried: false },
    ],
    [
      { name: 'John', age: 42, isMarried: true },
      { name: 'John', age: 42, isMarried: true },
    ],
  ])('returns ok(%p) for %j', (value, expected) => {
    expect(User.parse(value, [])).toEqual(ok(expected));
  });

  it.each([
    [{ name: 'John', age: 42 }, 'boolean', 'isMarried'],
    [{ name: 'John', isMarried: true }, 'number', 'age'],
    [{ age: 42, isMarried: true }, 'string', 'name'],
  ])('returns err(ERR_MISSING_VALUE) for %j', (value, expected, missing) => {
    expect.assertions(3);

    const result = User.parse(value, []);

    expect(result.isErr).toBe(true);

    if (result.isErr) {
      expect(result.error).toHaveLength(1);
      expect(result.error[0]).toEqual(
        castingErr('ERR_MISSING_VALUE', [missing], { expected }),
      );
    }
  });

  it.each([
    [
      {},
      [
        castingErr('ERR_MISSING_VALUE', ['name'], { expected: 'string' }),
        castingErr('ERR_MISSING_VALUE', ['age'], { expected: 'number' }),
        castingErr('ERR_MISSING_VALUE', ['isMarried'], { expected: 'boolean' }),
      ],
    ],
    [
      { name: 1, age: '42' },
      [
        castingErr('ERR_INVALID_VALUE_TYPE', ['name'], {
          expected: 'string',
          received: 1,
        }),
        castingErr('ERR_INVALID_VALUE_TYPE', ['age'], {
          expected: 'number',
          received: '42',
        }),
        castingErr('ERR_MISSING_VALUE', ['isMarried'], {
          expected: 'boolean',
        }),
      ],
    ],
  ])('returns list of errors for %j', (value, errors) => {
    expect.assertions(3);

    const result = User.parse(value, []);

    expect(result.isErr).toBe(true);

    if (result.isErr) {
      expect(result.error).toHaveLength(errors.length);
      expect(result.error).toEqual(errors);
    }
  });
});
