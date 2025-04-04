// Settings page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Display user information
    displayUserInfo(user);

    // Initialize settings tabs
    initSettingsTabs();

    // Initialize form controls
    initFormControls();

    // Setup event listeners
    setupEventListeners();

    // Load user preferences
    loadUserPreferences(user);
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
    const accountTypeBadge = document.getElementById('accountTypeBadge');
    if (accountTypeBadge) {
        if (user.isPremium) {
            accountTypeBadge.textContent = 'Premium Account';
            accountTypeBadge.classList.remove('free');
            accountTypeBadge.classList.add('premium');
            
            // Hide upgrade buttons
            const upgradeButtons = document.querySelectorAll('.btn-upgrade, .btn-upgrade-small, .btn-upgrade-large');
            upgradeButtons.forEach(button => {
                button.style.display = 'none';
            });
            
            // Show premium content
            const premiumContent = document.querySelectorAll('.premium-only');
            premiumContent.forEach(element => {
                element.style.display = 'block';
            });
        } else {
            accountTypeBadge.textContent = 'Free Account';
            accountTypeBadge.classList.remove('premium');
            accountTypeBadge.classList.add('free');
        }
    }
}

// Initialize settings tabs
function initSettingsTabs() {
    const tabButtons = document.querySelectorAll('.settings-nav-btn');
    const tabContents = document.querySelectorAll('.settings-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding tab content
            const tabName = button.getAttribute('data-tab');
            const tabContent = document.getElementById(tabName + '-tab');
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

// Initialize form controls
function initFormControls() {
    // Initialize toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingName = this.closest('.setting-item').querySelector('.setting-label span').textContent;
            const settingValue = this.checked;
            saveSetting(settingName, settingValue);
        });
    });
    
    // Initialize select inputs
    const selectInputs = document.querySelectorAll('.settings-select');
    selectInputs.forEach(select => {
        select.addEventListener('change', function() {
            const settingName = this.closest('.setting-item').querySelector('.setting-label span').textContent;
            const settingValue = this.value;
            saveSetting(settingName, settingValue);
        });
    });
    
    // Initialize radio buttons
    const radioGroups = document.querySelectorAll('.radio-group, .theme-selector, .color-selector');
    radioGroups.forEach(group => {
        const radios = group.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    const settingGroup = this.name;
                    const settingValue = this.value;
                    saveSetting(settingGroup, settingValue);
                    
                    // For color selector, update the selected class
                    if (this.name === 'accentColor') {
                        const colorOptions = document.querySelectorAll('.color-option');
                        colorOptions.forEach(option => option.classList.remove('selected'));
                        this.closest('.color-option').classList.add('selected');
                        
                        // Apply the color theme
                        applyAccentColor(settingValue);
                    }
                    
                    // For theme selector, apply the theme
                    if (this.name === 'theme') {
                        applyTheme(settingValue);
                    }
                }
            });
        });
    });
}

// Save a setting to localStorage
function saveSetting(name, value) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Initialize settings object if it doesn't exist
    if (!user.settings) {
        user.settings = {};
    }
    
    // Save the setting
    user.settings[name.toLowerCase().replace(/\s+/g, '_')] = value;
    
    // Save back to localStorage
    localStorage.setItem('vpnUser', JSON.stringify(user));
    
    // Show a save confirmation
    showSaveConfirmation();
}

// Load user preferences from localStorage
function loadUserPreferences(user) {
    if (!user || !user.settings) return;
    
    const settings = user.settings;
    
    // Load toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    toggleSwitches.forEach(toggle => {
        const settingName = toggle.closest('.setting-item').querySelector('.setting-label span').textContent;
        const settingKey = settingName.toLowerCase().replace(/\s+/g, '_');
        
        if (settings[settingKey] !== undefined) {
            toggle.checked = settings[settingKey];
        }
    });
    
    // Load select inputs
    const selectInputs = document.querySelectorAll('.settings-select');
    selectInputs.forEach(select => {
        const settingName = select.closest('.setting-item').querySelector('.setting-label span').textContent;
        const settingKey = settingName.toLowerCase().replace(/\s+/g, '_');
        
        if (settings[settingKey]) {
            select.value = settings[settingKey];
        }
    });
    
    // Load radio buttons
    if (settings.theme) {
        const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
            applyTheme(settings.theme);
        }
    }
    
    if (settings.accent_color) {
        const colorRadio = document.querySelector(`input[name="accentColor"][value="${settings.accent_color}"]`);
        if (colorRadio) {
            colorRadio.checked = true;
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(option => option.classList.remove('selected'));
            colorRadio.closest('.color-option').classList.add('selected');
            applyAccentColor(settings.accent_color);
        }
    }
    
    if (settings.time_format) {
        const timeFormatRadio = document.querySelector(`input[name="timeFormat"][value="${settings.time_format}"]`);
        if (timeFormatRadio) {
            timeFormatRadio.checked = true;
        }
    }
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
    
    // Upgrade button
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            window.location.href = 'premium.html';
        });
    }
    
    // Large upgrade button
    const btnUpgradeLarge = document.querySelector('.btn-upgrade-large');
    if (btnUpgradeLarge) {
        btnUpgradeLarge.addEventListener('click', function() {
            window.location.href = 'premium.html';
        });
    }
    
    // Change password button
    const btnChangePassword = document.querySelector('button.btn-settings-action');
    if (btnChangePassword) {
        btnChangePassword.addEventListener('click', function() {
            // In a real app, show a change password modal or redirect to a secure page
            alert('This feature would open a secure password change dialog in a real application.');
        });
    }
    
    // About buttons
    const aboutButtons = document.querySelectorAll('.btn-about');
    aboutButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            alert(`This would open the ${buttonText} page in a real application.`);
        });
    });
}

// Apply theme
function applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark', 'theme-system');
    
    // Add new theme class
    body.classList.add(`theme-${theme}`);
    
    // If system theme, detect user's preference
    if (theme === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('theme-dark');
        } else {
            body.classList.add('theme-light');
        }
    }
}

// Apply accent color
function applyAccentColor(color) {
    const body = document.body;
    
    // Remove existing color classes
    body.classList.remove('color-strawberry', 'color-blueberry', 'color-lime', 'color-orange', 'color-grape');
    
    // Add new color class
    body.classList.add(`color-${color}`);
}

// Show a save confirmation
function showSaveConfirmation() {
    const confirmationEl = document.createElement('div');
    confirmationEl.className = 'settings-saved-confirmation';
    confirmationEl.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Settings saved</span>
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