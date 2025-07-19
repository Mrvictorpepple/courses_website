/**
 * JavaScript for the Home page
 */

document.addEventListener('DOMContentLoaded', () => {
  loadPopularCourses();
  loadTestimonials();
  addAnimations();
});
 
/** 
 * Load popular courses for the home page
 */
/**
 * Load popular courses for the home page
 */
function loadPopularCourses() {
  const coursesContainer = document.getElementById('popular-courses-container');
  if (!coursesContainer) return;

  coursesContainer.innerHTML = '';

  fetch('/api/courses/popular/')
    .then(res => res.json())
    .then(courses => {
      const popularCourses = courses.slice(0, 3);

      if (popularCourses.length === 0) {
        coursesContainer.innerHTML = '<p>No popular courses available at the moment.</p>';
        return;
      }

      popularCourses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesContainer.appendChild(courseCard);
      });
    })
    .catch(err => {
      console.error('Error loading popular courses:', err);
      coursesContainer.innerHTML = '<p>Failed to load courses. Please try again later.</p>';
    });
}

/**
 * Load testimonials for the home page
 */
function loadTestimonials() {
  const testimonialsSlider = document.getElementById('testimonials-slider');
  if (!testimonialsSlider) return;
  
  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      content: "EduStream has completely transformed my learning experience. The one-time payment model provides incredible value, and the course quality is exceptional.",
      author: "Jennifer Lee",
      title: "Marketing Professional",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1"
    },
    {
      id: 2,
      content: "As someone who's tried multiple learning platforms, EduStream stands out for its clear course roadmaps and high-quality video content. I've learned more in a month than I did in a year elsewhere.",
      author: "Marcus Johnson",
      title: "Web Developer",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1"
    },
    {
      id: 3,
      content: "The structured learning paths helped me transition into a new career. I appreciate how each course builds upon the previous one, creating a comprehensive learning journey.",
      author: "Sophia Zhang",
      title: "Data Analyst",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1"
    }
  ];
  
  // Create a simple testimonial slider
  let currentTestimonial = 0;
  
  // Helper function to show a testimonial
  function showTestimonial(index) {
    const testimonial = testimonials[index];
    
    testimonialsSlider.innerHTML = `
      <div class="testimonial-card fade-in">
        <div class="testimonial-content">
          <p>${testimonial.content}</p>
        </div>
        <div class="testimonial-author">
          <img src="${testimonial.avatar}" alt="${testimonial.author}" class="testimonial-avatar">
          <div>
            <h4>${testimonial.author}</h4>
            <p>${testimonial.title}</p>
          </div>
        </div>
      </div>
      <div class="testimonial-nav">
        ${testimonials.map((_, i) => 
          `<button class="testimonial-dot ${i === index ? 'active' : ''}" data-index="${i}"></button>`
        ).join('')}
      </div>
    `;
    
    // Add event listeners to dots
    const dots = testimonialsSlider.querySelectorAll('.testimonial-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index);
        currentTestimonial = index;
        showTestimonial(index);
      });
    });
  }
  
  // Show first testimonial
  showTestimonial(currentTestimonial);
  
  // Auto-rotate testimonials
  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
  }, 8000);
  
  // Add styles for testimonial navigation
  const style = document.createElement('style');
  style.textContent = `
    .testimonial-nav {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
      gap: 0.5rem;
    }
    
    .testimonial-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--color-gray-300);
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .testimonial-dot.active {
      background-color: var(--color-primary);
      transform: scale(1.2);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Add animations to the home page
 */
function addAnimations() {
  // Animate hero section elements
  const heroElements = [
    '.hero-title',
    '.hero-subtitle',
    '.hero-content .btn',
    '.hero-image'
  ];
  
  heroElements.forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add(`fade-in-delay-${index}`);
    }
  });
  
  // Animate features on scroll
  const featureCards = document.querySelectorAll('.feature-card');
  const courseCards = document.querySelectorAll('.course-card');
  
  // Simple scroll animation function
  function animateOnScroll(elements, className = 'fade-in') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });
    
    elements.forEach(element => {
      element.style.opacity = '0';
      observer.observe(element);
    });
  }
  
  // Apply animations if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    animateOnScroll(featureCards);
    animateOnScroll(courseCards);
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    featureCards.forEach(card => card.classList.add('fade-in'));
    courseCards.forEach(card => card.classList.add('fade-in'));
  }
}