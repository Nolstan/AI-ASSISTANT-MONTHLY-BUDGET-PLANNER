// Responsive Navbar Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu') || document.querySelector('header nav') || document.querySelector('.nav-links');

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBtn.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggleBtn.contains(e.target) && !navMenu.contains(e.target)) {
                toggleBtn.classList.remove('active');
                navMenu.classList.remove('open');
            }
        });

        // Close menu when clicking any nav link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggleBtn.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
    }
});
