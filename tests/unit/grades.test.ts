import assert from 'node:assert/strict';
import test from 'node:test';

import { GRADE_SCALE, gradeLabelFromIndex, parseGrade } from '../../src/lib/grades';

test('parseGrade understands Yosemite decimal grades', () => {
  assert.equal(parseGrade('5.10a'), parseGrade('5.10A'));
  assert.equal(parseGrade('5.10a'), parseGrade('5.10a/b'));
  assert.equal(gradeLabelFromIndex(parseGrade('5.14a') ?? 0), '5.14A');
  assert.equal(gradeLabelFromIndex(parseGrade('5.8+') ?? 0), '5.8');
});

test('parseGrade handles bouldering grades', () => {
  assert.equal(gradeLabelFromIndex(parseGrade('V8') ?? 0), 'V8');
  assert.ok((parseGrade('V4') ?? 0) > (parseGrade('V2') ?? 0));
});

test('grade scale ordering increases monotonically', () => {
  for (let i = 1; i < GRADE_SCALE.length; i += 1) {
    const prev = parseGrade(GRADE_SCALE[i - 1]) ?? 0;
    const current = parseGrade(GRADE_SCALE[i]) ?? 0;
    assert.ok(current >= prev);
  }
});
