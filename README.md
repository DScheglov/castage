# castage [![Coverage Status](https://coveralls.io/repos/github/DScheglov/castage/badge.svg?branch=main)](https://coveralls.io/github/DScheglov/castage?branch=main) [![npm version](https://img.shields.io/npm/v/castage.svg?style=flat-square)](https://www.npmjs.com/package/castage) [![npm downloads](https://img.shields.io/npm/dm/castage.svg?style=flat-square)](https://www.npmjs.com/package/castage) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/castage/blob/master/LICENSE)

**Castage** is a TypeScript library for type-safe, dynamic object casting, ensuring runtime type validation while leveraging TypeScript's static type guarantees.

## Installation

Run the following command to install:

```bash
npm install castage
```

---

## Features

- **Type-safe casting**: Validate and transform objects with strict type guarantees.
- **Runtime validation**: Validate types beyond TypeScript's compile-time checks.
- **Flexible APIs**: Support for primitive types, schemas, and custom validations.

---

## API Documentation

### Core Components

#### `Caster<T>`

The main interface for creating and managing type casters.

```ts
interface CasterFn<T> {
  (value: unknown, path?: string[]): Result<T, CastingError>;
}

interface UnpackCasterFn<T> {
  (value: unknown, path?: string[]): T;
}

interface Caster<T> extends CasterFn<T> {
  nullable: Caster<T | null>;
  optional: Caster<T | undefined>;
  unpack: UnwrapCasterFn<T>;
  validate<S extends T>(
    predicate: (value: T) => value is S, 
    name?: string, 
    error?: (value: T, path: string[]) => CastingError
  ): Caster<S>;
  match<S, E>(
    okMatcher: (data: T) => S, 
    errMatcher: (err: CastingError) => E
  ): UnpackCasterFn<S | E>;
  chain<S>(caster: Caster<S>): Caster<T & S>;
}
```

Where the `Result` type is imported from the [`resultage`](https://www.npmjs.com/package/resultage) package.



#### `CastingError`

Describes an error encountered during the casting process.

```ts
interface CastingError extends Error {
  [$castingError]: true;
  code: CastingErrorCode;
  path: string[];
  extra: Extra;
}
```

#### Predefined Casters

Casters for commonly used types.

- `int`: Ensures the value is an integer.
- `string`: Ensures the value is a string.
- `boolean`: Ensures the value is a boolean.
- `number`: Ensures the value is a number.
- `struct`: Ensures the value is a generic object.
- `array`: Ensures the value is an array.
- `record`: Ensures the value is a record.
- `tuple`: Ensures the value is a tuple.
- `value`: Ensures the value is a specific value.
- `values`: Ensures the value is one of the specified values.
- `nill`: Ensures the value is `null`.
- `undef`: Ensures the value is `undefined`.

Example usage:

```ts
import { int, string } from 'castage';

const result = int(42);
if (result.isOk) {
  console.log(result.value); // 42
}
```

---

### Advanced Utilities

#### `array<T>(caster: CasterFn<T>, name?: string)`

Validates an array of values using a specific caster.

```ts
import { array, int } from 'castage';

const intArrayCaster = array(int);
const result = intArrayCaster([1, 2, 3]);

if (result.isOk) {
  console.log(result.value); // [1, 2, 3]
}
```

#### `struct<T>(casters: { [K in keyof T]: Caster<T[K]> }, name?: string)`

Validates a structured object with specific type requirements.

```ts
import { struct, int, string } from 'castage';

const userCaster = struct({
  id: int,
  name: string
});

const result = userCaster({ id: 1, name: 'Alice' });

if (result.isOk) {
  console.log(result.value); // { id: 1, name: 'Alice' }
}
```

#### `oneOf<T>(...casters: CasterFn<T>[])`

Validates a value against multiple possible types.

```ts
import { oneOf, int, string } from 'castage';

const mixedTypeCaster = oneOf(int, string);

const result1 = mixedTypeCaster(42);
if (result1.isOk) {
  console.log(result1.value); // 42
}

const result2 = mixedTypeCaster('Alice');
if (result2.isOk) {
  console.log(result2.value); // 'Alice'
}

const result3 = mixedTypeCaster(true);

if (result3.isErr) {
  console.error(result3.error); // CastingError
}
```




---

## Error Handling

Casting errors provide detailed information about failures:

```ts
interface CastingError {
  code: CastingErrorCode;
  path: string[];
  extra: Extra;
}
```

Use `isCastingError` to check for casting errors:

```ts
import { isCastingError } from 'castage';

if (isCastingError(error)) {
    console.error(error.path, error.code);
}
```
