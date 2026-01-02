// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = toggleBtn ? toggleBtn.querySelector('i') || toggleBtn.querySelector('span') : null;

    function updateIcon(theme) {
        if (!icon) return;
        if (theme === 'dark') {
            icon.textContent = '☀️';
        } else {
            icon.textContent = '🌙';
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });
    }

    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    updateIcon(currentTheme);
});