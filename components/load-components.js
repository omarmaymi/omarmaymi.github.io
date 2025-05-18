// Function to load HTML components
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
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
}); 