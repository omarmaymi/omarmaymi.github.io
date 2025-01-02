document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img.lazy');
  
  const lazyLoad = (target) => {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.disconnect();
        }
      });
    });

    io.observe(target);
  };

  lazyImages.forEach(lazyLoad);
});

document.addEventListener('DOMContentLoaded', function() {
    // Get the scroll-to-top button
    const topButton = document.querySelector('.top');
    
    // Add click event listener
    topButton.addEventListener('click', function() {
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
