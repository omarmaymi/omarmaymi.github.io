// Function to load HTML components
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
    // Initialize hamburger menu after header is loaded
    if (elementId === 'header-placeholder') {
      const hamburger = document.getElementById('hamburger-menu');
      const nav = document.getElementById('main-nav');
      console.log('Hamburger:', hamburger);
      console.log('Nav:', nav);
      if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
          console.log('Hamburger clicked');
          const isOpen = hamburger.classList.toggle('open');
          nav.classList.toggle('open', isOpen);
          hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        // Auto-close menu on link click
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.addEventListener('click', function() {
            hamburger.classList.remove('open');
            nav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
          });
        });
      }
    }
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
  }
}

// Function to handle scroll to top
function handleScrollToTop() {
  const topButton = document.querySelector('.top');
  if (topButton) {
    topButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Load header
  loadComponent('header-placeholder', '/components/header.html');
  
  // Load footer
  loadComponent('footer-placeholder', '/components/footer.html')
    .then(() => {
      // Initialize scroll to top after footer is loaded
      handleScrollToTop();
    });

  // Load cursor
  loadComponent('cursor-placeholder', '/components/cursor.html')
    .then(() => {
      const script = document.createElement('script');
      script.src = '/components/cursor.js';
      document.body.appendChild(script);
    });
}); 