import { Result } from 'resultage';

export const CastingErrorEnum = {
  ERR_MISSING_VALUE: 'ERR_MISSING_VALUE',
  ERR_INVALID_VALUE: 'ERR_INVALID_VALUE',
  ERR_INVALID_VALUE_TYPE: 'ERR_INVALID_VALUE_TYPE',
  ERR_INVALID_KEY: 'ERR_INVALID_KEY',
} as const;

export type CastingErrorCode =
  (typeof CastingErrorEnum)[keyof typeof CastingErrorEnum];

export const $castingError = Symbol.for('castage::CastingError');

export type Extra = {
  expected: string;
  received?: unknown;
  causes?: CastingError[];
  reason?: string;
};

export interface CastingError extends Error {
  [$castingError]: true;
  code: CastingErrorCode;
  path: string[];
  extra: Extra;
}

export interface CasterFn<T> {
  (value: unknown, path?: string[]): Result<T, CastingError>;
}

export interface ParserFn<T> {
  (value: unknown, path?: string[]): Result<T, CastingError[]>;
}

export interface UnpackCasterFn<T> {
  (value: unknown, path?: string[]): T;
}

export type Guard<T> = (value: unknown) => value is T;

export type OkType<T extends CasterFn<any>> =
  T extends CasterFn<infer S> ? S : never;

export const {
  ERR_MISSING_VALUE,
  ERR_INVALID_VALUE,
  ERR_INVALID_VALUE_TYPE,
  ERR_INVALID_KEY,
} = CastingErrorEnum;

export interface Caster<T> extends CasterFn<T> {
  nullable: Caster<T | null>;
  optional: Caster<T | undefined>;
  default(value: T, name?: string): Caster<T>;
  unpack: UnpackCasterFn<T>;

  validate<S extends T>(
    predicate: (value: T) => value is S,
    name?: string,
    error?: (value: T, path: string[]) => CastingError,
  ): Caster<S>;
  validate(
    predicate: (value: T) => boolean,
    name?: string,
    error?: (value: T, path: string[]) => CastingError,
  ): Caster<T>;

  match<S, E>(
    okMatcher: (data: T) => S,
    errMatcher: (err: CastingError) => E,
  ): UnpackCasterFn<S | E>;

  map<S>(transform: (data: T) => S, name?: string): Caster<S>;

  chain<S>(
    casterFn: (data: T, path?: string[]) => Result<S, CastingError>,
    name?: string,
  ): Caster<S>;

  parse(value: unknown, path?: string[]): Result<T, CastingError[]>;
}

export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

export type Cp<T> = { [K in keyof T]: T[K] };

export type UndefinedAsOptional<T> = Cp<
  { [field in RequiredKeys<T>]: T[field] } & {
    [field in OptionalKeys<T>]?: T[field];
  }
>;
