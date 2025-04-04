// auth.js - Handles authentication functionality

document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Remove email validation for demo purposes
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.removeAttribute('type');
            emailInput.setAttribute('type', 'text');
        }
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            
            // Special login logic for demo
            if (email === 'one' && password === 'two') {
                // Store special access in localStorage
                const userData = {
                    email: email,
                    accountType: 'premium',
                    isLoggedIn: true,
                    specialAccess: true
                };
                
                localStorage.setItem('strawberryVpnUser', JSON.stringify(userData));
                
                // Redirect to premium dashboard
                window.location.href = 'premium.html';
                return;
            }
            
            // Simulate authentication (in a real app, this would be a server request)
            if (email && password) {
                // For demo purposes, we'll just simulate a successful login
                // In a real application, you would validate credentials with Firebase or another backend
                
                // Store user info in localStorage (for demo purposes only)
                const userData = {
                    email: email,
                    accountType: 'free', // Default to free
                    isLoggedIn: true
                };
                
                localStorage.setItem('strawberryVpnUser', JSON.stringify(userData));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show error message
                errorMessage.textContent = 'Please enter both email and password.';
                errorMessage.classList.add('show');
            }
        });
    }
    
    // Registration form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // Password strength meter
        const passwordInput = document.getElementById('password');
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        
        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = calculatePasswordStrength(password);
                
                // Update strength bar
                strengthBar.style.width = strength.score * 25 + '%';
                
                // Update color based on strength
                if (strength.score === 0) {
                    strengthBar.style.backgroundColor = '#FF1744'; // Error
                    strengthText.textContent = 'Very weak';
                } else if (strength.score === 1) {
                    strengthBar.style.backgroundColor = '#FF9100'; // Warning
                    strengthText.textContent = 'Weak';
                } else if (strength.score === 2) {
                    strengthBar.style.backgroundColor = '#FFC107'; // Warning
                    strengthText.textContent = 'Fair';
                } else if (strength.score === 3) {
                    strengthBar.style.backgroundColor = '#4CAF50'; // Success
                    strengthText.textContent = 'Good';
                } else {
                    strengthBar.style.backgroundColor = '#00C853'; // Success
                    strengthText.textContent = 'Strong';
                }
            });
        }
        
        // Form submission
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const accountType = document.querySelector('input[name="account-type"]:checked').value;
            const termsChecked = document.getElementById('terms').checked;
            const errorMessage = document.getElementById('error-message');
            
            // Validate form
            if (!email || !password || !confirmPassword) {
                errorMessage.textContent = 'Please fill in all required fields.';
                errorMessage.classList.add('show');
                return;
            }
            
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match.';
                errorMessage.classList.add('show');
                return;
            }
            
            if (!termsChecked) {
                errorMessage.textContent = 'You must agree to the Terms of Service and Privacy Policy.';
                errorMessage.classList.add('show');
                return;
            }
            
            // Simulate registration (in a real app, this would be a server request)
            // In a real application, you would register with Firebase or another backend
            
            // Store user info in localStorage (for demo purposes only)
            const userData = {
                email: email,
                accountType: accountType,
                isLoggedIn: true
            };
            
            localStorage.setItem('strawberryVpnUser', JSON.stringify(userData));
            
            // Redirect to appropriate dashboard
            if (accountType === 'premium') {
                window.location.href = 'premium.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }
    
    // Helper function to calculate password strength
    function calculatePasswordStrength(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 8) {
            score += 1;
        }
        
        // Complexity checks
        if (/[A-Z]/.test(password)) {
            score += 1;
        }
        
        if (/[0-9]/.test(password)) {
            score += 1;
        }
        
        if (/[^A-Za-z0-9]/.test(password)) {
            score += 1;
        }
        
        return {
            score: score,
            isStrong: score >= 3
        };
    }
});