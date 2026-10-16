// Load standalone HTML layouts. Cached templates are shared across page visits.
const templates = new Map();

export async function loadTemplate(name) {
  // Template paths are fixed by the router; never accept arbitrary user input.
  if (!/^[a-z-]+$/.test(name)) throw new Error('Invalid template name.');
  if (!templates.has(name)) {
    const pending = fetch(`/pages/${name}.html`)
      .then(response => {
        if (!response.ok) throw new Error(`Unable to load ${name} page.`);
        return response.text();
      })
      .catch(error => {
        templates.delete(name); // Allow a retry on the next visit.
        throw error;
      });
    templates.set(name, pending);
  }
  return templates.get(name);
}

// Replace named slots with preformatted values; never evaluate HTML as JavaScript.
// Escape user text before passing it in. Only trusted components may contain HTML.
export function fillTemplate(html, values) {
  return html.replace(/\{\{([a-zA-Z][a-zA-Z0-9]*)\}\}/g, (_match, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Missing template value: ${key}`);
    return String(values[key]);
  });
}
