document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    let loading = document.getElementById('loading');
    let currentVideoIndex = 0;
    let shuffledVideos = [];
    let videosLoaded = 0;

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

    // Check if videos array exists
    if (typeof videos === 'undefined') {
        console.error('Video list not loaded. Please check if media-list.js is properly loaded.');
        loading.textContent = 'Error loading videos. Please refresh the page.';
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

    // Create a shuffled copy of the videos array
    shuffledVideos = shuffleArray(videos);

    const BATCH_SIZE = 12;
    let currentIndex = 0;
    let loadingBatch = false;

    // Function to create gallery items with staggered delay
    function createGalleryItem(video, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.setProperty('--stagger-delay', `${index * 40}ms`);
        
        // Create thumbnail container
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'thumbnail-container';
        
        // Create thumbnail image
        const thumbnail = document.createElement('img');
        thumbnail.loading = 'lazy';
        thumbnail.decoding = 'async';
        thumbnail.src = video.thumbnail;
        thumbnail.alt = video.title;
        
        // Create hover preview video
        const previewVideo = document.createElement('video');
        previewVideo.className = 'preview-video';
        previewVideo.src = video.preview;
        previewVideo.muted = true;
        previewVideo.loop = true;
        previewVideo.playsInline = true;
        
        // Create play icon
        const playIcon = document.createElement('div');
        playIcon.className = 'play-icon';
        playIcon.innerHTML = '<i class="fas fa-play"></i>';
        
        // Add error handling for thumbnail
        thumbnail.onerror = () => {
            console.error(`Failed to load thumbnail: ${video.thumbnail}`);
            item.classList.add('error');
            item.innerHTML = `<div class="error-message">Failed to load thumbnail</div>`;
            checkAllVideosLoaded();
        };

        // Add load event to track successful thumbnail loads
        thumbnail.onload = () => {
            item.classList.add('loaded');
            videosLoaded++;
            checkAllVideosLoaded();
        };
        
        // Add hover events for preview video
        item.addEventListener('mouseenter', () => {
            previewVideo.play().catch(error => {
                console.error('Error playing preview video:', error);
            });
        });
        
        item.addEventListener('mouseleave', () => {
            previewVideo.pause();
            previewVideo.currentTime = 0;
        });
        
        // Add click event to open fullscreen view
        item.addEventListener('click', () => {
            showFullscreen(video);
        });
        
        thumbnailContainer.appendChild(thumbnail);
        thumbnailContainer.appendChild(previewVideo);
        item.appendChild(thumbnailContainer);
        item.appendChild(playIcon);
        return item;
    }

    // Function to check if all videos are loaded
    function checkAllVideosLoaded() {
        if (videosLoaded >= shuffledVideos.length) {
            loading.style.display = 'none';
        }
    }

    // Show fullscreen view
    function showFullscreen(video) {
        const fullscreen = document.createElement('div');
        fullscreen.className = 'fullscreen-view';
        
        const content = document.createElement('div');
        content.className = 'fullscreen-content';
        
        const iframe = document.createElement('iframe');
        iframe.src = video.embedUrl;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => {
            document.body.removeChild(fullscreen);
        };

        const prevButton = document.createElement('button');
        prevButton.className = 'nav-button prev-button';
        prevButton.innerHTML = '&lt;';
        prevButton.onclick = (e) => {
            e.stopPropagation();
            navigateVideo(-1, iframe);
        };

        const nextButton = document.createElement('button');
        nextButton.className = 'nav-button next-button';
        nextButton.innerHTML = '&gt;';
        nextButton.onclick = (e) => {
            e.stopPropagation();
            navigateVideo(1, iframe);
        };
        
        content.appendChild(iframe);
        content.appendChild(closeButton);
        content.appendChild(prevButton);
        content.appendChild(nextButton);
        fullscreen.appendChild(content);
        document.body.appendChild(fullscreen);

        // Add click event to close when clicking outside the video
        fullscreen.addEventListener('click', (e) => {
            if (e.target === fullscreen) {
                document.body.removeChild(fullscreen);
            }
        });

        // Set current video index
        currentVideoIndex = shuffledVideos.findIndex(v => v.embedUrl === video.embedUrl);
    }

    // Navigate between videos
    function navigateVideo(direction, iframeElement) {
        const newIndex = (currentVideoIndex + direction + shuffledVideos.length) % shuffledVideos.length;
        const newVideo = shuffledVideos[newIndex];
        currentVideoIndex = newIndex;
        
        iframeElement.src = newVideo.embedUrl;
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

    // Load a batch of videos
    function loadBatch() {
        if (loadingBatch) return;
        loadingBatch = true;
        const start = currentIndex;
        const end = Math.min(currentIndex + BATCH_SIZE, shuffledVideos.length);
        
        
        // Hide loading indicator when first batch starts loading
        if (start === 0) {
            setTimeout(() => {
                if (loading) {
                    loading.style.display = 'none';
                    loading.style.visibility = 'hidden';
                    loading.style.opacity = '0';
                }
            }, 100);
        }
        
        for (let i = start; i < end; i++) {
            const item = createGalleryItem(shuffledVideos[i], i);
            gallery.appendChild(item);
            observer.observe(item);
        }
        currentIndex = end;
        loadingBatch = false;
        if (currentIndex >= shuffledVideos.length) {
            window.removeEventListener('scroll', handleScroll);
        }
    }

    // Check if we need to load more videos
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