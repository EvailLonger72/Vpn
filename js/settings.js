// settings.js - Handles settings page functionality

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
    
    // Load settings from localStorage
    const settings = JSON.parse(localStorage.getItem('strawberryVpnSettings') || '{}');
    
    // Set default settings if not available
    if (Object.keys(settings).length === 0) {
        settings.autoConnect = false;
        settings.killSwitch = false;
        settings.dnsProtection = true;
        settings.protocol = 'auto';
        settings.port = 'auto';
        settings.timeout = 30;
        settings.webrtcProtection = true;
        settings.ipv6Protection = true;
        settings.dataCollection = false;
        settings.customDns = false;
        settings.primaryDns = '';
        settings.secondaryDns = '';
        settings.theme = 'light';
        settings.language = 'en';
        settings.notifications = true;
        
        // Save default settings
        localStorage.setItem('strawberryVpnSettings', JSON.stringify(settings));
    }
    
    // Apply settings to form elements
    document.getElementById('auto-connect').checked = settings.autoConnect;
    document.getElementById('kill-switch').checked = settings.killSwitch;
    document.getElementById('dns-protection').checked = settings.dnsProtection;
    document.getElementById('protocol').value = settings.protocol;
    document.getElementById('port').value = settings.port;
    document.getElementById('timeout').value = settings.timeout;
    document.getElementById('webrtc-protection').checked = settings.webrtcProtection;
    document.getElementById('ipv6-protection').checked = settings.ipv6Protection;
    document.getElementById('data-collection').checked = settings.dataCollection;
    document.getElementById('custom-dns').checked = settings.customDns;
    document.getElementById('theme').value = settings.theme;
    document.getElementById('app-language').value = settings.language;
    document.getElementById('notifications').checked = settings.notifications;
    
    // Show/hide custom DNS inputs based on setting
    const customDnsServers = document.querySelector('.custom-dns-servers');
    const customDnsCheckbox = document.getElementById('custom-dns');
    
    if (customDnsServers && customDnsCheckbox) {
        if (settings.customDns) {
            customDnsServers.style.display = 'flex';
            document.getElementById('primary-dns').value = settings.primaryDns;
            document.getElementById('secondary-dns').value = settings.secondaryDns;
        }
        
        customDnsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                customDnsServers.style.display = 'flex';
            } else {
                customDnsServers.style.display = 'none';
            }
        });
    }
    
    // Save settings
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            // Get settings from form elements
            settings.autoConnect = document.getElementById('auto-connect').checked;
            settings.killSwitch = document.getElementById('kill-switch').checked;
            settings.dnsProtection = document.getElementById('dns-protection').checked;
            settings.protocol = document.getElementById('protocol').value;
            settings.port = document.getElementById('port').value;
            settings.timeout = document.getElementById('timeout').value;
            settings.webrtcProtection = document.getElementById('webrtc-protection').checked;
            settings.ipv6Protection = document.getElementById('ipv6-protection').checked;
            settings.dataCollection = document.getElementById('data-collection').checked;
            settings.customDns = document.getElementById('custom-dns').checked;
            settings.theme = document.getElementById('theme').value;
            settings.language = document.getElementById('app-language').value;
            settings.notifications = document.getElementById('notifications').checked;
            
            // Get custom DNS values if enabled
            if (settings.customDns) {
                settings.primaryDns = document.getElementById('primary-dns').value;
                settings.secondaryDns = document.getElementById('secondary-dns').value;
            }
            
            // Save settings
            localStorage.setItem('strawberryVpnSettings', JSON.stringify(settings));
            
            // Show success message
            alert('Settings saved successfully!');
        });
    }
    
    // Reset settings
    const resetSettingsBtn = document.getElementById('reset-settings');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                // Clear settings
                localStorage.removeItem('strawberryVpnSettings');
                
                // Reload page
                window.location.reload();
            }
        });
    }
    
    // Split tunneling modal
    const splitTunnelingBtn = document.getElementById('split-tunneling-btn');
    const splitTunnelingModal = document.getElementById('split-tunneling-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    
    if (splitTunnelingBtn && splitTunnelingModal) {
        splitTunnelingBtn.addEventListener('click', function() {
            splitTunnelingModal.classList.add('show');
        });
        
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                splitTunnelingModal.classList.remove('show');
            });
        }
        
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', function() {
                splitTunnelingModal.classList.remove('show');
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === splitTunnelingModal) {
                splitTunnelingModal.classList.remove('show');
            }
        });
    }
    
    // Apply theme
    if (settings.theme) {
        document.body.classList.add(`theme-${settings.theme}`);
    }
});