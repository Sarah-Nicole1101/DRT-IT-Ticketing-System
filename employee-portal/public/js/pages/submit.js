import { loadTemplate, fillTemplate } from '../lib/template-loader.js';
/** Landing page: concern -> full name -> municipal office -> photo -> Submit. */
import { officeOptions } from '../components/office-select.js';
import { DEPARTMENTS } from '../data/departments.js';
import { saveTicket } from '../data/ticket-store.js';
import { MAX_IMAGES, MAX_IMAGE_SIZE_BYTES, validateTicket } from '../lib/ticket-rules.js';

const maxSizeMb = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);

const errorFieldIds = {
  fullName: 'name-error',
  departmentCode: 'office-error',
  description: 'note-error',
  files: 'photo-error',
};

const namedInputs = {
  fullName: '#full-name',
  departmentCode: '#department',
  description: '#description',
  files: '#photo-upload',
};

export async function renderSubmit() {
  const html = await loadTemplate('submit');
  return fillTemplate(html, {
    officeOptions: officeOptions(),
    maxImages: MAX_IMAGES,
    maxSizeMb
  });
}

export function mountSubmit({ navigate }) {
  const form = document.querySelector('#ticket-form');
  const upload = form.querySelector('#photo-upload');
  const previews = form.querySelector('#preview-grid');
  const submitButton = form.querySelector('#submit-button');
  let files = [];
  let objectUrls = [];

  // Release object URLs when preview images are updated or page closes.
  function clearPreviews() {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls = [];
  }

  function paintPreviews() {
    clearPreviews();
    previews.replaceChildren();
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      objectUrls.push(url);
      const figure = document.createElement('div');
      figure.className = 'preview';

      const image = document.createElement('img');
      image.src = url;
      image.alt = `Selected photo ${index + 1}: ${file.name}`;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove photo';
      remove.dataset.removePhoto = String(index);
      figure.append(image, remove);
      previews.append(figure);
    });
  }

  // Photo input is reset so that the same file may be selected again.
  upload.addEventListener('change', () => {
    files = [...files, ...Array.from(upload.files ?? [])];
    upload.value = '';
    paintPreviews();
    document.querySelector('#photo-error').textContent = '';
  });

  previews.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-remove-photo]');
    if (!button) return;
    files.splice(Number(button.dataset.removePhoto), 1);
    paintPreviews();
  });

  // Frontend validation and browser-only save; server validation comes later.
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;

    const input = {
      description: form.elements.description.value,
      fullName: form.elements.fullName.value,
      departmentCode: form.elements.departmentCode.value,
      files,
    };
    const { errors, clean } = validateTicket(
      input,
      DEPARTMENTS.map((office) => office.code),
    );

    for (const [field, id] of Object.entries(errorFieldIds)) {
      document.getElementById(id).textContent = errors[field] ?? '';
    }
    for (const [field, selector] of Object.entries(namedInputs)) {
      const element = form.querySelector(selector);
      element.classList.toggle('error-input', Boolean(errors[field]));
      element.setAttribute('aria-invalid', String(Boolean(errors[field])));
    }

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.querySelector(namedInputs[firstError])?.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';
    document.querySelector('#form-error').textContent = '';

    try {
      const ticket = await saveTicket({ ...clean, files });
      sessionStorage.setItem('drt-last-demo-submission', JSON.stringify({
        reference: ticket.reference,
        office: ticket.departmentCode,
        name: ticket.fullName,
        time: ticket.createdAt,
      }));
      clearPreviews();
      navigate('/submit/success');
    } catch {
      document.querySelector('#form-error').textContent =
        'Could not save this demonstration ticket. Please check your browser storage and try again.';
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Ticket →';
    }
  });

  return clearPreviews;
}
