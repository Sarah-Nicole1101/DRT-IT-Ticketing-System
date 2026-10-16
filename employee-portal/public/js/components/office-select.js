import { OFFICE_GROUPS } from '../data/departments.js';
import { escapeHtml } from '../lib/ticket-rules.js';

/** Keep the office list in one source file and reuse it in forms/filters. */
export function officeOptions(selectedCode = '') {
  return `<option value="">Choose your municipal office</option>` + OFFICE_GROUPS.map(group => `
    <optgroup label="${escapeHtml(group.category)}">
      ${group.offices.map(([code, name]) => `<option value="${code}" ${code === selectedCode ? 'selected' : ''}>${code} — ${escapeHtml(name)}</option>`).join('')}
    </optgroup>`).join('');
}
