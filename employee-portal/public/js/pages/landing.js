import { loadTemplate } from '../lib/template-loader.js';
import { grantDemoAccess, isValidDemoPin } from '../services/access-service.js';


// Render the HTML template; interactions are attached by mountLanding().
export async function renderLanding() {
  return loadTemplate('landing');
}

// Handle PIN visibility and municipal access validation.
export function mountLanding({ navigate }) {
  const form = document.getElementById('municipal-pin-form');
  const pinField = document.getElementById('municipal-pin');
  const errorField = document.getElementById('pin-error');
  const toggleButton = document.getElementById('toggle-pin');

  // Show or hide the PIN without clearing the entered value.
  function togglePinVisibility() {
    const isVisible = pinField.type === 'password';

    pinField.type = isVisible ? 'text' : 'password';

    toggleButton.dataset.visible = String(isVisible);
    toggleButton.setAttribute('aria-pressed', String(isVisible));
    toggleButton.setAttribute(
      'aria-label',
      isVisible ? 'Hide PIN' : 'Show PIN'
    );
  }

  // Validate the entered PIN and open ticket submission.
  function handleSubmit(event) {
    event.preventDefault();

    const pin = pinField.value.trim();

    // Require exactly four digits.
    if (!/^\d{4}$/.test(pin)) {
      errorField.textContent = 'Please enter a valid municipal PIN.';
      pinField.setAttribute('aria-invalid', 'true');
      pinField.focus();
      return;
    }

    // Reject an incorrect PIN.
    if (!isValidDemoPin(pin)) {
      errorField.textContent =
        'Incorrect PIN. Please ask your IT Admin for assistance.';

      pinField.setAttribute('aria-invalid', 'true');
      pinField.value = '';
      pinField.focus();
      return;
    }

    // Allow access to the Employee Portal for this browser tab.
    grantDemoAccess();
    pinField.value = '';

    navigate('/submit', { replace: true });
  }

  // Clear validation errors when the employee types again.
  function handleInput() {
    errorField.textContent = '';
    pinField.removeAttribute('aria-invalid');
  }

  // Connect the form and eye icon interactions.
  form.addEventListener('submit', handleSubmit);
  pinField.addEventListener('input', handleInput);
  toggleButton.addEventListener('click', togglePinVisibility);

  // Remove event listeners when leaving the landing page.
  return () => {
    form.removeEventListener('submit', handleSubmit);
    pinField.removeEventListener('input', handleInput);
    toggleButton.removeEventListener('click', togglePinVisibility);
  };
}
