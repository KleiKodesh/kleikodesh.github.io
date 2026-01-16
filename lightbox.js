// Simple Lightbox Implementation
class SimpleLightbox {
    constructor(gallerySelector) {
        this.gallery = document.querySelector(gallerySelector);
        this.images = [];
        this.currentIndex = 0;
        this.lightbox = null;
        
        this.init();
    }
    
    init() {
        // Collect all images from gallery
        const links = this.gallery.querySelectorAll('a');
        links.forEach((link, index) => {
            const img = link.querySelector('img');
            this.images.push({
                src: link.href,
                alt: img ? img.alt : '',
                element: link
            });
            
            // Add click handler
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(index);
            });
        });
        
        // Create lightbox HTML
        this.createLightbox();
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }
    
    createLightbox() {
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'lightbox';
        this.lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="סגור"></button>
            <button class="lightbox-nav prev" aria-label="הקודם">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
            <button class="lightbox-nav next" aria-label="הבא">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <div class="lightbox-counter"></div>
            <div class="lightbox-content">
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-caption"></div>
            </div>
        `;
        
        document.body.appendChild(this.lightbox);
        
        // Event handlers
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.lightbox.querySelector('.prev').addEventListener('click', () => this.prev());
        this.lightbox.querySelector('.next').addEventListener('click', () => this.next());
        
        // Close on background click
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.close();
        });
    }
    
    open(index) {
        this.currentIndex = index;
        this.updateImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }
    
    updateImage() {
        const image = this.images[this.currentIndex];
        const img = this.lightbox.querySelector('.lightbox-image');
        const caption = this.lightbox.querySelector('.lightbox-caption');
        const counter = this.lightbox.querySelector('.lightbox-counter');
        
        // Add fade-out class
        img.classList.add('fade-out');
        caption.classList.add('fade-out');
        
        // Wait for fade-out animation, then update and fade-in
        setTimeout(() => {
            img.src = image.src;
            img.alt = image.alt;
            caption.textContent = image.alt;
            counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
            
            // Remove fade-out class to trigger fade-in
            img.classList.remove('fade-out');
            caption.classList.remove('fade-out');
        }, 150);
        
        // Show/hide nav buttons
        const prevBtn = this.lightbox.querySelector('.prev');
        const nextBtn = this.lightbox.querySelector('.next');
        
        if (this.images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
} else {
    initLightbox();
}

function initLightbox() {
    const gallery = document.querySelector('#gallery');
    if (gallery) {
        window.lightboxInstance = new SimpleLightbox('#gallery');
    }
}
