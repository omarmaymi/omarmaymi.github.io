document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const loading = document.getElementById('loading');

    // Intersection Observer for lazy loading and animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Function to create gallery items
    function createGalleryItem(image) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = image.src;
        img.alt = image.alt;
        
        item.appendChild(img);
        observer.observe(item);
        return item;
    }

    // Load images
    images.forEach(image => {
        gallery.appendChild(createGalleryItem(image));
    });

    // Hide loading indicator when all images are loaded
    window.addEventListener('load', () => {
        loading.style.display = 'none';
    });
}); 