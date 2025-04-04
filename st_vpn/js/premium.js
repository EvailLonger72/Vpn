// Strawberry VPN - Premium Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication check
    checkAuth();

    // Load user data
    loadUserData();

    // Set up event listeners
    setupEventListeners();

    // Initialize UI elements
    initUI();
    
    // Set up premium-specific features
    setupPremiumFeatures();
});

// Premium-specific setup
function setupPremiumFeatures() {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabToActivate = this.getAttribute('data-tab');
            switchTab(tabToActivate);
        });
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Deactivate all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activate the selected tab and button
    document.getElementById(`${tabId}-tab`).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
    
    // If we have a globe, update server markers based on tab
    if (window.globeControl) {
        window.globeControl.updateHighlightedServers(tabId);
    }
}

// Initialize UI components for premium
function initUI() {
    // Base initialization from dashboard.js
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
    
    // Premium has enhanced stats
    window.premiumStats = {
        encryptionLevel: 'AES-256',
        speedBoost: 150, // percent
        maxDownloadSpeed: 500, // Mbps
        maxUploadSpeed: 300, // Mbps
        allowedDevices: 10
    };
}

// Authentication check (same as in dashboard.js)
function checkAuth() {
    const authState = getAuthState();
    
    // If not logged in, redirect to login
    if (!authState.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // If free user but on premium dashboard, redirect to regular
    if (authState.accountType === 'free' && window.location.href.includes('premium.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Get authentication state from localStorage (same as in dashboard.js)
function getAuthState() {
    const authStateStr = localStorage.getItem('vpnAuthState');
    return authStateStr ? JSON.parse(authStateStr) : { isLoggedIn: false };
}

// Load user data into UI (same as in dashboard.js)
function loadUserData() {
    const authState = getAuthState();
    const userEmail = document.getElementById('userEmail');
    const accountTypeBadge = document.getElementById('accountTypeBadge');
    
    if (userEmail) {
        userEmail.textContent = authState.email;
    }
    
    if (accountTypeBadge) {
        accountTypeBadge.textContent = 'Premium Account';
        accountTypeBadge.className = 'account-type premium';
    }
}

// Set up premium dashboard event listeners
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
}

// Toggle VPN connection (same as in dashboard.js)
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
        
        // Simulate connection delay (premium connects faster)
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
            startSimulatingNetworkActivity(true); // true for premium speeds
        }, 1000); // Premium connects faster than free (1s vs 2s)
    }
}

// Select a server (same as in dashboard.js)
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
    
    // Update globe if available
    if (window.globeControl) {
        window.globeControl.highlightSelectedServer(window.vpnState.selectedServer);
    }
}

// Update connection statistics (modified for premium)
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

// Reset connection statistics (same as in dashboard.js)
function resetConnectionStats() {
    window.vpnState.stats = {
        downloadSpeed: 0,
        uploadSpeed: 0,
        ping: 0,
        dataUsed: 0
    };
    
    updateConnectionStats();
}

// Start simulating network activity (enhanced for premium)
function startSimulatingNetworkActivity(isPremium = false) {
    if (!window.vpnState.statSimInterval) {
        window.vpnState.statSimInterval = setInterval(() => {
            if (!window.vpnState.isConnected) {
                clearInterval(window.vpnState.statSimInterval);
                window.vpnState.statSimInterval = null;
                return;
            }
            
            // Get server type (determines speeds)
            const serverType = window.vpnState.selectedServer?.split('-')[0] || '';
            
            // Base speeds
            let downloadBase = Math.random() * 5 + 3; // 3-8 MB/s base
            let uploadBase = Math.random() * 2 + 1; // 1-3 MB/s base
            let pingBase = Math.floor(Math.random() * 30) + 40; // 40-70ms base
            
            // Apply modifiers based on server type
            if (serverType === 'dl') {
                // Download optimized servers
                downloadBase *= 2.5;
                uploadBase *= 0.8;
            } else if (serverType === 'ul') {
                // Upload optimized servers
                uploadBase *= 2.5;
                downloadBase *= 0.8;
            } else if (serverType === 'gaming') {
                // Gaming optimized servers
                pingBase = Math.floor(pingBase * 0.5);
                downloadBase *= 1.2;
            }
            
            // Set the calculated values
            window.vpnState.stats.downloadSpeed = downloadBase;
            window.vpnState.stats.uploadSpeed = uploadBase;
            window.vpnState.stats.ping = pingBase;
            
            // Accumulate data usage (premium uses more data due to higher speeds)
            const downloadData = window.vpnState.stats.downloadSpeed * 0.001; // Convert to GB
            const uploadData = window.vpnState.stats.uploadSpeed * 0.0005; // Convert to GB
            window.vpnState.stats.dataUsed += downloadData + uploadData;
        }, 2000);
    }
}

// Helper function to format time as HH:MM:SS (same as in dashboard.js)
function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    
    seconds = seconds % 60;
    minutes = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generate a random IP address (same as in dashboard.js)
function generateRandomIP() {
    const octet = () => Math.floor(Math.random() * 255) + 1;
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
}

// Logout function
function logout() {
    // Clear auth state from localStorage
    localStorage.removeItem('vpnAuthState');
    localStorage.removeItem('vpnUser');
    
    // Redirect to login page
    window.location.href = 'index.html';
} 