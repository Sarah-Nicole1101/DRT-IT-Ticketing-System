import test from 'node:test';
import assert from 'node:assert/strict';
import { createTicketReference } from '../public/js/data/ticket-store.js';
import { readableResolutionTime, renderTrack } from '../public/js/pages/track.js';
import { renderSubmit } from '../public/js/pages/submit.js';
import { OFFICE_GROUPS } from '../public/js/data/departments.js';

const sampleId = '01234567-89ab-cdef-0123-456789abcdef';

test('public ticket reference is readable, stable, and separate from internal UUID', () => {
  const id = createTicketReference(new Date('2026-10-15T10:00:00Z'), sampleId);
  assert.equal(id, 'DRT-IT-2026-0123456789AB');
  assert.notEqual(id, sampleId);
});

test('resolution duration is only available when completion time is supplied', () => {
  assert.equal(readableResolutionTime('2026-10-15T09:00:00Z', null), null);
  assert.equal(readableResolutionTime('2026-10-15T09:00:00Z', '2026-10-15T10:35:00Z'), '1 hr 35 min');
  assert.equal(readableResolutionTime('2026-10-15T10:00:00Z', '2026-10-15T09:00:00Z'), null);
});

test('landing form has 4 required fields and a bottom-right tracking action', () => {
  const html = renderSubmit();
  assert.match(html, /id="description"[\s\S]*?required/);
  assert.match(html, /id="full-name"[\s\S]*?required/);
  assert.match(html, /id="department"[\s\S]*?required/);
  assert.match(html, /id="photo-upload"/);
  assert.match(html, /landing-track-actions/);
  assert.match(html, /href="\/track"/);
  assert.doesNotMatch(html, /How It Works|\bAdmin Login\b/);
});

test('tracking search offers both ID lookup and all 25 offices in a dropdown', () => {
  const oldLocation = globalThis.window;
  globalThis.window = { location: { search: '' } };
  try {
    const html = renderTrack();
    assert.match(html, /id="track-id"/);
    assert.match(html, /id="track-office"/);
    assert.match(html, /value="oldest"/);
    assert.match(html, /value="newest"/);
    assert.match(html, /<th>Ticket ID<\/th>/);
    for (const group of OFFICE_GROUPS) {
      for (const [officeCode] of group.offices) {
        assert.match(html, new RegExp(`value="${officeCode}"`));
      }
    }
  } finally {
    if (oldLocation === undefined) delete globalThis.window;
    else globalThis.window = oldLocation;
  }
});
