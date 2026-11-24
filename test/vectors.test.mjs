import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as au from '../dist/esm/index.js';
import { createRequire } from 'node:module';

const cjs = createRequire(import.meta.url)('../dist/cjs/index.js');
const vectors = JSON.parse(readFileSync(new URL('./vectors.json', import.meta.url)));

for (const [name, lib] of [['esm', au], ['cjs', cjs]]) {
  const checks = { abn: lib.isValidAbn, acn: lib.isValidAcn, did: lib.isValidDirectorId, vin: lib.isValidVin };
  const formats = { abn: lib.formatAbn, acn: lib.formatAcn, vin: lib.normaliseVin };

  test(`${name}: validity vectors`, () => {
    for (const c of vectors.valid) {
      const got = c.type === 'tfn' ? lib.isValidTfn(c.value, { individual: !!c.individual }) : checks[c.type](c.value);
      assert.equal(got, c.valid, `${c.type} ${JSON.stringify(c.value)}`);
    }
  });

  test(`${name}: format vectors`, () => {
    for (const c of vectors.format) assert.equal(formats[c.type](c.value), c.expected, `${c.type} ${c.value}`);
  });

  test(`${name}: other inputs`, () => {
    assert.ok(lib.isValidArbn('000 000 019') && !lib.isValidArbn('000 000 018'));
    for (const v of [null, undefined, 5.1824753556e10 + 0.5, true, ['51824753556'], {}, -51824753556]) {
      assert.ok(!lib.isValidAbn(v) && !lib.isValidTfn(v) && !lib.isValidVin(v), String(v));
    }
    assert.ok(lib.isValidAbn(51824753556));
    assert.equal(lib.normaliseTfn(123456782), '123456782');
    assert.ok(!lib.isValidAcn('٠٠٤٠٨٥٦١٦'));
  });
}
