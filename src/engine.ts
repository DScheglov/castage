import { Result, err, expect, ok } from 'resultage';
import {
  CastingError,
  CastingErrorCode,
  CasterFn,
  Caster,
  ERR_INVALID_VALUE,
  ERR_INVALID_VALUE_TYPE,
  ParserFn,
} from './types.js';

import { replaceExpected, castingErr, castErr } from './casting-error.js';

export const casterApi = <T>(
  casterFn: CasterFn<T>,
  name: string = casterFn.name,
  parser?: ParserFn<T>,
): Caster<T> =>
  Object.defineProperties(casterFn.bind(null) as Caster<T>, {
    name: {
      enumerable: true,
      value: name,
      writable: false,
    },

    nullable: {
      enumerable: true,
      get: () => {
        const expected = `${name} | null`;
        return casterApi(
          (
            value: unknown,
            path: string[] = [],
          ): Result<T | null, CastingError> =>
            value === null
              ? ok(null)
              : casterFn(value, path).mapErr(replaceExpected(expected, path)),
          expected,
        );
      },
    },

    optional: {
      enumerable: true,
      get: () => {
        const expected = `${name} | undefined`;
        return casterApi(
          (
            value: unknown,
            path: string[] = [],
          ): Result<T | undefined, CastingError> =>
            value === undefined
              ? ok(undefined)
              : casterFn(value, path).mapErr(replaceExpected(expected, path)),
          expected,
        );
      },
    },

    default: {
      enumerable: true,
      value: (value: T, typeName: string = `${name} | undefined`): Caster<T> =>
        casterApi(
          (data: unknown, path: string[] = []): Result<T, CastingError> =>
            data === undefined
              ? ok(value)
              : casterFn(data, path).mapErr(replaceExpected(typeName, path)),
          typeName,
        ),
    },

    validate: {
      enumerable: true,
      value: <S extends T>(
        predicate: (value: T) => value is S,
        ruleName: string = predicate.name || name,
        error: (value: T, path: string[]) => CastingError = (value, path) =>
          castingErr(ERR_INVALID_VALUE, path, {
            expected: ruleName,
            received: value,
          }),
      ) =>
        casterApi(
          (value: unknown, path: string[] = []): Result<S, CastingError> =>
            casterFn(value, path).chain(
              expect(predicate, (data) => error(data, path)),
            ),
          ruleName,
        ),
    },

    unpack: {
      enumerable: true,
      get:
        () =>
        (value: unknown, path: string[] = []): T =>
          casterFn(value, path).match(
            (data) => data,
            (err) => {
              throw err;
            },
          ),
    },

    unpackOr: {
      enumerable: true,
      value:
        <E>(handleError: (err: CastingError) => E) =>
        (value: unknown, path: string[] = []): T | E =>
          casterFn(value, path).unwrapOrElse(handleError),
    },

    match: {
      enumerable: true,
      value:
        <S, E>(
          okMatcher: (data: T) => S,
          errMatcher: (err: CastingError) => E,
        ) =>
        (value: unknown, path: string[] = []): S | E =>
          casterFn(value, path).match(okMatcher, errMatcher),
    },

    map: {
      enumerable: true,
      value: <S>(
        transform: (data: T) => S,
        typeName: string = `(${name} |> ${transform.name})`,
      ): Caster<S> =>
        casterApi(
          (value: unknown, path: string[] = []) =>
            casterFn(value, path).map(transform),
          typeName,
        ),
    },

    chain: {
      enumerable: true,
      value: <S>(
        caster: (data: T, path: string[]) => Result<S, CastingError>,
        typeName: string = `(${name} |> ${caster.name})`,
      ): Caster<S> =>
        casterApi(
          (value: unknown, path: string[] = []) =>
            casterFn(value, path).chain((data) =>
              caster(data, [
                ...path.slice(0, -1),
                `${path.at(-1) || ''}::${name}`,
              ]),
            ),
          typeName,
        ),
    },

    parse: {
      enumerable: true,
      value: (
        value: unknown,
        path: string[] = [],
      ): Result<T, CastingError[]> =>
        typeof parser === 'function'
          ? parser(value, path)
          : casterFn(value, path).mapErr((err) => [err]),
    },

    assert: {
      enumerable: true,
      value: (value: unknown): asserts value is T => {
        casterFn(value).unwrap();
      },
    },
  });

export const fromGuard = <T>(
  guard: (value: any) => value is T,
  name: string = guard.name,
  errorCode: CastingErrorCode = ERR_INVALID_VALUE_TYPE,
): Caster<T> =>
  casterApi(
    (value, path = []) =>
      guard(value)
        ? ok(value)
        : castErr(errorCode, path, { expected: name, received: value }),
    name,
  );

export const fromGuardAndTransform = <T, S>(
  guard: (value: any) => value is T,
  transform: (value: T, path: string[]) => Result<S, CastingError>,
  name: string = transform.name,
  errorCode: CastingErrorCode = ERR_INVALID_VALUE_TYPE,
  parser?: (value: T, path: string[]) => Result<S, CastingError[]>,
): Caster<S> =>
  casterApi(
    (value, path = []) =>
      guard(value)
        ? transform(value, path)
        : castErr(errorCode, path, { expected: name, received: value }),
    name,
    parser !== undefined
      ? (value, path = []) =>
          guard(value)
            ? parser(value, path)
            : err([
                castingErr(errorCode, path, {
                  expected: name,
                  received: value,
                }),
              ])
      : undefined,
  );

export const is =
  <T>(caster: CasterFn<T>) =>
  (value: unknown): value is T =>
    caster(value).isOk;
