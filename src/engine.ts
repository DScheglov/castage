import { Result, expect, ok } from 'resultage';
import {
  CastingError,
  CastingErrorCode,
  CasterFn,
  Caster,
  ERR_INVALID_VALUE,
  ERR_INVALID_VALUE_TYPE,
} from './types';

import { replaceExpected, castingErr, castErr } from './casting-error';

const casterApi = <T>(
  casterFn: CasterFn<T>,
  name: string = casterFn.name,
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

    match: {
      enumerable: true,
      value:
        <S, E>(
          errMatcher: (err: CastingError) => E,
          okMatcher: (data: T) => S,
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
): Caster<S> =>
  casterApi(
    (value, path = []) =>
      guard(value)
        ? transform(value, path)
        : castErr(errorCode, path, { expected: name, received: value }),
    name,
  );

export const is =
  <T>(caster: CasterFn<T>) =>
  (value: unknown): value is T =>
    caster(value).isOk;
