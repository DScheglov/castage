import { describe, it, expect } from '@jest/globals';
import { allOf } from './allOf';
import { number, string } from './primitives';
import { struct } from './struct';
import { castingErr } from './casting-error';

describe('allOf', () => {
  const caster1 = struct({ a: number });

  const caster2 = struct({ b: string });

  it('should combine multiple casters and merge their results', () => {
    expect.assertions(2);
    const combinedCaster = allOf(caster1, caster2);
    const result = combinedCaster({ a: 1, b: 'test' });

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value).toEqual({ a: 1, b: 'test' });
    }
  });

  it('should return an error if any caster fails', () => {
    expect.assertions(2);

    const combinedCaster = allOf(caster1, caster2);
    const result = combinedCaster({ a: 1, b: 2 });

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toEqual(
        castingErr('ERR_INVALID_VALUE_TYPE', ['b'], {
          expected: 'string',
          received: 2,
        }),
      );
    }
  });

  it('should return an error if input is not an object', () => {
    expect.assertions(2);
    const combinedCaster = allOf(caster1, caster2);
    const result = combinedCaster(null);

    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toEqual(
        castingErr('ERR_INVALID_VALUE_TYPE', [], {
          expected: '({ a: number } & { b: string })',
          received: null,
        }),
      );
    }
  });
});
