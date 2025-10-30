// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });
    
    // Load dashboard data
    loadDashboardStats();
    
    // View all notifications button
    const viewAllNotificationsBtn = document.getElementById('viewAllNotifications');
    if (viewAllNotificationsBtn) {
        viewAllNotificationsBtn.addEventListener('click', function() {
            showToast('Opening all notifications...', 'info');
            // In a real app, this would navigate to a notifications page
        });
    }
});

function loadDashboardStats() {
    // In a real application, this would fetch data from an API
    // For now, we'll use sample data that's already in the HTML
    
    // You can load from localStorage if needed
    const tenants = JSON.parse(localStorage.getItem('tenants')) || getSampleTenants();
    const maintenanceRequests = JSON.parse(localStorage.getItem('maintenanceRequests')) || getSampleMaintenance();
    const leases = JSON.parse(localStorage.getItem('leases')) || getSampleLeases();
    
    // Store sample data if not exists
    if (!localStorage.getItem('tenants')) {
        localStorage.setItem('tenants', JSON.stringify(tenants));
    }
    if (!localStorage.getItem('maintenanceRequests')) {
        localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
    }
    if (!localStorage.getItem('leases')) {
        localStorage.setItem('leases', JSON.stringify(leases));
    }
}

function getSampleTenants() {
    return [
        { id: 1, name: 'John Smith', unit: '101', status: 'active', rent: 1500, leaseEnd: '2025-12-31' },
        { id: 2, name: 'Mary Johnson', unit: '102', status: 'active', rent: 1600, leaseEnd: '2025-11-30' },
        { id: 3, name: 'Robert Davis', unit: '103', status: 'active', rent: 1550, leaseEnd: '2026-01-15' },
        { id: 4, name: 'Lisa Anderson', unit: '104', status: 'active', rent: 1700, leaseEnd: '2025-11-15' },
        { id: 5, name: 'Michael Wilson', unit: '105', status: 'active', rent: 1800, leaseEnd: '2026-02-28' },
        { id: 6, name: 'Jennifer Taylor', unit: '201', status: 'active', rent: 1650, leaseEnd: '2025-12-20' },
        { id: 7, name: 'David Brown', unit: '202', status: 'active', rent: 1750, leaseEnd: '2026-03-10' },
        { id: 8, name: 'Sarah Martinez', unit: '203', status: 'active', rent: 1900, leaseEnd: '2025-10-31' },
        { id: 9, name: 'James Garcia', unit: '204', status: 'active', rent: 1800, leaseEnd: '2026-01-20' },
        { id: 10, name: 'Patricia Rodriguez', unit: '205', status: 'active', rent: 1950, leaseEnd: '2025-12-15' },
        { id: 11, name: 'Christopher Lee', unit: '301', status: 'active', rent: 2000, leaseEnd: '2025-11-30' },
        { id: 12, name: 'Linda White', unit: '302', status: 'active', rent: 1850, leaseEnd: '2026-02-15' }
    ];
}

function getSampleMaintenance() {
    return [
        { id: 1, unit: '105', issue: 'HVAC Repair', status: 'completed', priority: 'high', date: '2025-10-25', tenant: 'Michael Wilson' },
        { id: 2, unit: '203', issue: 'Leaking Faucet', status: 'in-progress', priority: 'medium', date: '2025-10-28', tenant: 'Sarah Martinez' },
        { id: 3, unit: '101', issue: 'Broken Window', status: 'pending', priority: 'high', date: '2025-10-29', tenant: 'John Smith' },
        { id: 4, unit: '204', issue: 'Light Fixture Replacement', status: 'in-progress', priority: 'low', date: '2025-10-27', tenant: 'James Garcia' },
        { id: 5, unit: '302', issue: 'Appliance Repair', status: 'pending', priority: 'medium', date: '2025-10-30', tenant: 'Linda White' }
    ];
}

function getSampleLeases() {
    return [
        { id: 1, unit: '101', tenant: 'John Smith', startDate: '2024-01-01', endDate: '2025-12-31', rent: 1500, status: 'active' },
        { id: 2, unit: '102', tenant: 'Mary Johnson', startDate: '2024-02-01', endDate: '2025-11-30', rent: 1600, status: 'expiring' },
        { id: 3, unit: '103', tenant: 'Robert Davis', startDate: '2024-02-15', endDate: '2026-01-15', rent: 1550, status: 'active' }
    ];
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}