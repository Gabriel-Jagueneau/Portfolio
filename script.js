// Function to create background circles
function createCircles() {
    const bg = document.getElementById('parallaxBg');
    const numCircles = 10; // Total number of circles
    const columns = Math.ceil(Math.sqrt(numCircles)); // Number of columns
    const rows = Math.ceil(numCircles / columns); // Number of rows

    for (let i = 0; i < numCircles; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');

        // Circle size between 50px and 250px
        const size = Math.random() * 200 + 50;
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;

        // Calculate the position in the grid
        const col = i % columns;
        const row = Math.floor(i / columns);

        // Available space for each cell (in percentage)
        const cellWidth = 100 / columns;
        const cellHeight = 100 / rows;

        // Random but constrained position within each cell
        const leftOffset = col * cellWidth + Math.random() * (cellWidth * 0.8); // 80% of the cell's width
        const topOffset = row * cellHeight + Math.random() * (cellHeight * 0.8); // 80% of the cell's height

        circle.style.left = `${leftOffset}%`;
        circle.style.top = `${topOffset}%`;

        bg.appendChild(circle);
    }
}

// Function for continuous and parallax animation
function animateCircles() {
    const circles = document.querySelectorAll('.circle');
    const scrolled = window.pageYOffset;

    circles.forEach((circle, index) => {
        const speed = (index + 0.1) * 0.5; // Speed adjustment for continuous animation
        const parallaxSpeed = (index + 0.1) * 0.025; // Speed adjustment for parallax effect
        
        const time = Date.now() * 0.001; // Time for smooth animation
        const translateY = Math.sin(time * speed) * 10; // Smooth vertical movement
        const rotateAngle = time * parallaxSpeed; // Smooth rotation

        const parallaxOffset = scrolled * parallaxSpeed; // Parallax offset based on scroll

        // Apply parallax effect and smooth animation
        circle.style.transform = `translateY(${translateY + parallaxOffset}px) rotate(${rotateAngle}deg)`;
    });

    // Continue animation with `requestAnimationFrame`
    requestAnimationFrame(animateCircles);
}

// Animation for project cards on scroll
function handleScroll() {
    const cards = document.querySelectorAll('.content-section');
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        if (cardTop < window.innerHeight * 0.6) {
            card.classList.add('visible');
        }
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    createCircles();
    window.addEventListener('scroll', handleScroll);
    animateCircles(); // Start continuous animation on load
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

const nav = document.querySelector('.nav');
// Custom cursor
document.addEventListener('mousemove', (e) => {
    if (e.clientY < 60) nav.classList.add('visibled');
    else if (e.clientY > 70) nav.classList.remove('visibled');
});

var copyText = function(id, text) {
    const cpy = document.getElementById(id); // get the ID of the container
    const oldInner = cpy.innerHTML; // stock its content
    navigator.clipboard.writeText(text)
        .then(() => { // if the text is copyable, then copy
            cpy.style = "background-color: lime;";
            cpy.innerHTML = `done_all`;
        }).catch(() => { // if not it shows an error
            cpy.style = "background-color: red;";
            cpy.innerHTML = `error`;
        }).finally(() => { // resets to the old stocked value, with 1.5 second delay
            setTimeout(() => {
                cpy.style = "";
                cpy.innerHTML = oldInner;
            }, 1500);
        });
}