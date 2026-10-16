import { loadTemplate, fillTemplate } from '../lib/template-loader.js';

// Import functions for escaping HTML and formatting dates.
import { escapeHtml, readableDate } from '../lib/ticket-rules.js';

// Import the municipal office lookup function.
import { getOffice } from '../data/departments.js';

// Import the reusable ticket status badge.
import { statusBadge } from '../components/page-elements.js';

// Load the submission details into a standalone HTML template.
export async function renderSuccess() {
  let result = null;
  try {
    result = JSON.parse(sessionStorage.getItem('drt-last-demo-submission'));
  } catch {
    // Invalid browser session data is handled by the fallback template.
  }

  const office = result ? getOffice(result.office) : null;
  if (!result || !office) return loadTemplate('no-submission');

  return fillTemplate(await loadTemplate('success'), {
    reference: escapeHtml(result.reference ?? 'Not available'),
    fullName: escapeHtml(result.name),
    officeCode: escapeHtml(office.code),
    officeName: escapeHtml(office.name),
    submittedAt: readableDate(result.time),
    statusBadge: statusBadge('Pending'),
    officeQuery: encodeURIComponent(office.code)
  });
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
