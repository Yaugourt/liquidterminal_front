
import { buildQueryParams } from '../src/services/common/utils';
import assert from 'assert';

console.log('Running verification for buildQueryParams...');

// Test 1: Simple params
const params1 = { page: 1, limit: 10 };
const search1 = buildQueryParams(params1);
assert.strictEqual(search1.toString(), 'page=1&limit=10');
console.log('Test 1 Passed');

// Test 2: Undefined/Null
const params2 = { page: 1, sortBy: undefined, order: null };
const search2 = buildQueryParams(params2);
assert.strictEqual(search2.toString(), 'page=1');
console.log('Test 2 Passed');

// Test 3: Arrays
const params3 = { ids: [1, 2, 3] };
const search3 = buildQueryParams(params3);
// URLSearchParams formats arrays as repeated keys by default with append, but let's check exact output
// It should be ids=1&ids=2&ids=3
assert.strictEqual(decodeURIComponent(search3.toString()), 'ids=1&ids=2&ids=3');
console.log('Test 3 Passed');

console.log('All verification tests passed successfully.');
