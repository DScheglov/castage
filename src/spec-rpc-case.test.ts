import { describe, it, expect } from '@jest/globals';
import type { Expect, Equal } from '@type-challenges/utils';
import * as c from '.';

const SpecRpcUnknownMethod = c.struct({
  reason: c.value('UNKNOWN_METHOD'),
  method: c.string,
});

const SpecRpcUnauthorized = c.struct({
  reason: c.value('UNAUTHORIZED'),
});

const SpecRpcInvalidParams = c.struct({
  reason: c.value('INVALID_PARAMS'),
  errors: c.array(
    c.struct({
      error: c.string,
      path: c.array(c.string),
      message: c.string,
      expected: c.unknown.optional,
      received: c.unknown.optional,
    }),
  ),
});

const SpecRpcFailure = c.allOf(
  c.struct({ kind: c.value('spec-rpc/failure') }),
  c.oneOf(SpecRpcUnknownMethod, SpecRpcUnauthorized, SpecRpcInvalidParams),
);

describe('spec-rpc-case', () => {
  describe('SpecRpcUnknownMethod', () => {
    it('casts a correct type', () => {
      const check: Expect<
        Equal<
          c.CastedBy<typeof SpecRpcUnknownMethod>,
          { reason: 'UNKNOWN_METHOD'; method: string }
        >
      > = true;
      expect(check).toBe(true);
    });
  });

  describe('SpecRpcUnauthorized', () => {
    it('casts a correct type', () => {
      const check: Expect<
        Equal<
          c.CastedBy<typeof SpecRpcUnauthorized>,
          { reason: 'UNAUTHORIZED' }
        >
      > = true;
      expect(check).toBe(true);
    });
  });

  describe('SpecRpcInvalidParams', () => {
    it('casts a correct type', () => {
      const check: Expect<
        Equal<
          c.CastedBy<typeof SpecRpcInvalidParams>,
          {
            reason: 'INVALID_PARAMS';
            errors: {
              error: string;
              path: string[];
              message: string;
              expected?: unknown;
              received?: unknown;
            }[];
          }
        >
      > = true;
      expect(check).toBe(true);
    });
  });

  describe('SpecRpcFailure', () => {
    it('casts a correct type', () => {
      const check: Expect<
        Equal<
          c.CastedBy<typeof SpecRpcFailure>,
          { kind: 'spec-rpc/failure' } & (
            | { reason: 'UNKNOWN_METHOD'; method: string }
            | { reason: 'UNAUTHORIZED' }
            | {
                reason: 'INVALID_PARAMS';
                errors: {
                  error: string;
                  path: string[];
                  message: string;
                  expected?: unknown;
                  received?: unknown;
                }[];
              }
          )
        >
      > = true;
      expect(check).toBe(true);
    });
  });
});
