// Statistics page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Display user information
    displayUserInfo(user);

    // Initialize charts
    initializeCharts();

    // Load user statistics
    loadUserStatistics(user);

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
            
            // Hide free user warning
            const dataWarning = document.querySelector('.data-warning');
            if (dataWarning) {
                dataWarning.style.display = 'none';
            }
        } else {
            accountTypeBadge.textContent = 'Free Account';
            accountTypeBadge.classList.remove('premium');
            accountTypeBadge.classList.add('free');
        }
    }
}

// Initialize charts
function initializeCharts() {
    initializeDataChart();
    initializeTimeChart();
    initializeSpeedChart();
}

// Initialize data usage chart
function initializeDataChart() {
    const ctx = document.getElementById('dataUsageChart').getContext('2d');
    
    // Generate dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Generate random data
    const downloaded = [];
    const uploaded = [];
    for (let i = 0; i < 7; i++) {
        downloaded.push(Math.floor(Math.random() * 500) + 100);
        uploaded.push(Math.floor(Math.random() * 200) + 50);
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Downloaded (MB)',
                    data: downloaded,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Uploaded (MB)',
                    data: uploaded,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Data (MB)'
                    }
                }
            }
        }
    });
}

// Initialize connection time chart
function initializeTimeChart() {
    const ctx = document.getElementById('connectionTimeChart').getContext('2d');
    
    // Generate random data for servers
    const servers = ['US East', 'UK', 'Germany', 'Japan', 'Singapore'];
    const times = [];
    
    for (let i = 0; i < servers.length; i++) {
        times.push(Math.floor(Math.random() * 300) + 30);
    }
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: servers,
            datasets: [
                {
                    data: times,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Connection Time by Server (minutes)'
                }
            }
        }
    });
}

// Initialize speed distribution chart
function initializeSpeedChart() {
    const ctx = document.getElementById('speedDistributionChart').getContext('2d');
    
    // Generate random data for speed
    const speeds = [
        'Below 5 Mbps',
        '5-10 Mbps',
        '10-25 Mbps',
        '25-50 Mbps',
        'Above 50 Mbps'
    ];
    
    const distributions = [
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 15) + 5,
        Math.floor(Math.random() * 25) + 15,
        Math.floor(Math.random() * 30) + 20,
        Math.floor(Math.random() * 20) + 10
    ];
    
    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: speeds,
            datasets: [
                {
                    data: distributions,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Connection Speed Distribution (%)'
                }
            }
        }
    });
}

// Load user statistics
function loadUserStatistics(user) {
    // If stats don't exist, generate random data
    if (!user.stats) {
        user.stats = generateRandomStats(user.isPremium);
        localStorage.setItem('vpnUser', JSON.stringify(user));
    }
    
    const { totalTime, serversUsed, dataDownloaded, dataUploaded } = user.stats;
    
    // Set values in the stats overview
    document.getElementById('totalSessions').textContent = Math.floor(Math.random() * 50) + 10;
    document.getElementById('totalConnectionTime').textContent = totalTime;
    document.getElementById('totalDataDownloaded').textContent = dataDownloaded;
    document.getElementById('totalDataUploaded').textContent = dataUploaded;
    
    // Generate connection history
    generateConnectionHistory();
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

// Generate connection history table
function generateConnectionHistory() {
    const connectionTable = document.getElementById('connectionHistoryTable');
    if (!connectionTable) return;
    
    const tbody = connectionTable.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Generate random connection history entries
    const serverNames = ['US East', 'UK', 'Germany', 'Japan', 'Singapore', 'US West', 'Canada', 'France'];
    const entries = 10;
    
    // Get current date
    const currentDate = new Date();
    
    for (let i = 0; i < entries; i++) {
        // Random server
        const serverName = serverNames[Math.floor(Math.random() * serverNames.length)];
        
        // Random date within last 30 days
        const date = new Date(currentDate);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const dateStr = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
        
        // Random time
        const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
        // Random duration (10m to 300m)
        const duration = Math.floor(Math.random() * 290) + 10;
        
        // Random data
        const downloaded = (Math.random() * 900 + 100).toFixed(1);
        const uploaded = (downloaded / 4).toFixed(1);
        
        // Random speed
        const speed = (Math.random() * 90 + 10).toFixed(1);
        
        // Create table row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dateStr} ${timeStr}</td>
            <td>${serverName}</td>
            <td>${duration}m</td>
            <td>${downloaded} MB</td>
            <td>${uploaded} MB</td>
            <td>${speed} Mbps</td>
        `;
        
        tbody.appendChild(tr);
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
    
    // Date filter buttons
    const filterButtons = document.querySelectorAll('.date-filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real app, this would refresh the charts with the selected date range
            // For now, we'll just show an alert
            alert(`Statistics would be filtered for: ${this.textContent.trim()}`);
        });
    });
    
    // Custom date range button
    const customDateBtn = document.getElementById('customDateBtn');
    if (customDateBtn) {
        customDateBtn.addEventListener('click', function() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (startDate && endDate) {
                alert(`Statistics would be filtered from ${startDate} to ${endDate}`);
            } else {
                alert('Please select both start and end dates');
            }
        });
    }
} 