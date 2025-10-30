// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Logging in... <span class="loading"></span>';
        
        // Artificial delay for visual feedback (shows loading spinner briefly)
        setTimeout(() => {
            // Simple authentication (in production, use proper backend authentication)
            if (username && password) {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                
                // Show success and redirect
                errorMessage.style.display = 'none';
                loginBtn.innerHTML = 'Success! Redirecting...';
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                errorMessage.textContent = 'Please enter both username and password';
                errorMessage.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Login';
            }
        }, 800);
    });
});