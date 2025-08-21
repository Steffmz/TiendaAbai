jest.mock('../config/prisma', () => ({ $use: jest.fn() }));
const { convertirABoolean } = require('../utils/boolean');

describe('convertirABoolean', () => {
  test('returns same boolean for boolean inputs', () => {
    expect(convertirABoolean(true)).toBe(true);
    expect(convertirABoolean(false)).toBe(false);
  });

  test('converts string "1" and "0"', () => {
    expect(convertirABoolean('1')).toBe(true);
    expect(convertirABoolean('0')).toBe(false);
  });

  test('converts string "activo" and "inactivo"', () => {
    expect(convertirABoolean('activo')).toBe(true);
    expect(convertirABoolean('inactivo')).toBe(false);
  });

  test('converts numeric 1 and 0', () => {
    expect(convertirABoolean(1)).toBe(true);
    expect(convertirABoolean(0)).toBe(false);
  });

  test('returns true for unexpected values', () => {
    expect(convertirABoolean('yes')).toBe(true);
    expect(convertirABoolean(null)).toBe(true);
    expect(convertirABoolean(undefined)).toBe(true);
    expect(convertirABoolean(2)).toBe(true);
    expect(convertirABoolean({})).toBe(true);
  });
});
