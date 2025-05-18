const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Update cursor position
function updateCursorPosition(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

// Smooth cursor movement
function smoothCursor() {
  // Smooth dot movement
  const dotSpeed = 0.2;
  cursorX += (mouseX - cursorX) * dotSpeed;
  cursorY += (mouseY - cursorY) * dotSpeed;
  cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

  requestAnimationFrame(smoothCursor);
}

// Start cursor movement
document.addEventListener('mousemove', updateCursorPosition);
smoothCursor();

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1';
}); 