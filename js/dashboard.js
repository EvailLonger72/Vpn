// dashboard.js - Handles dashboard functionality

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
    
    // VPN connection functionality
    const connectToggle = document.getElementById('connect-toggle');
    const connectionStatus = document.getElementById('connection-status');
    const ipAddress = document.getElementById('ip-address');
    const location = document.getElementById('location');
    const connectionTime = document.getElementById('connection-time');
    
    let isConnected = false;
    let connectionTimer;
    let connectionDuration = 0;
    let selectedServer = null;
    
    // Server selection
    const serverCards = document.querySelectorAll('.server-card');
    serverCards.forEach(card => {
        const radioInput = card.querySelector('input[type="radio"]');
        
        card.addEventListener('click', function() {
            // If already connected, don't allow changing server
            if (isConnected) {
                return;
            }
            
            // Select this server
            radioInput.checked = true;
            selectedServer = card.dataset.server;
        });
    });
    
    if (connectToggle && connectionStatus && ipAddress && location && connectionTime) {
        connectToggle.addEventListener('click', function() {
            if (!selectedServer) {
                // If no server selected, select the first one
                const firstServerRadio = document.querySelector('.server-card input[type="radio"]');
                if (firstServerRadio) {
                    firstServerRadio.checked = true;
                    selectedServer = firstServerRadio.value;
                } else {
                    alert('Please select a server first.');
                    return;
                }
            }
            
            if (!isConnected) {
                // Connect to VPN
                connectToVPN();
            } else {
                // Disconnect from VPN
                disconnectFromVPN();
            }
        });
    }
    
    function connectToVPN() {
        // Show connecting state
        connectionStatus.classList.remove('disconnected');
        connectionStatus.classList.add('connected');
        connectionStatus.querySelector('.status-text').textContent = 'Connected';
        
        // Update button
        connectToggle.innerHTML = '<i class="fas fa-power-off"></i><span>Disconnect</span>';
        connectToggle.classList.remove('btn-primary');
        connectToggle.classList.add('btn-outline');
        
        // Generate random IP address
        const randomIP = generateRandomIP();
        ipAddress.textContent = randomIP;
        
        // Set location based on selected server
        const serverLocations = {
            'us': 'United States',
            'uk': 'United Kingdom',
            'jp': 'Japan',
            'sg': 'Singapore'
        };
        location.textContent = serverLocations[selectedServer] || 'Unknown';
        
        // Start connection timer
        connectionDuration = 0;
        updateConnectionTime();
        connectionTimer = setInterval(updateConnectionTime, 1000);
        
        // Update connection state
        isConnected = true;
        
        // Update globe visualization
        if (window.updateGlobeConnection) {
            window.updateGlobeConnection(selectedServer, true);
        }
    }
    
    function disconnectFromVPN() {
        // Show disconnected state
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
        connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
        
        // Update button
        connectToggle.innerHTML = '<i class="fas fa-power-off"></i><span>Connect</span>';
        connectToggle.classList.remove('btn-outline');
        connectToggle.classList.add('btn-primary');
        
        // Reset connection info
        ipAddress.textContent = 'Not Connected';
        location.textContent = 'Not Connected';
        
        // Stop connection timer
        clearInterval(connectionTimer);
        connectionTime.textContent = '00:00:00';
        
        // Update connection state
        isConnected = false;
        
        // Update globe visualization
        if (window.updateGlobeConnection) {
            window.updateGlobeConnection(null, false);
        }
    }
    
    function updateConnectionTime() {
        connectionDuration++;
        
        const hours = Math.floor(connectionDuration / 3600);
        const minutes = Math.floor((connectionDuration % 3600) / 60);
        const seconds = connectionDuration % 60;
        
        const formattedTime = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
        
        connectionTime.textContent = formattedTime;
    }
    
    function generateRandomIP() {
        const octet1 = Math.floor(Math.random() * 223) + 1; // Avoid reserved ranges
        const octet2 = Math.floor(Math.random() * 256);
        const octet3 = Math.floor(Math.random() * 256);
        const octet4 = Math.floor(Math.random() * 254) + 1; // Avoid .0 and .255
        
        return `${octet1}.${octet2}.${octet3}.${octet4}`;
    }
});