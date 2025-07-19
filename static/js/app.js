const app = {
  user: null,
  isAuthenticated: false,
  courseData: [],
};

function initApp() {
  fetchUserProfile()
    .then(() => {
      updateAuthUI();
      initNavigation();
    })
    .catch(() => {
      updateAuthUI();
      initNavigation();
    });
}

/**
 * Fetch authenticated user from backend
 */
function fetchUserProfile() {
  return fetch('/api/user/profile/', {
    credentials: 'include',
  })
    .then(response => {
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    })
    .then(data => {
      app.user = {
        name: data.name,
        initial: data.initial,
      };
      app.isAuthenticated = true;
    })
    .catch(() => {
      app.user = null;
      app.isAuthenticated = false;
    });
}

/**
 * Update UI based on authentication state
 */
function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const userMenu = document.getElementById('user-menu');

  if (app.isAuthenticated && app.user) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (signupBtn) signupBtn.classList.add('hidden');

    if (userMenu) {
      userMenu.classList.remove('hidden');
      const userInitial = document.querySelector('.user-initial');
      if (userInitial) {
        userInitial.textContent = app.user.initial;
      }
    }
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (signupBtn) signupBtn.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
  }
}

/**
 * Initialize mobile navigation and dropdowns
 */
function initNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navActions = document.querySelector('.nav-actions');

  if (menuToggle && mainNav && navActions) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      navActions.classList.toggle('active');

      const spans = menuToggle.querySelectorAll('span');
      if (menuToggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  const userMenuToggle = document.getElementById('user-menu-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (userMenuToggle && dropdownMenu) {
    userMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('visible');
    });

    document.addEventListener('click', () => {
      if (dropdownMenu.classList.contains('visible')) {
        dropdownMenu.classList.remove('visible');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);

/**
 * Format price with currency
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price
 */
function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price);
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}


function createCourseCard(course) {
  const card = document.createElement('div');
  card.className = 'course-card';

  const levelClass = `level-${course.level.toLowerCase()}`;

  const instructorAvatar = course.instructor?.avatar || '/static/images/default-avatar.png';
  const instructorName = course.instructor?.name || 'Unknown Instructor';

  card.innerHTML = `
    <div class="course-thumbnail">
      <img src="${course.thumbnail}" alt="${course.title}">
    </div>
    <div class="course-content">
      <span class="course-category">${course.category}</span>
      <h3 class="course-title">${course.title}</h3>
      <div class="course-instructor">
        <img src="${instructorAvatar}" alt="${instructorName}" class="instructor-avatar">
        <span class="instructor-name">${instructorName}</span>
      </div>
      <div class="course-meta">
        <div class="course-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>${course.duration}</span>
        </div>
        <div class="course-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
            <path d="M22 12H18M6 12H2M12 2V6M12 18V22" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>${course.lessons} lessons</span>
        </div>
      </div>
      <span class="course-level ${levelClass}">${capitalize(course.level)}</span>
      <div class="course-footer">
        <div class="course-rating">
          <div class="rating-stars">
            ${getStarRating(course.rating)}
          </div>
          <span class="rating-count">(${course.rating_count})</span>
        </div>
        <a href="/course_detail?id=${course.id}" class="btn btn-primary btn-sm">View Course</a>
      </div>
    </div>
  `;
  
  return card;
}


function getStarRating(rating) {
  rating = parseFloat(rating) || 0;  // Fallback to 0 if undefined or null

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`;
  }
  
  if (halfStar) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24"><defs><linearGradient id="half"><stop offset="50%" stop-color="#FFD700"/><stop offset="50%" stop-color="#E0E0E0"/></linearGradient></defs><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#half)"/></svg>`;
  }
  
  for (let i = 0; i < emptyStars; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 24 24" fill="#E0E0E0"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`;
  }
  
  return html;
}


/**
 * Show form validation error
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message
 */
function showFormError(input, message) {
  // Remove existing error message
  const existingError = input.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error class to input
  input.classList.add('error');
  
  // Create error message element
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // Insert error message after input
  input.parentElement.appendChild(errorElement);
}


function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}


/**
 * Clear form validation errors
 * @param {HTMLFormElement} form - Form element
 */
function clearFormErrors(form) {
  const errorInputs = form.querySelectorAll('.error');
  const errorMessages = form.querySelectorAll('.error-message');
  
  errorInputs.forEach(input => {
    input.classList.remove('error');
  });
  
  errorMessages.forEach(message => {
    message.remove();
  });
}

/**
 * Generate a random string for use as an ID
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function generateRandomId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);