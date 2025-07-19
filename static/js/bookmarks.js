/**
 * JavaScript for the bookmarks page
 */

document.addEventListener('DOMContentLoaded', () => {
    
    initializeFilters();
    loadBookmarks();
  });
  
  /**
   * Initialize search and filter controls
   */
  function initializeFilters() {
    const searchInput = document.getElementById('bookmark-search');
    const searchBtn = document.getElementById('search-btn');
    const filterSelect = document.getElementById('filter-by');
    
    if (searchInput && searchBtn) {
      // Search functionality
      searchBtn.addEventListener('click', () => {
        loadBookmarks(searchInput.value, filterSelect?.value);
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          loadBookmarks(searchInput.value, filterSelect?.value);
        }
      });
    }
    
    if (filterSelect) {
      // Filter functionality
      filterSelect.addEventListener('change', () => {
        loadBookmarks(searchInput?.value || '', filterSelect.value);
      });
    }
  }
  
  /**
   * Load user's bookmarked courses
   * @param {string} searchTerm - Search term
   * @param {string} category - Category filter
   */
  function loadBookmarks(searchTerm = '', category = 'all') {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    if (!bookmarksContainer) return;
    
    // Clear skeleton loading
    bookmarksContainer.innerHTML = '';
    
    // Mock bookmarks data
    let bookmarks = [
      {
        id: '1',
        courseId: '3',
        title: 'UI/UX Design Principles',
        thumbnail: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg',
        instructor: 'Emily Chen',
        category: 'design',
        duration: '10 hours',
        lessons: 28,
        dateBookmarked: '2025-02-24'
      },
      {
        id: '2',
        courseId: '5',
        title: 'Data Science with Python',
        thumbnail: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
        instructor: 'Priya Sharma',
        category: 'development',
        duration: '14 hours',
        lessons: 42,
        dateBookmarked: '2025-02-23'
      }
    ];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      bookmarks = bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(term) ||
        bookmark.instructor.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (category !== 'all') {
      bookmarks = bookmarks.filter(bookmark => bookmark.category === category);
    }
    
    if (bookmarks.length === 0) {
      bookmarksContainer.innerHTML = `
        <div class="empty-bookmarks">
          <h3>No Bookmarks Found</h3>
          <p>Browse courses and bookmark the ones you're interested in.</p>
          <a href="courses.html" class="btn btn-primary">Browse Courses</a>
        </div>
      `;
      return;
    }
    
    // Add bookmarks to the container
    bookmarks.forEach(bookmark => {
      const card = document.createElement('div');
      card.className = 'bookmark-card';
      
      card.innerHTML = `
        <div class="bookmark-thumbnail">
          <img src="${bookmark.thumbnail}" alt="${bookmark.title}">
        </div>
        <div class="bookmark-content">
          <span class="bookmark-category">${bookmark.category.charAt(0).toUpperCase() + bookmark.category.slice(1)}</span>
          <h3 class="bookmark-title">${bookmark.title}</h3>
          <div class="bookmark-meta">
            <span>By ${bookmark.instructor}</span>
            <span>${bookmark.duration}</span>
          </div>
          <p>${bookmark.lessons} lessons</p>
          <div class="bookmark-actions">
            <a href="course-detail.html?id=${bookmark.courseId}" class="btn btn-primary">View Course</a>
            <button class="btn btn-text" onclick="removeBookmark('${bookmark.id}')">
              Remove
            </button>
          </div>
        </div>
      `;
      
      bookmarksContainer.appendChild(card);
    });
  }
  
  /**
   * Remove a bookmark
   * @param {string} bookmarkId - Bookmark ID
   */
  function removeBookmark(bookmarkId) {
    if (confirm('Are you sure you want to remove this bookmark?')) {
      // In a real app, this would remove the bookmark from the database
      const card = document.querySelector(`[data-bookmark-id="${bookmarkId}"]`);
      if (card) {
        card.remove();
      }
      
      // Reload bookmarks to show empty state if needed
      loadBookmarks();
    }
  }