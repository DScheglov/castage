import { describe, it, expect } from '@jest/globals';
import * as castage from './index';

describe('castage', () => {
  it('should export a function', () => {
    expect(castage).toBeDefined();
  });
});
