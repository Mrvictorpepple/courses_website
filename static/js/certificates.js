/**
 * JavaScript for the certificates page
 */

document.addEventListener('DOMContentLoaded', () => {
    
    loadCertificates();
  });
  
  /**
   * Load user's certificates
   */
  function loadCertificates() {
    const certificatesContainer = document.getElementById('certificates-container');
    if (!certificatesContainer) return;
    
    // Clear skeleton loading
    certificatesContainer.innerHTML = '';
    
    // Mock certificates data
    const certificates = [
      {
        id: '1',
        courseId: '1',
        courseTitle: 'Web Development Fundamentals',
        completionDate: '2025-01-15',
        instructor: 'Sarah Johnson',
        preview: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg'
      },
      {
        id: '2',
        courseId: '3',
        courseTitle: 'UI/UX Design Principles',
        completionDate: '2025-02-20',
        instructor: 'Emily Chen',
        preview: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg'
      }
    ];
    
    if (certificates.length === 0) {
      certificatesContainer.innerHTML = `
        <div class="empty-certificates">
          <h3>No Certificates Yet</h3>
          <p>Complete courses to earn certificates and showcase your achievements.</p>
          <a href="courses.html" class="btn btn-primary">Browse Courses</a>
        </div>
      `;
      return;
    }
    
    // Add certificates to the container
    certificates.forEach(certificate => {
      const card = document.createElement('div');
      card.className = 'certificate-card';
      
      card.innerHTML = `
        <div class="certificate-preview">
          <img src="${certificate.preview}" alt="${certificate.courseTitle} Certificate">
        </div>
        <div class="certificate-content">
          <h3 class="certificate-title">${certificate.courseTitle}</h3>
          <div class="certificate-meta">
            <span>Completed ${formatDate(certificate.completionDate)}</span>
            <span>By ${certificate.instructor}</span>
          </div>
          <div class="certificate-actions">
            <button class="btn btn-secondary" onclick="viewCertificate('${certificate.id}')">
              View
            </button>
            <button class="btn btn-primary" onclick="downloadCertificate('${certificate.id}')">
              Download
            </button>
          </div>
        </div>
      `;
      
      certificatesContainer.appendChild(card);
    });
  }
  
  /**
   * View certificate in a new window
   * @param {string} certificateId - Certificate ID
   */
  function viewCertificate(certificateId) {
    // In a real app, this would open a modal or new window with the certificate
    alert('Certificate viewer would open here');
  }
  
  /**
   * Download certificate as PDF
   * @param {string} certificateId - Certificate ID
   */
  function downloadCertificate(certificateId) {
    // In a real app, this would trigger the certificate PDF download
    alert('Certificate download would start here');
  }