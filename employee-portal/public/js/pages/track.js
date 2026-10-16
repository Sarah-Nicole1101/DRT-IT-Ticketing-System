
// Import the dropdown, UI components, office data, and ticket functions.
import { officeOptions } from '../components/office-select.js';
import { emptyState, statusBadge } from '../components/page-elements.js';
import { getOffice } from '../data/departments.js';
import { getTicketByReference, listTicketsByDepartment } from '../data/ticket-store.js';
import { escapeHtml, readableDate } from '../lib/ticket-rules.js';
import { loadTemplate, fillTemplate } from '../lib/template-loader.js';

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

// Load the tracking layout while keeping search state in the URL.
export async function renderTrack() {
  const params = new URLSearchParams(window.location.search);
  const office = getOffice(params.get('office'));
  const reference = params.get('id') ?? '';

  return fillTemplate(await loadTemplate('track'), {
    ticketId: escapeHtml(reference),
    officeOptions: officeOptions(office?.code ?? '')
  });
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

    // Clone the HTML row template and assign values as text (not raw HTML).
    const rowTemplate = document.getElementById('ticket-row-template');
    rows.replaceChildren();
    sorted.forEach((ticket, index) => {
      selectedTickets.set(String(index), ticket);
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      const button = row.querySelector('button[data-ticket-index]');
      button.dataset.ticketIndex = String(index);
      button.setAttribute('aria-label', `View progress for ticket ${ticket.reference}`);
      row.querySelector('[data-reference]').textContent = ticket.reference;
      row.querySelector('[data-office]').textContent = ticket.departmentCode;
      row.querySelector('[data-status]').innerHTML = statusBadge(ticket.status);
      row.querySelector('[data-date]').textContent = readableDate(ticket.createdAt);
      rows.append(row);
    });

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

    // Clone the dialog template and safely assign ticket information.
    const template = document.getElementById('ticket-detail-template');
    dialog.replaceChildren(template.content.cloneNode(true));
    dialog.querySelector('[data-detail-reference]').textContent = ticket.reference;
    dialog.querySelector('[data-detail-office]').textContent = office?.code ?? ticket.departmentCode;
    dialog.querySelector('[data-detail-date]').textContent = readableDate(ticket.createdAt);
    dialog.querySelector('[data-detail-status]').innerHTML = statusBadge(ticket.status);
    dialog.querySelector('[data-detail-description]').textContent = ticket.description;
    dialog.querySelector('[data-detail-note]').textContent = adminNote || 'No IT notes available yet.';
    if (resolutionTime) {
      dialog.querySelector('[data-resolution-row]').hidden = false;
      dialog.querySelector('[data-resolution-time]').textContent = resolutionTime;
    }

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
