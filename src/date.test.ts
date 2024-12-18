import { describe, it, expect } from '@jest/globals';
import { date } from './date';
import { castingErr } from './casting-error';

describe('date', () => {
  describe('js', () => {
    it('jsDate.name === "JsDate"', () => {
      expect(date.name).toBe('JsDate');
    });

    it.each([
      ['2020-01-01'],
      [1577836800000],
      ['12/18/2024, 1:20:57 PM'],
      ['2024-12-18T12:21:38.048Z'],
      [Date.now()],
      [new Date('2020-01-01')],
    ])('parses %s as %s', (value) => {
      expect.assertions(2);
      const expected = new Date(value);
      const result = date(value);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value).toEqual(expected);
      }
    });

    it.each([
      ['2020-01-01T25:00:00'],
      ['2020-13-32'],
      [Infinity],
      [-Infinity],
      [NaN],
      ['hello world'],
    ])('fails to parse %s with error code ERR_INVALID_VALUE', (value) => {
      expect.assertions(2);
      const result = date(value);
      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error).toEqual(
          castingErr('ERR_INVALID_VALUE', [], {
            expected: 'JsDate',
            received: value,
          }),
        );
      }
    });

    it.each([
      [true], //
      [false],
      [{}],
      [[]],
      [null],
      [undefined],
    ])(`fails to parse %s with error code ERR_INVALID_VALUE_TYPE`, (value) => {
      expect.assertions(2);
      const result = date(value);
      expect(result.isOk).toBe(false);
      if (!result.isOk) {
        expect(result.error).toEqual(
          castingErr('ERR_INVALID_VALUE_TYPE', [], {
            expected: 'JsDate',
            received: value,
          }),
        );
      }
    });
  });

  describe('iso', () => {
    it('isoDate.name === "ISODate"', () => {
      expect(date.iso.name).toBe('IsoDate');
    });

    it.each([
      ['2020-10-12', Date.UTC(2020, 9, 12)],
      ['2020-10', Date.UTC(2020, 9)],
      ['2020', Date.UTC(2020, 0)],
      ['2020-10-12T10:00', new Date(2020, 9, 12, 10)],
      ['2020-10-12T10:00Z', Date.UTC(2020, 9, 12, 10)],
      ['2020-02-02T01:00:20Z', Date.UTC(2020, 1, 2, 1, 0, 20)],
      ['2020-02-02T01:00:20', new Date(2020, 1, 2, 1, 0, 20)],
      ['2020-10-12 10:00', new Date(2020, 9, 12, 10)],
      ['2020-10-12 10:00Z', Date.UTC(2020, 9, 12, 10)],
      ['2020-02-02 01:00:20Z', Date.UTC(2020, 1, 2, 1, 0, 20)],
      ['2020-02-02 01:00:20', new Date(2020, 1, 2, 1, 0, 20)],

      ['2020', new Date('2020-01-01T00:00:00.000Z')],
      ['2020-12', new Date('2020-12-01T00:00:00.000Z')],
      ['2020-12-01', new Date('2020-12-01T00:00:00.000Z')],
      ['2020-12-01T14:31:12Z', new Date('2020-12-01T14:31:12.000Z')],
      ['2020-12-01T14:31:12.1Z', new Date('2020-12-01T14:31:12.100Z')],
      ['2020-12-01T14:31:12.100Z', new Date('2020-12-01T14:31:12.100Z')],
      ['2020-12-01T14:31:12+01:00', new Date('2020-12-01T13:31:12.000Z')],
      ['2020-12-01T14:31:12.100+01:00', new Date('2020-12-01T13:31:12.100Z')],
      ['2020-12-01T14:31:12-05:30', new Date('2020-12-01T20:01:12.000Z')],
      ['2020-12-01T14:31:12.100-05:30', new Date('2020-12-01T20:01:12.100Z')],
      ['2020-12-01T14:31Z', new Date('2020-12-01T14:31:00.000Z')],
      ['2020-12-01T14:31', new Date('2020-12-01T14:31:00.000')],
    ])('returns date for %s', (dateStr, expected) => {
      expect.assertions(2);

      const result = date.iso(dateStr);

      expect(result.isOk).toBe(true);

      if (result.isOk) {
        expect(result.value).toEqual(new Date(expected));
      }
    });

    it.each([
      [''],
      ['20'],
      ['22-02'],
      ['2432-4234-234'],
      ['127.0.0.1'],
      ['1979-15-01T24:78:23'],
    ])('fails to parse %s with error code ERR_INVALID_VALUE', (value) => {
      expect.assertions(2);

      const result = date.iso(value);

      expect(result.isOk).toBe(false);

      if (!result.isOk) {
        expect(result.error).toEqual(
          castingErr('ERR_INVALID_VALUE', [], {
            expected: 'IsoDate',
            received: value,
          }),
        );
      }
    });

    it.each([
      [null], //
      [undefined],
      [1],
      [NaN],
      [{}],
      [[]],
    ])('fails to parse %s with error code ERR_INVALID_VALUE_TYPE', (value) => {
      expect.assertions(2);

      const result = date.iso(value);

      expect(result.isOk).toBe(false);

      if (!result.isOk) {
        expect(result.error).toEqual(
          castingErr('ERR_INVALID_VALUE_TYPE', [], {
            expected: 'IsoDate',
            received: value,
          }),
        );
      }
    });
  });
});
