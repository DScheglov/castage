import { describe, it, expect } from '@jest/globals';
import { castingErr, CastingException } from './casting-error';

describe('castingErr', () => {
  it('creates a CastingException', () => {
    const error = castingErr('ERR_MISSING_VALUE', ['path'], {
      expected: 'string',
    });
    expect(error).toBeInstanceOf(CastingException);
    expect(error.code).toBe('ERR_MISSING_VALUE');
    expect(error.path).toEqual(['path']);
    expect(error.extra).toEqual({ expected: 'string' });
  });

  it('is serializable to string (ERR_MISSING_VALUE)', () => {
    const error = castingErr('ERR_MISSING_VALUE', ['path'], {
      expected: 'string',
    });
    expect(`${error}`).toBe(
      'CastingException: ERR_MISSING_VALUE at path:\n  expected: string',
    );
  });

  it('is serializable to string (ERR_INVALID_VALUE)', () => {
    const error = castingErr('ERR_INVALID_VALUE', ['path'], {
      expected: 'string',
      received: '+',
    });
    expect(`${error}`).toBe(
      'CastingException: ERR_INVALID_VALUE at path:\n  expected: string\n  received: +',
    );
  });

  it('is serializable to Json (ERR_MISSING_VALUE)', () => {
    const error = castingErr('ERR_MISSING_VALUE', ['path'], {
      expected: 'string',
    });
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      code: 'ERR_MISSING_VALUE',
      path: ['path'],
      extra: { expected: 'string' },
    });
  });

  it('is serializable to Json (ERR_INVALID_VALUE)', () => {
    const error = castingErr('ERR_INVALID_VALUE', ['path'], {
      expected: 'string',
      received: '+',
    });
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      code: 'ERR_INVALID_VALUE',
      path: ['path'],
      extra: { expected: 'string', received: '+' },
    });
  });
});
