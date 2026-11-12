(function() {
    var stored = localStorage.getItem('darkMode');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'enabled' || (stored === null && prefersDark)) {
        document.body.classList.add('dark-mode');
    }

    var SVG_OPEN = '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var SUN = SVG_OPEN + '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var MOON = SVG_OPEN + '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        var isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        updateDarkModeButton();
    };

    function updateDarkModeButton() {
        var button = document.getElementById('darkModeToggle');
        if (!button) return;
        var isDark = document.body.classList.contains('dark-mode');
        var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        button.setAttribute('aria-label', label);
        button.title = label;
        // Icon-only buttons show just the glyph; others keep a text label
        if (button.classList.contains('btn-icon')) {
            button.innerHTML = isDark ? SUN : MOON;
        } else {
            button.innerHTML = (isDark ? SUN + ' Light' : MOON + ' Dark');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateDarkModeButton);
    } else {
        updateDarkModeButton();
    }
})();
