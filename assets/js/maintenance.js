// Maintenance request functionality
let requests = [];
let currentEditId = null;

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
    
    // Load maintenance requests
    loadRequests();
    
    // Modal functionality
    const modal = document.getElementById('requestModal');
    const addBtn = document.getElementById('addRequestBtn');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const requestForm = document.getElementById('requestForm');
    
    addBtn.addEventListener('click', function() {
        openModal();
    });
    
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    cancelBtn.addEventListener('click', function() {
        closeModal();
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Form submission
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveRequest();
    });
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Search and filter
    document.getElementById('searchBox').addEventListener('input', filterRequests);
    document.getElementById('filterStatus').addEventListener('change', filterRequests);
});

function loadRequests() {
    requests = JSON.parse(localStorage.getItem('maintenanceRequests')) || getSampleRequests();
    if (!localStorage.getItem('maintenanceRequests')) {
        localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
    }
    displayRequests();
}

function getSampleRequests() {
    return [
        { id: 1, unit: '101', issue: 'Broken Window', priority: 'high', status: 'pending', date: '2025-10-29', tenant: 'John Smith', notes: 'Living room window cracked' },
        { id: 2, unit: '203', issue: 'Leaking Faucet', priority: 'medium', status: 'in-progress', date: '2025-10-28', tenant: 'Sarah Martinez', notes: 'Kitchen sink' },
        { id: 3, unit: '204', issue: 'Light Fixture Replacement', priority: 'low', status: 'in-progress', date: '2025-10-27', tenant: 'James Garcia', notes: 'Bedroom ceiling light' },
        { id: 4, unit: '302', issue: 'Appliance Repair', priority: 'medium', status: 'pending', date: '2025-10-30', tenant: 'Linda White', notes: 'Refrigerator not cooling' },
        { id: 5, unit: '105', issue: 'HVAC Repair', priority: 'high', status: 'completed', date: '2025-10-25', completedDate: '2025-10-26', tenant: 'Michael Wilson', notes: 'AC not working' }
    ];
}

function displayRequests() {
    const activeBody = document.getElementById('activeRequestsBody');
    const completedBody = document.getElementById('completedRequestsBody');
    
    const activeRequests = requests.filter(r => r.status !== 'completed');
    const completedRequests = requests.filter(r => r.status === 'completed');
    
    if (activeRequests.length === 0) {
        activeBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No active requests</td></tr>';
    } else {
        activeBody.innerHTML = activeRequests.map(request => `
            <tr>
                <td>${request.unit}</td>
                <td>${request.issue}</td>
                <td><span class="status-badge status-${request.priority}">${request.priority}</span></td>
                <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                <td>${request.date}</td>
                <td>
                    <button class="btn btn-small" onclick="editRequest(${request.id})">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="deleteRequest(${request.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }
    
    if (completedRequests.length === 0) {
        completedBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No completed requests</td></tr>';
    } else {
        completedBody.innerHTML = completedRequests.map(request => `
            <tr>
                <td>${request.unit}</td>
                <td>${request.issue}</td>
                <td><span class="status-badge status-${request.priority}">${request.priority}</span></td>
                <td>${request.completedDate || request.date}</td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="deleteRequest(${request.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function openModal(editId = null) {
    const modal = document.getElementById('requestModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('requestForm');
    
    currentEditId = editId;
    
    if (editId) {
        modalTitle.textContent = 'Edit Maintenance Request';
        const request = requests.find(r => r.id === editId);
        if (request) {
            document.getElementById('requestId').value = request.id;
            document.getElementById('unit').value = request.unit;
            document.getElementById('issue').value = request.issue;
            document.getElementById('priority').value = request.priority;
            document.getElementById('status').value = request.status;
            document.getElementById('notes').value = request.notes || '';
        }
    } else {
        modalTitle.textContent = 'Submit New Maintenance Request';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('requestModal');
    modal.style.display = 'none';
    currentEditId = null;
}

function saveRequest() {
    const request = {
        id: currentEditId || Date.now(),
        unit: document.getElementById('unit').value,
        issue: document.getElementById('issue').value,
        priority: document.getElementById('priority').value,
        status: document.getElementById('status').value,
        date: new Date().toISOString().split('T')[0],
        notes: document.getElementById('notes').value
    };
    
    if (request.status === 'completed' && !request.completedDate) {
        request.completedDate = new Date().toISOString().split('T')[0];
    }
    
    if (currentEditId) {
        const index = requests.findIndex(r => r.id === currentEditId);
        if (index !== -1) {
            requests[index] = request;
        }
    } else {
        requests.push(request);
    }
    
    localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
    displayRequests();
    closeModal();
    showToast('Request saved successfully!', 'success');
}

function editRequest(id) {
    openModal(id);
}

function deleteRequest(id) {
    if (confirm('Are you sure you want to delete this request?')) {
        requests = requests.filter(r => r.id !== id);
        localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
        displayRequests();
        showToast('Request deleted successfully!', 'success');
    }
}

function filterRequests() {
    const searchValue = document.getElementById('searchBox').value.trim().toLowerCase();
    const statusValue = document.getElementById('filterStatus').value;

    const filteredRequests = requests.filter(request => {
        // Filter by status
        const statusMatch = (statusValue === 'all' || request.status === statusValue);
        // Filter by search (unit, issue, notes)
        const searchMatch =
            request.unit.toLowerCase().includes(searchValue) ||
            request.issue.toLowerCase().includes(searchValue) ||
            (request.notes && request.notes.toLowerCase().includes(searchValue));
        return statusMatch && (searchValue === '' || searchMatch);
    });

    displayRequests(filteredRequests);
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
