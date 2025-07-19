/**
 * JavaScript for the profile page
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  if (!app.isAuthenticated) {
    // window.location.href = '/login/?redirect=/profile/';
    return;
  }
  
  initProfile();
  initProfileNav();
  initProfileForms();
});

/**
 * Initialize profile page
 */
function initProfile() {
  // Load user data
  if (app.user) {
    // Update avatar
    const avatarImage = document.getElementById('avatar-image');
    if (avatarImage && app.user.avatar) {
      avatarImage.src = app.user.avatar;
    }
    
    // Update form fields
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    if (nameInput) nameInput.value = app.user.name;
    if (emailInput) emailInput.value = app.user.email;
  }
  
  // Initialize avatar upload
  initAvatarUpload();
}

/**
 * Initialize profile navigation
 */
function initProfileNav() {
  const navLinks = document.querySelectorAll('.profile-nav a');
  const sections = document.querySelectorAll('.profile-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and sections
      navLinks.forEach(link => link.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      // Show corresponding section
      const sectionId = link.getAttribute('href').substring(1);
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add('active');
      }
    });
  });
}

/**
 * Initialize profile forms
 */
function initProfileForms() {
  // Profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
  
  // Notifications form
  const notificationsForm = document.getElementById('notifications-form');
  if (notificationsForm) {
    notificationsForm.addEventListener('submit', handleNotificationsUpdate);
  }
  
  // Password form
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordUpdate);
  }
  
  // Initialize 2FA setup
  const setup2faBtn = document.getElementById('setup-2fa');
  if (setup2faBtn) {
    setup2faBtn.addEventListener('click', handle2FASetup);
  }
  
  // Initialize session management
  initSessionManagement();
}

/**
 * Initialize avatar upload
 */
function initAvatarUpload() {
  const changeAvatarBtn = document.getElementById('change-avatar');
  const avatarUpload = document.getElementById('avatar-upload');
  const avatarImage = document.getElementById('avatar-image');
  
  if (changeAvatarBtn && avatarUpload && avatarImage) {
    changeAvatarBtn.addEventListener('click', () => {
      avatarUpload.click();
    });
    
    avatarUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarImage.src = e.target.result;
        
        // In a real app, this would upload the file to a server
        // For demo, just update the user data in local storage
        const userData = { ...app.user, avatar: e.target.result };
        localStorage.setItem(`${app.storagePrefix}user`, JSON.stringify(userData));
        app.user = userData;
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Handle profile form submission
 * @param {Event} e - Submit event
 */
async function handleProfileUpdate(e) {
  e.preventDefault();
  
  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const location = document.getElementById('location').value;
  const timezone = document.getElementById('timezone').value;
  const bio = document.getElementById('bio').value;
  
  try {
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="spinner"></span>
      Saving...
    `;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update user data
    const userData = {
      ...app.user,
      name,
      email,
      location,
      timezone,
      bio
    };
    
    localStorage.setItem(`${app.storagePrefix}user`, JSON.stringify(userData));
    app.user = userData;
    
    // Show success message
    alert('Profile updated successfully');
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
  } catch (error) {
    console.error('Profile update error:', error);
    alert('An error occurred while updating your profile');
  }
}

/**
 * Handle notifications form submission
 * @param {Event} e - Submit event
 */
async function handleNotificationsUpdate(e) {
  e.preventDefault();
  
  try {
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="spinner"></span>
      Saving...
    `;
    
    // Get form data
    const formData = new FormData(e.target);
    const preferences = {
      courseUpdates: formData.has('course-updates'),
      newCourses: formData.has('new-courses'),
      comments: formData.has('comments'),
      newsletter: formData.has('newsletter')
    
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save preferences to local storage
    localStorage.setItem(
      `${app.storagePrefix}notification_preferences`,
      JSON.stringify(preferences)
    );
    
    // Show success message
    alert('Notification preferences updated successfully');
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
  } catch (error) {
    console.error('Notifications update error:', error);
    alert('An error occurred while updating your notification preferences');
  }
}

/**
 * Handle password form submission
 * @param {Event} e - Submit event
 */
async function handlePasswordUpdate(e) {
  e.preventDefault();
  
  // Clear previous errors
  clearFormErrors(e.target);
  
  // Get form data
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-new-password').value;
  
  // Validate form
  let isValid = true;
  
  if (!currentPassword) {
    showFormError(
      document.getElementById('current-password'),
      'Current password is required'
    );
    isValid = false;
  }
  
  if (!newPassword) {
    showFormError(
      document.getElementById('new-password'),
      'New password is required'
    );
    isValid = false;
  } else if (newPassword.length < 8) {
    showFormError(
      document.getElementById('new-password'),
      'Password must be at least 8 characters'
    );
    isValid = false;
  }
  
  if (!confirmPassword) {
    showFormError(
      document.getElementById('confirm-new-password'),
      'Please confirm your new password'
    );
    isValid = false;
  } else if (newPassword !== confirmPassword) {
    showFormError(
      document.getElementById('confirm-new-password'),
      'Passwords do not match'
    );
    isValid = false;
  }
  
  if (!isValid) return;
  
  try {
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="spinner"></span>
      Updating...
    `;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    alert('Password updated successfully');
    
    // Clear form
    e.target.reset();
    
    // Reset button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
  } catch (error) {
    console.error('Password update error:', error);
    alert('An error occurred while updating your password');
  }
}

/**
 * Handle 2FA setup
 */
function handle2FASetup() {
  // In a real app, this would start the 2FA setup process
  alert('2FA setup would be implemented here');
}

/**
 * Initialize session management
 */
function initSessionManagement() {
  const sessionsList = document.querySelector('.sessions-list');
  if (!sessionsList) return;
  
  // Add event listeners to end session buttons
  const endSessionButtons = sessionsList.querySelectorAll('.btn-text');
  endSessionButtons.forEach(button => {
    button.addEventListener('click', async () => {
      try {
        // Show loading state
        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = `
          <span class="spinner"></span>
          Ending...
        `;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove session item
        const sessionItem = button.closest('.session-item');
        if (sessionItem) {
          sessionItem.remove();
        }
        
      } catch (error) {
        console.error('End session error:', error);
        alert('An error occurred while ending the session');
        
        // Reset button
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
}