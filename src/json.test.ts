import { describe, it, expect } from '@jest/globals';
import { ERR_INVALID_VALUE, ERR_INVALID_VALUE_TYPE } from './types';
import { castingErr } from './casting-error';
import { json, jsonObject, jsonStruct } from './json';
import { string } from './primitives';

describe('json', () => {
  it.each([
    null,
    0,
    100,
    '',
    'string',
    {},
    [],
    true,
    false,
    { key: 'value' },
    ['value'],
  ])('parses valid JSON %j', (value) => {
    expect.assertions(2);
    const result = json(JSON.stringify(value));
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value).toEqual(value);
    }
  });

  it('returns an error for invalid JSON string', () => {
    expect.assertions(2);
    const result = json('invalid json');
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toEqual(
        castingErr(ERR_INVALID_VALUE, [], {
          expected: 'JSON',
          received: 'invalid json',
          reason: 'Unexpected token \'i\', "invalid json" is not valid JSON',
        }),
      );
    }
  });
});

describe('jsonObject', () => {
  it('parses valid JSON object', () => {
    expect.assertions(2);
    const value = { key: 'value' };
    const result = jsonObject(JSON.stringify(value));
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value).toEqual(value);
    }
  });

  it('returns an error for non-object JSON', () => {
    expect.assertions(2);
    const value = 'string';
    const result = jsonObject(JSON.stringify(value));
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toEqual(
        castingErr(ERR_INVALID_VALUE, [], {
          expected: 'Object',
          received: value,
        }),
      );
    }
  });

  it('returns an error for invalid JSON string', () => {
    expect.assertions(2);
    const result = jsonObject('invalid json');
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toEqual(
        castingErr(ERR_INVALID_VALUE, [], {
          expected: 'JSON',
          received: 'invalid json',
          reason: 'Unexpected token \'i\', "invalid json" is not valid JSON',
        }),
      );
    }
  });
});

describe('jsonStruct', () => {
  const jsonStructCaster = jsonStruct({ key: string });

  it('parses valid JSON object with structure', () => {
    expect.assertions(2);
    const value = { key: 'value' };
    const result = jsonStructCaster(JSON.stringify(value));
    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value).toEqual(value);
    }
  });

  it('returns an error for non-object JSON', () => {
    expect.assertions(2);
    const value = 'string';
    const result = jsonStructCaster(JSON.stringify(value));
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toEqual(
        castingErr(ERR_INVALID_VALUE_TYPE, ['::JSON'], {
          expected: 'Json({ key: string })',
          received: value,
        }),
      );
    }
  });

  it('returns an error for invalid JSON string', () => {
    expect.assertions(2);
    const result = jsonStructCaster('invalid json');
    expect(result.isErr).toBe(true);
    if (result.isErr) {
      expect(result.error).toEqual(
        castingErr(ERR_INVALID_VALUE, [], {
          expected: 'JSON',
          received: 'invalid json',
          reason: 'Unexpected token \'i\', "invalid json" is not valid JSON',
        }),
      );
    }
  });
});
