const cursor = document.querySelector('.custom-cursor');
const nav = document.querySelector('.nav');

// Custom cursor
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';

    // Navbar visibility
    if (e.clientY < 60) {
        nav.classList.add('visible');
    } else if (e.clientY > 70) {
        nav.classList.remove('visible');
    }
});

document.addEventListener('mousedown', () => {
    cursor.style.transform = 'scale(0.8)';
});

document.addEventListener('mouseup', () => {
    cursor.style.transform = 'scale(1)';
});

/*
let lastScrollPosition = 0;
window.addEventListener('scroll', () => {
    const currentScrollPosition = window.scrollY;
    if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
        nav.classList.remove('visible');
    } else {
        nav.classList.add('visible');
    }
    lastScrollPosition = currentScrollPosition;
});
*/