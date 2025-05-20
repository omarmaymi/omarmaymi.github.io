document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    let loading = document.getElementById('loading');
    let currentImageIndex = 0;
    let shuffledImages = [];
    let imagesLoaded = 0;

    // Check if gallery exists
    if (!gallery) {
        console.error('Gallery element not found');
        return;
    }

    // Create loading element if it doesn't exist
    if (!loading) {
        loading = document.createElement('div');
        loading.className = 'loading';
        loading.textContent = 'Loading...';
        gallery.parentNode.insertBefore(loading, gallery.nextSibling);
    }

    // Check if images array exists
    if (typeof images === 'undefined') {
        console.error('Image list not loaded. Please check if image-list.js is properly loaded.');
        loading.textContent = 'Error loading images. Please refresh the page.';
        return;
    }

    // Function to shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Create a shuffled copy of the images array
    shuffledImages = shuffleArray(images);

    const BATCH_SIZE = 20;
    let currentIndex = 0;
    let loadingBatch = false;

    // Function to create gallery items with staggered delay
    function createGalleryItem(image, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.setProperty('--stagger-delay', `${index * 40}ms`);
        
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.src = image.src;
        img.alt = image.alt;
        
        
        // Add error handling for images
        img.onerror = () => {
            console.error(`Failed to load image: ${image.src}`);
            item.classList.add('error');
            item.innerHTML = `<div class="error-message">Failed to load image</div>`;
            checkAllImagesLoaded();
        };

        // Add load event to track successful image loads
        img.onload = () => {
            item.classList.add('loaded');
            imagesLoaded++;
            checkAllImagesLoaded();
        };
        
        // Add click event to open fullscreen view
        item.addEventListener('click', () => {
            showFullscreen(image.fullsize, image.alt, item);
        });
        
        item.appendChild(img);
        return item;
    }

    // Function to check if all images are loaded
    function checkAllImagesLoaded() {
        if (imagesLoaded >= shuffledImages.length) {
            loading.style.display = 'none';
        }
    }

    // Show fullscreen view
    function showFullscreen(src, alt, clickedElement) {
        const fullscreen = document.createElement('div');
        fullscreen.className = 'fullscreen-view';
        
        const content = document.createElement('div');
        content.className = 'fullscreen-content';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;

        // Get the position and dimensions of the clicked image
        const rect = clickedElement.getBoundingClientRect();
        const scale = rect.width / window.innerWidth;
        const translateX = rect.left + (rect.width / 2) - (window.innerWidth / 2);
        const translateY = rect.top + (rect.height / 2) - (window.innerHeight / 2);

        // Set initial transform
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = (e) => {
            e.stopPropagation();
            closeFullscreen(fullscreen, clickedElement);
        };

        const prevButton = document.createElement('button');
        prevButton.className = 'nav-button prev-button';
        prevButton.innerHTML = '&lt;';
        prevButton.onclick = (e) => {
            e.stopPropagation();
            navigateImage(-1, img);
        };

        const nextButton = document.createElement('button');
        nextButton.className = 'nav-button next-button';
        nextButton.innerHTML = '&gt;';
        nextButton.onclick = (e) => {
            e.stopPropagation();
            navigateImage(1, img);
        };
        
        content.appendChild(img);
        content.appendChild(closeButton);
        content.appendChild(prevButton);
        content.appendChild(nextButton);
        fullscreen.appendChild(content);
        document.body.appendChild(fullscreen);

        // Trigger animation after a small delay
        requestAnimationFrame(() => {
            fullscreen.classList.add('active');
            img.classList.add('animate');
        });

        // Add click event to close when clicking outside the image
        fullscreen.addEventListener('click', (e) => {
            if (e.target === fullscreen) {
                closeFullscreen(fullscreen, clickedElement);
            }
        });

        // Set current image index
        currentImageIndex = shuffledImages.findIndex(img => img.fullsize === src);
    }

    // Close fullscreen view with animation
    function closeFullscreen(fullscreen, originalElement) {
        const img = fullscreen.querySelector('img');
        const rect = originalElement.getBoundingClientRect();
        const scale = rect.width / window.innerWidth;
        const translateX = rect.left + (rect.width / 2) - (window.innerWidth / 2);
        const translateY = rect.top + (rect.height / 2) - (window.innerHeight / 2);

        img.classList.remove('animate');
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        fullscreen.classList.remove('active');

        fullscreen.addEventListener('transitionend', function handler() {
            if (fullscreen.parentNode) {
                fullscreen.parentNode.removeChild(fullscreen);
            }
            fullscreen.removeEventListener('transitionend', handler);
        });
    }

    // Navigate between images
    function navigateImage(direction, imgElement) {
        const newIndex = (currentImageIndex + direction + shuffledImages.length) % shuffledImages.length;
        const newImage = shuffledImages[newIndex];
        currentImageIndex = newIndex;
        
        imgElement.style.opacity = '0';
        
        setTimeout(() => {
            imgElement.src = newImage.fullsize;
            imgElement.alt = newImage.alt;
            imgElement.style.opacity = '1';
        }, 300);
    }

    // Intersection Observer for fade-in animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '200px'
    });

    // Load a batch of images
    function loadBatch() {
        if (loadingBatch) return;
        loadingBatch = true;
        const start = currentIndex;
        const end = Math.min(currentIndex + BATCH_SIZE, shuffledImages.length);
        
        
        // Hide loading indicator when first batch starts loading
        if (start === 0) {
            // Add a small delay to ensure the loading indicator is hidden
            setTimeout(() => {
                if (loading) {
                    loading.style.display = 'none';
                    loading.style.visibility = 'hidden';
                    loading.style.opacity = '0';
                }
            }, 100);
        }
        
        for (let i = start; i < end; i++) {
            const item = createGalleryItem(shuffledImages[i], i);
            gallery.appendChild(item);
            observer.observe(item);
        }
        currentIndex = end;
        loadingBatch = false;
        if (currentIndex >= shuffledImages.length) {
            window.removeEventListener('scroll', handleScroll);
        }
    }

    // Check if we need to load more images
    function handleScroll() {
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 600;
        if (scrollPosition > threshold) {
            loadBatch();
        }
    }

    // Initial load
    loadBatch();
    window.addEventListener('scroll', handleScroll);
}); 