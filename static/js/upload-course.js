/**
 * JavaScript for the Upload Course page
 */

// State to track form progress
const formState = {
  currentSection: 'course-details',
  sectionCount: 1,
  lessonCount: { 1: 1 },
  milestoneCount: 1,
  formProgress: 0,
  isDraft: false,
  courseData: {
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnail: null,
    tags: [],
    prerequisites: '',
    sections: [],
    roadmap: []
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  if (!app.isAuthenticated) {
    // window.location.href = '/login/';
    return;
  }
  
  initFormNavigation();
  initSectionHandlers();
  initLessonHandlers();
  initMilestoneHandlers();
  initFileUploads();
  setupFormSaving();
  updateProgress();
});

/**
 * Initialize form navigation
 */
function initFormNavigation() {
  // Section navigation via sidebar
  const navLinks = document.querySelectorAll('.form-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get target section
      const targetSection = link.getAttribute('data-section');
      
      // Switch to that section
      switchSection(targetSection);
    });
  });
  
  // Next/Prev buttons
  const nextButtons = document.querySelectorAll('.next-section');
  const prevButtons = document.querySelectorAll('.prev-section');
  
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-target');
      switchSection(targetSection);
    });
  });
  
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSection = button.getAttribute('data-target');
      switchSection(targetSection);
    });
  });
}

/**
 * Switch between form sections
 * @param {string} sectionId - ID of the section to switch to
 */
function switchSection(sectionId) {
  // Save current section data
  saveCurrentSectionData();
  
  // Hide all sections
  const sections = document.querySelectorAll('.form-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    formState.currentSection = sectionId;
  }
  
  // Update navigation
  const navLinks = document.querySelectorAll('.form-nav a');
  navLinks.forEach(link => {
    const linkSection = link.getAttribute('data-section');
    if (linkSection === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // If switching to preview section, generate preview
  if (sectionId === 'preview-submit') {
    generateCoursePreview();
  }
  
  // Update progress
  updateProgress();
}

/**
 * Save data from the current section
 */
function saveCurrentSectionData() {
  switch (formState.currentSection) {
    case 'course-details':
      formState.courseData.title = document.getElementById('course-title').value;
      formState.courseData.description = document.getElementById('course-description').value;
      formState.courseData.category = document.getElementById('course-category').value;
      formState.courseData.level = document.getElementById('course-level').value;
      formState.courseData.tags = document.getElementById('course-tags').value.split(',').map(tag => tag.trim());
      formState.courseData.prerequisites = document.getElementById('course-prerequisites').value;
      break;
      
    case 'course-content':
      saveSectionsData();
      break;
      
    case 'course-roadmap':
      formState.courseData.roadmapIntro = document.getElementById('roadmap-intro').value;
      saveMilestonesData();
      break;
  }
}

/**
 * Save sections and lessons data
 */
function saveSectionsData() {
  const sections = [];
  
  // Get all section elements
  const sectionElements = document.querySelectorAll('.course-section');
  
  sectionElements.forEach(sectionEl => {
    const sectionId = sectionEl.getAttribute('data-section-id');
    const sectionTitle = sectionEl.querySelector('.section-title').value;
    
    const lessons = [];
    const lessonElements = sectionEl.querySelectorAll('.lesson-item');
    
    lessonElements.forEach(lessonEl => {
      const lessonId = lessonEl.getAttribute('data-lesson-id');
      const lessonTitle = lessonEl.querySelector('.lesson-title').value;
      const lessonContent = lessonEl.querySelector('.lesson-content').value;
      
      // In a real app, we would handle video uploads and get URLs
      const videoUrlInput = lessonEl.querySelector('.lesson-video');
      const videoFile = videoUrlInput.files[0];
      const videoUrl = videoFile ? URL.createObjectURL(videoFile) : '';
      
      lessons.push({
        id: lessonId,
        title: lessonTitle,
        content: lessonContent,
        videoUrl
      });
    });
    
    sections.push({
      id: sectionId,
      title: sectionTitle,
      lessons
    });
  });
  
  formState.courseData.sections = sections;
}

/**
 * Save milestones data
 */
function saveMilestonesData() {
  const milestones = [];
  
  // Get all milestone elements
  const milestoneElements = document.querySelectorAll('.milestone-item');
  
  milestoneElements.forEach(milestoneEl => {
    const milestoneId = milestoneEl.getAttribute('data-milestone-id');
    const milestoneTitle = milestoneEl.querySelector('.milestone-title').value;
    const milestoneDescription = milestoneEl.querySelector('.milestone-description').value;
    
    // Get associated sections
    const selectElement = milestoneEl.querySelector('.milestone-sections');
    const selectedSections = Array.from(selectElement.selectedOptions).map(option => option.value);
    
    milestones.push({
      id: milestoneId,
      title: milestoneTitle,
      description: milestoneDescription,
      sections: selectedSections
    });
  });
  
  formState.courseData.roadmap = milestones;
}

/**
 * Initialize section add/remove handlers
 */
function initSectionHandlers() {
  // Add new section
  const addSectionBtn = document.getElementById('add-section');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', addNewSection);
  }
  
  // Remove section event delegation
  const sectionsContainer = document.getElementById('sections-container');
  if (sectionsContainer) {
    sectionsContainer.addEventListener('click', (e) => {
      if (e.target.closest('.remove-section')) {
        const sectionEl = e.target.closest('.course-section');
        if (sectionEl) {
          removeSection(sectionEl);
        }
      }
    });
  }
}

/**
 * Add a new course section
 */
function addNewSection() {
  formState.sectionCount++;
  const sectionId = formState.sectionCount;
  
  // Initialize lesson count for this section
  formState.lessonCount[sectionId] = 1;
  
  const sectionsContainer = document.getElementById('sections-container');
  if (!sectionsContainer) return;
  
  const sectionEl = document.createElement('div');
  sectionEl.className = 'course-section';
  sectionEl.setAttribute('data-section-id', sectionId);
  
  sectionEl.innerHTML = `
    <div class="section-header">
      <h3>Section ${sectionId}</h3>
      <button type="button" class="btn-icon remove-section" title="Remove section">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="form-group">
      <label for="section-title-${sectionId}">Section Title *</label>
      <input type="text" id="section-title-${sectionId}" class="section-title" placeholder="e.g., Introduction to HTML" required>
    </div>
    
    <div class="lessons-container" data-section-id="${sectionId}">
      <h4>Lessons</h4>
      
      <div class="lesson-item" data-lesson-id="${sectionId}-1">
        <div class="lesson-header">
          <h5>Lesson 1</h5>
          <button type="button" class="btn-icon remove-lesson" title="Remove lesson">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="form-group">
          <label for="lesson-title-${sectionId}-1">Lesson Title *</label>
          <input type="text" id="lesson-title-${sectionId}-1" class="lesson-title" placeholder="e.g., HTML Document Structure" required>
        </div>
        
        <div class="form-group">
          <label for="lesson-video-${sectionId}-1">Video *</label>
          <div class="file-upload">
            <div class="file-preview video-preview" id="video-preview-${sectionId}-1">
              <div class="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <input type="file" id="lesson-video-${sectionId}-1" class="file-input lesson-video" accept="video/*">
            <label for="lesson-video-${sectionId}-1" class="file-label">Choose Video</label>
          </div>
          <p class="form-hint">MP4 format recommended, max 2GB</p>
        </div>
        
        <div class="form-group">
          <label for="lesson-content-${sectionId}-1">Lesson Content *</label>
          <textarea id="lesson-content-${sectionId}-1" class="lesson-content" placeholder="Add text, code examples, and other content for this lesson..." rows="6" required></textarea>
        </div>
      </div>
      
      <button type="button" class="btn btn-text add-lesson" data-section-id="${sectionId}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Add Lesson
      </button>
    </div>
  `;
  
  sectionsContainer.appendChild(sectionEl);
  
  // Update milestone section select options
  updateMilestoneSectionOptions();
  
  // Initialize file upload for new section
  initFileUploads();
  
  // Update progress
  updateProgress();
}

/**
 * Remove a section
 * @param {HTMLElement} sectionEl - Section element to remove
 */
function removeSection(sectionEl) {
  // Prevent removing the last section
  const sectionCount = document.querySelectorAll('.course-section').length;
  if (sectionCount <= 1) {
    alert('You must have at least one section.');
    return;
  }
  
  // Confirm before removing
  if (confirm('Are you sure you want to remove this section? This will delete all lessons in this section.')) {
    const sectionId = sectionEl.getAttribute('data-section-id');
    
    // Remove lesson count for this section
    delete formState.lessonCount[sectionId];
    
    // Remove the section
    sectionEl.remove();
    
    // Update milestone section select options
    updateMilestoneSectionOptions();
    
    // Update progress
    updateProgress();
  }
}

/**
 * Initialize lesson add/remove handlers
 */
function initLessonHandlers() {
  // Add lesson event delegation
  const sectionsContainer = document.getElementById('sections-container');
  if (sectionsContainer) {
    sectionsContainer.addEventListener('click', (e) => {
      if (e.target.closest('.add-lesson')) {
        const addLessonBtn = e.target.closest('.add-lesson');
        const sectionId = addLessonBtn.getAttribute('data-section-id');
        addNewLesson(sectionId);
      }
      
      if (e.target.closest('.remove-lesson')) {
        const lessonEl = e.target.closest('.lesson-item');
        if (lessonEl) {
          removeLesson(lessonEl);
        }
      }
    });
  }
}

/**
 * Add a new lesson to a section
 * @param {string} sectionId - ID of the section to add lesson to
 */
function addNewLesson(sectionId) {
  formState.lessonCount[sectionId]++;
  const lessonId = `${sectionId}-${formState.lessonCount[sectionId]}`;
  
  const lessonsContainer = document.querySelector(`.lessons-container[data-section-id="${sectionId}"]`);
  if (!lessonsContainer) return;
  
  const addLessonBtn = lessonsContainer.querySelector('.add-lesson');
  
  const lessonEl = document.createElement('div');
  lessonEl.className = 'lesson-item';
  lessonEl.setAttribute('data-lesson-id', lessonId);
  
  lessonEl.innerHTML = `
    <div class="lesson-header">
      <h5>Lesson ${formState.lessonCount[sectionId]}</h5>
      <button type="button" class="btn-icon remove-lesson" title="Remove lesson">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="form-group">
      <label for="lesson-title-${lessonId}">Lesson Title *</label>
      <input type="text" id="lesson-title-${lessonId}" class="lesson-title" placeholder="e.g., HTML Document Structure" required>
    </div>
    
    <div class="form-group">
      <label for="lesson-video-${lessonId}">Video *</label>
      <div class="file-upload">
        <div class="file-preview video-preview" id="video-preview-${lessonId}">
          <div class="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <input type="file" id="lesson-video-${lessonId}" class="file-input lesson-video" accept="video/*">
        <label for="lesson-video-${lessonId}" class="file-label">Choose Video</label>
      </div>
      <p class="form-hint">MP4 format recommended, max 2GB</p>
    </div>
    
    <div class="form-group">
      <label for="lesson-content-${lessonId}">Lesson Content *</label>
      <textarea id="lesson-content-${lessonId}" class="lesson-content" placeholder="Add text, code examples, and other content for this lesson..." rows="6" required></textarea>
    </div>
  `;
  
  // Insert before add button
  lessonsContainer.insertBefore(lessonEl, addLessonBtn);
  
  // Initialize file upload for new lesson
  initFileUploads();
  
  // Update progress
  updateProgress();
}

/**
 * Remove a lesson
 * @param {HTMLElement} lessonEl - Lesson element to remove
 */
function removeLesson(lessonEl) {
  const sectionEl = lessonEl.closest('.lessons-container');
  const lessonCount = sectionEl.querySelectorAll('.lesson-item').length;
  
  // Prevent removing the last lesson
  if (lessonCount <= 1) {
    alert('Each section must have at least one lesson.');
    return;
  }
  
  // Confirm before removing
  if (confirm('Are you sure you want to remove this lesson?')) {
    lessonEl.remove();
    
    // Update lesson numbers
    const sectionId = sectionEl.getAttribute('data-section-id');
    const lessonItems = sectionEl.querySelectorAll('.lesson-item');
    
    lessonItems.forEach((item, index) => {
      item.setAttribute('data-lesson-id', `${sectionId}-${index + 1}`);
      item.querySelector('h5').textContent = `Lesson ${index + 1}`;
    });
    
    // Update lesson count
    formState.lessonCount[sectionId] = lessonItems.length;
    
    // Update progress
    updateProgress();
  }
}

/**
 * Initialize milestone add/remove handlers
 */
function initMilestoneHandlers() {
  // Add new milestone
  const addMilestoneBtn = document.getElementById('add-milestone');
  if (addMilestoneBtn) {
    addMilestoneBtn.addEventListener('click', addNewMilestone);
  }
  
  // Remove milestone event delegation
  const milestonesContainer = document.getElementById('milestones-container');
  if (milestonesContainer) {
    milestonesContainer.addEventListener('click', (e) => {
      if (e.target.closest('.remove-milestone')) {
        const milestoneEl = e.target.closest('.milestone-item');
        if (milestoneEl) {
          removeMilestone(milestoneEl);
        }
      }
    });
  }
  
  // Initial update of milestone section options
  updateMilestoneSectionOptions();
}

/**
 * Add a new milestone
 */
function addNewMilestone() {
  formState.milestoneCount++;
  const milestoneId = formState.milestoneCount;
  
  const milestonesContainer = document.getElementById('milestones-container');
  if (!milestonesContainer) return;
  
  const milestoneEl = document.createElement('div');
  milestoneEl.className = 'milestone-item';
  milestoneEl.setAttribute('data-milestone-id', milestoneId);
  
  milestoneEl.innerHTML = `
    <div class="milestone-header">
      <span class="milestone-number">${milestoneId}</span>
      <button type="button" class="btn-icon remove-milestone" title="Remove milestone">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div class="form-group">
      <label for="milestone-title-${milestoneId}">Milestone Title *</label>
      <input type="text" id="milestone-title-${milestoneId}" class="milestone-title" placeholder="e.g., Building Your First Webpage" required>
    </div>
    
    <div class="form-group">
      <label for="milestone-description-${milestoneId}">Description</label>
      <textarea id="milestone-description-${milestoneId}" class="milestone-description" placeholder="What will students achieve at this milestone?" rows="3"></textarea>
    </div>
    
    <div class="form-group">
      <label for="milestone-sections-${milestoneId}">Associated Sections</label>
      <select id="milestone-sections-${milestoneId}" class="milestone-sections" multiple>
        ${getSectionOptionsHTML()}
      </select>
      <p class="form-hint">Select the sections that contribute to reaching this milestone</p>
    </div>
  `;
  
  milestonesContainer.appendChild(milestoneEl);
  
  // Update roadmap visualization
  updateRoadmapVisualization();
  
  // Update progress
  updateProgress();
}

/**
 * Remove a milestone
 * @param {HTMLElement} milestoneEl - Milestone element to remove
 */
function removeMilestone(milestoneEl) {
  // Prevent removing the last milestone
  const milestoneCount = document.querySelectorAll('.milestone-item').length;
  if (milestoneCount <= 1) {
    alert('You must have at least one milestone.');
    return;
  }
  
  // Confirm before removing
  if (confirm('Are you sure you want to remove this milestone?')) {
    milestoneEl.remove();
    
    // Update milestone numbers
    const milestoneItems = document.querySelectorAll('.milestone-item');
    
    milestoneItems.forEach((item, index) => {
      const milestoneId = index + 1;
      item.setAttribute('data-milestone-id', milestoneId);
      item.querySelector('.milestone-number').textContent = milestoneId;
    });
    
    // Update milestone count
    formState.milestoneCount = milestoneItems.length;
    
    // Update roadmap visualization
    updateRoadmapVisualization();
    
    // Update progress
    updateProgress();
  }
}

/**
 * Update milestone section select options based on available sections
 */
function updateMilestoneSectionOptions() {
  const milestoneSelects = document.querySelectorAll('.milestone-sections');
  if (!milestoneSelects.length) return;
  
  const optionsHTML = getSectionOptionsHTML();
  
  milestoneSelects.forEach(select => {
    // Save current selections
    const selectedValues = Array.from(select.selectedOptions).map(option => option.value);
    
    // Update options
    select.innerHTML = optionsHTML;
    
    // Re-apply selections
    Array.from(select.options).forEach(option => {
      if (selectedValues.includes(option.value)) {
        option.selected = true;
      }
    });
  });
}

/**
 * Get HTML for section select options
 * @returns {string} HTML for options
 */
function getSectionOptionsHTML() {
  const sectionElements = document.querySelectorAll('.course-section');
  let optionsHTML = '';
  
  sectionElements.forEach(sectionEl => {
    const sectionId = sectionEl.getAttribute('data-section-id');
    const sectionTitle = sectionEl.querySelector('.section-title').value || `Section ${sectionId}`;
    
    optionsHTML += `<option value="section-${sectionId}">${sectionTitle}</option>`;
  });
  
  return optionsHTML;
}

/**
 * Update roadmap visualization
 */
function updateRoadmapVisualization() {
  const roadmapViz = document.getElementById('roadmap-viz');
  if (!roadmapViz) return;
  
  // Save milestone data
  saveMilestonesData();
  
  // Check if we have milestones
  if (formState.courseData.roadmap.length === 0) {
    roadmapViz.innerHTML = `
      <div class="roadmap-placeholder">
        <p>Your roadmap will appear here as you add milestones.</p>
      </div>
    `;
    return;
  }
  
  // Create roadmap visualization
  let vizHTML = `<div class="roadmap-timeline">`;
  
  formState.courseData.roadmap.forEach((milestone, index) => {
    vizHTML += `
      <div class="roadmap-step">
        <div class="roadmap-step-number">${index + 1}</div>
        <div class="roadmap-step-content">
          <h4>${milestone.title || `Milestone ${index + 1}`}</h4>
          <p>${milestone.description || 'No description provided.'}</p>
        </div>
      </div>
    `;
    
    // Add connector line except for the last item
    if (index < formState.courseData.roadmap.length - 1) {
      vizHTML += `<div class="roadmap-connector"></div>`;
    }
  });
  
  vizHTML += `</div>`;
  
  roadmapViz.innerHTML = vizHTML;
  
  // Add styles for roadmap visualization
  const style = document.createElement('style');
  style.textContent = `
    .roadmap-timeline {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .roadmap-step {
      display: flex;
      align-items: flex-start;
      margin-bottom: var(--space-4);
    }
    
    .roadmap-step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background-color: var(--color-primary);
      color: white;
      border-radius: 50%;
      font-weight: var(--font-weight-bold);
      flex-shrink: 0;
      margin-right: var(--space-4);
    }
    
    .roadmap-step-content {
      background-color: var(--color-gray-100);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      flex-grow: 1;
    }
    
    .roadmap-step-content h4 {
      margin-bottom: var(--space-2);
      color: var(--color-gray-900);
    }
    
    .roadmap-step-content p {
      color: var(--color-gray-600);
      margin-bottom: 0;
    }
    
    .roadmap-connector {
      width: 2px;
      height: 24px;
      background-color: var(--color-primary-light);
      margin-left: 16px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize file upload previews
 */
function initFileUploads() {
  // Course thumbnail
  const courseThumbnail = document.getElementById('course-thumbnail');
  
  if (courseThumbnail) {
    courseThumbnail.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('thumbnail-preview');
        if (preview) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Course thumbnail">`;
        }
        
        // Store in form state
        formState.courseData.thumbnail = e.target.result;
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  // Lesson videos
  const lessonVideos = document.querySelectorAll('.lesson-video');
  
  lessonVideos.forEach(videoInput => {
    videoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const lessonId = videoInput.id.replace('lesson-video-', '');
      const preview = document.getElementById(`video-preview-${lessonId}`);
      
      if (preview) {
        preview.innerHTML = `
          <div class="video-preview-info">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 7L12 12L6 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 12V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="video-file-info">
              <p class="video-file-name">${file.name}</p>
              <p class="video-file-size">${formatFileSize(file.size)}</p>
            </div>
          </div>
        `;
        
        // Add styles for video preview info
        const style = document.createElement('style');
        style.textContent = `
          .video-preview-info {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            color: var(--color-gray-700);
          }
          
          .video-file-info {
            text-align: left;
          }
          
          .video-file-name {
            margin: 0;
            font-weight: var(--font-weight-medium);
            font-size: var(--font-size-sm);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
          }
          
          .video-file-size {
            margin: 0;
            font-size: var(--font-size-xs);
            color: var(--color-gray-500);
          }
        `;
        document.head.appendChild(style);
      }
    });
  });
}

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate course preview
 */
function generateCoursePreview() {
  // Save all form data first
  saveCurrentSectionData();
  
  const previewContainer = document.getElementById('course-preview');
  if (!previewContainer) return;
  
  // Check if we have basic course info
  if (!formState.courseData.title) {
    previewContainer.innerHTML = `
      <div class="preview-message">
        <p>Please fill in at least the course title to generate a preview.</p>
      </div>
    `;
    return;
  }
  
  // Generate preview HTML
  let previewHTML = `
    <div class="preview-course">
      <div class="preview-header">
        <div class="preview-thumbnail">
          ${formState.courseData.thumbnail ? 
            `<img src="${formState.courseData.thumbnail}" alt="${formState.courseData.title}">` : 
            `<div class="preview-thumbnail-placeholder">No thumbnail</div>`
          }
        </div>
        <div class="preview-info">
          <h2>${formState.courseData.title}</h2>
          <div class="preview-meta">
            <span class="preview-category">${formState.courseData.category || 'No category'}</span>
            <span class="preview-level">${formState.courseData.level ? formState.courseData.level.charAt(0).toUpperCase() + formState.courseData.level.slice(1) : 'No level'}</span>
          </div>
          <p>${formState.courseData.description || 'No description provided.'}</p>
        </div>
      </div>
      
      <div class="preview-sections">
        <h3>Course Content</h3>
  `;
  
  if (formState.courseData.sections && formState.courseData.sections.length > 0) {
    formState.courseData.sections.forEach(section => {
      previewHTML += `
        <div class="preview-section">
          <h4>${section.title}</h4>
          <div class="preview-lessons">
      `;
      
      if (section.lessons && section.lessons.length > 0) {
        section.lessons.forEach(lesson => {
          previewHTML += `
            <div class="preview-lesson">
              <div class="preview-lesson-title">
                <span class="preview-lesson-icon">📽️</span>
                <span>${lesson.title}</span>
              </div>
              <span class="preview-lesson-duration">15:00</span>
            </div>
          `;
        });
      } else {
        previewHTML += `<p class="preview-empty">No lessons added to this section.</p>`;
      }
      
      previewHTML += `
          </div>
        </div>
      `;
    });
  } else {
    previewHTML += `<p class="preview-empty">No sections added to the course yet.</p>`;
  }
  
  previewHTML += `
      </div>
      
      <div class="preview-roadmap">
        <h3>Course Roadmap</h3>
  `;
  
  if (formState.courseData.roadmap && formState.courseData.roadmap.length > 0) {
    previewHTML += `<div class="preview-roadmap-intro">${formState.courseData.roadmapIntro || ''}</div>`;
    previewHTML += `<div class="preview-milestones">`;
    
    formState.courseData.roadmap.forEach((milestone, index) => {
      previewHTML += `
        <div class="preview-milestone">
          <div class="preview-milestone-header">
            <span class="preview-milestone-number">${index + 1}</span>
            <h4>${milestone.title}</h4>
          </div>
          <p>${milestone.description || 'No description provided.'}</p>
        </div>
      `;
    });
    
    previewHTML += `</div>`;
  } else {
    previewHTML += `<p class="preview-empty">No milestones added to the roadmap yet.</p>`;
  }
  
  previewHTML += `
      </div>
    </div>
  `;
  
  previewContainer.innerHTML = previewHTML;
  
  // Add styles for preview
  const style = document.createElement('style');
  style.textContent = `
    .preview-course {
      font-family: var(--font-family-base);
    }
    
    .preview-header {
      display: flex;
      gap: var(--space-6);
      margin-bottom: var(--space-8);
    }
    
    .preview-thumbnail {
      width: 240px;
      height: 135px;
      background-color: var(--color-gray-200);
      border-radius: var(--radius-md);
      overflow: hidden;
      flex-shrink: 0;
    }
    
    .preview-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .preview-thumbnail-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-gray-500);
    }
    
    .preview-info {
      flex-grow: 1;
    }
    
    .preview-info h2 {
      margin-bottom: var(--space-2);
    }
    
    .preview-meta {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }
    
    .preview-category,
    .preview-level {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      background-color: var(--color-gray-200);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
    }
    
    .preview-sections,
    .preview-roadmap {
      margin-bottom: var(--space-8);
    }
    
    .preview-sections h3,
    .preview-roadmap h3 {
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-gray-200);
    }
    
    .preview-section {
      margin-bottom: var(--space-4);
    }
    
    .preview-section h4 {
      margin-bottom: var(--space-3);
    }
    
    .preview-lessons {
      padding-left: var(--space-4);
    }
    
    .preview-lesson {
      display: flex;
      justify-content: space-between;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-2);
    }
    
    .preview-lesson:hover {
      background-color: var(--color-gray-100);
    }
    
    .preview-lesson-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .preview-lesson-duration {
      color: var(--color-gray-500);
      font-size: var(--font-size-sm);
    }
    
    .preview-milestones {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    
    .preview-milestone {
      padding: var(--space-4);
      background-color: var(--color-gray-100);
      border-radius: var(--radius-md);
    }
    
    .preview-milestone-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-2);
    }
    
    .preview-milestone-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background-color: var(--color-primary);
      color: white;
      border-radius: 50%;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }
    
    .preview-milestone-header h4 {
      margin-bottom: 0;
    }
    
    .preview-empty {
      color: var(--color-gray-500);
      font-style: italic;
      padding: var(--space-4);
      text-align: center;
    }
    
    .preview-message {
      padding: var(--space-8);
      text-align: center;
      color: var(--color-gray-600);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Setup form saving (draft and submit)
 */
function setupFormSaving() {
  // Save draft
  const saveDraftBtn = document.getElementById('save-draft');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', () => {
      // Save all form data
      saveCurrentSectionData();
      
      // Store in local storage
      formState.isDraft = true;
      localStorage.setItem(`${app.storagePrefix}course_draft`, JSON.stringify(formState.courseData));
      
      // Show confirmation
      alert('Course draft saved successfully.');
    });
  }
  
  // Submit form
  const uploadForm = document.getElementById('upload-course-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Save all form data
      saveCurrentSectionData();
      
      // Validate form
      if (!validateCourseForm()) {
        return;
      }
      
      // In a real app, this would send data to the server
      // For demo, show success message
      
      uploadForm.innerHTML = `
        <div class="upload-success">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2>Course Submitted Successfully!</h2>
          <p>Your course has been submitted for review. Once approved, it will be published on the platform.</p>
          <div class="success-actions">
            <a href="{% url 'dashboard' %}" class="btn btn-primary">Go to Dashboard</a>
            <a href="{% url 'upload_course' %}" class="btn btn-secondary">Create Another Course</a>
          </div>
        </div>
      `;
      
      // Clear draft from local storage
      localStorage.removeItem(`${app.storagePrefix}course_draft`);
      
      // Add styles for success message
      const style = document.createElement('style');
      style.textContent = `
        .upload-success {
          text-align: center;
          padding: var(--space-12);
        }
        
        .upload-success svg {
          color: var(--color-success);
          margin-bottom: var(--space-6);
        }
        
        .upload-success h2 {
          margin-bottom: var(--space-4);
          color: var(--color-success);
        }
        
        .upload-success p {
          margin-bottom: var(--space-8);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .success-actions {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
        }
      `;
      document.head.appendChild(style);
    });
  }
}

/**
 * Validate the course form
 * @returns {boolean} Is valid
 */
function validateCourseForm() {
  // Clear existing errors
  clearFormErrors(document.getElementById('upload-course-form'));
  
  let isValid = true;
  
  // Validate course details
  if (!formState.courseData.title) {
    isValid = false;
    switchSection('course-details');
    showFormError(document.getElementById('course-title'), 'Course title is required');
  }
  
  if (!formState.courseData.description) {
    isValid = false;
    switchSection('course-details');
    showFormError(document.getElementById('course-description'), 'Course description is required');
  }
  
  if (!formState.courseData.category) {
    isValid = false;
    switchSection('course-details');
    showFormError(document.getElementById('course-category'), 'Please select a category');
  }
  
  if (!formState.courseData.level) {
    isValid = false;
    switchSection('course-details');
    showFormError(document.getElementById('course-level'), 'Please select a level');
  }
  
  // Validate sections and lessons
  if (formState.courseData.sections.length === 0) {
    isValid = false;
    switchSection('course-content');
    // No specific input to show error on, so alert
    alert('You must add at least one section to your course');
  } else {
    // Check each section has title and lessons
    let hasInvalidSection = false;
    
    formState.courseData.sections.forEach((section, sectionIndex) => {
      if (!section.title) {
        isValid = false;
        hasInvalidSection = true;
        
        if (!hasInvalidSection) {
          switchSection('course-content');
          hasInvalidSection = true;
        }
        
        const sectionTitleInput = document.querySelector(`#section-title-${sectionIndex + 1}`);
        if (sectionTitleInput) {
          showFormError(sectionTitleInput, 'Section title is required');
        }
      }
      
      if (section.lessons.length === 0) {
        isValid = false;
        
        if (!hasInvalidSection) {
          switchSection('course-content');
          hasInvalidSection = true;
        }
        
        // No specific input to show error on, so alert
        alert(`Section "${section.title || `Section ${sectionIndex + 1}`}" must have at least one lesson`);
      } else {
        // Check each lesson has title and content
        section.lessons.forEach((lesson, lessonIndex) => {
          if (!lesson.title) {
            isValid = false;
            
            if (!hasInvalidSection) {
              switchSection('course-content');
              hasInvalidSection = true;
            }
            
            const lessonTitleInput = document.querySelector(`#lesson-title-${sectionIndex + 1}-${lessonIndex + 1}`);
            if (lessonTitleInput) {
              showFormError(lessonTitleInput, 'Lesson title is required');
            }
          }
          
          if (!lesson.content) {
            isValid = false;
            
            if (!hasInvalidSection) {
              switchSection('course-content');
              hasInvalidSection = true;
            }
            
            const lessonContentInput = document.querySelector(`#lesson-content-${sectionIndex + 1}-${lessonIndex + 1}`);
            if (lessonContentInput) {
              showFormError(lessonContentInput, 'Lesson content is required');
            }
          }
        });
      }
    });
  }
  
  // Validate roadmap
  if (formState.courseData.roadmap.length === 0) {
    isValid = false;
    switchSection('course-roadmap');
    // No specific input to show error on, so alert
    alert('You must add at least one milestone to your course roadmap');
  } else {
    // Check each milestone has title
    let hasInvalidMilestone = false;
    
    formState.courseData.roadmap.forEach((milestone, milestoneIndex) => {
      if (!milestone.title) {
        isValid = false;
        
        if (!hasInvalidMilestone) {
          switchSection('course-roadmap');
          hasInvalidMilestone = true;
        }
        
        const milestoneTitleInput = document.querySelector(`#milestone-title-${milestoneIndex + 1}`);
        if (milestoneTitleInput) {
          showFormError(milestoneTitleInput, 'Milestone title is required');
        }
      }
    });
  }
  
  // Check terms agreement
  const termsAgreement = document.getElementById('terms-agreement');
  if (termsAgreement && !termsAgreement.checked) {
    isValid = false;
    switchSection('preview-submit');
    showFormError(termsAgreement, 'You must agree to the terms');
  }
  
  return isValid;
}

/**
 * Update form progress
 */
function updateProgress() {
  // Calculate progress based on form completeness
  let progress = 0;
  let totalSteps = 4; // Total sections in the form
  
  // Course details progress
  if (formState.courseData.title) progress += 0.15;
  if (formState.courseData.description) progress += 0.1;
  if (formState.courseData.category) progress += 0.05;
  if (formState.courseData.level) progress += 0.05;
  if (formState.courseData.thumbnail) progress += 0.05;
  
  // Course content progress (sections and lessons)
  if (formState.courseData.sections.length > 0) {
    progress += 0.2 * Math.min(formState.courseData.sections.length / 3, 1);
  }
  
  // Roadmap progress
  if (formState.courseData.roadmap.length > 0) {
    progress += 0.2 * Math.min(formState.courseData.roadmap.length / 3, 1);
  }
  
  // Terms agreement
  const termsAgreement = document.getElementById('terms-agreement');
  if (termsAgreement && termsAgreement.checked) {
    progress += 0.1;
  }
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  const progressPercentage = document.getElementById('progress-percentage');
  
  if (progressBar && progressPercentage) {
    const percentage = Math.round(progress * 100);
    progressBar.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
  }
}