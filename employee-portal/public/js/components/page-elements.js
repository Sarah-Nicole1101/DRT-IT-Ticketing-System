export function breadcrumb(label) {
  return `<div class="breadcrumb"><a href="/" data-link>Home</a> &nbsp;›&nbsp; ${label}</div>`;
}
export function statusBadge(status) {
  const kind = ({ Pending: 'pending', Resolved: 'resolved', Cancelled: 'cancelled' })[status] ?? 'pending';
  return `<span class="badge status-pill ${kind}">${status}</span>`;
}
export function emptyState(title, message) {
  return `<div class="blank-state"><h3>${title}</h3><p class="muted">${message}</p></div>`;
}
