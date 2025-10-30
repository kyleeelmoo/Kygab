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
    
    // Load inventory stats
    loadInventoryStats();
    
    // Load recent logs
    loadRecentLogs();
    
    // Microsoft integration status
    checkMicrosoftStatus();
    
    // Microsoft connect button
    document.getElementById('msConnectBtn').addEventListener('click', function() {
        alert('Microsoft integration feature coming soon! This will connect to Microsoft Graph API for task sync and OneDrive storage.');
    });
});

function loadInventoryStats() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    const totalItems = inventory.length;
    const outOfStock = inventory.filter(item => item.status === 'Out of Stock').length;
    const lowStock = inventory.filter(item => item.status === 'Low Stock').length;
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('outOfStock').textContent = outOfStock;
    document.getElementById('lowStock').textContent = lowStock;
}

function loadRecentLogs() {
    const sprinklerLogs = JSON.parse(localStorage.getItem('sprinklerLogs')) || [];
    const temperatureLogs = JSON.parse(localStorage.getItem('temperatureLogs')) || [];
    const inspectionLogs = JSON.parse(localStorage.getItem('inspectionLogs')) || [];
    
    const allLogs = [
        ...sprinklerLogs.map(log => ({ ...log, type: 'Sprinkler' })),
        ...temperatureLogs.map(log => ({ ...log, type: 'Temperature' })),
        ...inspectionLogs.map(log => ({ ...log, type: 'Inspection' }))
    ];
    
    // Sort by date (most recent first)
    allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const recentLogs = allLogs.slice(0, 5);
    
    const recentLogsDiv = document.getElementById('recentLogs');
    if (recentLogs.length === 0) {
        recentLogsDiv.innerHTML = '<p>No recent logs</p>';
    } else {
        recentLogsDiv.innerHTML = recentLogs.map(log => 
            `<p>${log.type} - ${log.date} ${log.time || ''}</p>`
        ).join('');
    }
}

function checkMicrosoftStatus() {
    const msConnected = localStorage.getItem('msConnected') === 'true';
    document.getElementById('msConnected').textContent = msConnected ? 'Connected' : 'Not Connected';
    document.getElementById('msConnected').style.color = msConnected ? '#00ff88' : '#ff8800';
}