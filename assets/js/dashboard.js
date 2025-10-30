// Dashboard functionality for Property Management Portal
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display user info
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole') || 'user';
    document.getElementById('userInfo').textContent = `${username} (${userRole})`;
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        }
    });
    
    // Initialize data if not exists
    initializeData();
    
    // Load dashboard statistics
    loadAnalytics();
    loadTenantStats();
    loadMaintenanceStats();
    loadLeaseStats();
    loadFinancialStats();
    loadRecentActivity();
    
    // Initialize notifications
    initializeNotifications();
    
    // Notification panel toggle
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotifications = document.getElementById('closeNotifications');
    
    if (notificationToggle) {
        notificationToggle.addEventListener('click', function() {
            notificationPanel.classList.toggle('active');
        });
    }
    
    if (closeNotifications) {
        closeNotifications.addEventListener('click', function() {
            notificationPanel.classList.remove('active');
        });
    }
});

function initializeData() {
    // Initialize tenants if not exists
    if (!localStorage.getItem('tenants')) {
        const sampleTenants = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john.doe@email.com',
                phone: '555-0101',
                unit: 'Unit 101',
                leaseStart: '2024-01-01',
                leaseEnd: '2025-01-01',
                rentAmount: 1500,
                status: 'active'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane.smith@email.com',
                phone: '555-0102',
                unit: 'Unit 202',
                leaseStart: '2024-03-01',
                leaseEnd: '2025-03-01',
                rentAmount: 1800,
                status: 'active'
            }
        ];
        localStorage.setItem('tenants', JSON.stringify(sampleTenants));
    }
    
    // Initialize maintenance requests if not exists
    if (!localStorage.getItem('maintenanceRequests')) {
        const sampleRequests = [
            {
                id: 1,
                tenant: 'John Doe',
                unit: 'Unit 101',
                category: 'Plumbing',
                description: 'Leaky faucet in kitchen',
                priority: 'medium',
                status: 'pending',
                dateSubmitted: new Date().toISOString().split('T')[0]
            },
            {
                id: 2,
                tenant: 'Jane Smith',
                unit: 'Unit 202',
                category: 'Electrical',
                description: 'Light fixture not working',
                priority: 'high',
                status: 'in-progress',
                dateSubmitted: new Date().toISOString().split('T')[0]
            }
        ];
        localStorage.setItem('maintenanceRequests', JSON.stringify(sampleRequests));
    }
    
    // Initialize leases if not exists
    if (!localStorage.getItem('leases')) {
        const sampleLeases = [
            {
                id: 1,
                tenantName: 'John Doe',
                unit: 'Unit 101',
                startDate: '2024-01-01',
                endDate: '2025-01-01',
                monthlyRent: 1500,
                securityDeposit: 1500,
                status: 'active'
            },
            {
                id: 2,
                tenantName: 'Jane Smith',
                unit: 'Unit 202',
                startDate: '2024-03-01',
                endDate: '2025-03-01',
                monthlyRent: 1800,
                securityDeposit: 1800,
                status: 'active'
            }
        ];
        localStorage.setItem('leases', JSON.stringify(sampleLeases));
    }
    
    // Initialize payments if not exists
    if (!localStorage.getItem('payments')) {
        const samplePayments = [
            {
                id: 1,
                tenant: 'John Doe',
                unit: 'Unit 101',
                amount: 1500,
                date: new Date().toISOString().split('T')[0],
                status: 'paid',
                method: 'bank transfer'
            },
            {
                id: 2,
                tenant: 'Jane Smith',
                unit: 'Unit 202',
                amount: 1800,
                date: new Date().toISOString().split('T')[0],
                status: 'paid',
                method: 'check'
            }
        ];
        localStorage.setItem('payments', JSON.stringify(samplePayments));
    }
}

function loadAnalytics() {
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    
    // Calculate analytics
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in-progress').length;
    
    // Calculate rent collected this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const rentCollected = payments
        .filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear &&
                   p.status === 'paid';
        })
        .reduce((sum, p) => sum + p.amount, 0);
    
    // Update UI
    document.getElementById('totalProperties').textContent = '12'; // Sample data
    document.getElementById('activeTenants').textContent = activeTenants;
    document.getElementById('rentCollected').textContent = `$${rentCollected.toLocaleString()}`;
    document.getElementById('pendingRequests').textContent = pendingRequests;
}

function loadTenantStats() {
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    
    // Calculate move-ins this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const moveIns = leases.filter(l => {
        const startDate = new Date(l.startDate);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
    }).length;
    
    // Calculate expiring leases (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringLeases = leases.filter(l => {
        const endDate = new Date(l.endDate);
        return endDate <= thirtyDaysFromNow && endDate >= new Date();
    }).length;
    
    document.getElementById('activeTenantsCount').textContent = activeTenants;
    document.getElementById('moveInsCount').textContent = moveIns;
    document.getElementById('expiringLeasesCount').textContent = expiringLeases;
}

function loadMaintenanceStats() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    
    const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'in-progress').length;
    const urgentRequests = requests.filter(r => r.priority === 'high' && r.status !== 'completed').length;
    
    // Calculate completed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const completedThisWeek = requests.filter(r => {
        if (r.dateCompleted) {
            const completedDate = new Date(r.dateCompleted);
            return completedDate >= oneWeekAgo && r.status === 'completed';
        }
        return false;
    }).length;
    
    document.getElementById('activeRequests').textContent = activeRequests;
    document.getElementById('completedRequests').textContent = completedThisWeek;
    document.getElementById('urgentRequests').textContent = urgentRequests;
}

function loadLeaseStats() {
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    
    const activeLeases = leases.filter(l => l.status === 'active').length;
    
    // Calculate expiring soon (next 60 days)
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringSoon = leases.filter(l => {
        const endDate = new Date(l.endDate);
        return endDate <= sixtyDaysFromNow && endDate >= new Date() && l.status === 'active';
    }).length;
    
    document.getElementById('activeLeases').textContent = activeLeases;
    document.getElementById('expiringSoon').textContent = expiringSoon;
    document.getElementById('renewalsRequired').textContent = expiringSoon;
}

function loadFinancialStats() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    
    // Calculate month revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthRevenue = payments
        .filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear &&
                   p.status === 'paid';
        })
        .reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate outstanding payments
    const totalExpected = tenants
        .filter(t => t.status === 'active')
        .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const outstandingPayments = totalExpected - monthRevenue;
    
    // Calculate on-time payment percentage
    const paidOnTime = totalExpected > 0 ? ((monthRevenue / totalExpected) * 100).toFixed(0) : 0;
    
    document.getElementById('monthRevenue').textContent = `$${monthRevenue.toLocaleString()}`;
    document.getElementById('outstandingPayments').textContent = `$${outstandingPayments.toLocaleString()}`;
    document.getElementById('paidOnTime').textContent = `${paidOnTime}%`;
}

function loadRecentActivity() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    
    const activities = [];
    
    // Add recent maintenance requests
    requests.slice(-5).reverse().forEach(r => {
        activities.push({
            date: r.dateSubmitted,
            text: `Maintenance request from ${r.tenant} - ${r.category}`,
            type: 'maintenance'
        });
    });
    
    // Add recent payments
    payments.slice(-5).reverse().forEach(p => {
        activities.push({
            date: p.date,
            text: `Payment received from ${p.tenant} - $${p.amount}`,
            type: 'payment'
        });
    });
    
    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const activityDiv = document.getElementById('recentActivity');
    if (activities.length > 0) {
        activityDiv.innerHTML = activities.slice(0, 10).map(a => 
            `<div class="activity-item">
                <span class="activity-date">${a.date}</span> - ${a.text}
            </div>`
        ).join('');
    }
}

function initializeNotifications() {
    const notifications = [];
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    
    // Check for expiring leases
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    leases.forEach(l => {
        const endDate = new Date(l.endDate);
        if (endDate <= thirtyDaysFromNow && endDate >= new Date() && l.status === 'active') {
            notifications.push({
                type: 'warning',
                message: `Lease expiring soon for ${l.tenantName} (${l.unit}) on ${l.endDate}`
            });
        }
    });
    
    // Check for urgent maintenance requests
    const urgentRequests = requests.filter(r => r.priority === 'high' && r.status !== 'completed');
    urgentRequests.forEach(r => {
        notifications.push({
            type: 'urgent',
            message: `Urgent maintenance request: ${r.description} at ${r.unit}`
        });
    });
    
    // Add rent due notification
    const today = new Date().getDate();
    if (today >= 25 || today <= 5) {
        notifications.push({
            type: 'info',
            message: 'Rent payments are due soon. Review payment status.'
        });
    }
    
    // Update notification badge
    document.getElementById('notificationBadge').textContent = notifications.length;
    
    // Display notifications
    const notificationList = document.getElementById('notificationList');
    if (notifications.length > 0) {
        notificationList.innerHTML = notifications.map(n => 
            `<div class="notification-item ${n.type}">
                <p>${n.message}</p>
            </div>`
        ).join('');
    } else {
        notificationList.innerHTML = '<p style="text-align: center; color: #888; padding: 2rem;">No new notifications</p>';
    }
}