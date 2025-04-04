// account.js - Handles account page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (in a real app, this would be more secure)
    const userData = JSON.parse(localStorage.getItem('strawberryVpnUser') || '{}');
    if (!userData.isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Update user information
    const userNameElement = document.getElementById('user-name');
    const accountTypeElement = document.getElementById('account-type');
    const subscriptionBadge = document.getElementById('subscription-badge');
    const planBadge = document.getElementById('plan-badge');
    const emailInput = document.getElementById('email');
    
    if (userNameElement) {
        userNameElement.textContent = userData.email || 'User';
    }
    
    if (accountTypeElement) {
        if (userData.accountType === 'premium') {
            accountTypeElement.textContent = 'Premium Account';
            accountTypeElement.classList.remove('free');
            accountTypeElement.classList.add('premium');
        } else {
            accountTypeElement.textContent = 'Free Account';
        }
    }
    
    if (subscriptionBadge) {
        if (userData.accountType === 'premium') {
            subscriptionBadge.classList.remove('free');
            subscriptionBadge.classList.add('premium');
            subscriptionBadge.innerHTML = '<i class="fas fa-crown"></i><span>Premium Account</span>';
            
            // Hide upgrade buttons
            document.querySelectorAll('.upgrade-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }
    
    if (planBadge) {
        if (userData.accountType === 'premium') {
            planBadge.classList.remove('free');
            planBadge.classList.add('premium');
            planBadge.textContent = 'Premium Plan';
        }
    }
    
    if (emailInput) {
        emailInput.value = userData.email || '';
    }
    
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const dashboardMain = document.querySelector('.dashboard-main');
    
    if (sidebarToggle && sidebar && dashboardMain) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            dashboardMain.classList.toggle('expanded');
        });
    }
    
    // Mobile sidebar functionality
    function handleMobileSidebar() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            dashboardMain.classList.add('expanded');
            
            // Add mobile-specific event listener
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('mobile-visible');
            });
            
            // Close sidebar when clicking outside
            document.addEventListener('click', function(e) {
                if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
                    sidebar.classList.remove('mobile-visible');
                }
            });
        } else {
            sidebar.classList.remove('mobile-visible');
        }
    }
    
    // Run on page load
    handleMobileSidebar();
    
    // Run on window resize
    window.addEventListener('resize', handleMobileSidebar);
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear user data
            localStorage.removeItem('strawberryVpnUser');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = document.getElementById('full-name').value;
            const country = document.getElementById('country').value;
            const language = document.getElementById('language').value;
            const bio = document.getElementById('bio').value;
            
            // Update user data
            userData.fullName = fullName;
            userData.country = country;
            userData.language = language;
            userData.bio = bio;
            
            // Save updated user data
            localStorage.setItem('strawberryVpnUser', JSON.stringify(userData));
            
            // Show success message
            alert('Profile updated successfully!');
        });
    }
    
    // Security form submission
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate form
            if (!currentPassword) {
                alert('Please enter your current password.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match.');
                return;
            }
            
            // In a real app, you would verify the current password and update the password on the server
            
            // Show success message
            alert('Password updated successfully!');
            
            // Clear form
            securityForm.reset();
        });
    }
    
    // Avatar upload functionality
    const avatarUpload = document.getElementById('avatar-upload');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (avatarUpload && profileAvatar) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Create image element
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Profile Avatar';
                    img.className = 'avatar-image';
                    
                    // Clear existing content and add image
                    profileAvatar.innerHTML = '';
                    profileAvatar.appendChild(img);
                    
                    // Store avatar in user data
                    userData.avatar = e.target.result;
                    localStorage.setItem('strawberryVpnUser', JSON.stringify(userData));
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Load avatar from user data if available
        if (userData.avatar) {
            const img = document.createElement('img');
            img.src = userData.avatar;
            img.alt = 'Profile Avatar';
            img.className = 'avatar-image';
            
            profileAvatar.innerHTML = '';
            profileAvatar.appendChild(img);
        }
    }
    
    // Upgrade buttons
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    const paymentModal = document.getElementById('payment-modal');
    const modalClose = document.querySelector('.modal-close');
    
    if (upgradeButtons.length > 0 && paymentModal) {
        upgradeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                paymentModal.classList.add('show');
            });
        });
        
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                paymentModal.classList.remove('show');
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                paymentModal.classList.remove('show');
            }
        });
    }
    
    // Payment form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, you would process the payment here
            
            // Update user to premium
            userData.accountType = 'premium';
            localStorage.setItem('strawberryVpnUser', JSON.stringify(userData));
            
            // Show success message
            alert('Payment successful! You are now a premium user.');
            
            // Reload page to update UI
            window.location.reload();
        });
    }
});