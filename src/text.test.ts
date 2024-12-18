import { describe, it, expect } from '@jest/globals';
import { text } from './text';
import { castingErr } from './casting-error';

describe('text', () => {
  describe('text.int', () => {
    it.each([
      ['0'], //
      ['1'],
      ['42'],
      ['-1'],
      ['-42'],
    ])('returns ok(%p)', (value) => {
      expect.assertions(2);
      const result = text.int(value);

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value).toBe(parseInt(value, 10));
      }
    });

    it.each([
      [''],
      [' '],
      ['  '],
      ['a'],
      ['1.5'],
      ['1.0'],
      ['1.0.0'],
      ['0.1'],
      ['0.0'],
      ['-1.0'],
      ['-1.1'],
    ])('returns err([ERR_INVALID_VALUE_TYPE]) for %p', (value) => {
      expect.assertions(2);

      const result = text.int(value);

      expect(result.isErr).toBe(true);

      if (result.isErr) {
        expect(result.error).toEqual(
          castingErr('ERR_INVALID_VALUE_TYPE', [], {
            expected: 'text::int',
            received: value,
          }),
        );
      }
    });
  });

  describe('text.number', () => {
    it.each([
      ['0'], //
      ['1'],
      ['42'],
      ['-1'],
      ['-42'],
      ['1.5'],
      ['0.1'],
      ['0.0'],
      ['-1.0'],
      ['-1.1'],
      ['1.2e20'],
      ['1.2e-20'],
      ['1.2e+20'],
      ['-1.2e20'],
      ['-1.2e-20'],
      ['-1.2e+20'],
    ])('returns ok(%p)', (value) => {
      expect.assertions(2);
      const result = text.number(value);

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value).toBe(parseFloat(value));
      }
    });

    it.each([
      [''], //
      [' '],
      ['  '],
      ['a'],
      ['1.0.0'],
    ])('returns err([ERR_INVALID_VALUE_TYPE]) for %p', (value) => {
      expect.assertions(2);

      const result = text.number(value);

      expect(result.isErr).toBe(true);

      if (result.isErr) {
        expect(result.error).toEqual(
          castingErr('ERR_INVALID_VALUE_TYPE', [], {
            expected: 'text::number',
            received: value,
          }),
        );
      }
    });
  });

  describe('text.bool', () => {
    it.each([
      ['true'], //
      ['false'],
    ])('returns ok(%p)', (value) => {
      expect.assertions(2);
      const result = text.bool(value);

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value).toBe(value === 'true');
      }
    });

    it.each([
      [''], //
      [' '],
      ['  '],
      ['a'],
      ['1'],
      ['0'],
      ['True'],
      ['False'],
      ['TRUE'],
      ['FALSE'],
    ])('returns err([ERR_INVALID_VALUE_TYPE]) for %p', (value) => {
      expect.assertions(2);

      const result = text.bool(value);

      expect(result.isErr).toBe(true);

      if (result.isErr) {
        expect(result.error).toEqual(
          castingErr('ERR_INVALID_VALUE_TYPE', [], {
            expected: 'text::boolean',
            received: value,
          }),
        );
      }
    });
  });
});
