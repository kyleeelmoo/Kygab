// Suppliers management functionality
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
    
    // Modal functionality
    const modal = document.getElementById('linkModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelLinkBtn');
    const linkForm = document.getElementById('linkForm');
    
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
    
    // Link form submission
    linkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCustomLink();
    });
    
    // Supplier form submission
    document.getElementById('supplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addCustomSupplier();
    });
    
    // Load custom links and suppliers
    loadCustomLinks();
    loadCustomSuppliers();
});

function addCustomLink(supplier) {
    const modal = document.getElementById('linkModal');
    document.getElementById('linkSupplier').value = supplier;
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('linkModal');
    modal.style.display = 'none';
    document.getElementById('linkForm').reset();
}

function saveCustomLink() {
    const supplier = document.getElementById('linkSupplier').value;
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    
    const link = {
        id: Date.now().toString(),
        title,
        url,
        createdAt: new Date().toISOString()
    };
    
    const storageKey = supplier === 'hd' ? 'hdSupplyLinks' : 'hsSupplyLinks';
    const links = JSON.parse(localStorage.getItem(storageKey)) || [];
    links.push(link);
    localStorage.setItem(storageKey, JSON.stringify(links));
    
    loadCustomLinks();
    closeModal();
}

function loadCustomLinks() {
    loadSupplierLinks('hd', 'hdSupplyLinks');
    loadSupplierLinks('hs', 'hsSupplyLinks');
}

function loadSupplierLinks(supplier, containerId) {
    const storageKey = supplier === 'hd' ? 'hdSupplyLinks' : 'hsSupplyLinks';
    const links = JSON.parse(localStorage.getItem(storageKey)) || [];
    const container = document.getElementById(containerId);
    
    if (links.length === 0) {
        container.innerHTML = '<p style="font-size: 0.9rem; color: #888;">No custom links added</p>';
        return;
    }
    
    container.innerHTML = links.map(link => `
        <div class="custom-link-item">
            <a href="${link.url}" target="_blank">${link.title}</a>
            <button onclick="deleteCustomLink('${storageKey}', '${link.id}')">Delete</button>
        </div>
    `).join('');
}

function deleteCustomLink(storageKey, id) {
    if (confirm('Are you sure you want to delete this link?')) {
        let links = JSON.parse(localStorage.getItem(storageKey)) || [];
        links = links.filter(link => link.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(links));
        loadCustomLinks();
    }
}

function addCustomSupplier() {
    const name = document.getElementById('supplierName').value;
    const description = document.getElementById('supplierDescription').value;
    const website = document.getElementById('supplierWebsite').value;
    const catalog = document.getElementById('supplierCatalog').value;
    
    const supplier = {
        id: Date.now().toString(),
        name,
        description,
        website,
        catalog,
        createdAt: new Date().toISOString()
    };
    
    const suppliers = JSON.parse(localStorage.getItem('customSuppliers')) || [];
    suppliers.push(supplier);
    localStorage.setItem('customSuppliers', JSON.stringify(suppliers));
    
    document.getElementById('supplierForm').reset();
    loadCustomSuppliers();
    alert('Supplier added successfully!');
}

function loadCustomSuppliers() {
    const suppliers = JSON.parse(localStorage.getItem('customSuppliers')) || [];
    const container = document.getElementById('customSuppliers');
    
    if (suppliers.length === 0) {
        return;
    }
    
    container.innerHTML = suppliers.map(supplier => `
        <div class="card supplier-card">
            <h3>${supplier.name}</h3>
            <p>${supplier.description || 'No description provided'}</p>
            <div class="supplier-links">
                <a href="${supplier.website}" target="_blank" class="btn btn-primary">Visit Website</a>
                ${supplier.catalog ? `<a href="${supplier.catalog}" target="_blank" class="btn btn-secondary">Browse Catalog</a>` : ''}
            </div>
            <button class="btn btn-small btn-secondary" style="margin-top: 1rem;" onclick="deleteSupplier('${supplier.id}')">Delete Supplier</button>
        </div>
    `).join('');
}

function deleteSupplier(id) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        let suppliers = JSON.parse(localStorage.getItem('customSuppliers')) || [];
        suppliers = suppliers.filter(supplier => supplier.id !== id);
        localStorage.setItem('customSuppliers', JSON.stringify(suppliers));
        loadCustomSuppliers();
    }
}
