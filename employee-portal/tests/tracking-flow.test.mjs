import { installTemplateFetch } from './helpers/template-fetch.mjs';
installTemplateFetch();


// Import Node.js testing and assertion tools.
import assert from 'node:assert/strict';
import test from 'node:test';

// Import the ticket reference generator.
import { createTicketReference } from '../public/js/data/ticket-store.js';

// Import tracking page functions.
import { readableResolutionTime, renderTrack } from '../public/js/pages/track.js';

// Import the ticket submission page.
import { renderSubmit } from '../public/js/pages/submit.js';

// Import the municipal office groups.
import { OFFICE_GROUPS } from '../public/js/data/departments.js';

// Test the new year-month ticket reference format.
test('ticket reference follows the monthly numbering format', () => {
  const october = new Date('2026-10-15T10:00:00Z');
  const november = new Date('2026-11-01T10:00:00Z');

  // Verify automatic ticket numbering within October.
  assert.equal(createTicketReference(1, october), 'TKT-2026-10-001');
  assert.equal(createTicketReference(2, october), 'TKT-2026-10-002');
  assert.equal(createTicketReference(10, october), 'TKT-2026-10-010');
  assert.equal(createTicketReference(100, october), 'TKT-2026-10-100');

  // Verify numbering for a new month.
  assert.equal(createTicketReference(1, november), 'TKT-2026-11-001');

  // Verify the correct Philippine date at the month boundary.
  const manilaNovember = new Date('2026-10-31T16:00:00Z');

  assert.equal(
    createTicketReference(1, manilaNovember),
    'TKT-2026-11-001'
  );

  // Verify the reference follows the required format.
  const reference = createTicketReference(1, october);

  assert.match(reference, /^TKT-\d{4}-(0[1-9]|1[0-2])-\d{3,}$/);
});

// Test resolution time calculations.
test('resolution duration is only available when completion time is supplied', () => {
  // Return null when no resolution date exists.
  assert.equal(
    readableResolutionTime('2026-10-15T09:00:00Z', null),
    null
  );

  // Calculate the duration for a resolved ticket.
  assert.equal(
    readableResolutionTime(
      '2026-10-15T09:00:00Z',
      '2026-10-15T10:35:00Z'
    ),
    '1 hr 35 min'
  );

  // Reject a resolution date earlier than submission.
  assert.equal(
    readableResolutionTime(
      '2026-10-15T10:00:00Z',
      '2026-10-15T09:00:00Z'
    ),
    null
  );
});

// Test required form fields and ticket tracking navigation.
test('landing form has 4 required fields and a bottom-right tracking action', async () => {
  const html = await renderSubmit();

  // Verify the required submission form fields.
  assert.match(html, /id="description"[\s\S]*?required/);
  assert.match(html, /id="full-name"[\s\S]*?required/);
  assert.match(html, /id="department"[\s\S]*?required/);
  assert.match(html, /id="photo-upload"/);

  // Verify the tracking button appears on the landing page.
  assert.match(html, /landing-track-actions/);
  assert.match(html, /href="\/track"/);

  // Confirm that Home and Admin Login sections are not displayed.
  assert.doesNotMatch(html, /How It Works|\bAdmin Login\b/);
});

// Test Ticket ID searching and municipal office selection.
test('tracking search offers both ID lookup and all 25 offices in a dropdown', async () => {
  // Temporarily simulate the browser's window location.
  const oldLocation = globalThis.window;

  globalThis.window = {
    location: {
      search: ''
    }
  };

  try {
    // Render the Track Ticket page.
    const html = await renderTrack();

    // Verify the ticket ID search field.
    assert.match(html, /id="track-id"/);

    // Verify the municipal office dropdown.
    assert.match(html, /id="track-office"/);

    // Verify both sorting options.
    assert.match(html, /value="oldest"/);
    assert.match(html, /value="newest"/);

    // Verify the Ticket ID table heading.
    assert.match(html, /<th>Ticket ID<\/th>/);

    // Verify that every municipal office is included.
    for (const group of OFFICE_GROUPS) {
      for (const [officeCode] of group.offices) {
        assert.match(
          html,
          new RegExp(`value="${officeCode}"`)
        );
      }
    }
  } finally {
    // Restore the original browser environment.
    if (oldLocation === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = oldLocation;
    }
  }
});
