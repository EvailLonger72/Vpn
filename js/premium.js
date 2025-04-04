// premium.js - Handles premium dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (in a real app, this would be more secure)
    const userData = JSON.parse(localStorage.getItem('strawberryVpnUser') || '{}');
    if (!userData.isLoggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Check if user is premium
    if (userData.accountType !== 'premium' && !(userData.email === 'one' && userData.specialAccess)) {
        // Redirect to regular dashboard if not premium
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Update user information
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = userData.email || 'Premium User';
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
    
    // Server tab functionality
    const serverTabs = document.querySelectorAll('.server-tab');
    const serverTabContents = document.querySelectorAll('.server-tab-content');
    
    serverTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            serverTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            serverTabContents.forEach(content => content.classList.remove('active'));
            
            // Show corresponding tab content
            const tabId = this.dataset.tab;
            document.getElementById(`${tabId}-servers`).classList.add('active');
        });
    });
    
    // VPN connection functionality
    const connectToggle = document.getElementById('connect-toggle');
    const connectionStatus = document.getElementById('connection-status');
    const ipAddress = document.getElementById('ip-address');
    const location = document.getElementById('location');
    const connectionTime = document.getElementById('connection-time');
    const serverType = document.getElementById('server-type');
    const connectionSpeed = document.getElementById('connection-speed');
    const dataTransferred = document.getElementById('data-transferred');
    const threatsBlocked = document.getElementById('threats-blocked');
    
    let isConnected = false;
    let connectionTimer;
    let statsTimer;
    let connectionDuration = 0;
    let totalDataTransferred = 0;
    let totalThreatsBlocked = 0;
    let selectedServer = null;
    let selectedServerType = 'standard';
    
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
            
            // Determine server type
            if (selectedServer.includes('gaming')) {
                selectedServerType = 'Gaming';
            } else if (selectedServer.includes('dl')) {
                selectedServerType = 'Download Boost';
            } else if (selectedServer.includes('ul')) {
                selectedServerType = 'Upload Boost';
            } else {
                selectedServerType = 'Standard';
            }
        });
    });
    
    if (connectToggle && connectionStatus && ipAddress && location && connectionTime && serverType) {
        connectToggle.addEventListener('click', function() {
            if (!selectedServer) {
                // If no server selected, select the first one
                const firstServerRadio = document.querySelector('.server-card input[type="radio"]');
                if (firstServerRadio) {
                    firstServerRadio.checked = true;
                    selectedServer = document.querySelector('.server-card').dataset.server;
                    selectedServerType = 'Standard';
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
            'sg': 'Singapore',
            'gaming-us': 'United States (Gaming)',
            'gaming-eu': 'Europe (Gaming)',
            'gaming-asia': 'Asia (Gaming)',
            'gaming-au': 'Australia (Gaming)',
            'gaming-sa': 'South America (Gaming)',
            'dl-us': 'United States (Download)',
            'dl-eu': 'Europe (Download)',
            'dl-asia': 'Asia (Download)',
            'dl-au': 'Australia (Download)',
            'dl-sa': 'South America (Download)',
            'ul-us': 'United States (Upload)',
            'ul-eu': 'Europe (Upload)',
            'ul-asia': 'Asia (Upload)',
            'ul-au': 'Australia (Upload)',
            'ul-sa': 'South America (Upload)'
        };
        location.textContent = serverLocations[selectedServer] || 'Unknown';
        
        // Set server type
        serverType.textContent = selectedServerType;
        
        // Start connection timer
        connectionDuration = 0;
        updateConnectionTime();
        connectionTimer = setInterval(updateConnectionTime, 1000);
        
        // Start stats timer
        totalDataTransferred = 0;
        totalThreatsBlocked = 0;
        updateStats();
        statsTimer = setInterval(updateStats, 3000);
        
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
        serverType.textContent = 'Standard';
        
        // Stop timers
        clearInterval(connectionTimer);
        clearInterval(statsTimer);
        connectionTime.textContent = '00:00:00';
        
        // Reset stats
        connectionSpeed.textContent = '0 Mbps';
        
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
    
    function updateStats() {
        if (!isConnected) return;
        
        // Generate random connection speed based on server type
        let speed;
        if (selectedServerType === 'Gaming') {
            speed = Math.floor(Math.random() * 100) + 150; // 150-250 Mbps
        } else if (selectedServerType === 'Download Boost') {
            speed = Math.floor(Math.random() * 200) + 300; // 300-500 Mbps
        } else if (selectedServerType === 'Upload Boost') {
            speed = Math.floor(Math.random() * 150) + 200; // 200-350 Mbps
        } else {
            speed = Math.floor(Math.random() * 100) + 100; // 100-200 Mbps
        }
        
        connectionSpeed.textContent = `${speed} Mbps`;
        
        // Update data transferred
        const dataIncrement = (speed / 8) * 3; // Convert Mbps to MB for 3 seconds
        totalDataTransferred += dataIncrement;
        
        if (totalDataTransferred < 1024) {
            dataTransferred.textContent = `${Math.round(totalDataTransferred)} MB`;
        } else {
            dataTransferred.textContent = `${(totalDataTransferred / 1024).toFixed(2)} GB`;
        }
        
        // Update threats blocked
        if (Math.random() < 0.3) { // 30% chance to block a threat
            totalThreatsBlocked++;
            threatsBlocked.textContent = totalThreatsBlocked;
        }
    }
    
    function generateRandomIP() {
        const octet1 = Math.floor(Math.random() * 223) + 1; // Avoid reserved ranges
        const octet2 = Math.floor(Math.random() * 256);
        const octet3 = Math.floor(Math.random() * 256);
        const octet4 = Math.floor(Math.random() * 254) + 1; // Avoid .0 and .255
        
        return `${octet1}.${octet2}.${octet3}.${octet4}`;
    }
});