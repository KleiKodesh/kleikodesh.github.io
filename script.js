// Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
    
    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}

// Scroll Progress Bar
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate scroll percentage
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    // Update progress bar width
    if (scrollProgress) {
        scrollProgress.style.width = scrollPercentage + '%';
    }
}

// Update on scroll
window.addEventListener('scroll', updateScrollProgress);

// Update on load
window.addEventListener('load', updateScrollProgress);

// Theme Toggle - Using Tailwind's dark mode
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Initialize theme from localStorage or system preference
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    } else if (savedTheme === 'light') {
        html.classList.remove('dark');
    } else {
        // Use system preference if no saved theme
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.classList.add('dark');
        }
    }
}

// Toggle theme function
function toggleTheme() {
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme on page load
initTheme();

// Theme toggle handler
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const nav = document.querySelector('nav');
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = target.offsetTop - navHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Intersection Observer for fade-in animations (optional enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Form validation enhancement
const contactForm = document.querySelector('form[action*="formspree"]');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !message) {
            e.preventDefault();
            alert('נא למלא את כל השדות');
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            e.preventDefault();
            alert('נא להזין כתובת דוא"ל תקינה');
            return false;
        }
    });
}

// Keyboard navigation for gallery images
document.querySelectorAll('.gallery-image').forEach(img => {
    img.addEventListener('click', () => {
        // Open image in new tab when clicked
        window.open(img.src, '_blank');
    });
});

// Lazy loading for images (if needed in future)
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Add active state to nav links based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const highlightNavLink = () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

window.addEventListener('scroll', highlightNavLink);

// Console message for developers
console.log('%cכלי קודש לוורד', 'font-size: 24px; font-weight: bold; color: #0078d4;');
console.log('%cפרויקט קוד פתוח לעורכים תורניים', 'font-size: 14px; color: #5a5a5a;');
console.log('GitHub: https://github.com/KleiKodesh');

// Gallery - Open custom lightbox directly
const openGalleryBtn = document.getElementById('openGallery');
const openGalleryMobileBtn = document.getElementById('openGalleryMobile');

function openGallery(e) {
    e.preventDefault();
    
    // Close mobile menu if open
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
    
    // Open lightbox at first image
    if (window.lightboxInstance) {
        window.lightboxInstance.open(0);
    }
}

if (openGalleryBtn) {
    openGalleryBtn.addEventListener('click', openGallery);
}

if (openGalleryMobileBtn) {
    openGalleryMobileBtn.addEventListener('click', openGallery);
}
