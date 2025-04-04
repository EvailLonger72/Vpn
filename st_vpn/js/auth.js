// Strawberry VPN - Authentication

document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    const isLoginPage = document.getElementById('loginForm');
    const isRegisterPage = document.getElementById('registerForm');
    
    // Initialize authentication state
    const authState = getAuthState();
    
    // If user is already logged in, redirect to appropriate page
    if (authState.isLoggedIn) {
        if (isLoginPage || isRegisterPage) {
            redirectToUserDashboard(authState);
        }
    }
    
    // Set up login form
    if (isLoginPage) {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Set up register form
    if (isRegisterPage) {
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Add sync call
    syncAuthStates();
});

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Validate input
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    // Special login case for demo
    if (email === 'one' && password === 'two' || 
        email === 'one@gmail.com' && password === 'two') {
        // Set as premium user
        const authState = {
            isLoggedIn: true,
            email: 'premium@example.com',
            accountType: 'premium'
        };
        
        // Save to local storage
        saveAuthState(authState);
        
        // Redirect to premium dashboard
        window.location.href = 'premium.html';
        return;
    }
    
    // Check if user exists in local storage
    const users = getUsersFromStorage();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        alert('User not found. Please register first.');
        return;
    }
    
    if (user.password !== password) {
        alert('Incorrect password');
        return;
    }
    
    // Force account type to be 'free' for all regular users
    // Only the special demo account should get premium
    
    // Create auth state
    const authState = {
        isLoggedIn: true,
        email: user.email,
        accountType: 'free' // Force all regular users to free
    };
    
    // Save to local storage
    saveAuthState(authState);
    
    // Redirect to appropriate dashboard (which will be dashboard.html for all regular users)
    window.location.href = 'dashboard.html';
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const accountTypeSelected = document.querySelector('input[name="accountType"]:checked').value;
    
    // Validate input
    if (!email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if user already exists
    const users = getUsersFromStorage();
    if (users.some(u => u.email === email)) {
        alert('User with this email already exists');
        return;
    }
    
    // Determine account type - force to 'free' for all regular registrations
    // Only the special demo account (handled in handleLogin) gets premium
    const accountType = 'free';
    
    // If user selected premium, show message
    if (accountTypeSelected === 'premium') {
        alert('Sorry, premium registration is currently only available through special promotion. Your account has been registered as a free account.');
    }
    
    // Create new user
    const newUser = {
        email,
        password, // In a real app, you'd hash this password
        accountType
    };
    
    // Add to storage
    users.push(newUser);
    localStorage.setItem('vpnUsers', JSON.stringify(users));
    
    // Create auth state
    const authState = {
        isLoggedIn: true,
        email: newUser.email,
        accountType: newUser.accountType
    };
    
    // Save to local storage
    saveAuthState(authState);
    
    // Redirect to appropriate dashboard
    redirectToUserDashboard(authState);
}

// Helper functions

// Get authentication state from localStorage
function getAuthState() {
    const authStateStr = localStorage.getItem('vpnAuthState');
    return authStateStr ? JSON.parse(authStateStr) : { isLoggedIn: false };
}

// Save authentication state to localStorage
function saveAuthState(authState) {
    localStorage.setItem('vpnAuthState', JSON.stringify(authState));
    
    // Also create or update the vpnUser object
    let vpnUser = JSON.parse(localStorage.getItem('vpnUser') || '{}');
    
    // Update email and premium status
    vpnUser.email = authState.email;
    vpnUser.isPremium = authState.accountType === 'premium';
    
    // If it's a new user, initialize other fields
    if (!vpnUser.profile) {
        vpnUser.profile = {
            firstName: '',
            lastName: '',
            displayName: '',
            language: 'en',
            timezone: 'UTC+00:00'
        };
    }
    
    // Save back to localStorage
    localStorage.setItem('vpnUser', JSON.stringify(vpnUser));
}

// Get users from localStorage
function getUsersFromStorage() {
    const usersStr = localStorage.getItem('vpnUsers');
    return usersStr ? JSON.parse(usersStr) : [];
}

// Redirect to appropriate dashboard based on user type
function redirectToUserDashboard(authState) {
    if (authState.accountType === 'premium') {
        window.location.href = 'premium.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

// Logout function (will be used in dashboard pages)
function logout() {
    // Clear auth state
    localStorage.removeItem('vpnAuthState');
    localStorage.removeItem('vpnUser');
    
    // Redirect to login
    window.location.href = 'index.html';
}

// Export logout for use in other scripts
window.logout = logout;

// Synchronize authentication states
function syncAuthStates() {
    const authState = getAuthState();
    let vpnUser = JSON.parse(localStorage.getItem('vpnUser') || '{}');
    
    // If user is logged in via authState but vpnUser doesn't exist or doesn't match
    if (authState.isLoggedIn && (!vpnUser.email || vpnUser.email !== authState.email)) {
        // Update vpnUser object
        vpnUser.email = authState.email;
        vpnUser.isPremium = authState.accountType === 'premium';
        
        // Initialize other fields if needed
        if (!vpnUser.profile) {
            vpnUser.profile = {
                firstName: '',
                lastName: '',
                displayName: '',
                language: 'en',
                timezone: 'UTC+00:00'
            };
        }
        
        // Save back to localStorage
        localStorage.setItem('vpnUser', JSON.stringify(vpnUser));
    }
    
    // If vpnUser exists but no authState
    else if (vpnUser.email && !authState.isLoggedIn) {
        authState = {
            isLoggedIn: true,
            email: vpnUser.email,
            accountType: vpnUser.isPremium ? 'premium' : 'free'
        };
        
        localStorage.setItem('vpnAuthState', JSON.stringify(authState));
    }
    
    return { authState, vpnUser };
}

// Export syncAuthStates for use in other scripts
window.syncAuthStates = syncAuthStates; 