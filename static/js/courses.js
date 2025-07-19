/**
 * JavaScript for the Courses page
 */

document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  setupFilters();
  initPagination();
});

// Current filter and search state
const filterState = {
  category: '',
  level: '',
  search: '',
  page: 1,
  perPage: 6
};

/**
 * Load and display courses
 */
function loadCourses() {
  const coursesContainer = document.getElementById('courses-container');
  if (!coursesContainer) return;

  coursesContainer.innerHTML = '';

  fetch('/api/courses/')
    .then(res => res.json())
    .then(courses => {
      // Apply filters
      courses = filterCourses(courses);

      // Get paginated results
      const { paginatedCourses, totalPages } = paginateCourses(courses);

      // Render courses
      renderCourses(paginatedCourses, totalPages);
    })
    .catch(err => {
      console.error('Error loading courses:', err);
      coursesContainer.innerHTML = `<p>Error loading courses. Please try again later.</p>`;
    });
}


/**
 * Render courses and handle empty state
 */
function renderCourses(paginatedCourses, totalPages) {
  const coursesContainer = document.getElementById('courses-container');
  if (!coursesContainer) return;

  coursesContainer.innerHTML = '';

  if (paginatedCourses.length === 0) {
    coursesContainer.innerHTML = `
      <div class="empty-state">
        <p>No courses match your search criteria. Try adjusting your filters.</p>
        <button id="reset-search" class="btn btn-primary">Reset Search</button>
      </div>
    `;
    document.getElementById('pagination').style.display = 'none';

    document.getElementById('reset-search').addEventListener('click', resetFilters);
    return;
  }

  paginatedCourses.forEach(course => {
    const courseCard = createCourseCard(course);
    coursesContainer.appendChild(courseCard);
  });

  updatePagination(totalPages);
}


/**
 * Filter courses based on current filter state
 */
function filterCourses(courses) {
  return courses.filter(course => {
    if (filterState.category && course.category.toLowerCase() !== filterState.category.toLowerCase()) {
      return false;
    }
    if (filterState.level && course.level.toLowerCase() !== filterState.level.toLowerCase()) {
      return false;
    }
    if (filterState.search) {
      const searchTerm = filterState.search.toLowerCase();
      const matchesTitle = course.title.toLowerCase().includes(searchTerm);
      const matchesDescription = course.description.toLowerCase().includes(searchTerm);
      const matchesInstructor = course.instructor.name.toLowerCase().includes(searchTerm);
      if (!matchesTitle && !matchesDescription && !matchesInstructor) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Paginate courses
 */
function paginateCourses(courses) {
  const startIndex = (filterState.page - 1) * filterState.perPage;
  const paginatedCourses = courses.slice(startIndex, startIndex + filterState.perPage);
  const totalPages = Math.ceil(courses.length / filterState.perPage);
  return { paginatedCourses, totalPages };
}

/**
 * Update pagination UI
 */
function updatePagination(totalPages) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  pagination.style.display = totalPages > 1 ? 'flex' : 'none';
  pagination.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.className = `pagination-item ${filterState.page === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/></svg>`;
  prevBtn.addEventListener('click', () => {
    if (filterState.page > 1) {
      filterState.page--;
      loadCourses();
      window.scrollTo(0, 0);
    }
  });
  pagination.appendChild(prevBtn);

  let startPage = Math.max(1, filterState.page - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-item ${i === filterState.page ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      filterState.page = i;
      loadCourses();
      window.scrollTo(0, 0);
    });
    pagination.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = `pagination-item ${filterState.page === totalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/></svg>`;
  nextBtn.addEventListener('click', () => {
    if (filterState.page < totalPages) {
      filterState.page++;
      loadCourses();
      window.scrollTo(0, 0);
    }
  });
  pagination.appendChild(nextBtn);
}

/**
 * Set up filter and search functionality
 */
function setupFilters() {
  const categoryFilter = document.getElementById('category-filter');
  const levelFilter = document.getElementById('level-filter');
  const searchInput = document.getElementById('course-search');
  const searchBtn = document.getElementById('search-btn');
  const clearFiltersBtn = document.getElementById('clear-filters');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      filterState.category = categoryFilter.value;
      filterState.page = 1;
      loadCourses();
    });
  }

  if (levelFilter) {
    levelFilter.addEventListener('change', () => {
      filterState.level = levelFilter.value;
      filterState.page = 1;
      loadCourses();
    });
  }

  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', () => {
      filterState.search = searchInput.value.trim();
      filterState.page = 1;
      loadCourses();
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        filterState.search = searchInput.value.trim();
        filterState.page = 1;
        loadCourses();
      }
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', resetFilters);
  }
}

/**
 * Reset filters to default state
 */
function resetFilters() {
  filterState.category = '';
  filterState.level = '';
  filterState.search = '';
  filterState.page = 1;

  const categoryFilter = document.getElementById('category-filter');
  const levelFilter = document.getElementById('level-filter');
  const searchInput = document.getElementById('course-search');

  if (categoryFilter) categoryFilter.value = '';
  if (levelFilter) levelFilter.value = '';
  if (searchInput) searchInput.value = '';

  loadCourses();
}

/**
 * Initialize pagination (placeholder)
 */
function initPagination() {
  // Handled dynamically inside updatePagination
}
