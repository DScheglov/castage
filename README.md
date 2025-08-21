# castage [![Coverage Status](https://coveralls.io/repos/github/DScheglov/castage/badge.svg?branch=main)](https://coveralls.io/github/DScheglov/castage?branch=main) [![npm version](https://img.shields.io/npm/v/castage.svg?style=flat-square)](https://www.npmjs.com/package/castage) [![npm downloads](https://img.shields.io/npm/dm/castage.svg?style=flat-square)](https://www.npmjs.com/package/castage) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/castage/blob/master/LICENSE)

**Castage** is a TypeScript library for type-safe, dynamic data casting, ensuring runtime type validation while leveraging TypeScript's static type guarantees.

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

## Usage

### Primitive Types

```ts
import { int, string } from 'castage';

const result = int(42);
if (result.isOk) {
  console.log(result.value); // 42
}

const result2 = string(42);

if (result2.isErr) {
  console.error(result2.error); // CastingError
}
```

### Structured Objects

```ts
import { struct, int, string } from 'castage';

const User = struct({
  id: int,
  name: string
});

const result = User({ id: 1, name: 'Alice' });

if (result.isOk) {
  console.log(result.value); // { id: 1, name: 'Alice' }
}
```

### Arrays

```ts

import { array, int } from 'castage';

const intArray = array(int);

const result = intArray([1, 2, 3]);

if (result.isOk) {
  console.log(result.value); // [1, 2, 3]
}
```

---

## API Documentation

### Core Components

#### `Caster<T>`

The main interface for creating and managing data casters.

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

  unpackOr<E>(handleError: (err: CastingError) => E): UnpackCasterFn<T | E>;

  map<S>(transform: (data: T) => S, name?: string): Caster<S>;

  chain<S>(
    casterFn: (data: T, path?: string[]) => Result<S, CastingError>,
    name?: string,
  ): Caster<S>;

  parse(value: unknown, path?: string[]): Result<T, CastingError[]>;

  assert(value: unknown, path?: string[]): asserts value is T;
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

---

### Primitive Types

- `int`: Ensures the value is an integer.
- `string`: Ensures the value is a string.
- `boolean`: Ensures the value is a boolean.
- `number`: Ensures the value is a number.
- `value`: Ensures the value is a specific value.
- `values`: Ensures the value is one of the specified values.
- `nill`: Ensures the value is `null`.
- `undef`: Ensures the value is `undefined`.

### Ephemeral Types

- `any`: Ensures the value is any type.
- `unknown`: Ensures the value is unknown.

### Complex Types

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

#### `tuple<T extends any[]>(...casters: { [K in keyof T]: Caster<T[K]> })`

Validates a tuple of values using specific casters.

```ts
import { tuple, int, string } from 'castage';

const tupleCaster = tuple(int, string);

const result = tupleCaster([42, 'Alice']);

if (result.isOk) {
  console.log(result.value); // [42, 'Alice']
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

#### `record<K, V>(keyCaster: CasterFn<K>, valueCaster: CasterFn<V>, name?: string)`

Validates a record with specific key and value types.

```ts
import { record, int, string } from 'castage';

const userRecordCaster = record(string, int);

const result = userRecordCaster({ Alice: 1, Bob: 2 });

if (result.isOk) {
  console.log(result.value); // { Alice: 1, Bob: 2 }
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

## `allOf<T>(...casters: CasterFn<T>[])`

Validates a value against multiple possible types.

```ts
import { allOf, struct, int, string } from 'castage';

const mixedTypeCaster = allOf(
  struct({ id: int }),
  struct({ name: string })
);

const result = mixedTypeCaster({ id: 42, name: "Alice" });
if (result.isOk) {
  console.log(result.value); // { id: 42, name: "Alice" }
} else {
  console.error(result.error); // CastingError
}
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
