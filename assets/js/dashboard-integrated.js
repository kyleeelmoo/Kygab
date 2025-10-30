// Integrated Dashboard functionality with all features
let inventory = [];
let currentEditId = null;
let currentSupplier = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display welcome message
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('welcomeUser').textContent = `Welcome, ${username}`;
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            showLoading();
            setTimeout(() => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'index.html';
            }, 500);
        }
    });
    
    // Main tab functionality
    const tabBtns = document.querySelectorAll('.tabs:not(.sub-tabs) .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Sub-tab functionality for logsheets
    const subTabBtns = document.querySelectorAll('.sub-tabs .tab-btn');
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const subTabName = this.getAttribute('data-subtab');
            openSubTab(subTabName);
        });
    });
    
    // Initialize dashboard
    initializeDashboard();
    initializeInventory();
    initializeLogsheets();
    initializeSuppliers();
    
    // Microsoft integration
    document.getElementById('msConnectBtn').addEventListener('click', function() {
        showToast('Microsoft integration feature coming soon! This will connect to Microsoft Graph API for task sync and OneDrive storage.', 'warning');
    });
});

// ====================
// TAB SWITCHING
// ====================

function switchTab(tabName, subTab = null) {
    showLoading();
    
    setTimeout(() => {
        // Hide all main tab contents
        const tabContents = document.querySelectorAll('.container > .tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all main tab buttons
        const tabBtns = document.querySelectorAll('.tabs:not(.sub-tabs) .tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show the selected tab
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to the clicked button
        const activeBtn = document.querySelector(`.tabs:not(.sub-tabs) [data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // If switching to logsheets with a specific sub-tab
        if (tabName === 'logsheets' && subTab) {
            setTimeout(() => openSubTab(subTab), 100);
        }
        
        hideLoading();
    }, 300);
}

function openSubTab(subTabName) {
    // Hide all sub-tab contents
    const subTabContents = document.querySelectorAll('#logsheets .tab-content');
    subTabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all sub-tab buttons
    const subTabBtns = document.querySelectorAll('.sub-tabs .tab-btn');
    subTabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show the selected sub-tab
    const selectedSubTab = document.getElementById(subTabName);
    if (selectedSubTab) {
        selectedSubTab.classList.add('active');
    }
    
    // Add active class to the clicked button
    const activeSubBtn = document.querySelector(`.sub-tabs [data-subtab="${subTabName}"]`);
    if (activeSubBtn) {
        activeSubBtn.classList.add('active');
    }
}

// ====================
// DASHBOARD OVERVIEW
// ====================

function initializeDashboard() {
    loadInventoryStats();
    loadRecentLogs();
    checkMicrosoftStatus();
}

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

// ====================
// INVENTORY MANAGEMENT
// ====================

function initializeInventory() {
    // Load inventory from localStorage
    loadInventory();
    
    // Modal functionality
    const modal = document.getElementById('itemModal');
    const addBtn = document.getElementById('addItemBtn');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const itemForm = document.getElementById('itemForm');
    
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
    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem();
    });
    
    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function(e) {
        filterInventory();
    });
    
    // Filter functionality
    document.getElementById('filterStatus').addEventListener('change', function(e) {
        filterInventory();
    });
}

function loadInventory() {
    inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    displayInventory(inventory);
}

function displayInventory(items) {
    const tbody = document.getElementById('inventoryBody');
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No items in inventory</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.partName}</td>
            <td>${item.quantity}</td>
            <td><span class="status-badge status-${item.status.replace(/\s+/g, '-').toLowerCase()}">${item.status}</span></td>
            <td>${item.supplier || '-'}</td>
            <td>${item.notes || '-'}</td>
            <td>
                <button class="btn btn-small" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn btn-small btn-secondary" onclick="deleteItem('${item.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openModal(item = null) {
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (item) {
        modalTitle.textContent = 'Edit Item';
        document.getElementById('itemId').value = item.id;
        document.getElementById('partName').value = item.partName;
        document.getElementById('quantity').value = item.quantity;
        document.getElementById('status').value = item.status;
        document.getElementById('supplier').value = item.supplier || '';
        document.getElementById('notes').value = item.notes || '';
        currentEditId = item.id;
    } else {
        modalTitle.textContent = 'Add New Item';
        document.getElementById('itemForm').reset();
        document.getElementById('itemId').value = '';
        currentEditId = null;
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('itemModal');
    modal.style.display = 'none';
    document.getElementById('itemForm').reset();
    currentEditId = null;
}

function saveItem() {
    showLoading();
    
    const partName = document.getElementById('partName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const status = document.getElementById('status').value;
    const supplier = document.getElementById('supplier').value;
    const notes = document.getElementById('notes').value;
    
    // Auto-update status based on quantity
    let finalStatus = status;
    if (quantity === 0) {
        finalStatus = 'Out of Stock';
    } else if (quantity > 0 && quantity <= 10) {
        finalStatus = 'Low Stock';
    }
    
    setTimeout(() => {
        if (currentEditId) {
            // Update existing item
            const index = inventory.findIndex(item => item.id === currentEditId);
            if (index !== -1) {
                inventory[index] = {
                    ...inventory[index],
                    partName,
                    quantity,
                    status: finalStatus,
                    supplier,
                    notes,
                    lastUpdated: new Date().toISOString()
                };
                showToast('Item updated successfully!', 'success');
            }
        } else {
            // Add new item
            const newItem = {
                id: Date.now().toString(),
                partName,
                quantity,
                status: finalStatus,
                supplier,
                notes,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            inventory.push(newItem);
            showToast('Item added successfully!', 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('inventory', JSON.stringify(inventory));
        
        // Refresh displays
        displayInventory(inventory);
        loadInventoryStats();
        
        // Close modal
        closeModal();
        hideLoading();
    }, 500);
}

function editItem(id) {
    const item = inventory.find(item => item.id === id);
    if (item) {
        openModal(item);
    }
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        showLoading();
        setTimeout(() => {
            inventory = inventory.filter(item => item.id !== id);
            localStorage.setItem('inventory', JSON.stringify(inventory));
            displayInventory(inventory);
            loadInventoryStats();
            showToast('Item deleted successfully!', 'success');
            hideLoading();
        }, 300);
    }
}

function filterInventory() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = inventory;
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(item =>
            item.partName.toLowerCase().includes(searchTerm) ||
            (item.supplier && item.supplier.toLowerCase().includes(searchTerm)) ||
            (item.notes && item.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply status filter
    if (statusFilter) {
        filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    displayInventory(filtered);
}

// ====================
// LOGSHEETS MANAGEMENT
// ====================

function initializeLogsheets() {
    // Form submissions
    document.getElementById('sprinklerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSprinklerLog();
    });
    
    document.getElementById('temperatureForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTemperatureLog();
    });
    
    document.getElementById('inspectionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveInspectionLog();
    });
    
    // Load existing logs
    loadLogs();
}

function saveSprinklerLog() {
    showLoading();
    
    const log = {
        id: Date.now().toString(),
        date: document.getElementById('sprinklerDate').value,
        time: document.getElementById('sprinklerTime').value,
        status: document.getElementById('sprinklerStatus').value,
        comments: document.getElementById('sprinklerComments').value,
        createdAt: new Date().toISOString()
    };
    
    setTimeout(() => {
        const logs = JSON.parse(localStorage.getItem('sprinklerLogs')) || [];
        logs.unshift(log);
        localStorage.setItem('sprinklerLogs', JSON.stringify(logs));
        
        document.getElementById('sprinklerForm').reset();
        loadLogs();
        loadRecentLogs();
        showToast('Sprinkler log saved successfully!', 'success');
        hideLoading();
    }, 500);
}

function saveTemperatureLog() {
    showLoading();
    
    const log = {
        id: Date.now().toString(),
        date: document.getElementById('tempDate').value,
        time: document.getElementById('tempTime').value,
        location: document.getElementById('tempLocation').value,
        temperature: document.getElementById('temperature').value,
        inspector: document.getElementById('tempInspector').value,
        comments: document.getElementById('tempComments').value,
        createdAt: new Date().toISOString()
    };
    
    setTimeout(() => {
        const logs = JSON.parse(localStorage.getItem('temperatureLogs')) || [];
        logs.unshift(log);
        localStorage.setItem('temperatureLogs', JSON.stringify(logs));
        
        document.getElementById('temperatureForm').reset();
        loadLogs();
        loadRecentLogs();
        showToast('Temperature log saved successfully!', 'success');
        hideLoading();
    }, 500);
}

function saveInspectionLog() {
    showLoading();
    
    const log = {
        id: Date.now().toString(),
        date: document.getElementById('inspectionDate').value,
        time: document.getElementById('inspectionTime').value,
        type: document.getElementById('inspectionType').value,
        area: document.getElementById('inspectionArea').value,
        inspector: document.getElementById('inspectionInspector').value,
        details: document.getElementById('inspectionDetails').value,
        result: document.getElementById('inspectionResult').value,
        notes: document.getElementById('inspectionNotes').value,
        createdAt: new Date().toISOString()
    };
    
    setTimeout(() => {
        const logs = JSON.parse(localStorage.getItem('inspectionLogs')) || [];
        logs.unshift(log);
        localStorage.setItem('inspectionLogs', JSON.stringify(logs));
        
        document.getElementById('inspectionForm').reset();
        loadLogs();
        loadRecentLogs();
        showToast('Inspection record saved successfully!', 'success');
        hideLoading();
    }, 500);
}

function loadLogs() {
    loadSprinklerLogs();
    loadTemperatureLogs();
    loadInspectionLogs();
}

function loadSprinklerLogs() {
    const logs = JSON.parse(localStorage.getItem('sprinklerLogs')) || [];
    const container = document.getElementById('sprinklerLogsList');
    
    if (logs.length === 0) {
        container.innerHTML = '<p class="empty-state">No sprinkler logs yet</p>';
        return;
    }
    
    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <h4>Sprinkler Log - ${log.date} ${log.time}</h4>
            <p><strong>Status:</strong> ${log.status}</p>
            <p><strong>Comments:</strong> ${log.comments || 'None'}</p>
            <button class="btn btn-small btn-secondary" onclick="deleteLog('sprinklerLogs', '${log.id}')">Delete</button>
        </div>
    `).join('');
}

function loadTemperatureLogs() {
    const logs = JSON.parse(localStorage.getItem('temperatureLogs')) || [];
    const container = document.getElementById('temperatureLogsList');
    
    if (logs.length === 0) {
        container.innerHTML = '<p class="empty-state">No temperature logs yet</p>';
        return;
    }
    
    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <h4>Temperature Log - ${log.date} ${log.time}</h4>
            <p><strong>Location:</strong> ${log.location}</p>
            <p><strong>Temperature:</strong> ${log.temperature}°F</p>
            <p><strong>Inspector:</strong> ${log.inspector}</p>
            <p><strong>Comments:</strong> ${log.comments || 'None'}</p>
            <button class="btn btn-small btn-secondary" onclick="deleteLog('temperatureLogs', '${log.id}')">Delete</button>
        </div>
    `).join('');
}

function loadInspectionLogs() {
    const logs = JSON.parse(localStorage.getItem('inspectionLogs')) || [];
    const container = document.getElementById('inspectionLogsList');
    
    if (logs.length === 0) {
        container.innerHTML = '<p class="empty-state">No inspection records yet</p>';
        return;
    }
    
    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <h4>${log.type} Inspection - ${log.date} ${log.time}</h4>
            <p><strong>Area:</strong> ${log.area}</p>
            <p><strong>Inspector:</strong> ${log.inspector}</p>
            <p><strong>Details:</strong> ${log.details}</p>
            <p><strong>Result:</strong> <span class="status-badge">${log.result}</span></p>
            <p><strong>Notes:</strong> ${log.notes || 'None'}</p>
            <button class="btn btn-small btn-secondary" onclick="deleteLog('inspectionLogs', '${log.id}')">Delete</button>
        </div>
    `).join('');
}

function deleteLog(storageKey, id) {
    if (confirm('Are you sure you want to delete this log?')) {
        showLoading();
        setTimeout(() => {
            let logs = JSON.parse(localStorage.getItem(storageKey)) || [];
            logs = logs.filter(log => log.id !== id);
            localStorage.setItem(storageKey, JSON.stringify(logs));
            loadLogs();
            loadRecentLogs();
            showToast('Log deleted successfully!', 'success');
            hideLoading();
        }, 300);
    }
}

// Export functions
function exportToPDF(type) {
    showToast('PDF export feature coming soon!', 'warning');
}

function exportToExcel(type) {
    showToast('Excel export feature coming soon!', 'warning');
}

// ====================
// SUPPLIERS MANAGEMENT
// ====================

function initializeSuppliers() {
    // Modal functionality
    const modal = document.getElementById('linkModal');
    const closeBtn = modal.querySelector('.close-link');
    const cancelBtn = document.getElementById('cancelLinkBtn');
    const linkForm = document.getElementById('linkForm');
    
    closeBtn.addEventListener('click', function() {
        closeLinkModal();
    });
    
    cancelBtn.addEventListener('click', function() {
        closeLinkModal();
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLinkModal();
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
}

function addCustomLink(supplier) {
    currentSupplier = supplier;
    const modal = document.getElementById('linkModal');
    document.getElementById('linkSupplier').value = supplier;
    modal.style.display = 'block';
}

function closeLinkModal() {
    const modal = document.getElementById('linkModal');
    modal.style.display = 'none';
    document.getElementById('linkForm').reset();
    currentSupplier = null;
}

function saveCustomLink() {
    showLoading();
    
    const supplier = document.getElementById('linkSupplier').value;
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    
    setTimeout(() => {
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
        closeLinkModal();
        showToast('Custom link added successfully!', 'success');
        hideLoading();
    }, 300);
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
        showLoading();
        setTimeout(() => {
            let links = JSON.parse(localStorage.getItem(storageKey)) || [];
            links = links.filter(link => link.id !== id);
            localStorage.setItem(storageKey, JSON.stringify(links));
            loadCustomLinks();
            showToast('Link deleted successfully!', 'success');
            hideLoading();
        }, 300);
    }
}

function addCustomSupplier() {
    showLoading();
    
    const name = document.getElementById('supplierName').value;
    const description = document.getElementById('supplierDescription').value;
    const website = document.getElementById('supplierWebsite').value;
    const catalog = document.getElementById('supplierCatalog').value;
    
    setTimeout(() => {
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
        showToast('Supplier added successfully!', 'success');
        hideLoading();
    }, 500);
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
        showLoading();
        setTimeout(() => {
            let suppliers = JSON.parse(localStorage.getItem('customSuppliers')) || [];
            suppliers = suppliers.filter(supplier => supplier.id !== id);
            localStorage.setItem('customSuppliers', JSON.stringify(suppliers));
            loadCustomSuppliers();
            showToast('Supplier deleted successfully!', 'success');
            hideLoading();
        }, 300);
    }
}

// ====================
// UI UTILITIES
// ====================

function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
