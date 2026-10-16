/** Shared frontend rules. These must also be validated by the future server. */
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGES = 3;
export const MAX_DESCRIPTION_LENGTH = 1500;
export const STATUSES = Object.freeze(['Pending', 'Resolved', 'Cancelled']);

export function validateTicket({ fullName, departmentCode, description, files }, validDepartmentCodes) {
  const errors = {};
  const name = fullName.trim().replace(/\s+/g, ' ');
  const note = description.trim();
  if (name.length < 2) errors.fullName = 'Please enter your complete name.';
  else if (name.length > 120) errors.fullName = 'Please keep your name under 120 characters.';
  if (!validDepartmentCodes.includes(departmentCode)) errors.departmentCode = 'Please select your municipal office.';
  if (note.length < 8) errors.description = 'Please describe the problem in at least 8 characters.';
  else if (note.length > MAX_DESCRIPTION_LENGTH) errors.description = 'Please keep the description within 1,500 characters.';
  if (!files.length) errors.files = 'Please attach at least one clear photo of the problem.';
  else if (files.length > MAX_IMAGES) errors.files = 'You can attach up to 3 photos only.';
  else if (files.some(file => !ALLOWED_IMAGE_TYPES.has(file.type))) errors.files = 'Only JPG, PNG, and WebP images are allowed.';
  else if (files.some(file => file.size > MAX_IMAGE_SIZE_BYTES)) errors.files = 'Each photo must be 5 MB or smaller.';
  return { errors, clean: { fullName: name, description: note, departmentCode } };
}

export function filterAndSortTickets(tickets, { name = '', status = 'All', sort = 'newest' } = {}) {
  const query = name.toLocaleLowerCase().trim();
  const filtered = tickets.filter(ticket =>
    (status === 'All' || ticket.status === status) &&
    (!query || ticket.fullName.toLocaleLowerCase().includes(query)),
  );
  const nameCollator = new Intl.Collator('en', { sensitivity: 'base' });
  filtered.sort((a, b) => {
    switch (sort) {
      case 'oldest': return a.createdAt.localeCompare(b.createdAt);
      case 'name-asc': return nameCollator.compare(a.fullName, b.fullName) || b.createdAt.localeCompare(a.createdAt);
      case 'name-desc': return nameCollator.compare(b.fullName, a.fullName) || b.createdAt.localeCompare(a.createdAt);
      default: return b.createdAt.localeCompare(a.createdAt);
    }
  });
  return filtered;
}

export const readableDate = iso => new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila',
}).format(new Date(iso));

/** Escape all user-provided strings inserted into HTML templates. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}
