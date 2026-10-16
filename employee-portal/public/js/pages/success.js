
// Import functions for escaping HTML and formatting dates.
import { escapeHtml, readableDate } from '../lib/ticket-rules.js';

// Import the municipal office lookup function.
import { getOffice } from '../data/departments.js';

// Import the reusable ticket status badge.
import { statusBadge } from '../components/page-elements.js';

// Display the submission confirmation page.
export function renderSuccess() {
  // Retrieve the most recent submission.
  let result = null;

  try {
    result = JSON.parse(sessionStorage.getItem('drt-last-demo-submission'));
  } catch {
    // Continue if the stored data is invalid.
  }

  // Find the office associated with the submitted ticket.
  const office = result ? getOffice(result.office) : null;

  // Display a fallback if no recent submission exists.
  if (!result || !office) {
    return `
      <div class="container narrow">
        <section class="panel submission-result">
          <h1>No recent submission</h1>
          <p class="muted">You can submit a concern or track municipal office tickets.</p>
          <a href="/" data-link class="button primary">Submit Ticket</a>
        </section>
      </div>
    `;
  }

  // Escape the ticket ID before displaying it.
  const reference = escapeHtml(result.reference ?? 'Not available');

  // Display the submission confirmation and ticket details.
  return `
    <div class="container narrow">
      <section class="panel submission-result">

        <!-- Display the submission success message. -->
        <div class="eyebrow">Submission Complete</div>
        <div class="submission-check" aria-hidden="true">✓</div>

        <h1>Your IT concern has been submitted</h1>

        <p class="muted">
          Your ticket is now under the selected department and has a Pending status.
        </p>

        <!-- Display the ticket ID and copy button. -->
        <div class="reference-box">
          <span>Your Ticket ID</span>

          <div class="ticket-id-actions">
            <strong id="ticket-reference">${reference}</strong>

            <!-- Copy the ticket ID to the clipboard. -->
            <button
              type="button"
              id="copy-ticket-id"
              class="copy-ticket-button"
              aria-label="Copy Ticket ID"
            >
              Copy ID
            </button>
          </div>

          <!-- Remind the employee to keep their ticket ID. -->
          <p>
            Remember this Ticket ID or copy it to track your reported issue.
          </p>

          <!-- Announce whether copying was successful. -->
          <p id="copy-feedback" role="status" aria-live="polite"></p>
        </div>

        <!-- Display the submitted ticket information. -->
        <div class="result-meta">

          <!-- Employee's full name. -->
          <div>
            <span class="muted">Submitted by</span>
            <strong>${escapeHtml(result.name)}</strong>
          </div>

          <!-- Selected municipal office. -->
          <div>
            <span class="muted">Office</span>
            <strong>${escapeHtml(office.code)} — ${escapeHtml(office.name)}</strong>
          </div>

          <!-- Submission date and time. -->
          <div>
            <span class="muted">Date and time</span>
            <strong>${readableDate(result.time)}</strong>
          </div>

          <!-- Initial ticket status. -->
          <div>
            <span class="muted">Status</span>
            ${statusBadge('Pending')}
          </div>
        </div>

        <!-- Buttons for tracking or submitting another ticket. -->
        <div class="result-buttons">
          <a href="/track?office=${encodeURIComponent(office.code)}" data-link class="button primary">
            Track Ticket →
          </a>

          <a href="/" data-link class="button secondary">
            Submit Another
          </a>
        </div>

      </section>
    </div>
  `;
}

// Enable copying the ticket ID from the confirmation page.
export function mountSuccess() {
  const copyButton = document.getElementById('copy-ticket-id');
  const ticketReference = document.getElementById('ticket-reference');
  const feedback = document.getElementById('copy-feedback');

  // Stop if there is no ticket to copy.
  if (!copyButton || !ticketReference || !feedback) return;

  // Copy the displayed ticket ID when clicked.
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(ticketReference.textContent.trim());

      // Confirm that the ticket ID was copied.
      copyButton.textContent = 'Copied!';
      feedback.textContent = 'Ticket ID copied to clipboard.';
    } catch {
      // Show a message if clipboard access is unavailable.
      feedback.textContent = 'Unable to copy automatically. Please select and copy the Ticket ID.';
    }
  }

  // Attach the copy button interaction.
  copyButton.addEventListener('click', handleCopy);

  // Remove the listener when leaving the page.
  return () => {
    copyButton.removeEventListener('click', handleCopy);
  };
}
