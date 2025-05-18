// Detect devtools
let devtoolsOpen = false;

// Function to check if devtools is open
function checkDevTools() {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    if (!devtoolsOpen) {
      devtoolsOpen = true;
      document.body.classList.add('devtools-open');
    }
  } else {
    if (devtoolsOpen) {
      devtoolsOpen = false;
      document.body.classList.remove('devtools-open');
    }
  }
}

// Check on load and resize
window.addEventListener('load', checkDevTools);
window.addEventListener('resize', checkDevTools);

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
