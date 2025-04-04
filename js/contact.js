// contact.js - Handles contact page functionality

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
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    
    if (userNameElement) {
        userNameElement.textContent = userData.email || 'User';
    }
    
    if (accountTypeElement) {
        if (userData.accountType === 'premium') {
            accountTypeElement.textContent = 'Premium Account';
            accountTypeElement.classList.remove('free');
            accountTypeElement.classList.add('premium');
            
            // Show premium features
            document.querySelectorAll('.premium-only').forEach(element => {
                element.innerHTML = '+1-800-STRAWBERRY';
            });
        } else {
            accountTypeElement.textContent = 'Free Account';
        }
    }
    
    // Pre-fill form with user data if available
    if (emailInput && userData.email) {
        emailInput.value = userData.email;
    }
    
    if (nameInput && userData.fullName) {
        nameInput.value = userData.fullName;
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
    
    // File upload functionality
    const fileInput = document.getElementById('attachments');
    const fileInfo = document.querySelector('.file-info');
    
    if (fileInput && fileInfo) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileNames = Array.from(this.files).map(file => file.name).join(', ');
                fileInfo.textContent = `Selected files: ${fileNames}`;
            } else {
                fileInfo.textContent = 'No files selected';
            }
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const ticketNumber = document.getElementById('ticket-number');
    
    if (contactForm && successModal) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, you would send the form data to the server
            
            // Generate random ticket number
            const randomTicket = 'ST-' + Math.floor(10000 + Math.random() * 90000);
            if (ticketNumber) {
                ticketNumber.textContent = randomTicket;
            }
            
            // Show success modal
            successModal.classList.add('show');
            
            // Reset form
            contactForm.reset();
            if (fileInfo) {
                fileInfo.textContent = 'No files selected';
            }
        });
        
        // Close modal buttons
        const modalCloseButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                successModal.classList.remove('show');
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.classList.remove('show');
            }
        });
    }
    
    // Live chat functionality
    const liveChatBtn = document.getElementById('live-chat-btn');
    const liveChatModal = document.getElementById('live-chat-modal');
    const chatInput = document.querySelector('.chat-input textarea');
    const chatSendBtn = document.querySelector('.chat-input .btn');
    const chatMessages = document.querySelector('.chat-messages');
    
    if (liveChatBtn && liveChatModal) {
        liveChatBtn.addEventListener('click', function() {
            liveChatModal.classList.add('show');
            
            // Focus on chat input
            if (chatInput) {
                chatInput.focus();
            }
        });
        
        const modalClose = liveChatModal.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                liveChatModal.classList.remove('show');
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === liveChatModal) {
                liveChatModal.classList.remove('show');
            }
        });
        
        // Send message functionality
        if (chatSendBtn && chatInput && chatMessages) {
            chatSendBtn.addEventListener('click', sendMessage);
            
            // Send message on Enter key
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            function sendMessage() {
                const message = chatInput.value.trim();
                
                if (message) {
                    // Add user message
                    const userMessageHTML = `
                        <div class="chat-message user">
                            <div class="message-content">
                                <div class="message-sender">You</div>
                                <div class="message-text">${message}</div>
                                <div class="message-time">Just now</div>
                            </div>
                            <div class="message-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                    `;
                    
                    chatMessages.insertAdjacentHTML('beforeend', userMessageHTML);
                    
                    // Clear input
                    chatInput.value = '';
                    
                    // Scroll to bottom
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Simulate agent response after a delay
                    setTimeout(function() {
                        const agentMessageHTML = `
                            <div class="chat-message support">
                                <div class="message-avatar">
                                    <i class="fas fa-headset"></i>
                                </div>
                                <div class="message-content">
                                    <div class="message-sender">Support Agent</div>
                                    <div class="message-text">Thank you for your message. Our support team will get back to you shortly.</div>
                                    <div class="message-time">Just now</div>
                                </div>
                            </div>
                        `;
                        
                        chatMessages.insertAdjacentHTML('beforeend', agentMessageHTML);
                        
                        // Scroll to bottom
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 1000);
                }
            }
        }
    }
});