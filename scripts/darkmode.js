(function() {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
    
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
    
    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
        
        updateDarkModeButton();
    };
    
    function updateDarkModeButton() {
        const button = document.getElementById('darkModeToggle');
        if (button) {
            const isDarkMode = document.body.classList.contains('dark-mode');
            button.innerHTML = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        updateDarkModeButton();
    });
})();