// Function to create background circles
function createCircles() {
  const bg = document.getElementById('parallaxBg');
  const numCircles = 25;
  const columns = Math.ceil(Math.sqrt(numCircles));
  const rows = Math.ceil(numCircles / columns);

  for (let i = 0; i < numCircles; i++) {
      const circle = document.createElement('div');
      circle.classList.add('circle');

      // Circle size between 50px and 250px
      const size = Math.random() * 200 + 20;
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;

      // Grid-based random position
      const col = i % columns;
      const row = Math.floor(i / columns);
      const cellWidth = 100 / columns;
      const cellHeight = 100 / rows;
      const leftOffset = col * cellWidth + Math.random() * (cellWidth * 0.8);
      const topOffset = row * cellHeight + Math.random() * (cellHeight * 0.8);

      circle.style.left = `${leftOffset}%`;
      circle.style.top = `${topOffset}%`;
      bg.appendChild(circle);
  }
}

// Function to animate circles continuously with a parallax effect
function animateCircles() {
  const circles = document.querySelectorAll('.circle');
  let rotationAngle = 0; // Initial angle for smooth rotation

  function animate() {
      const scrolled = window.scrollY;
      rotationAngle += 0.005; // Increment angle slowly for smoother rotation

      circles.forEach((circle, index) => {
          const speed = (index + 1) * 0.2; // Adjusted speed for animation
          const parallaxSpeed = (index + (1/5)) * 0.01; // Slower parallax effect

          // Time-based vertical oscillation
          const time = Date.now() * 0.001;
          const oscillation = Math.sin(time * speed) * 50;
          const parallax = scrolled * parallaxSpeed;

          // Calculate a smooth and slow rotation angle
          const rotateAngle = rotationAngle * speed;

          // Apply transformation
          circle.style.transform = `translateY(${oscillation + parallax}px) rotate(${rotateAngle}rad)`;
      });

      requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function applyParallaxToText() {
    const home = document.getElementById('home');
    const bg = document.getElementById('parallaxBg');

    // Get background from .parallax-bg
    const bgStyle = window.getComputedStyle(bg).backgroundImage;

    // Apply it to #home
    home.style.backgroundImage = bgStyle;
    home.style.backgroundSize = "cover";
    home.style.backgroundPosition = "center";
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  createCircles();
  animateCircles();
});

// AOS init

AOS.init();

// tilt init
