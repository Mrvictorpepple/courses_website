/**
 * JavaScript for the dashboard page
 */

document.addEventListener('DOMContentLoaded', () => { 
  
  initDashboard();
  loadCourseProgress();
  loadRecommendedCourses();
});

/**
 * Initialize dashboard
 */
function initDashboard() {
  // Update user name
  const userNameElement = document.getElementById('user-name');
  if (userNameElement && app.user) {
    userNameElement.textContent = app.user.name.split(' ')[0];
  }
  
  // Initialize navigation
  initDashboardNav();
}

/**
 * Initialize dashboard navigation
 */
function initDashboardNav() {
  const navLinks = document.querySelectorAll('.dashboard-nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Only add click listener to hash links (e.g., #my-courses)
    if (href && href.startsWith('#')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active from all
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active to clicked
        link.classList.add('active');

        // Load section content
        const sectionId = href.substring(1);
        loadSectionContent(sectionId);
      });
    }
  });
}

/**
 * Load section content
 * @param {string} sectionId - ID of the section to load
 */
function loadSectionContent(sectionId) {
  // In a real app, this would load different content based on the section
  // For demo, just console log the section change
  console.log(`Loading section: ${sectionId}`);
}

/**
 * Load course progress
 */
function loadCourseProgress() {
  const progressContainer = document.querySelector('.course-progress-cards');
  if (!progressContainer) return;
 
  fetch('/api/dashboard/progress/')
    .then(res => res.json())
    .then(progressData => {
      progressContainer.innerHTML = '';

      progressData.forEach(data => {
        const card = document.createElement('div');
        card.className = 'course-progress-card';

        card.innerHTML = `
          <div class="progress-thumbnail">
            <img src="${data.thumbnail}" alt="${data.title}">
          </div>
          <div class="progress-content">
            <h3 class="progress-title">${data.title}</h3>
            <div class="progress-meta">
              <span>Last lesson: ${data.lastLesson}</span>
              <span>${data.lastAccessed}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${data.progress}%"></div>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          window.location.href = `course_detail?id=${data.courseId}`;
        });

        progressContainer.appendChild(card);
      });
    });
}

/**
 * Load recommended courses
 */
function loadRecommendedCourses() {
  const coursesContainer = document.querySelector('#recommended .courses-grid');
  if (!coursesContainer) return;

  fetch('/api/dashboard/recommendations/')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    })
    .then(recommendedCourses => {
      coursesContainer.innerHTML = '';

      if (recommendedCourses.length === 0) {
        coursesContainer.innerHTML = `<p>No recommendations available at the moment.</p>`;
        return;
      }

      recommendedCourses.forEach(course => {
        const card = createCourseCard(course);
        coursesContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Error loading recommendations:', err);
      coursesContainer.innerHTML = `<p class="error-msg">Failed to load recommended courses.</p>`;
    });
}

/**
 * Capitalize a string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
