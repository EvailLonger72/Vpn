// servers.js - Handles servers page functionality

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
            
            // Remove premium overlays for premium users
            document.querySelectorAll('.premium-overlay').forEach(overlay => {
                overlay.style.display = 'none';
            });
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
    
    // Server tabs functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(`${tabName}-servers`).classList.add('active');
            
            // Update globe visualization
            if (window.updateGlobeHighlight) {
                window.updateGlobeHighlight(tabName);
            }
        });
    });
    
    // Server search functionality
    const serverSearch = document.getElementById('server-search');
    const serverCards = document.querySelectorAll('.server-card');
    
    if (serverSearch) {
        serverSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            serverCards.forEach(card => {
                const serverName = card.querySelector('h4').textContent.toLowerCase();
                
                if (serverName.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Server filter functionality
    const serverFilter = document.getElementById('server-filter');
    
    if (serverFilter) {
        serverFilter.addEventListener('change', function() {
            const filterValue = this.value;
            
            if (filterValue === 'all') {
                serverCards.forEach(card => {
                    card.style.display = 'flex';
                });
            } else if (filterValue === 'favorites') {
                serverCards.forEach(card => {
                    const isFavorite = card.querySelector('.btn-favorite.active');
                    
                    if (isFavorite) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            } else if (filterValue === 'recommended') {
                // Show servers with low ping and load
                serverCards.forEach(card => {
                    const pingElement = card.querySelector('.server-ping');
                    const loadElement = card.querySelector('.server-load');
                    
                    if (pingElement && loadElement) {
                        const ping = parseInt(pingElement.textContent);
                        const load = parseInt(loadElement.textContent);
                        
                        if (ping < 100 && load < 50) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    } else {
                        card.style.display = 'flex';
                    }
                });
            }
        });
    }
    
    // View toggle functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    const serverGrid = document.querySelector('.server-grid');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const viewType = this.dataset.view;
            
            // Remove active class from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update view
            if (serverGrid) {
                if (viewType === 'list') {
                    serverGrid.classList.add('list-view');
                    serverGrid.classList.remove('grid-view');
                } else {
                    serverGrid.classList.add('grid-view');
                    serverGrid.classList.remove('list-view');
                }
            }
        });
    });
    
    // Favorite server functionality
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                this.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                this.innerHTML = '<i class="far fa-heart"></i>';
            }
            
            // In a real app, you would save favorites to user data
        });
    });
    
    // Connect button functionality
    const connectButtons = document.querySelectorAll('.server-actions .btn-primary');
    
    connectButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const serverCard = this.closest('.server-card');
            const serverName = serverCard.querySelector('h4').textContent;
            const isPremiumServer = serverCard.classList.contains('premium-server');
            
            // Check if user can connect to premium servers
            if (isPremiumServer && userData.accountType !== 'premium') {
                // Show payment modal
                const paymentModal = document.getElementById('payment-modal');
                if (paymentModal) {
                    paymentModal.classList.add('show');
                }
                return;
            }
            
            // Simulate connection
            alert(`Connecting to ${serverName}...`);
            
            // In a real app, you would initiate the VPN connection
            // and redirect to the dashboard
            window.location.href = 'dashboard.html';
        });
    });
    
    // Payment modal functionality
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