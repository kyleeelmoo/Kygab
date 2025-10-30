// Tenant management functionality
let tenants = [];
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
    
    // Load tenants from localStorage
    loadTenants();
    
    // Modal functionality
    const modal = document.getElementById('tenantModal');
    const addBtn = document.getElementById('addTenantBtn');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const tenantForm = document.getElementById('tenantForm');
    
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
    tenantForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTenant();
    });
    
    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function(e) {
        filterTenants();
    });
    
    // Filter functionality
    document.getElementById('filterStatus').addEventListener('change', function(e) {
        filterTenants();
    });
});

function loadTenants() {
    tenants = JSON.parse(localStorage.getItem('tenants')) || getSampleTenants();
    if (!localStorage.getItem('tenants')) {
        localStorage.setItem('tenants', JSON.stringify(tenants));
    }
    displayTenants(tenants);
}

function getSampleTenants() {
    return [
        { id: 1, name: 'John Smith', unit: '101', email: 'john.smith@email.com', phone: '555-0101', rent: 1500, leaseStart: '2024-01-01', leaseEnd: '2025-12-31', status: 'active', notes: '' },
        { id: 2, name: 'Mary Johnson', unit: '102', email: 'mary.johnson@email.com', phone: '555-0102', rent: 1600, leaseStart: '2024-02-01', leaseEnd: '2025-11-30', status: 'active', notes: '' }
    ];
}

function displayTenants(items) {
    const tbody = document.getElementById('tenantBody');
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No tenants found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(tenant => `
        <tr>
            <td>${tenant.name}</td>
            <td>${tenant.unit}</td>
            <td>$${tenant.rent.toLocaleString()}</td>
            <td><span class="status-badge status-${tenant.status}">${tenant.status}</span></td>
            <td>${tenant.leaseEnd}</td>
            <td>
                <button class="btn btn-small" onclick="editTenant(${tenant.id})">Edit</button>
                <button class="btn btn-small btn-secondary" onclick="deleteTenant(${tenant.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openModal(editId = null) {
    const modal = document.getElementById('tenantModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('tenantForm');
    
    currentEditId = editId;
    
    if (editId) {
        modalTitle.textContent = 'Edit Tenant';
        const tenant = tenants.find(t => t.id === editId);
        if (tenant) {
            document.getElementById('tenantId').value = tenant.id;
            document.getElementById('tenantName').value = tenant.name;
            document.getElementById('unit').value = tenant.unit;
            document.getElementById('email').value = tenant.email;
            document.getElementById('phone').value = tenant.phone;
            document.getElementById('rent').value = tenant.rent;
            document.getElementById('leaseStart').value = tenant.leaseStart;
            document.getElementById('leaseEnd').value = tenant.leaseEnd;
            document.getElementById('status').value = tenant.status;
            document.getElementById('notes').value = tenant.notes || '';
        }
    } else {
        modalTitle.textContent = 'Add New Tenant';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('tenantModal');
    modal.style.display = 'none';
    currentEditId = null;
}

function saveTenant() {
    const tenant = {
        id: currentEditId || Date.now(),
        name: document.getElementById('tenantName').value,
        unit: document.getElementById('unit').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        rent: parseFloat(document.getElementById('rent').value),
        leaseStart: document.getElementById('leaseStart').value,
        leaseEnd: document.getElementById('leaseEnd').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value
    };
    
    if (currentEditId) {
        const index = tenants.findIndex(t => t.id === currentEditId);
        if (index !== -1) {
            tenants[index] = tenant;
        }
    } else {
        tenants.push(tenant);
    }
    
    localStorage.setItem('tenants', JSON.stringify(tenants));
    displayTenants(tenants);
    closeModal();
    showToast('Tenant saved successfully!', 'success');
}

function editTenant(id) {
    openModal(id);
}

function deleteTenant(id) {
    if (confirm('Are you sure you want to delete this tenant?')) {
        tenants = tenants.filter(t => t.id !== id);
        localStorage.setItem('tenants', JSON.stringify(tenants));
        displayTenants(tenants);
        showToast('Tenant deleted successfully!', 'success');
    }
}

function filterTenants() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = tenants;
    
    if (searchTerm) {
        filtered = filtered.filter(tenant => 
            tenant.name.toLowerCase().includes(searchTerm) ||
            tenant.unit.toLowerCase().includes(searchTerm) ||
            tenant.email.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(tenant => tenant.status === statusFilter);
    }
    
    displayTenants(filtered);
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
