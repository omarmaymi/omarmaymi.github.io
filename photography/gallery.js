document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const loading = document.getElementById('loading');

    // Check if images array exists
    if (typeof images === 'undefined') {
        console.error('Image list not loaded. Please check if image-list.js is properly loaded.');
        loading.textContent = 'Error loading images. Please refresh the page.';
        return;
    }

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
        
        // Add error handling for images
        img.onerror = () => {
            console.error(`Failed to load image: ${image.src}`);
            item.classList.add('error');
            item.innerHTML = `<div class="error-message">Failed to load image</div>`;
        };
        
        item.appendChild(img);
        observer.observe(item);
        return item;
    }

    // Load images
    try {
        images.forEach(image => {
            gallery.appendChild(createGalleryItem(image));
        });
    } catch (error) {
        console.error('Error loading gallery:', error);
        loading.textContent = 'Error loading gallery. Please refresh the page.';
    }

    // Hide loading indicator when all images are loaded
    window.addEventListener('load', () => {
        loading.style.display = 'none';
    });
}); 