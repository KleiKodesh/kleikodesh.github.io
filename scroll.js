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
    const scrollAmount = 220; // adjust as needed
    wrapper.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }
