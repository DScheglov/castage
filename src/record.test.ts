import { describe, it, expect } from '@jest/globals';
import { ok } from 'resultage';
import { number, string } from './primitives';
import { values } from './values';
import { record } from './record';
import { castErr } from './casting-error';

describe('record', () => {
  describe('record(string, string)', () => {
    const recordType = record(string, string);
    it.each([[{}], [{ 0: '0' }], [{ 1: '1' }], [{ 1: '1', 2: '2', 3: '3' }]])(
      'returns ok(%p)',
      (value) => {
        expect(recordType(value)).toEqual(ok(value));
      },
    );

    it.each([
      [false],
      [true],
      [''],
      ['0'],
      ['1'],
      ['1.5'],
      [[]],
      [[1]],
      [[1, 2, 3]],
      [null],
      [undefined],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %j', (value) => {
      expect(recordType(value)).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', [], {
          expected: 'Record<string, string>',
          received: value,
        }),
      );
    });

    it.each([[{ [Symbol.for('z')]: '3' }]])(
      'returns err(ERR_INVALID_KEY) for %j',
      (value) => {
        expect(recordType(value, ['obj'])).toEqual(
          castErr('ERR_INVALID_KEY', ['obj'], {
            expected: 'string',
            received: Symbol.for('z'),
          }),
        );
      },
    );

    it.each([
      [{ s: 1 }],
      [{ s: 's', b: {} }],
      [{ s: 's', b: [] }],
      [{ s: 's', b: null }],
      [{ s: 's', b: undefined }],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %j', (value) => {
      const keys = Object.keys(value) as (keyof typeof value)[];
      const key = keys.find((k) => typeof value[k] !== 'string');
      expect(recordType(value, ['obj'])).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', ['obj', key!], {
          expected: 'string',
          received: value[key!],
        }),
      );
    });
  });

  describe('record(values("x", "y"), number)', () => {
    const recordType = record(values('x', 'y'), number);
    it.each([[{}], [{ x: 1 }], [{ x: 1, y: 2 }]])('returns ok(%p)', (value) => {
      expect(recordType(value)).toEqual(ok(value));
    });

    it.each([
      [{ x: 1, z: 2 }],
      // [{ z: '3' }],
    ])('returns err(ERR_INVALID_KEY) for %j', (value) => {
      expect(recordType(value, ['obj'])).toEqual(
        castErr('ERR_INVALID_KEY', ['obj'], {
          expected: '"x" | "y"',
          received: 'z',
        }),
      );
    });

    it.each([
      [{ x: 1, y: '3' }],
      [{ x: 1, y: [] }],
      [{ x: 1, y: null }],
      [{ x: 1, y: undefined }],
    ])('returns err(ERR_INVALID_VALUE_TYPE) for %j', (value) => {
      expect(recordType(value, ['obj'])).toEqual(
        castErr('ERR_INVALID_VALUE_TYPE', ['obj', 'y'], {
          expected: 'number',
          received: (value as any).y as unknown,
        }),
      );
    });
  });
});
