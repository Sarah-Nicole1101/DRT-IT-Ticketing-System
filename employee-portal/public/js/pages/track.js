
// Import the dropdown, UI components, office data, and ticket functions.
import { officeOptions } from '../components/office-select.js';
import { emptyState, statusBadge } from '../components/page-elements.js';
import { getOffice } from '../data/departments.js';
import { getTicketByReference, listTicketsByDepartment } from '../data/ticket-store.js';
import { escapeHtml, readableDate } from '../lib/ticket-rules.js';

// Calculate how long it took to resolve a ticket.
export function readableResolutionTime(createdAt, resolvedAt) {
  // Return nothing if there is no resolution date.
  if (!resolvedAt) return null;

  const milliseconds = Date.parse(resolvedAt) - Date.parse(createdAt);

  // Ignore missing or invalid time differences.
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return null;

  const minutes = Math.round(milliseconds / 60000);

  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return `${hours} hr${hours === 1 ? '' : 's'}${remaining ? ` ${remaining} min` : ''}`;
}

// Display the Track Ticket page and its search form.
export function renderTrack() {
  // Restore the selected office or ticket ID from the page URL.
  const params = new URLSearchParams(window.location.search);
  const office = getOffice(params.get('office'));
  const reference = params.get('id') ?? '';

  return `
    <div class="container tracking-container">

      <!-- Display the page heading and return button. -->
      <div class="tracking-header">
        <div>
          <div class="eyebrow">Ticket History</div>
          <h1>Track Ticket</h1>
          <p>Search for one ticket using its ID, or choose a municipal office to view all reported concerns.</p>
        </div>
        <a href="/" data-link class="button secondary">← Submit Ticket</a>
      </div>

      <!-- Search by exact ticket ID or selected municipal office. -->
      <form id="track-form" class="panel tracking-search" novalidate>
        <div class="tracking-field">
          <label for="track-id">Search by Ticket ID (optional)</label>
          <input id="track-id" name="reference" type="search" value="${escapeHtml(reference)}"
            autocomplete="off" placeholder="e.g., DRT-IT-2026-A1B2C3D4E5F6" />
        </div>

        <!-- Separate the two available search methods. -->
        <div class="tracking-separator" aria-hidden="true">OR</div>

        <div class="tracking-field tracking-office">
          <label for="track-office">Choose or Search Your Municipal Office</label>
          <select id="track-office" name="office">${officeOptions(office?.code ?? '')}</select>
        </div>

        <!-- Submit the search without leaving the page. -->
        <button type="submit" class="button primary tracking-search-button">Search Tickets</button>

        <p class="tracking-help">Enter a Ticket ID to find that ticket only. Leave it blank to show all tickets for the selected office.</p>
        <p id="track-error" class="field-error" role="alert"></p>
      </form>

      <!-- Show search results below the form. -->
      <section id="results-section" aria-label="Ticket search results" hidden>
        <div class="tracking-results-header">
          <div>
            <div class="eyebrow">Search Results</div>
            <h2 id="result-title">Tickets</h2>
            <p id="result-count" class="caption"></p>
          </div>

          <!-- Allow sorting tickets by submission date. -->
          <div class="tracking-sort">
            <label for="sort-filter">Sort by</label>
            <select id="sort-filter">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <!-- Display matching tickets in a table. -->
        <div class="ticket-table-wrap">
          <table class="ticket-table">
            <thead><tr><th>Ticket ID</th><th>Office</th><th>Status</th><th>Time Submitted</th></tr></thead>

            <!-- JavaScript inserts ticket rows here. -->
            <tbody id="ticket-rows"></tbody>
          </table>

          <!-- Display an empty or loading message when needed. -->
          <div id="tracking-empty"></div>
        </div>

        <p class="tracking-help tracking-table-help">Select a ticket row to view its progress and IT notes.</p>
      </section>
    </div>
  `;
}

// Set up the search form, sorting, and ticket details popup.
export function mountTrack() {
  // Get the tracking page elements.
  const form = document.getElementById('track-form');
  const referenceField = document.getElementById('track-id');
  const officeField = document.getElementById('track-office');
  const errorField = document.getElementById('track-error');
  const section = document.getElementById('results-section');
  const rows = document.getElementById('ticket-rows');
  const empty = document.getElementById('tracking-empty');
  const dialog = document.getElementById('progress-dialog');
  const sortField = document.getElementById('sort-filter');

  // Keep track of the displayed tickets and current search.
  const selectedTickets = new Map();
  let tickets = [];
  let searchGeneration = 0;

  // Display matching tickets as clickable table rows.
  function paintResults() {
    // Clear old selections and sort the latest results.
    selectedTickets.clear();

    const sorted = [...tickets].sort((a, b) => {
      const diff = a.createdAt.localeCompare(b.createdAt);
      return sortField.value === 'oldest' ? diff : -diff;
    });

    // Show the total number of matching tickets.
    document.getElementById('result-count').textContent =
      `${sorted.length} ticket${sorted.length === 1 ? '' : 's'} found`;

    // Create a clickable row for each ticket.
    rows.innerHTML = sorted.map((ticket, index) => {
      selectedTickets.set(String(index), ticket);

      return `
        <tr>
          <td colspan="4" class="ticket-cell">
            <button class="ticket-row-button" type="button" data-ticket-index="${index}"
              aria-label="View progress for ticket ${escapeHtml(ticket.reference)}">
              <span class="ticket-reference">${escapeHtml(ticket.reference)}</span>
              <span class="ticket-office">${escapeHtml(ticket.departmentCode)}</span>
              <span class="ticket-status">${statusBadge(ticket.status)}</span>
              <span class="ticket-date">${readableDate(ticket.createdAt)}</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Show an empty-state message if no tickets matched.
    empty.innerHTML = sorted.length
      ? ''
      : emptyState('No matching tickets', 'Try a different Ticket ID or municipal office.');
  }

  // Search one ticket by ID, or list all tickets from an office.
  async function search() {
    // Ignore outdated results if another search starts.
    const generation = ++searchGeneration;
    const reference = referenceField.value.trim().toUpperCase();
    const code = officeField.value;

    errorField.textContent = '';

    // Require at least one valid search input.
    if (!reference && !getOffice(code)) {
      errorField.textContent = 'Please enter a Ticket ID or select a municipal office.';
      referenceField.focus();
      section.hidden = true;
      return;
    }

    // Show the results area and loading message.
    section.hidden = false;
    rows.replaceChildren();
    empty.innerHTML = '<p class="loading">Searching tickets…</p>';

    const title = document.getElementById('result-title');

    try {
      // Ticket ID searches take priority over office searches.
      if (reference) {
        const match = await getTicketByReference(reference);

        if (generation !== searchGeneration) return;

        tickets = match ? [match] : [];
        title.textContent = `Ticket ID: ${reference}`;

        // Update the URL to remember the searched ticket ID.
        history.replaceState(null, '', `/track?id=${encodeURIComponent(reference)}`);
      } else {
        // Otherwise, retrieve every ticket for the selected office.
        tickets = await listTicketsByDepartment(code);

        if (generation !== searchGeneration) return;

        const office = getOffice(code);
        title.textContent = `${office.code} — ${office.name}`;

        history.replaceState(null, '', `/track?office=${encodeURIComponent(code)}`);
      }

      paintResults();
    } catch {
      if (generation !== searchGeneration) return;

      // Show an error message if ticket retrieval fails.
      tickets = [];
      title.textContent = 'Search unavailable';
      rows.replaceChildren();
      empty.innerHTML = emptyState('Unable to load tickets', 'Please try searching again.');
      document.getElementById('result-count').textContent = '';
    }
  }

  // Open a popup showing the selected ticket's progress.
  function showTicket(ticket) {
    const office = getOffice(ticket.departmentCode);

    // Calculate resolution time only for resolved tickets.
    const resolutionTime = ticket.status === 'Resolved'
      ? readableResolutionTime(ticket.createdAt, ticket.resolvedAt ?? ticket.updatedAt)
      : null;

    // Find the latest available IT note for this ticket.
    const adminNote = ticket.adminNote || ticket.resolutionNote ||
      [...(ticket.events ?? [])].reverse().find((event) => event.actor === 'admin')?.publicNote;

    // Build the ticket details popup.
    dialog.innerHTML = `
      <div class="dialog-body ticket-detail-dialog">
        <div class="dialog-top">
          <h2 id="dialog-title">Ticket Progress</h2>
          <button class="close-button" data-close-dialog type="button" aria-label="Close ticket progress">×</button>
        </div>

        <!-- Show the ticket reference, office, dates, and status. -->
        <div class="ticket-detail-meta">
          <div><span>Ticket ID</span><strong class="ticket-reference">${escapeHtml(ticket.reference)}</strong></div>
          <div><span>Municipal Office</span><strong>${escapeHtml(office?.code ?? ticket.departmentCode)}</strong></div>
          <div><span>Time Submitted</span><strong>${readableDate(ticket.createdAt)}</strong></div>
          <div><span>Current Status</span>${statusBadge(ticket.status)}</div>
          ${resolutionTime ? `<div><span>Resolution Time</span><strong>${resolutionTime}</strong></div>` : ''}
        </div>

        <!-- Show the concern submitted by the employee. -->
        <section class="ticket-detail-note">
          <h3>End User's Description</h3>
          <p>${escapeHtml(ticket.description)}</p>
        </section>

        <!-- Show an IT note when one is available. -->
        <section class="ticket-detail-note">
          <h3>IT Note / Description</h3>
          <p>${adminNote ? escapeHtml(adminNote) : 'No IT notes available yet.'}</p>
        </section>
      </div>
    `;

    // Open the dialog and connect its close button.
    dialog.showModal();
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close(), { once: true });
  }

  // Search tickets when the employee submits the form.
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search();
  });

  // Refresh the displayed order when sorting changes.
  sortField.addEventListener('change', paintResults);

  // Open ticket details when a result row is selected.
  rows.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-ticket-index]');
    if (!button) return;

    const ticket = selectedTickets.get(button.dataset.ticketIndex);
    if (ticket) showTicket(ticket);
  });

  // Restore the previous search when refreshing or returning to this page.
  const params = new URLSearchParams(window.location.search);
  if (referenceField.value || getOffice(params.get('office'))) search();

  // Clean up active searches and close the popup when leaving the page.
  return () => {
    ++searchGeneration;
    if (dialog.open) dialog.close();
  };
}
