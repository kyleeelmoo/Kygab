// Tenant Management JavaScript
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
    
    let currentEditId = null;
    
    // Load tenants
    loadTenants();
    
    // Add tenant button
    document.getElementById('addTenantBtn').addEventListener('click', function() {
        currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Tenant';
        document.getElementById('tenantForm').reset();
        document.getElementById('tenantModal').style.display = 'block';
    });
    
    // Close modal buttons
    document.getElementById('closeTenantModal').addEventListener('click', function() {
        document.getElementById('tenantModal').style.display = 'none';
    });
    
    document.getElementById('cancelTenantBtn').addEventListener('click', function() {
        document.getElementById('tenantModal').style.display = 'none';
    });
    
    document.getElementById('closeViewModal').addEventListener('click', function() {
        document.getElementById('viewTenantModal').style.display = 'none';
    });
    
    document.getElementById('closeDetailsBtn').addEventListener('click', function() {
        document.getElementById('viewTenantModal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Submit tenant form
    document.getElementById('tenantForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTenant();
    });
    
    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function() {
        loadTenants();
    });
    
    // Filter functionality
    document.getElementById('filterStatus').addEventListener('change', function() {
        loadTenants();
    });
});

function loadTenants() {
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;
    
    // Filter tenants
    let filteredTenants = tenants.filter(tenant => {
        const matchesSearch = tenant.name.toLowerCase().includes(searchTerm) ||
                            tenant.email.toLowerCase().includes(searchTerm) ||
                            tenant.unit.toLowerCase().includes(searchTerm);
        const matchesFilter = !filterStatus || tenant.status === filterStatus;
        return matchesSearch && matchesFilter;
    });
    
    const tbody = document.getElementById('tenantsBody');
    
    if (filteredTenants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No tenants found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredTenants.map(tenant => `
        <tr>
            <td>${tenant.name}</td>
            <td>${tenant.unit}</td>
            <td>${tenant.email}</td>
            <td>${tenant.phone}</td>
            <td>${tenant.leaseEnd}</td>
            <td><span class="status-badge status-${tenant.status}">${tenant.status}</span></td>
            <td>
                <button class="btn btn-small" onclick="viewTenant(${tenant.id})">View</button>
                <button class="btn btn-small" onclick="editTenant(${tenant.id})">Edit</button>
                <button class="btn btn-small" style="background-color: #ff4444;" onclick="deleteTenant(${tenant.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function saveTenant() {
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    
    const tenant = {
        id: currentEditId || Date.now(),
        name: document.getElementById('tenantName').value,
        email: document.getElementById('tenantEmail').value,
        phone: document.getElementById('tenantPhone').value,
        unit: document.getElementById('tenantUnit').value,
        leaseStart: document.getElementById('tenantLeaseStart').value,
        leaseEnd: document.getElementById('tenantLeaseEnd').value,
        rentAmount: parseFloat(document.getElementById('tenantRent').value),
        status: document.getElementById('tenantStatus').value
    };
    
    if (currentEditId) {
        // Update existing tenant
        const index = tenants.findIndex(t => t.id === currentEditId);
        if (index !== -1) {
            tenants[index] = tenant;
        }
    } else {
        // Add new tenant
        tenants.push(tenant);
    }
    
    localStorage.setItem('tenants', JSON.stringify(tenants));
    
    // Show success message
    alert(currentEditId ? 'Tenant updated successfully!' : 'Tenant added successfully!');
    
    // Close modal and reload
    document.getElementById('tenantModal').style.display = 'none';
    loadTenants();
}

function editTenant(id) {
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    const tenant = tenants.find(t => t.id === id);
    
    if (!tenant) return;
    
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Tenant';
    document.getElementById('tenantName').value = tenant.name;
    document.getElementById('tenantEmail').value = tenant.email;
    document.getElementById('tenantPhone').value = tenant.phone;
    document.getElementById('tenantUnit').value = tenant.unit;
    document.getElementById('tenantLeaseStart').value = tenant.leaseStart;
    document.getElementById('tenantLeaseEnd').value = tenant.leaseEnd;
    document.getElementById('tenantRent').value = tenant.rentAmount;
    document.getElementById('tenantStatus').value = tenant.status;
    
    document.getElementById('tenantModal').style.display = 'block';
}

function viewTenant(id) {
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    const tenant = tenants.find(t => t.id === id);
    
    if (!tenant) return;
    
    const detailsDiv = document.getElementById('tenantDetails');
    detailsDiv.innerHTML = `
        <div style="padding: 1rem;">
            <p><strong>Name:</strong> ${tenant.name}</p>
            <p><strong>Email:</strong> ${tenant.email}</p>
            <p><strong>Phone:</strong> ${tenant.phone}</p>
            <p><strong>Unit:</strong> ${tenant.unit}</p>
            <p><strong>Lease Start:</strong> ${tenant.leaseStart}</p>
            <p><strong>Lease End:</strong> ${tenant.leaseEnd}</p>
            <p><strong>Monthly Rent:</strong> $${tenant.rentAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${tenant.status}">${tenant.status}</span></p>
        </div>
    `;
    
    document.getElementById('viewTenantModal').style.display = 'block';
}

function deleteTenant(id) {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
        return;
    }
    
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    const filteredTenants = tenants.filter(t => t.id !== id);
    
    localStorage.setItem('tenants', JSON.stringify(filteredTenants));
    
    alert('Tenant deleted successfully!');
    loadTenants();
}
