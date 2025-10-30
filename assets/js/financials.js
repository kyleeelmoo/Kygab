// Financial Management JavaScript
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
    
    // Initialize invoices if not exists
    if (!localStorage.getItem('invoices')) {
        localStorage.setItem('invoices', JSON.stringify([]));
    }
    
    // Load data
    loadFinancialAnalytics();
    loadPayments();
    loadInvoices();
    
    // Payment form submission
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        recordPayment();
    });
    
    // Invoice modal
    document.getElementById('generateInvoiceBtn').addEventListener('click', function() {
        document.getElementById('invoiceModal').style.display = 'block';
    });
    
    document.getElementById('closeInvoiceModal').addEventListener('click', function() {
        document.getElementById('invoiceModal').style.display = 'none';
    });
    
    document.getElementById('cancelInvoiceBtn').addEventListener('click', function() {
        document.getElementById('invoiceModal').style.display = 'none';
    });
    
    // Invoice form submission
    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateInvoice();
    });
    
    // Search functionality
    document.getElementById('searchPaymentsBox').addEventListener('input', loadPayments);
    document.getElementById('searchInvoicesBox').addEventListener('input', loadInvoices);
    
    // Filter functionality
    document.getElementById('filterPaymentStatus').addEventListener('change', loadPayments);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Set default payment date to today
    document.getElementById('paymentDate').valueAsDate = new Date();
});

function loadFinancialAnalytics() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    
    // Calculate month revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthRevenue = payments
        .filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear &&
                   p.status === 'paid';
        })
        .reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate outstanding payments
    const totalExpected = tenants
        .filter(t => t.status === 'active')
        .reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const outstandingPayments = totalExpected - monthRevenue;
    
    // Count paid this month
    const paidThisMonth = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               p.status === 'paid';
    }).length;
    
    // Count overdue
    const overdueCount = payments.filter(p => p.status === 'overdue').length;
    
    // Update UI
    document.getElementById('totalRevenue').textContent = `$${monthRevenue.toLocaleString()}`;
    document.getElementById('outstandingAmount').textContent = `$${outstandingPayments.toLocaleString()}`;
    document.getElementById('paidCount').textContent = paidThisMonth;
    document.getElementById('overdueCount').textContent = overdueCount;
}

function loadPayments() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const searchTerm = document.getElementById('searchPaymentsBox').value.toLowerCase();
    const filterStatus = document.getElementById('filterPaymentStatus').value;
    
    // Filter payments
    let filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.tenant.toLowerCase().includes(searchTerm) ||
                            payment.unit.toLowerCase().includes(searchTerm);
        const matchesFilter = !filterStatus || payment.status === filterStatus;
        return matchesSearch && matchesFilter;
    });
    
    const tbody = document.getElementById('paymentsBody');
    
    if (filteredPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #888;">No payments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredPayments.map(payment => `
        <tr>
            <td>#${payment.id}</td>
            <td>${payment.tenant}</td>
            <td>${payment.unit}</td>
            <td>$${payment.amount.toLocaleString()}</td>
            <td>${payment.date}</td>
            <td>${payment.method}</td>
            <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
            <td>
                <button class="btn btn-small" onclick="viewPayment(${payment.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function loadInvoices() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const searchTerm = document.getElementById('searchInvoicesBox').value.toLowerCase();
    
    // Filter invoices
    let filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.tenant.toLowerCase().includes(searchTerm) ||
                            invoice.unit.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });
    
    const tbody = document.getElementById('invoicesBody');
    
    if (filteredInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No invoices found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredInvoices.map(invoice => `
        <tr>
            <td>#INV-${invoice.id}</td>
            <td>${invoice.tenant}</td>
            <td>${invoice.unit}</td>
            <td>$${invoice.amount.toLocaleString()}</td>
            <td>${invoice.dueDate}</td>
            <td><span class="status-badge status-${invoice.status}">${invoice.status}</span></td>
            <td>
                <button class="btn btn-small" onclick="viewInvoice(${invoice.id})">View</button>
                <button class="btn btn-small" onclick="deleteInvoice(${invoice.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function recordPayment() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    
    const newPayment = {
        id: Date.now(),
        tenant: document.getElementById('paymentTenant').value,
        unit: document.getElementById('paymentUnit').value,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        date: document.getElementById('paymentDate').value,
        method: document.getElementById('paymentMethod').value,
        notes: document.getElementById('paymentNotes').value,
        status: 'paid'
    };
    
    payments.push(newPayment);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    alert('Payment recorded successfully!');
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentDate').valueAsDate = new Date();
    
    // Switch to payments tab
    document.querySelector('[data-tab="payments"]').click();
    loadPayments();
    loadFinancialAnalytics();
}

function generateInvoice() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    
    const newInvoice = {
        id: Date.now(),
        tenant: document.getElementById('invoiceTenant').value,
        unit: document.getElementById('invoiceUnit').value,
        amount: parseFloat(document.getElementById('invoiceAmount').value),
        dueDate: document.getElementById('invoiceDueDate').value,
        description: document.getElementById('invoiceDescription').value,
        status: 'pending',
        generatedDate: new Date().toISOString().split('T')[0]
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    alert('Invoice generated successfully!');
    document.getElementById('invoiceModal').style.display = 'none';
    document.getElementById('invoiceForm').reset();
    
    loadInvoices();
}

function viewPayment(id) {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const payment = payments.find(p => p.id === id);
    
    if (!payment) return;
    
    alert(`Payment Details:\n\nID: #${payment.id}\nTenant: ${payment.tenant}\nUnit: ${payment.unit}\nAmount: $${payment.amount}\nDate: ${payment.date}\nMethod: ${payment.method}\nStatus: ${payment.status}\n${payment.notes ? 'Notes: ' + payment.notes : ''}`);
}

function viewInvoice(id) {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoice = invoices.find(i => i.id === id);
    
    if (!invoice) return;
    
    alert(`Invoice Details:\n\nInvoice #: INV-${invoice.id}\nTenant: ${invoice.tenant}\nUnit: ${invoice.unit}\nAmount: $${invoice.amount}\nDue Date: ${invoice.dueDate}\nGenerated: ${invoice.generatedDate}\nStatus: ${invoice.status}\n${invoice.description ? 'Description: ' + invoice.description : ''}`);
}

function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
        return;
    }
    
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const filteredInvoices = invoices.filter(i => i.id !== id);
    
    localStorage.setItem('invoices', JSON.stringify(filteredInvoices));
    
    alert('Invoice deleted successfully!');
    loadInvoices();
}
