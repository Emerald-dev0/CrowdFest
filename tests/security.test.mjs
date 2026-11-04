import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDestination, isBlockedHost } from '../packages/security/dist/index.js';

test('blocks localhost', () => {
  const r = validateDestination('http://localhost:3000/x');
  assert.equal(r.valid, false);
});

test('blocks private network', () => {
  const r = validateDestination('http://192.168.1.1/');
  assert.equal(r.valid, false);
});

test('allows public host', () => {
  const r = validateDestination('https://example.com/path');
  assert.equal(r.valid, true);
});

test('isBlockedHost works', () => {
  assert.equal(isBlockedHost('127.0.0.1'), true);
  assert.equal(isBlockedHost('example.com'), false);
});
