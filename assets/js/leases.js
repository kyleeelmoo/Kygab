// Lease Management JavaScript
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
    
    // Load leases
    loadLeases();
    
    // Add lease button
    document.getElementById('addLeaseBtn').addEventListener('click', function() {
        currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Lease';
        document.getElementById('leaseForm').reset();
        document.getElementById('leaseModal').style.display = 'block';
    });
    
    // Close modal buttons
    document.getElementById('closeLeaseModal').addEventListener('click', function() {
        document.getElementById('leaseModal').style.display = 'none';
    });
    
    document.getElementById('cancelLeaseBtn').addEventListener('click', function() {
        document.getElementById('leaseModal').style.display = 'none';
    });
    
    document.getElementById('closeViewModal').addEventListener('click', function() {
        document.getElementById('viewLeaseModal').style.display = 'none';
    });
    
    document.getElementById('closeDetailsBtn').addEventListener('click', function() {
        document.getElementById('viewLeaseModal').style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Submit lease form
    document.getElementById('leaseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveLease();
    });
    
    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function() {
        loadLeases();
    });
    
    // Filter functionality
    document.getElementById('filterStatus').addEventListener('change', function() {
        loadLeases();
    });
});

function loadLeases() {
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;
    
    // Filter leases
    let filteredLeases = leases.filter(lease => {
        const matchesSearch = lease.tenantName.toLowerCase().includes(searchTerm) ||
                            lease.unit.toLowerCase().includes(searchTerm);
        const matchesFilter = !filterStatus || lease.status === filterStatus;
        return matchesSearch && matchesFilter;
    });
    
    const tbody = document.getElementById('leasesBody');
    
    if (filteredLeases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #888;">No leases found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredLeases.map(lease => `
        <tr>
            <td>#${lease.id}</td>
            <td>${lease.tenantName}</td>
            <td>${lease.unit}</td>
            <td>${lease.startDate}</td>
            <td>${lease.endDate}</td>
            <td>$${lease.monthlyRent.toLocaleString()}</td>
            <td><span class="status-badge status-${lease.status}">${lease.status}</span></td>
            <td>
                <button class="btn btn-small" onclick="viewLease(${lease.id})">View</button>
                <button class="btn btn-small" onclick="editLease(${lease.id})">Edit</button>
                <button class="btn btn-small" style="background-color: #ff4444;" onclick="deleteLease(${lease.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function saveLease() {
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    
    const lease = {
        id: currentEditId || Date.now(),
        tenantName: document.getElementById('leaseTenant').value,
        unit: document.getElementById('leaseUnit').value,
        startDate: document.getElementById('leaseStartDate').value,
        endDate: document.getElementById('leaseEndDate').value,
        monthlyRent: parseFloat(document.getElementById('leaseRent').value),
        securityDeposit: parseFloat(document.getElementById('leaseDeposit').value),
        terms: document.getElementById('leaseTerms').value,
        status: document.getElementById('leaseStatus').value
    };
    
    if (currentEditId) {
        // Update existing lease
        const index = leases.findIndex(l => l.id === currentEditId);
        if (index !== -1) {
            leases[index] = lease;
        }
    } else {
        // Add new lease
        leases.push(lease);
    }
    
    localStorage.setItem('leases', JSON.stringify(leases));
    
    // Show success message
    alert(currentEditId ? 'Lease updated successfully!' : 'Lease added successfully!');
    
    // Close modal and reload
    document.getElementById('leaseModal').style.display = 'none';
    loadLeases();
}

function editLease(id) {
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    const lease = leases.find(l => l.id === id);
    
    if (!lease) return;
    
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Lease';
    document.getElementById('leaseTenant').value = lease.tenantName;
    document.getElementById('leaseUnit').value = lease.unit;
    document.getElementById('leaseStartDate').value = lease.startDate;
    document.getElementById('leaseEndDate').value = lease.endDate;
    document.getElementById('leaseRent').value = lease.monthlyRent;
    document.getElementById('leaseDeposit').value = lease.securityDeposit;
    document.getElementById('leaseTerms').value = lease.terms || '';
    document.getElementById('leaseStatus').value = lease.status;
    
    document.getElementById('leaseModal').style.display = 'block';
}

function viewLease(id) {
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    const lease = leases.find(l => l.id === id);
    
    if (!lease) return;
    
    const detailsDiv = document.getElementById('leaseDetails');
    detailsDiv.innerHTML = `
        <div style="padding: 1rem;">
            <p><strong>Lease ID:</strong> #${lease.id}</p>
            <p><strong>Tenant:</strong> ${lease.tenantName}</p>
            <p><strong>Unit:</strong> ${lease.unit}</p>
            <p><strong>Start Date:</strong> ${lease.startDate}</p>
            <p><strong>End Date:</strong> ${lease.endDate}</p>
            <p><strong>Monthly Rent:</strong> $${lease.monthlyRent.toLocaleString()}</p>
            <p><strong>Security Deposit:</strong> $${lease.securityDeposit.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${lease.status}">${lease.status}</span></p>
            ${lease.terms ? `<p><strong>Terms:</strong><br>${lease.terms}</p>` : ''}
        </div>
    `;
    
    document.getElementById('viewLeaseModal').style.display = 'block';
}

function deleteLease(id) {
    if (!confirm('Are you sure you want to delete this lease? This action cannot be undone.')) {
        return;
    }
    
    const leases = JSON.parse(localStorage.getItem('leases')) || [];
    const filteredLeases = leases.filter(l => l.id !== id);
    
    localStorage.setItem('leases', JSON.stringify(filteredLeases));
    
    alert('Lease deleted successfully!');
    loadLeases();
}
