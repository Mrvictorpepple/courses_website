/**
 * JavaScript for authentication pages
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initSignupForm();
});

/**
 * Initialize login form
 */
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    clearFormErrors(loginForm);

    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    let isValid = true;

    // Email validation
    if (!emailEl.value.trim()) {
      showFormError(emailEl, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(emailEl.value.trim())) {
      showFormError(emailEl, 'Please enter a valid email');
      isValid = false;
    }

    // Password validation
    if (!passwordEl.value) {
      showFormError(passwordEl, 'Password is required');
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // Show loading state
    const buttonText = document.getElementById('button-text');
    const buttonLoading = document.getElementById('button-loading');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (buttonText && buttonLoading && submitButton) {
      buttonText.classList.add('hidden');
      buttonLoading.classList.remove('hidden');
      submitButton.disabled = true;
    }
    // Let the form submit naturally to your Django view
  });
}

/**
 * Initialize signup form
 */
function initSignupForm() {
  const signupForm = document.getElementById('signup-form');
  if (!signupForm) return;

  signupForm.addEventListener('submit', (e) => {
    clearFormErrors(signupForm);

    const firstNameEl = document.getElementById('first_name');
    const lastNameEl  = document.getElementById('last_name');
    const emailEl     = document.getElementById('email');
    const passwordEl  = document.getElementById('password');
    const confirmEl   = document.getElementById('confirm_password');
    const termsEl     = document.getElementById('terms');
    let isValid = true;

    // First name
    if (!firstNameEl.value.trim()) {
      showFormError(firstNameEl, 'First name is required');
      isValid = false;
    }

    // Last name
    if (!lastNameEl.value.trim()) {
      showFormError(lastNameEl, 'Last name is required');
      isValid = false;
    }

    // Email
    if (!emailEl.value.trim()) {
      showFormError(emailEl, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(emailEl.value.trim())) {
      showFormError(emailEl, 'Please enter a valid email');
      isValid = false;
    }

    // Password
    if (!passwordEl.value) {
      showFormError(passwordEl, 'Password is required');
      isValid = false;
    } else if (passwordEl.value.length < 8) {
      showFormError(passwordEl, 'Password must be at least 8 characters');
      isValid = false;
    }

    // Confirm password
    if (!confirmEl.value) {
      showFormError(confirmEl, 'Please confirm your password');
      isValid = false;
    } else if (passwordEl.value !== confirmEl.value) {
      showFormError(confirmEl, 'Passwords do not match');
      isValid = false;
    }

    // Terms checkbox
    if (!termsEl.checked) {
      showFormError(termsEl, 'You must agree to the Terms of Service');
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // Show loading state
    const buttonText = document.getElementById('button-text');
    const buttonLoading = document.getElementById('button-loading');
    const submitButton = signupForm.querySelector('button[type="submit"]');

    if (buttonText && buttonLoading && submitButton) {
      buttonText.classList.add('hidden');
      buttonLoading.classList.remove('hidden');
      submitButton.disabled = true;
    }
    // Let the form submit to your Django signup view
  });
}

/**
 * Clear all inline form errors inside a form element
 */
function clearFormErrors(form) {
  form.querySelectorAll('.error-message').forEach(el => el.remove());
  form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

/**
 * Show an inline error message for a given input element
 */
function showFormError(inputEl, message) {
  inputEl.classList.add('input-error');
  const err = document.createElement('div');
  err.className = 'error-message';
  err.innerText = message;
  inputEl.parentNode.appendChild(err);
}

/**
 * Simple email format check
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
