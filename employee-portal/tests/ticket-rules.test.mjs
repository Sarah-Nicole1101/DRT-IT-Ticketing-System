import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTicket, filterAndSortTickets, STATUSES, escapeHtml } from '../public/js/lib/ticket-rules.js';
import { DEPARTMENTS } from '../public/js/data/departments.js';

const sample = { fullName: 'Maria Santos', departmentCode: 'SBO', description: 'Computer cannot power on', files: [{ name: 'pc.png', type: 'image/png', size: 6000 }] };

test('all 25 offices exist with unique codes', () => {
  assert.equal(DEPARTMENTS.length, 25);
  assert.equal(new Set(DEPARTMENTS.map(department => department.code)).size, 25);
});
test('ticket validates with required photo and valid office', () => {
  assert.deepEqual(validateTicket(sample, DEPARTMENTS.map(d => d.code)).errors, {});
});
test('missing photo is rejected; no username/password required', () => {
  const { errors } = validateTicket({ ...sample, files: [] }, ['SBO']);
  assert.match(errors.files, /photo/i);
});
test('invalid office is rejected', () => {
  const { errors } = validateTicket({ ...sample, departmentCode: 'MADEUP' }, ['SBO']);
  assert.match(errors.departmentCode, /select/i);
});
test('only Pending, Resolved, Cancelled are supported', () => {
  assert.deepEqual(STATUSES, ['Pending', 'Resolved', 'Cancelled']);
});
test('employee name filter and latest sort work', () => {
  const cards = [
    { fullName: 'Maria Santos', status: 'Pending', createdAt: '2026-10-15T03:00:00Z' },
    { fullName: 'Sarah Hular', status: 'Resolved', createdAt: '2026-10-15T05:00:00Z' },
    { fullName: 'Maria Dela Cruz', status: 'Cancelled', createdAt: '2026-10-15T04:00:00Z' },
  ];
  assert.deepEqual(filterAndSortTickets(cards, { name: 'maria' }).map(t => t.fullName), ['Maria Dela Cruz', 'Maria Santos']);
  assert.deepEqual(filterAndSortTickets(cards, { status: 'Pending' }).map(t => t.fullName), ['Maria Santos']);
});
test('unsafe text is escaped before display', () => {
  assert.equal(escapeHtml('<img src="x">'), '&lt;img src=&quot;x&quot;&gt;');
});
