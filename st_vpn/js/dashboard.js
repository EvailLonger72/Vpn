// Strawberry VPN - Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication check
    checkAuth();

    // Load user data
    loadUserData();

    // Set up event listeners
    setupEventListeners();

    // Initialize UI elements
    initUI();
});

// Authentication check
function checkAuth() {
    const authState = getAuthState();
    
    // If not logged in, redirect to login
    if (!authState.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // If premium user but on free dashboard, redirect to premium
    if (authState.accountType === 'premium' && !window.location.href.includes('premium.html')) {
        window.location.href = 'premium.html';
    }
    
    // If free user but on premium dashboard, redirect to regular
    if (authState.accountType === 'free' && window.location.href.includes('premium.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Get authentication state from localStorage
function getAuthState() {
    const authStateStr = localStorage.getItem('vpnAuthState');
    return authStateStr ? JSON.parse(authStateStr) : { isLoggedIn: false };
}

// Load user data into UI
function loadUserData() {
    const authState = getAuthState();
    const userEmail = document.getElementById('userEmail');
    const accountTypeBadge = document.getElementById('accountTypeBadge');
    
    if (userEmail) {
        userEmail.textContent = authState.email;
    }
    
    if (accountTypeBadge) {
        accountTypeBadge.textContent = authState.accountType === 'premium' ? 'Premium Account' : 'Free Account';
        accountTypeBadge.className = `account-type ${authState.accountType}`;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Connect/Disconnect Button
    const connectButton = document.getElementById('connectButton');
    if (connectButton) {
        connectButton.addEventListener('click', toggleConnection);
    }
    
    // Server Selection
    const serverOptions = document.querySelectorAll('.server-option');
    serverOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectServer(this);
        });
    });
    
    // Upgrade button (for free users)
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            upgradeAccount();
        });
    }
    
    const upgradeSmallBtn = document.querySelector('.btn-upgrade-small');
    if (upgradeSmallBtn) {
        upgradeSmallBtn.addEventListener('click', function() {
            upgradeAccount();
        });
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        // Initialize dark mode based on saved preference
        initializeDarkMode();
    }
    
    // Favorite server buttons
    const favoriteButtons = document.querySelectorAll('.favorite-server');
    if (favoriteButtons.length > 0) {
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering server selection
                toggleFavoriteServer(this.closest('.server-option').getAttribute('data-server'));
            });
        });
    }
    
    // Auto-connect toggle
    const autoConnectToggle = document.getElementById('autoConnectToggle');
    if (autoConnectToggle) {
        autoConnectToggle.addEventListener('change', toggleAutoConnect);
        // Initialize auto-connect based on saved preference
        initializeAutoConnect();
    }

    // Quick connect button
    const quickConnectBtn = document.getElementById('quickConnectBtn');
    if (quickConnectBtn) {
        quickConnectBtn.addEventListener('click', connectToQuickServer);
    }
}

// Initialize UI components
function initUI() {
    // VPN connection state
    window.vpnState = {
        isConnected: false,
        isConnecting: false,
        selectedServer: null,
        connectionStartTime: null,
        currentIP: null,
        stats: {
            downloadSpeed: 0,
            uploadSpeed: 0,
            ping: 0,
            dataUsed: 0
        }
    };
    
    // Update stats periodically
    setInterval(updateConnectionStats, 1000);
    
    // Initialize favorites UI
    updateFavoriteServersUI();
}

// Animate UI elements on connection
function animateConnectionElements(isConnected) {
    // Find all elements to animate
    const statusCard = document.querySelector('.status-card');
    const statItems = document.querySelectorAll('.stat-item');
    
    if (isConnected) {
        // Add animation classes
        if (statusCard) {
            statusCard.classList.add('connected-state');
        }
        
        // Animate stat items one after another
        statItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('stat-active');
            }, index * 200);
        });
    } else {
        // Remove animation classes
        if (statusCard) {
            statusCard.classList.remove('connected-state');
        }
        
        statItems.forEach(item => {
            item.classList.remove('stat-active');
        });
    }
}

// Toggle VPN connection
function toggleConnection() {
    // Get UI elements
    const connectButton = document.getElementById('connectButton');
    const indicator = document.querySelector('.indicator');
    const statusText = document.getElementById('connectionStatus');
    const ipAddress = document.getElementById('ipAddress');
    
    // Check if a server is selected
    if (!window.vpnState.selectedServer && !window.vpnState.isConnected) {
        alert('Please select a server before connecting');
        return;
    }
    
    // If already connected, disconnect
    if (window.vpnState.isConnected) {
        // Update UI
        connectButton.textContent = 'Connect';
        connectButton.className = 'btn-connect';
        indicator.className = 'indicator offline';
        statusText.textContent = 'Disconnected';
        ipAddress.textContent = 'Not connected';
        
        // Reset connection timer
        window.vpnState.connectionStartTime = null;
        document.getElementById('connectionTime').textContent = '00:00:00';
        
        // Update state
        window.vpnState.isConnected = false;
        window.vpnState.currentIP = null;
        
        // Reset stats
        resetConnectionStats();
        
        // Animate UI elements
        animateConnectionElements(false);
        
        return;
    }
    
    // If not connected, start connecting
    if (!window.vpnState.isConnecting) {
        // Start connecting process
        window.vpnState.isConnecting = true;
        
        // Update UI for connecting state
        connectButton.textContent = 'Connecting...';
        connectButton.className = 'btn-connect connecting';
        indicator.className = 'indicator connecting';
        statusText.textContent = 'Connecting...';
        
        // Simulate connection delay
        setTimeout(() => {
            // Connection successful
            window.vpnState.isConnected = true;
            window.vpnState.isConnecting = false;
            window.vpnState.connectionStartTime = new Date();
            window.vpnState.currentIP = generateRandomIP();
            
            // Update UI for connected state
            connectButton.textContent = 'Disconnect';
            connectButton.className = 'btn-connect disconnect';
            indicator.className = 'indicator online';
            statusText.textContent = 'Connected';
            ipAddress.textContent = window.vpnState.currentIP;
            
            // Start simulating data
            startSimulatingNetworkActivity();
            
            // Animate UI elements
            animateConnectionElements(true);
        }, 2000);
    }
}

// Select a server
function selectServer(serverElement) {
    // Remove selection from all servers
    document.querySelectorAll('.server-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked server
    serverElement.classList.add('selected');
    
    // Update state
    window.vpnState.selectedServer = serverElement.getAttribute('data-server');
    
    // If already connected, disconnect first
    if (window.vpnState.isConnected) {
        toggleConnection();
    }
    
    // Store last used server
    localStorage.setItem('vpnLastServer', window.vpnState.selectedServer);
    
    // Update UI for favorites
    const favoriteBtn = serverElement.querySelector('.favorite-server');
    if (favoriteBtn) {
        const favorites = JSON.parse(localStorage.getItem('vpnFavoriteServers') || '[]');
        if (favorites.includes(window.vpnState.selectedServer)) {
            favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
            favoriteBtn.classList.add('favorited');
        } else {
            favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
            favoriteBtn.classList.remove('favorited');
        }
    }
}

// Update connection statistics
function updateConnectionStats() {
    if (!window.vpnState.isConnected) return;
    
    // Update connection time
    if (window.vpnState.connectionStartTime) {
        const elapsed = new Date() - window.vpnState.connectionStartTime;
        document.getElementById('connectionTime').textContent = formatTime(elapsed);
    }
    
    // Update stats display
    const downloadSpeed = document.getElementById('downloadSpeed');
    const uploadSpeed = document.getElementById('uploadSpeed');
    const pingValue = document.getElementById('pingValue');
    const dataUsed = document.getElementById('dataUsed');
    
    if (downloadSpeed) downloadSpeed.textContent = window.vpnState.stats.downloadSpeed.toFixed(2);
    if (uploadSpeed) uploadSpeed.textContent = window.vpnState.stats.uploadSpeed.toFixed(2);
    if (pingValue) pingValue.textContent = window.vpnState.stats.ping;
    if (dataUsed) dataUsed.textContent = window.vpnState.stats.dataUsed.toFixed(2);
}

// Reset connection statistics
function resetConnectionStats() {
    window.vpnState.stats = {
        downloadSpeed: 0,
        uploadSpeed: 0,
        ping: 0,
        dataUsed: 0
    };
    
    updateConnectionStats();
}

// Start simulating network activity
function startSimulatingNetworkActivity() {
    if (!window.vpnState.statSimInterval) {
        window.vpnState.statSimInterval = setInterval(() => {
            if (!window.vpnState.isConnected) {
                clearInterval(window.vpnState.statSimInterval);
                window.vpnState.statSimInterval = null;
                return;
            }
            
            // Simulate fluctuating speeds
            window.vpnState.stats.downloadSpeed = Math.random() * 5 + 1; // 1-6 MB/s
            window.vpnState.stats.uploadSpeed = Math.random() * 2 + 0.5; // 0.5-2.5 MB/s
            window.vpnState.stats.ping = Math.floor(Math.random() * 50) + 50; // 50-100ms
            
            // Accumulate data usage
            const downloadData = window.vpnState.stats.downloadSpeed * 0.001; // Convert to GB
            const uploadData = window.vpnState.stats.uploadSpeed * 0.0005; // Convert to GB
            window.vpnState.stats.dataUsed += downloadData + uploadData;
        }, 2000);
    }
}

// Helper function to format time as HH:MM:SS
function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    
    seconds = seconds % 60;
    minutes = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generate a random IP address
function generateRandomIP() {
    const octet = () => Math.floor(Math.random() * 255) + 1;
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
}

// Upgrade account (simulated)
function upgradeAccount() {
    const authState = getAuthState();
    
    // Already premium
    if (authState.accountType === 'premium') {
        alert('You are already a premium user!');
        return;
    }
    
    // Simulate upgrade process
    const confirmed = confirm('Upgrade to premium for $9.99/month?');
    if (confirmed) {
        // Update auth state
        authState.accountType = 'premium';
        localStorage.setItem('vpnAuthState', JSON.stringify(authState));
        
        // Update user in storage
        const users = JSON.parse(localStorage.getItem('vpnUsers') || '[]');
        const userIndex = users.findIndex(u => u.email === authState.email);
        if (userIndex >= 0) {
            users[userIndex].accountType = 'premium';
            localStorage.setItem('vpnUsers', JSON.stringify(users));
        }
        
        // Redirect to premium dashboard
        alert('Upgrade successful! Redirecting to premium dashboard...');
        window.location.href = 'premium.html';
    }
}

// Logout function
function logout() {
    // Clear auth state from localStorage
    localStorage.removeItem('vpnAuthState');
    localStorage.removeItem('vpnUser');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Dark mode functionality
function toggleDarkMode() {
    document.body.classList.toggle('theme-dark');
    // Save preference
    const isDarkMode = document.body.classList.contains('theme-dark');
    localStorage.setItem('vpnDarkMode', isDarkMode);
    
    // Update toggle icon/text if needed
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        if (isDarkMode) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
    }
}

function initializeDarkMode() {
    const isDarkMode = localStorage.getItem('vpnDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('theme-dark');
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }
    }
}

// Favorite servers functionality
function toggleFavoriteServer(serverId) {
    // Get current favorites
    let favorites = JSON.parse(localStorage.getItem('vpnFavoriteServers') || '[]');
    
    if (favorites.includes(serverId)) {
        // Remove from favorites
        favorites = favorites.filter(id => id !== serverId);
    } else {
        // Add to favorites
        favorites.push(serverId);
    }
    
    // Save updated favorites
    localStorage.setItem('vpnFavoriteServers', JSON.stringify(favorites));
    
    // Update UI
    updateFavoriteServersUI();
}

function updateFavoriteServersUI() {
    const favorites = JSON.parse(localStorage.getItem('vpnFavoriteServers') || '[]');
    
    // Update favorite buttons
    document.querySelectorAll('.server-option').forEach(server => {
        const serverId = server.getAttribute('data-server');
        const favoriteBtn = server.querySelector('.favorite-server');
        
        if (favoriteBtn) {
            if (favorites.includes(serverId)) {
                favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
                favoriteBtn.classList.add('favorited');
            } else {
                favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
                favoriteBtn.classList.remove('favorited');
            }
        }
    });
    
    // Update favorites section if it exists
    const favoritesList = document.getElementById('favoriteServersList');
    if (favoritesList) {
        favoritesList.innerHTML = '';
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">No favorite servers added yet.</p>';
        } else {
            favorites.forEach(serverId => {
                const serverOption = document.querySelector(`.server-option[data-server="${serverId}"]`);
                if (serverOption) {
                    const clone = serverOption.cloneNode(true);
                    favoritesList.appendChild(clone);
                    
                    // Add event listener to cloned element
                    clone.addEventListener('click', function() {
                        selectServer(this);
                    });
                }
            });
        }
    }
}

// Auto-connect functionality
function toggleAutoConnect() {
    const autoConnectToggle = document.getElementById('autoConnectToggle');
    if (autoConnectToggle) {
        const isEnabled = autoConnectToggle.checked;
        localStorage.setItem('vpnAutoConnect', isEnabled);
        
        if (isEnabled && !window.vpnState.isConnected) {
            // If enabled but not connected, ask for confirmation
            const confirmed = confirm('Would you like to connect to VPN now?');
            if (confirmed && window.vpnState.selectedServer) {
                toggleConnection();
            }
        }
    }
}

function initializeAutoConnect() {
    const autoConnectToggle = document.getElementById('autoConnectToggle');
    if (autoConnectToggle) {
        const isEnabled = localStorage.getItem('vpnAutoConnect') === 'true';
        autoConnectToggle.checked = isEnabled;
        
        // If auto-connect is enabled and we're not connected, connect to last server
        if (isEnabled && !window.vpnState.isConnected) {
            // Get last used server
            const lastServer = localStorage.getItem('vpnLastServer');
            if (lastServer) {
                const serverOption = document.querySelector(`.server-option[data-server="${lastServer}"]`);
                if (serverOption) {
                    // Select the server
                    selectServer(serverOption);
                    
                    // Connect after a short delay
                    setTimeout(() => {
                        toggleConnection();
                    }, 1000);
                }
            }
        }
    }
}

// Quick connect functionality
function connectToQuickServer() {
    // First try to connect to a favorite server with lowest ping
    const favorites = JSON.parse(localStorage.getItem('vpnFavoriteServers') || '[]');
    
    let bestServer = null;
    let lowestPing = 999;
    
    // First check favorites
    if (favorites.length > 0) {
        favorites.forEach(serverId => {
            const serverEl = document.querySelector(`.server-option[data-server="${serverId}"]`);
            if (serverEl) {
                const pingEl = serverEl.querySelector('.server-ping');
                if (pingEl) {
                    const pingMatch = pingEl.textContent.match(/(\d+)/);
                    if (pingMatch && pingMatch[1]) {
                        const ping = parseInt(pingMatch[1]);
                        if (ping < lowestPing) {
                            lowestPing = ping;
                            bestServer = serverEl;
                        }
                    }
                }
            }
        });
    }
    
    // If no favorite with ping found, just get any server with lowest ping
    if (!bestServer) {
        document.querySelectorAll('.server-option').forEach(server => {
            const pingEl = server.querySelector('.server-ping');
            if (pingEl) {
                const pingMatch = pingEl.textContent.match(/(\d+)/);
                if (pingMatch && pingMatch[1]) {
                    const ping = parseInt(pingMatch[1]);
                    if (ping < lowestPing) {
                        lowestPing = ping;
                        bestServer = server;
                    }
                }
            }
        });
    }
    
    // Connect to best server
    if (bestServer) {
        selectServer(bestServer);
        if (!window.vpnState.isConnected) {
            toggleConnection();
        }
    } else {
        alert('No servers available for quick connect');
    }
} 