/**  
 * Check subscription status from Django backend
 */
document.addEventListener('DOMContentLoaded', () => {
  checkSubscriptionStatus();
});

/**
 * Check subscription status from Django backend 
 */
function checkSubscriptionStatus() {
  fetch('/api/user/is-subscribed/', {
    credentials: 'include',
  })
    .then(res => res.json())
    .then(data => {
      const loginPrompt = document.getElementById('login-prompt');
      const paystackSection = document.getElementById('paystack-section');

      // If user is authenticated
      if (data.authenticated) {
        if (loginPrompt) loginPrompt.style.display = 'none';

        if (data.subscribed) {
          // If user is already subscribed
          if (paystackSection) {
            paystackSection.innerHTML = `
              <div class="subscription-active">
                <svg width="64" height="64" viewBox="0 0 24 24">
                  <path d="M22 4L12 14.01L9 11.01" stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3>You're already subscribed!</h3>
                <p>You have full access to all courses on EduStream.</p>
                <a href="/courses/" class="btn btn-primary">Browse Courses</a>
              </div>
            `;
          }
        } else {
          // User is not subscribed, show Paystack button
          if (paystackSection) {
            paystackSection.innerHTML = `
              <p class="payment-instructions">
                Make a one-time payment of ₦5,000 for lifetime access to all courses on EduStream.
              </p>
              <a href="/subscribe/" class="btn btn-primary btn-large">Pay with Paystack</a>
            `;
          }
        }
      } else {
        // User is not logged in
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (paystackSection) paystackSection.style.display = 'none';
      }
    })
    .catch(error => {
      console.error('Error checking subscription status:', error);

      const loginPrompt = document.getElementById('login-prompt');
      const paystackSection = document.getElementById('paystack-section');

      if (loginPrompt) loginPrompt.style.display = 'block';
      if (paystackSection) paystackSection.style.display = 'none';
    });
}

/**
 * Get CSRF token from cookie
 */
function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return decodeURIComponent(cookieValue || '');
}
