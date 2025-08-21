const test = require('node:test');
const assert = require('node:assert/strict');
const { convertirABoolean } = require('../utils/boolean');

test('returns same boolean for boolean inputs', () => {
  assert.strictEqual(convertirABoolean(true), true);
  assert.strictEqual(convertirABoolean(false), false);
});

test('converts string "1" and "0"', () => {
  assert.strictEqual(convertirABoolean('1'), true);
  assert.strictEqual(convertirABoolean('0'), false);
});

test('converts string "activo" and "inactivo"', () => {
  assert.strictEqual(convertirABoolean('activo'), true);
  assert.strictEqual(convertirABoolean('inactivo'), false);
});

test('converts numeric 1 and 0', () => {
  assert.strictEqual(convertirABoolean(1), true);
  assert.strictEqual(convertirABoolean(0), false);
});

test('is case-insensitive for strings', () => {
  assert.strictEqual(convertirABoolean('TrUe'), true);
  assert.strictEqual(convertirABoolean('InAcTiVo'), false);
});

test('returns false for unexpected values', () => {
  assert.strictEqual(convertirABoolean('yes'), false);
  assert.strictEqual(convertirABoolean(null), false);
  assert.strictEqual(convertirABoolean(undefined), false);
  assert.strictEqual(convertirABoolean(2), false);
  assert.strictEqual(convertirABoolean({}), false);
});

