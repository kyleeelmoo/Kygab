// Inventory management functionality
let inventory = [];
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
    
    // Load inventory from localStorage
    loadInventory();
    
    // Modal functionality
    const modal = document.getElementById('itemModal');
    const addBtn = document.getElementById('addItemBtn');
    const closeBtn = document.querySelector('.close');
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
});

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
    }
    
    // Save to localStorage
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    // Refresh display
    displayInventory(inventory);
    
    // Close modal
    closeModal();
}

function editItem(id) {
    const item = inventory.find(item => item.id === id);
    if (item) {
        openModal(item);
    }
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory = inventory.filter(item => item.id !== id);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        displayInventory(inventory);
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
