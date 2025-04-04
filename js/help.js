// help.js - Handles help page functionality

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
    
    // FAQ category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    const faqSections = document.querySelectorAll('.faq-section');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Remove active class from all tabs and sections
            categoryTabs.forEach(tab => tab.classList.remove('active'));
            faqSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            this.classList.add('active');
            document.getElementById(`${category}-faq`).classList.add('active');
        });
    });
    
    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = this.nextElementSibling;
            
            // Toggle active class
            faqItem.classList.toggle('active');
            
            // Toggle answer visibility
            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                this.querySelector('i').classList.remove('fa-chevron-down');
                this.querySelector('i').classList.add('fa-chevron-up');
            } else {
                answer.style.maxHeight = '0';
                this.querySelector('i').classList.remove('fa-chevron-up');
                this.querySelector('i').classList.add('fa-chevron-down');
            }
        });
    });
    
    // FAQ search functionality
    const faqSearch = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqSearch) {
        faqSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length > 2) {
                // Show all FAQ sections
                faqSections.forEach(section => section.classList.add('active'));
                
                // Remove active class from all category tabs
                categoryTabs.forEach(tab => tab.classList.remove('active'));
                
                // Filter FAQ items
                faqItems.forEach(item => {
                    const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                    const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                    
                    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                        item.style.display = 'block';
                        
                        // Expand matching items
                        item.classList.add('active');
                        const answerElement = item.querySelector('.faq-answer');
                        answerElement.style.maxHeight = answerElement.scrollHeight + 'px';
                        
                        // Update icon
                        const icon = item.querySelector('.faq-question i');
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    } else {
                        item.style.display = 'none';
                    }
                });
            } else if (searchTerm.length === 0) {
                // Reset to default state
                categoryTabs[0].click();
                
                // Reset all FAQ items
                faqItems.forEach(item => {
                    item.style.display = 'block';
                    item.classList.remove('active');
                    
                    const answerElement = item.querySelector('.faq-answer');
                    answerElement.style.maxHeight = '0';
                    
                    const icon = item.querySelector('.faq-question i');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                });
            }
        });
    }
    
    // Live chat functionality
    const liveChatBtn = document.getElementById('live-chat-btn');
    const liveChatModal = document.getElementById('live-chat-modal');
    const modalClose = document.querySelector('.modal-close');
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