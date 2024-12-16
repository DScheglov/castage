import { Result, err } from 'resultage';
import { $castingError, CastingError, CastingErrorCode, Extra } from './types';
import { hasOwn } from './tools';

export const isCastingError = (error: unknown): error is CastingError =>
  error != null &&
  typeof error === 'object' &&
  (error as any)[$castingError] === true;

export const errorMessage = (
  { code, path, extra }: Pick<CastingError, 'code' | 'path' | 'extra'>,
  prefix = '',
): string =>
  `${prefix}${code} at ${path.join('.')}:` +
  `\n${prefix}  expected: ${extra.expected}` +
  (hasOwn(extra, 'received')
    ? `\n${prefix}  received: ${String(extra.received)}`
    : '') +
  (Array.isArray(extra.causes) && extra.causes.length > 0
    ? `${prefix}\n  causes:\n` +
      extra.causes
        .map((cause) =>
          errorMessage(
            {
              ...cause,
              path: cause.path.slice(path.length),
            },
            `${prefix}      `,
          ),
        )
        .join(`\n${prefix}`)
    : '');

export class CastingException extends Error implements CastingError {
  readonly [$castingError] = true;

  readonly name: string = 'CastingException';

  readonly code: CastingErrorCode;

  readonly path: string[];

  readonly extra: Extra;

  readonly reason?: string | undefined;

  constructor(code: CastingErrorCode, path: string[], extra: Extra) {
    const error = { code, path, extra };
    const message = errorMessage(error);
    super(message, { cause: error });
    this.code = code;
    this.path = path;
    this.extra = extra;
  }

  toString(): string {
    return `${this.name}:\n${this.message}`;
  }
}

export const castingErr = (
  code: CastingErrorCode,
  path: string[],
  extra: Extra,
): CastingError => new CastingException(code, path, extra);

export const castErr = (
  code: CastingErrorCode,
  path: string[],
  extra: Extra,
): Result<never, CastingError> => err(castingErr(code, path, extra));

export const replaceExpected =
  (expected: string, currentPath?: string[]) =>
  (error: CastingError): CastingError =>
    currentPath?.length === error.path.length
      ? castingErr(error.code, error.path, { ...error.extra, expected })
      : error;

export const updateError =
  ({ code, path, extra }: Partial<CastingError>) =>
  (error: CastingError): CastingError =>
    path?.length === error.path.length
      ? castingErr(code ?? error.code, path, { ...error.extra, ...extra })
      : error;
