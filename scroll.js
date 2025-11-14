document.querySelectorAll('a.nav-link[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    const navbarHeight = document.querySelector('.navbar').offsetHeight;

    if (targetElement) {
      const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  });
});

function scrollGallery(direction) {
  const wrapper = document.getElementById('scrolling-wrapper');
  const scrollAmount = 220;
  wrapper.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

// Image modal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <span class="image-modal-close">&times;</span>
    <img class="image-modal-content" alt="תמונה בגודל מלא">
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('.image-modal-content');
  const closeBtn = modal.querySelector('.image-modal-close');

  // Add click event to all gallery images
  const galleryImages = document.querySelectorAll('.scrolling-wrapper .card img');
  galleryImages.forEach(img => {
    img.addEventListener('click', function() {
      modal.classList.add('active');
      modalImg.src = this.src;
      modalImg.alt = this.alt;
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal on click
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});
