// Servers page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Display user information
    displayUserInfo(user);

    // Initialize servers
    initializeServers();

    // Setup event listeners
    setupEventListeners(user);
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
            const upgradeButtons = document.querySelectorAll('.btn-upgrade');
            upgradeButtons.forEach(button => {
                button.style.display = 'none';
            });
            
            // Show premium servers
            const premiumSection = document.querySelector('.premium-servers');
            if (premiumSection) {
                premiumSection.classList.remove('locked');
            }
            
            // Hide premium upgrade notice
            const premiumUpgradeNotice = document.querySelector('.premium-upgrade-notice');
            if (premiumUpgradeNotice) {
                premiumUpgradeNotice.style.display = 'none';
            }
        } else {
            accountTypeBadge.textContent = 'Free Account';
            accountTypeBadge.classList.remove('premium');
            accountTypeBadge.classList.add('free');
        }
    }
}

// Define server data
const standardServers = [
    {
        id: 'us-east',
        name: 'US East',
        location: 'New York, USA',
        flag: '🇺🇸',
        ping: 45,
        load: 72,
        isFavorite: false
    },
    {
        id: 'uk-london',
        name: 'UK',
        location: 'London, UK',
        flag: '🇬🇧',
        ping: 85,
        load: 45,
        isFavorite: false
    },
    {
        id: 'de-frankfurt',
        name: 'Germany',
        location: 'Frankfurt, Germany',
        flag: '🇩🇪',
        ping: 92,
        load: 38,
        isFavorite: false
    },
    {
        id: 'jp-tokyo',
        name: 'Japan',
        location: 'Tokyo, Japan',
        flag: '🇯🇵',
        ping: 187,
        load: 25,
        isFavorite: false
    }
];

const premiumServers = [
    {
        id: 'us-west',
        name: 'US West',
        location: 'Los Angeles, USA',
        flag: '🇺🇸',
        ping: 78,
        load: 45,
        type: 'standard',
        isFavorite: false
    },
    {
        id: 'ca-toronto',
        name: 'Canada',
        location: 'Toronto, Canada',
        flag: '🇨🇦',
        ping: 62,
        load: 30,
        type: 'standard',
        isFavorite: false
    },
    {
        id: 'fr-paris',
        name: 'France',
        location: 'Paris, France',
        flag: '🇫🇷',
        ping: 89,
        load: 42,
        type: 'standard',
        isFavorite: false
    },
    {
        id: 'sg-singapore',
        name: 'Singapore',
        location: 'Singapore',
        flag: '🇸🇬',
        ping: 145,
        load: 33,
        type: 'standard',
        isFavorite: false
    },
    {
        id: 'au-sydney',
        name: 'Australia',
        location: 'Sydney, Australia',
        flag: '🇦🇺',
        ping: 210,
        load: 28,
        type: 'standard',
        isFavorite: false
    },
    {
        id: 'gaming-1',
        name: 'Gaming 1',
        location: 'Amsterdam, Netherlands',
        flag: '🇳🇱',
        ping: 35,
        load: 40,
        type: 'gaming',
        isFavorite: false
    },
    {
        id: 'gaming-2',
        name: 'Gaming 2',
        location: 'Seoul, South Korea',
        flag: '🇰🇷',
        ping: 125,
        load: 35,
        type: 'gaming',
        isFavorite: false
    },
    {
        id: 'gaming-3',
        name: 'Gaming 3',
        location: 'Stockholm, Sweden',
        flag: '🇸🇪',
        ping: 65,
        load: 30,
        type: 'gaming',
        isFavorite: false
    },
    {
        id: 'streaming-1',
        name: 'Streaming 1',
        location: 'Miami, USA',
        flag: '🇺🇸',
        ping: 55,
        load: 60,
        type: 'streaming',
        isFavorite: false
    },
    {
        id: 'streaming-2',
        name: 'Streaming 2',
        location: 'Dublin, Ireland',
        flag: '🇮🇪',
        ping: 75,
        load: 50,
        type: 'streaming',
        isFavorite: false
    },
    {
        id: 'streaming-3',
        name: 'Streaming 3',
        location: 'Tokyo, Japan',
        flag: '🇯🇵',
        ping: 165,
        load: 45,
        type: 'streaming',
        isFavorite: false
    },
    {
        id: 'p2p-1',
        name: 'P2P 1',
        location: 'Zurich, Switzerland',
        flag: '🇨🇭',
        ping: 85,
        load: 70,
        type: 'p2p',
        isFavorite: false
    },
    {
        id: 'p2p-2',
        name: 'P2P 2',
        location: 'Helsinki, Finland',
        flag: '🇫🇮',
        ping: 95,
        load: 55,
        type: 'p2p',
        isFavorite: false
    }
];

// Initialize servers
function initializeServers() {
    // Get saved servers from localStorage
    const user = getCurrentUser();
    let savedServers = {};
    
    if (user && user.servers) {
        savedServers = user.servers;
    }
    
    // Populate standard servers
    const standardServerContainer = document.querySelector('.standard-servers .server-grid');
    if (standardServerContainer) {
        standardServerContainer.innerHTML = '';
        
        standardServers.forEach(server => {
            // Apply saved state if available
            if (savedServers[server.id]) {
                server.isFavorite = savedServers[server.id].isFavorite || false;
            }
            
            standardServerContainer.appendChild(createServerCard(server));
        });
    }
    
    // Populate premium servers
    const premiumServerContainer = document.querySelector('.premium-servers .server-grid');
    if (premiumServerContainer) {
        premiumServerContainer.innerHTML = '';
        
        // Group premium servers by type
        const groupedServers = groupServersByType(premiumServers);
        
        // Add standard premium servers
        if (groupedServers.standard && groupedServers.standard.length > 0) {
            appendServerGroupHeader(premiumServerContainer, 'Standard Servers');
            
            groupedServers.standard.forEach(server => {
                // Apply saved state if available
                if (savedServers[server.id]) {
                    server.isFavorite = savedServers[server.id].isFavorite || false;
                }
                
                premiumServerContainer.appendChild(createServerCard(server));
            });
        }
        
        // Add gaming servers
        if (groupedServers.gaming && groupedServers.gaming.length > 0) {
            appendServerGroupHeader(premiumServerContainer, 'Gaming Servers');
            
            groupedServers.gaming.forEach(server => {
                // Apply saved state if available
                if (savedServers[server.id]) {
                    server.isFavorite = savedServers[server.id].isFavorite || false;
                }
                
                premiumServerContainer.appendChild(createServerCard(server));
            });
        }
        
        // Add streaming servers
        if (groupedServers.streaming && groupedServers.streaming.length > 0) {
            appendServerGroupHeader(premiumServerContainer, 'Streaming Servers');
            
            groupedServers.streaming.forEach(server => {
                // Apply saved state if available
                if (savedServers[server.id]) {
                    server.isFavorite = savedServers[server.id].isFavorite || false;
                }
                
                premiumServerContainer.appendChild(createServerCard(server));
            });
        }
        
        // Add P2P servers
        if (groupedServers.p2p && groupedServers.p2p.length > 0) {
            appendServerGroupHeader(premiumServerContainer, 'P2P Servers');
            
            groupedServers.p2p.forEach(server => {
                // Apply saved state if available
                if (savedServers[server.id]) {
                    server.isFavorite = savedServers[server.id].isFavorite || false;
                }
                
                premiumServerContainer.appendChild(createServerCard(server));
            });
        }
    }
    
    // Initialize search and filters
    initializeSearch();
}

// Group servers by type
function groupServersByType(servers) {
    const groupedServers = {};
    
    servers.forEach(server => {
        if (!groupedServers[server.type]) {
            groupedServers[server.type] = [];
        }
        
        groupedServers[server.type].push(server);
    });
    
    return groupedServers;
}

// Append a server group header
function appendServerGroupHeader(container, title) {
    const headerElement = document.createElement('div');
    headerElement.className = 'server-group-header';
    headerElement.innerHTML = `<h3>${title}</h3>`;
    container.appendChild(headerElement);
}

// Create a server card
function createServerCard(server) {
    const serverCard = document.createElement('div');
    serverCard.className = 'server-card';
    serverCard.setAttribute('data-server-id', server.id);
    
    // Determine ping class
    let pingClass = 'ping-excellent';
    if (server.ping > 150) {
        pingClass = 'ping-high';
    } else if (server.ping > 100) {
        pingClass = 'ping-medium';
    }
    
    // Determine load class
    let loadClass = 'load-low';
    if (server.load > 70) {
        loadClass = 'load-high';
    } else if (server.load > 40) {
        loadClass = 'load-medium';
    }
    
    // Create favorite star class
    const favoriteClass = server.isFavorite ? 'favorite active' : 'favorite';
    
    // Create server card HTML
    serverCard.innerHTML = `
        <div class="server-header">
            <div class="server-flag">${server.flag}</div>
            <div class="server-name">${server.name}</div>
            <button class="${favoriteClass}">
                <i class="fas fa-star"></i>
            </button>
        </div>
        <div class="server-details">
            <div class="server-location">${server.location}</div>
            <div class="server-stats">
                <div class="server-ping ${pingClass}">
                    <span class="stat-label">Ping:</span>
                    <span class="stat-value">${server.ping}ms</span>
                </div>
                <div class="server-load ${loadClass}">
                    <span class="stat-label">Load:</span>
                    <span class="stat-value">${server.load}%</span>
                </div>
            </div>
            ${server.type ? `<div class="server-tag ${server.type}">${server.type}</div>` : ''}
        </div>
        <div class="server-actions">
            <button class="btn-connect">Connect</button>
        </div>
    `;
    
    return serverCard;
}

// Initialize search and filters
function initializeSearch() {
    const searchInput = document.getElementById('serverSearch');
    const filters = document.querySelectorAll('.filter-option');
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterServers();
        });
    }
    
    // Filter functionality
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Toggle active class
            filters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Filter servers
            filterServers();
        });
    });
}

// Filter servers based on search and filters
function filterServers() {
    const searchTerm = document.getElementById('serverSearch').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-option.active').getAttribute('data-filter');
    
    // Get all server cards
    const serverCards = document.querySelectorAll('.server-card');
    
    serverCards.forEach(card => {
        const serverId = card.getAttribute('data-server-id');
        const server = findServerById(serverId);
        
        if (!server) return;
        
        let showServer = true;
        
        // Apply search filter
        if (searchTerm) {
            const nameMatch = server.name.toLowerCase().includes(searchTerm);
            const locationMatch = server.location.toLowerCase().includes(searchTerm);
            
            if (!nameMatch && !locationMatch) {
                showServer = false;
            }
        }
        
        // Apply type filter
        if (activeFilter !== 'all') {
            if (activeFilter === 'favorites' && !server.isFavorite) {
                showServer = false;
            } else if (activeFilter === 'low-ping' && server.ping > 80) {
                showServer = false;
            } else if (activeFilter === 'low-load' && server.load > 50) {
                showServer = false;
            } else if (activeFilter === 'streaming' && server.type !== 'streaming') {
                showServer = false;
            } else if (activeFilter === 'gaming' && server.type !== 'gaming') {
                showServer = false;
            } else if (activeFilter === 'p2p' && server.type !== 'p2p') {
                showServer = false;
            }
        }
        
        // Show or hide the server card
        card.style.display = showServer ? 'block' : 'none';
    });
    
    // Hide empty group headers
    const groupHeaders = document.querySelectorAll('.server-group-header');
    groupHeaders.forEach(header => {
        const nextSibling = header.nextElementSibling;
        let hasVisibleServer = false;
        
        // Check if any of the following servers are visible
        let current = nextSibling;
        while (current && !current.classList.contains('server-group-header')) {
            if (current.classList.contains('server-card') && current.style.display !== 'none') {
                hasVisibleServer = true;
                break;
            }
            current = current.nextElementSibling;
        }
        
        header.style.display = hasVisibleServer ? 'block' : 'none';
    });
}

// Find a server by its ID
function findServerById(id) {
    // Check standard servers
    for (const server of standardServers) {
        if (server.id === id) {
            return server;
        }
    }
    
    // Check premium servers
    for (const server of premiumServers) {
        if (server.id === id) {
            return server;
        }
    }
    
    return null;
}

// Setup event listeners
function setupEventListeners(user) {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('vpnUser');
            window.location.href = 'index.html';
        });
    }
    
    // Upgrade button
    const upgradeButtons = document.querySelectorAll('#upgradeBtn, .btn-upgrade-notice button');
    upgradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = 'premium.html';
        });
    });
    
    // Add event delegation for server cards
    document.addEventListener('click', function(event) {
        // Connect button click
        if (event.target.classList.contains('btn-connect')) {
            const serverCard = event.target.closest('.server-card');
            if (serverCard) {
                const serverId = serverCard.getAttribute('data-server-id');
                connectToServer(serverId, user);
            }
        }
        
        // Favorite button click
        if (event.target.classList.contains('fa-star') || event.target.classList.contains('favorite')) {
            const favoriteBtn = event.target.closest('.favorite');
            if (favoriteBtn) {
                const serverCard = favoriteBtn.closest('.server-card');
                if (serverCard) {
                    const serverId = serverCard.getAttribute('data-server-id');
                    toggleFavorite(serverId, favoriteBtn, user);
                }
            }
        }
    });
}

// Connect to a server
function connectToServer(serverId, user) {
    const server = findServerById(serverId);
    if (!server) return;
    
    // Check if server is premium and user is not premium
    if (premiumServers.some(s => s.id === serverId) && !user.isPremium) {
        // Show premium upgrade notice
        const premiumNotice = document.querySelector('.premium-upgrade-notice');
        if (premiumNotice) {
            premiumNotice.style.display = 'flex';
        }
        return;
    }
    
    // Simulate connection - in a real app this would initiate a VPN connection
    alert(`Connecting to ${server.name} (${server.location})...`);
    
    // Save as last connected server
    user.lastConnectedServer = serverId;
    localStorage.setItem('vpnUser', JSON.stringify(user));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html?connected=' + serverId;
}

// Toggle favorite status
function toggleFavorite(serverId, favoriteBtn, user) {
    const server = findServerById(serverId);
    if (!server) return;
    
    // Toggle favorite status
    server.isFavorite = !server.isFavorite;
    
    // Update UI
    if (server.isFavorite) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }
    
    // Save to user data
    if (!user.servers) {
        user.servers = {};
    }
    
    if (!user.servers[serverId]) {
        user.servers[serverId] = {};
    }
    
    user.servers[serverId].isFavorite = server.isFavorite;
    localStorage.setItem('vpnUser', JSON.stringify(user));
    
    // Refresh filters if on favorites view
    const activeFilter = document.querySelector('.filter-option.active').getAttribute('data-filter');
    if (activeFilter === 'favorites') {
        filterServers();
    }
} 