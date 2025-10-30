// Maintenance Requests Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
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
            window.location.href = 'index.html';
        }
    });
    
    let currentViewRequestId = null;
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
    
    // Load requests
    loadActiveRequests();
    loadCompletedRequests();
    
    // Submit maintenance request form
    document.getElementById('maintenanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitMaintenanceRequest();
    });
    
    // Search functionality
    document.getElementById('searchActiveBox').addEventListener('input', loadActiveRequests);
    document.getElementById('searchCompletedBox').addEventListener('input', loadCompletedRequests);
    
    // Filter functionality
    document.getElementById('filterPriority').addEventListener('change', loadActiveRequests);
    document.getElementById('filterCategory').addEventListener('change', loadActiveRequests);
    
    // Modal close buttons
    document.getElementById('closeViewModal').addEventListener('click', function() {
        document.getElementById('viewRequestModal').style.display = 'none';
    });
    
    document.getElementById('closeDetailsBtn').addEventListener('click', function() {
        document.getElementById('viewRequestModal').style.display = 'none';
    });
    
    document.getElementById('markCompletedBtn').addEventListener('click', function() {
        markRequestCompleted(currentViewRequestId);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

function loadActiveRequests() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    const searchTerm = document.getElementById('searchActiveBox').value.toLowerCase();
    const filterPriority = document.getElementById('filterPriority').value;
    const filterCategory = document.getElementById('filterCategory').value;
    
    // Filter active requests
    let filteredRequests = requests.filter(request => {
        const isActive = request.status !== 'completed';
        const matchesSearch = request.tenant.toLowerCase().includes(searchTerm) ||
                            request.unit.toLowerCase().includes(searchTerm) ||
                            request.description.toLowerCase().includes(searchTerm);
        const matchesPriority = !filterPriority || request.priority === filterPriority;
        const matchesCategory = !filterCategory || request.category === filterCategory;
        return isActive && matchesSearch && matchesPriority && matchesCategory;
    });
    
    const tbody = document.getElementById('activeRequestsBody');
    
    if (filteredRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #888;">No active requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredRequests.map(request => `
        <tr>
            <td>#${request.id}</td>
            <td>${request.tenant}</td>
            <td>${request.unit}</td>
            <td>${request.category}</td>
            <td>${request.description.substring(0, 50)}${request.description.length > 50 ? '...' : ''}</td>
            <td><span class="priority-badge priority-${request.priority}">${request.priority}</span></td>
            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
            <td>${request.dateSubmitted}</td>
            <td>
                <button class="btn btn-small" onclick="viewRequest(${request.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function loadCompletedRequests() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    const searchTerm = document.getElementById('searchCompletedBox').value.toLowerCase();
    
    // Filter completed requests
    let filteredRequests = requests.filter(request => {
        const isCompleted = request.status === 'completed';
        const matchesSearch = request.tenant.toLowerCase().includes(searchTerm) ||
                            request.unit.toLowerCase().includes(searchTerm) ||
                            request.description.toLowerCase().includes(searchTerm);
        return isCompleted && matchesSearch;
    });
    
    const tbody = document.getElementById('completedRequestsBody');
    
    if (filteredRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #888;">No completed requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredRequests.map(request => `
        <tr>
            <td>#${request.id}</td>
            <td>${request.tenant}</td>
            <td>${request.unit}</td>
            <td>${request.category}</td>
            <td>${request.description.substring(0, 50)}${request.description.length > 50 ? '...' : ''}</td>
            <td>${request.dateSubmitted}</td>
            <td>${request.dateCompleted || 'N/A'}</td>
            <td>
                <button class="btn btn-small" onclick="viewRequest(${request.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function submitMaintenanceRequest() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    
    const newRequest = {
        id: Date.now(),
        tenant: document.getElementById('requestTenant').value,
        unit: document.getElementById('requestUnit').value,
        category: document.getElementById('requestCategory').value,
        description: document.getElementById('requestDescription').value,
        priority: document.getElementById('requestPriority').value,
        status: 'pending',
        dateSubmitted: new Date().toISOString().split('T')[0]
    };
    
    requests.push(newRequest);
    localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
    
    alert('Maintenance request submitted successfully!');
    document.getElementById('maintenanceForm').reset();
    
    // Switch to active requests tab
    document.querySelector('[data-tab="active"]').click();
    loadActiveRequests();
}

function viewRequest(id) {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    const request = requests.find(r => r.id === id);
    
    if (!request) return;
    
    currentViewRequestId = id;
    
    const detailsDiv = document.getElementById('requestDetails');
    detailsDiv.innerHTML = `
        <div style="padding: 1rem;">
            <p><strong>Request ID:</strong> #${request.id}</p>
            <p><strong>Tenant:</strong> ${request.tenant}</p>
            <p><strong>Unit:</strong> ${request.unit}</p>
            <p><strong>Category:</strong> ${request.category}</p>
            <p><strong>Description:</strong> ${request.description}</p>
            <p><strong>Priority:</strong> <span class="priority-badge priority-${request.priority}">${request.priority}</span></p>
            <p><strong>Status:</strong> <span class="status-badge status-${request.status}">${request.status}</span></p>
            <p><strong>Date Submitted:</strong> ${request.dateSubmitted}</p>
            ${request.dateCompleted ? `<p><strong>Date Completed:</strong> ${request.dateCompleted}</p>` : ''}
        </div>
    `;
    
    // Hide mark completed button if already completed
    const markCompletedBtn = document.getElementById('markCompletedBtn');
    if (request.status === 'completed') {
        markCompletedBtn.style.display = 'none';
    } else {
        markCompletedBtn.style.display = 'inline-block';
    }
    
    document.getElementById('viewRequestModal').style.display = 'block';
}

function markRequestCompleted(id) {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || [];
    const request = requests.find(r => r.id === id);
    
    if (!request) return;
    
    request.status = 'completed';
    request.dateCompleted = new Date().toISOString().split('T')[0];
    
    localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
    
    alert('Request marked as completed!');
    document.getElementById('viewRequestModal').style.display = 'none';
    
    loadActiveRequests();
    loadCompletedRequests();
}