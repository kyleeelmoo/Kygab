// Login and Registration functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const toggleForm = document.getElementById('toggleForm');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const emailField = document.getElementById('email');
    const roleField = document.getElementById('userRole');
    
    let isRegistering = false;
    
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
    
    // Initialize users database if it doesn't exist
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            { username: 'admin', email: 'admin@morata-dominguez.com', password: 'admin123', role: 'admin' },
            { username: 'manager', email: 'manager@morata-dominguez.com', password: 'manager123', role: 'manager' },
            { username: 'tenant', email: 'tenant@morata-dominguez.com', password: 'tenant123', role: 'tenant' }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Toggle between login and registration
    toggleForm.addEventListener('click', function(e) {
        e.preventDefault();
        isRegistering = !isRegistering;
        
        if (isRegistering) {
            formTitle.textContent = 'Register';
            submitBtn.textContent = 'Register';
            emailField.style.display = 'block';
            roleField.style.display = 'block';
            toggleForm.textContent = 'Already have an account? Login';
        } else {
            formTitle.textContent = 'Login';
            submitBtn.textContent = 'Login';
            emailField.style.display = 'none';
            roleField.style.display = 'none';
            toggleForm.textContent = "Don't have an account? Register";
        }
        
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        loginForm.reset();
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('userRole').value;
        
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        if (isRegistering) {
            // Registration logic
            if (!username || !password || !email) {
                errorMessage.textContent = 'Please fill in all fields';
                errorMessage.style.display = 'block';
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Check if username already exists
            if (users.find(u => u.username === username)) {
                errorMessage.textContent = 'Username already exists';
                errorMessage.style.display = 'block';
                return;
            }
            
            // Check if email already exists
            if (users.find(u => u.email === email)) {
                errorMessage.textContent = 'Email already registered';
                errorMessage.style.display = 'block';
                return;
            }
            
            // Add new user
            users.push({ username, email, password, role });
            localStorage.setItem('users', JSON.stringify(users));
            
            successMessage.textContent = 'Registration successful! Please login.';
            successMessage.style.display = 'block';
            
            // Switch to login form after 2 seconds
            setTimeout(() => {
                toggleForm.click();
            }, 2000);
            
        } else {
            // Login logic
            if (!username || !password) {
                errorMessage.textContent = 'Please enter both username and password';
                errorMessage.style.display = 'block';
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('userEmail', user.email);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                errorMessage.textContent = 'Invalid username or password';
                errorMessage.style.display = 'block';
            }
        }
    });
});