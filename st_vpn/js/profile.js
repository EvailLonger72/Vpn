// Profile page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Display user information
    displayUserInfo(user);

    // Load user profile data
    loadUserProfile(user);

    // Setup event listeners
    setupEventListeners();
});

// Get current user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('vpnUser');
    if (!userJson) return null;
    
    try {
        return JSON.parse(userJson);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

// Display user information in the header and sidebar
function displayUserInfo(user) {
    // Display user email
    const userEmailElements = document.querySelectorAll('#userEmail');
    userEmailElements.forEach(element => {
        element.textContent = user.email || 'user@example.com';
    });

    // Set account type badge
    const accountTypeBadges = document.querySelectorAll('#accountTypeBadge, #profileAccountType');
    accountTypeBadges.forEach(badge => {
        if (user.isPremium) {
            badge.textContent = 'Premium Account';
            badge.classList.remove('free');
            badge.classList.add('premium');
            
            // Hide upgrade buttons
            const upgradeButtons = document.querySelectorAll('.btn-upgrade, .btn-upgrade-small');
            upgradeButtons.forEach(button => {
                button.style.display = 'none';
            });
            
            // Update data usage section for premium users
            const dataLimitBadge = document.getElementById('dataLimitBadge');
            if (dataLimitBadge) {
                dataLimitBadge.textContent = 'Unlimited';
                dataLimitBadge.classList.remove('free');
                dataLimitBadge.classList.add('premium');
            }
            
            const dataLimit = document.getElementById('dataLimit');
            if (dataLimit) {
                dataLimit.textContent = 'Unlimited';
            }
            
            const dataUsageInfo = document.querySelector('.data-usage-info p');
            if (dataUsageInfo) {
                dataUsageInfo.innerHTML = 'Your premium plan includes <span class="highlight">unlimited</span> data usage. Enjoy!';
            }
            
            const dataUsageFill = document.querySelector('.data-usage-fill');
            if (dataUsageFill) {
                dataUsageFill.style.width = '100%';
                dataUsageFill.classList.add('premium-bar');
            }
        } else {
            badge.textContent = 'Free Account';
            badge.classList.remove('premium');
            badge.classList.add('free');
        }
    });
}

// Load user profile data
function loadUserProfile(user) {
    // Profile email
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) {
        profileEmail.textContent = user.email || 'user@example.com';
    }
    
    // Profile username - generate from email if not set
    const profileUsername = document.getElementById('profileUsername');
    if (profileUsername) {
        profileUsername.textContent = user.username || user.email.split('@')[0] || 'strawberry_user';
    }
    
    // Join date - use a random date in the past if not set
    const profileJoinDate = document.getElementById('profileJoinDate');
    if (profileJoinDate) {
        if (user.joinDate) {
            profileJoinDate.textContent = user.joinDate;
        } else {
            // Generate a random join date within the last year
            const now = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            const randomTimestamp = oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime());
            const randomDate = new Date(randomTimestamp);
            
            // Format the date
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            profileJoinDate.textContent = randomDate.toLocaleDateString('en-US', options);
            
            // Save the join date for future reference
            user.joinDate = profileJoinDate.textContent;
            localStorage.setItem('vpnUser', JSON.stringify(user));
        }
    }
    
    // Load user profile fields if they exist
    if (user.profile) {
        const { firstName, lastName, displayName } = user.profile;
        
        if (firstName) {
            document.getElementById('profileFirstName').value = firstName;
        }
        
        if (lastName) {
            document.getElementById('profileLastName').value = lastName;
        }
        
        if (displayName) {
            document.getElementById('profileDisplayName').value = displayName;
        }
        
        // Load timezone and language if they exist
        if (user.profile.timezone) {
            document.getElementById('profileTimezone').value = user.profile.timezone;
        }
        
        if (user.profile.language) {
            document.getElementById('profileLanguage').value = user.profile.language;
        }
    }
    
    // Load usage statistics
    loadUsageStatistics(user);
}

// Load usage statistics
function loadUsageStatistics(user) {
    // If stats don't exist, generate random data
    if (!user.stats) {
        user.stats = generateRandomStats(user.isPremium);
        localStorage.setItem('vpnUser', JSON.stringify(user));
    }
    
    const { totalTime, serversUsed, dataDownloaded, dataUploaded, dataUsed } = user.stats;
    
    // Set values in the stats display
    document.getElementById('statTotalTime').textContent = totalTime;
    document.getElementById('statServersUsed').textContent = serversUsed;
    document.getElementById('statDataDownloaded').textContent = dataDownloaded;
    document.getElementById('statDataUploaded').textContent = dataUploaded;
    
    // Set data usage bar
    document.getElementById('dataUsed').textContent = dataUsed;
    
    if (!user.isPremium) {
        // Calculate percentage for free users (out of 10GB)
        const usedGB = parseFloat(dataUsed.replace(' GB', ''));
        const percentUsed = Math.min(100, (usedGB / 10) * 100);
        document.querySelector('.data-usage-fill').style.width = `${percentUsed}%`;
        
        // Calculate days until reset (random between 1-30)
        const daysRemaining = Math.floor(Math.random() * 30) + 1;
        document.getElementById('dataResetDays').textContent = daysRemaining;
    }
}

// Generate random statistics for the user
function generateRandomStats(isPremium) {
    // Total connection time (between 10h and 300h)
    const hours = Math.floor(Math.random() * 290) + 10;
    const minutes = Math.floor(Math.random() * 60);
    const totalTime = `${hours}h ${minutes}m`;
    
    // Servers used (between 3 and 15)
    const serversUsed = Math.floor(Math.random() * 13) + 3;
    
    // Data downloaded (between 1GB and 50GB)
    const downloadedGB = (Math.random() * 49 + 1).toFixed(1);
    const dataDownloaded = `${downloadedGB} GB`;
    
    // Data uploaded (about 1/4 of downloaded)
    const uploadedGB = (downloadedGB / 4).toFixed(1);
    const dataUploaded = `${uploadedGB} GB`;
    
    // Data used (sum of download and upload)
    const totalGB = (parseFloat(downloadedGB) + parseFloat(uploadedGB)).toFixed(1);
    const dataUsed = `${totalGB} GB`;
    
    return {
        totalTime,
        serversUsed,
        dataDownloaded,
        dataUploaded,
        dataUsed
    };
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('vpnUser');
            window.location.href = 'index.html';
        });
    }
    
    // Upgrade buttons
    const upgradeButtons = document.querySelectorAll('#upgradeBtn, .btn-upgrade-small');
    upgradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = 'premium.html';
        });
    });
    
    // Save profile button
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', function() {
            saveUserProfile();
        });
    }
    
    // Cancel button
    const btnCancel = document.querySelector('.btn-secondary');
    if (btnCancel) {
        btnCancel.addEventListener('click', function() {
            // Reload the page to reset the form
            window.location.reload();
        });
    }
    
    // Delete account button
    const btnDeleteAccount = document.getElementById('btnDeleteAccount');
    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener('click', function() {
            // Show the delete confirmation modal
            document.getElementById('deleteAccountModal').style.display = 'flex';
        });
    }
    
    // Close modal button
    const btnCloseModal = document.querySelector('.btn-close-modal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', function() {
            document.getElementById('deleteAccountModal').style.display = 'none';
        });
    }
    
    // Cancel delete button
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', function() {
            document.getElementById('deleteAccountModal').style.display = 'none';
        });
    }
    
    // Delete confirmation input
    const deleteConfirmInput = document.getElementById('deleteConfirmInput');
    if (deleteConfirmInput) {
        deleteConfirmInput.addEventListener('input', function() {
            const btnConfirmDelete = document.getElementById('btnConfirmDelete');
            btnConfirmDelete.disabled = this.value !== 'delete my account';
        });
    }
    
    // Confirm delete button
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', function() {
            // Delete the user account
            localStorage.removeItem('vpnUser');
            // Redirect to the login page
            window.location.href = 'index.html?deleted=true';
        });
    }
    
    // Avatar edit button
    const btnAvatarEdit = document.querySelector('.btn-avatar-edit');
    if (btnAvatarEdit) {
        btnAvatarEdit.addEventListener('click', function() {
            // In a real app, this would open a file picker or avatar selection modal
            alert('This would open an avatar selection dialog in a real application.');
        });
    }
}

// Save user profile data
function saveUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Initialize profile object if it doesn't exist
    if (!user.profile) {
        user.profile = {};
    }
    
    // Get form values
    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const displayName = document.getElementById('profileDisplayName').value;
    const timezone = document.getElementById('profileTimezone').value;
    const language = document.getElementById('profileLanguage').value;
    
    // Update profile data
    user.profile.firstName = firstName;
    user.profile.lastName = lastName;
    user.profile.displayName = displayName;
    user.profile.timezone = timezone;
    user.profile.language = language;
    
    // Update username if display name is provided
    if (displayName) {
        user.username = displayName;
        document.getElementById('profileUsername').textContent = displayName;
    }
    
    // Save back to localStorage
    localStorage.setItem('vpnUser', JSON.stringify(user));
    
    // Show confirmation
    showSaveConfirmation();
}

// Show a save confirmation
function showSaveConfirmation() {
    const confirmationEl = document.createElement('div');
    confirmationEl.className = 'settings-saved-confirmation';
    confirmationEl.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Profile saved</span>
    `;
    
    document.body.appendChild(confirmationEl);
    
    // Animate in
    setTimeout(() => {
        confirmationEl.classList.add('show');
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        confirmationEl.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(confirmationEl);
        }, 300);
    }, 2000);
} 