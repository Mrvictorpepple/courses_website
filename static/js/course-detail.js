/**
 * JavaScript for the Course Detail page
 * 
 *
 */

// Course detail page state
const pageState = {
  courseId: null,
  course: null,
  currentLessonIndex: 0,
  currentSectionIndex: 0,
  isSubscribed: false
};

document.addEventListener('DOMContentLoaded', () => {
  // Get course ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  pageState.courseId = urlParams.get('id');
  
  if (!pageState.courseId) {
    // Redirect to courses page if no ID is provided
    window.location.href = '/courses/';
    return;
  }
  
  // Load course data
  loadCourseDetail();
  
  // Check if user is subscribed
  checkSubscriptionStatus();
  
  // Load related courses
  loadRelatedCourses();
});

/**
 * Load course detail data
 */
function loadCourseDetail() {
  fetch(`/api/course/${pageState.courseId}/`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Course not found');
      }
      return response.json(); 
    })
    .then(course => {
      pageState.course = course;
      document.title = `${course.title} | EduStream`;
      loadCourseHeader(course);
      loadCourseSidebar(course);
      loadCourseContent(course); // You can adjust this based on your backend
    })
    .catch(error => {
      console.error('Error loading course:', error);
      window.location.href = '/dashboard/';
    });
}

/**
 * Load course header
 * @param {Object} course - Course data
 */
function loadCourseHeader(course) {
  const courseHeader = document.getElementById('course-header');
  if (!courseHeader) return;
  
  courseHeader.innerHTML = `
    <div class="container">
      <div class="course-header-content">
        <h1>${course.title}</h1>
        <div class="course-header-meta">
          <div class="course-header-meta-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${formatDuration(course.duration)}</span>
          </div>
          <div class="course-header-meta-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${course.lessons} lessons</span>
          </div>
          <div class="course-header-meta-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${course.rating} (${course.ratingCount} reviews)</span>
          </div>
          <div class="course-header-meta-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${course.students.toLocaleString()} students</span>
          </div>
        </div>
        <p>${course.description}</p>
        <div class="course-instructor-detail">
          <img src="${course.instructor.avatar}" alt="${course.instructor.name}" class="instructor-avatar-large">
          <div class="instructor-info">
            <h3>Instructor: ${course.instructor.name}</h3>
            <p>${course.instructor.bio}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Set background image for header
  courseHeader.style.backgroundImage = `url(${course.thumbnail})`;
  courseHeader.style.backgroundSize = 'cover';
  courseHeader.style.backgroundPosition = 'center';
}

/**
 * Load course sidebar
 * @param {Object} course - Course data
 */
function loadCourseSidebar(course) {
  // Load course progress
  loadCourseProgress();
  
  // Load course meta
  loadCourseMeta(course);
  
  // Load course roadmap
  loadCourseRoadmap(course);
}

/**
 * Load course progress
 */
function loadCourseProgress() {
  const progressContainer = document.getElementById('course-progress-container');
  if (!progressContainer) return;
  
  if (pageState.isSubscribed) {
    // Mock progress for demo
    const progress = 25; // 25% complete
    
    progressContainer.innerHTML = `
      <h3>Course Progress</h3>
      <div class="progress-bar-wrapper">
        <div class="progress-bar-fill" style="width: ${progress}%;"></div>
      </div>
      <p>${progress}% complete</p>
    `;
  } else {
    progressContainer.innerHTML = `
      <h3>Course Progress</h3>
      <p>Subscribe to track your progress</p>
    `;
  }
}

/**
 * Load course meta information
 * @param {Object} course - Course data
 */
function loadCourseMeta(course) {
  const metaContainer = document.getElementById('course-meta');
  if (!metaContainer) return;
  
  metaContainer.innerHTML = `
    <div class="course-meta-item">
      <span class="course-meta-label">Category</span>
      <span class="course-meta-value">${course.category}</span>
    </div>
    <div class="course-meta-item">
      <span class="course-meta-label">Level</span>
      <span class="course-meta-value">${course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
    </div>
    <div class="course-meta-item">
      <span class="course-meta-label">Duration</span>
      <span class="course-meta-value">${formatDuration(course.duration)}</span>
    </div>
    <div class="course-meta-item">
      <span class="course-meta-label">Lessons</span>
      <span class="course-meta-value">${course.lessons}</span>
    </div>
  `;
}

/**
 * Update subscription status display
 */
function updateSubscriptionStatus() {
  const subscriptionStatus = document.getElementById('course-subscription-status');
  if (!subscriptionStatus) return;
  
  if (pageState.isSubscribed) {
    subscriptionStatus.innerHTML = `
      <div class="status-subscribed">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>You have access to this course</span>
      </div>
    `;
  } else {
    subscriptionStatus.innerHTML = `
      <div class="status-not-subscribed">
        <p>Subscribe to access this course</p>
        <a href="{% url 'subscription' %}" class="btn btn-primary">Subscribe Now</a>
      </div>
    `;
  }
}

/**
 * Load course roadmap
 * @param {Object} course - Course data
 */
function loadCourseRoadmap(course) {
  const roadmapContainer = document.getElementById('course-roadmap-container');
  if (!roadmapContainer) return;
  
  // Check if course has a roadmap
  if (!course.roadmap || course.roadmap.length === 0) {
    roadmapContainer.innerHTML = `
      <p class="empty-state">This course doesn't have a roadmap yet.</p>
    `;
    return;
  }
  
  // Clear container
  roadmapContainer.innerHTML = '';
  
  // Add roadmap items
  course.roadmap.forEach((milestone, index) => {
    const isActive = index === 0; // First milestone is active for demo
    const isCompleted = false; // None completed for demo
    
    const milestoneEl = document.createElement('div');
    milestoneEl.className = 'roadmap-item';
    
    milestoneEl.innerHTML = `
      <div class="roadmap-marker ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}"></div>
      <div class="roadmap-line"></div>
      <div class="roadmap-content">
        <h4>${milestone.title}</h4>
        <p>${milestone.description}</p>
      </div>
    `;
    
    roadmapContainer.appendChild(milestoneEl);
  });
}

/**
 * Load course content (video and text)
 * @param {Object} course - Course data
 */
function loadCourseContent(course) {
  // Only load content if course has sections and lessons
  if (!course.sections || course.sections.length === 0) {
    const lessonContent = document.getElementById('lesson-content');
    if (lessonContent) {
      lessonContent.innerHTML = `
        <p class="empty-state">This course doesn't have any content yet.</p>
      `;
    }
    return;
  }
  
  // Load video section
  const videoContainer = document.getElementById('video-container');
  const currentLessonTitle = document.getElementById('current-lesson-title');
  const prevLessonBtn = document.getElementById('prev-lesson');
  const nextLessonBtn = document.getElementById('next-lesson');
  const markCompleteBtn = document.getElementById('mark-complete');
  
  // Get current section and lesson
  const currentSection = course.sections[pageState.currentSectionIndex];
  const currentLesson = currentSection.lessons[pageState.currentLessonIndex];
  
  // Update lesson title
  if (currentLessonTitle) {
    currentLessonTitle.textContent = currentLesson.title;
  }
  
  // Update video content
  if (videoContainer) {
    if (pageState.isSubscribed) {
      // Show video player for subscribers
      videoContainer.innerHTML = `
        <div class="video-content">
          <!-- In a real app, this would be a video player -->
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: #000;">
            <p style="color: white; text-align: center;">
              Video player would be here<br>
              <small>${currentLesson.videoUrl}</small>
            </p>
          </div>
        </div>
      `;
    } else {
      // Show locked overlay for non-subscribers
      videoContainer.innerHTML = `
        <div class="video-placeholder">
          <div class="locked-overlay">
            <div class="lock-icon">🔒</div>
            <p>Subscribe to unlock this course</p>
            <a href="/subscription/" class="btn btn-primary">Subscribe Now</a>
          </div>
        </div>
      `;
    }
  }
  
  // Update lesson content
  const lessonContent = document.getElementById('lesson-content');
  if (lessonContent) {
    if (pageState.isSubscribed) {
      lessonContent.innerHTML = `
        <h2>${currentLesson.title}</h2>
        <p>${currentLesson.content}</p>
      `;
    } else {
      lessonContent.innerHTML = `
        <div class="locked-content">
          <h2>Course Content Locked</h2>
          <p>Subscribe to access the full course content including video lessons, exercises, and resources.</p>
        </div>
      `;
    }
  }
  
  // Update navigation buttons
  if (prevLessonBtn) {
    prevLessonBtn.disabled = pageState.currentLessonIndex === 0 && pageState.currentSectionIndex === 0;
    prevLessonBtn.addEventListener('click', navigateToPreviousLesson);
  }
  
  if (nextLessonBtn) {
    const isLastLesson = pageState.currentLessonIndex === currentSection.lessons.length - 1 && 
                          pageState.currentSectionIndex === course.sections.length - 1;
    nextLessonBtn.disabled = isLastLesson;
    nextLessonBtn.addEventListener('click', navigateToNextLesson);
  }
  
  if (markCompleteBtn) {
    markCompleteBtn.disabled = !pageState.isSubscribed;
    markCompleteBtn.addEventListener('click', markLessonAsComplete);
  }
  
  // Update discussion section
  updateDiscussionSection();
}

/**
 * Navigate to previous lesson
 */
function navigateToPreviousLesson() {
  if (!pageState.course || !pageState.isSubscribed) return;
  
  if (pageState.currentLessonIndex > 0) {
    // Go to previous lesson in current section
    pageState.currentLessonIndex--;
  } else if (pageState.currentSectionIndex > 0) {
    // Go to last lesson of previous section
    pageState.currentSectionIndex--;
    const previousSection = pageState.course.sections[pageState.currentSectionIndex];
    pageState.currentLessonIndex = previousSection.lessons.length - 1;
  }
  
  // Reload course content
  loadCourseContent(pageState.course);
}

/**
 * Navigate to next lesson
 */
function navigateToNextLesson() {
  if (!pageState.course || !pageState.isSubscribed) return;
  
  const currentSection = pageState.course.sections[pageState.currentSectionIndex];
  
  if (pageState.currentLessonIndex < currentSection.lessons.length - 1) {
    // Go to next lesson in current section
    pageState.currentLessonIndex++;
  } else if (pageState.currentSectionIndex < pageState.course.sections.length - 1) {
    // Go to first lesson of next section
    pageState.currentSectionIndex++;
    pageState.currentLessonIndex = 0;
  }
  
  // Reload course content
  loadCourseContent(pageState.course);
}

/**
 * Mark current lesson as complete
 */
function markLessonAsComplete() {
  if (!pageState.isSubscribed) return;
  
  // In a real app, this would send a request to the server
  // For demo, just show a message
  
  const markCompleteBtn = document.getElementById('mark-complete');
  if (markCompleteBtn) {
    markCompleteBtn.textContent = 'Completed!';
    markCompleteBtn.classList.add('btn-success');
    markCompleteBtn.disabled = true;
    
    // Reset button after a delay
    setTimeout(() => {
      markCompleteBtn.textContent = 'Mark as Complete';
      markCompleteBtn.classList.remove('btn-success');
      markCompleteBtn.disabled = false;
    }, 2000);
  }
  
  // Update progress
  loadCourseProgress();
}

/**
 * Update the discussion section
 */
function updateDiscussionSection() {
  const commentInput = document.getElementById('comment-input');
  const postCommentBtn = document.getElementById('post-comment');
  const commentsContainer = document.getElementById('comments-container');
  
  if (!commentInput || !postCommentBtn || !commentsContainer) return;
  
  if (pageState.isSubscribed) {
    // Enable comment input and button
    commentInput.disabled = false;
    commentInput.placeholder = 'Add your thoughts about this lesson...';
    postCommentBtn.disabled = false;
    
    // Add event listener to post button
    postCommentBtn.addEventListener('click', () => {
      const commentText = commentInput.value.trim();
      
      if (commentText) {
        // Add comment to UI
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        
        commentEl.innerHTML = `
          <div class="comment-header">
            <div class="comment-author">
              <img src="${app.user?.avatar || 'https://via.placeholder.com/32'}" alt="${app.user?.name || 'User'}" class="comment-author-avatar">
              <span class="comment-author-name">${app.user?.name || 'You'}</span>
            </div>
            <span class="comment-date">Just now</span>
          </div>
          <div class="comment-content">
            <p>${commentText}</p>
          </div>
          <div class="comment-actions">
            <button class="comment-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 9V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H12C12.5304 21 13.0391 20.7893 13.4142 20.4142C13.7893 20.0391 14 19.5304 14 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 15L10 12L7 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Reply
            </button>
            <button class="comment-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 11L12 6L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Upvote
            </button>
          </div>
        `;
        
        // Add to comments container
        if (commentsContainer.querySelector('.empty-state')) {
          commentsContainer.innerHTML = '';
        }
        
        commentsContainer.prepend(commentEl);
        
        // Clear input
        commentInput.value = '';
      }
    });
    
    // Show sample comments for demonstration
    commentsContainer.innerHTML = `
      <div class="comment-item">
        <div class="comment-header">
          <div class="comment-author">
            <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=1" alt="David Wilson" class="comment-author-avatar">
            <span class="comment-author-name">David Wilson</span>
          </div>
          <span class="comment-date">2 days ago</span>
        </div>
        <div class="comment-content">
          <p>This explanation was really clear! I was struggling with this concept but now it makes perfect sense. Thanks!</p>
        </div>
        <div class="comment-actions">
          <button class="comment-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 9V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H12C12.5304 21 13.0391 20.7893 13.4142 20.4142C13.7893 20.0391 14 19.5304 14 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 15L10 12L7 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Reply
          </button>
          <button class="comment-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 11L12 6L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Upvote (5)
          </button>
        </div>
      </div>
      <div class="comment-item">
        <div class="comment-header">
          <div class="comment-author">
            <img src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=1" alt="Emily Chen" class="comment-author-avatar">
            <span class="comment-author-name">Emily Chen</span>
          </div>
          <span class="comment-date">5 days ago</span>
        </div>
        <div class="comment-content">
          <p>Could you please explain the part about event handling in more detail? I'm still confused about how to implement it in my project.</p>
        </div>
        <div class="comment-actions">
          <button class="comment-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 9V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H12C12.5304 21 13.0391 20.7893 13.4142 20.4142C13.7893 20.0391 14 19.5304 14 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 15L10 12L7 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Reply
          </button>
          <button class="comment-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 11L12 6L17 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Upvote (2)
          </button>
        </div>
      </div>
    `;
  } else {
    // Disabled state for non-subscribers
    commentInput.disabled = true;
    commentInput.placeholder = 'Subscribe to join the discussion';
    postCommentBtn.disabled = true;
    
    commentsContainer.innerHTML = `
      <p class="empty-state">Subscribe to join the discussion</p>
    `;
  } 
}

/**
 * Check if the user is subscribed 
 */
function checkSubscriptionStatus() {
  fetch(`/api/user/is-subscribed/${pageState.courseId}`)
    .then(response => response.json())
    .then(data => {
      pageState.isSubscribed = data.is_subscribed;
      updateSubscriptionStatus();
      loadCourseProgress(); // Only after subscription status is known
    });
}


/**
 * Load related courses
 */
function loadRelatedCourses() {
  const relatedCoursesContainer = document.getElementById('related-courses-container');
  if (!relatedCoursesContainer) return;
  
  // Clear skeleton loading placeholders
  relatedCoursesContainer.innerHTML = '';
  
  // Get all courses
  const allCourses = loadDummyCourses();
  
  // Filter out current course and get courses in the same category
  let relatedCourses = allCourses.filter(course => 
    course.id !== pageState.courseId && 
    course.category === pageState.course.category
  );
  
  // If not enough courses in the same category, add some from other categories
  if (relatedCourses.length < 3) {
    const otherCourses = allCourses.filter(course => 
      course.id !== pageState.courseId && 
      course.category !== pageState.course.category
    );
    
    relatedCourses = [...relatedCourses, ...otherCourses].slice(0, 3);
  } else {
    // Limit to 3 courses
    relatedCourses = relatedCourses.slice(0, 3);
  }
  
  // Add courses to the container
  relatedCourses.forEach(course => {
    const courseCard = createCourseCard(course);
    relatedCoursesContainer.appendChild(courseCard);
  });
}