// Forms and Logsheets functionality
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
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            openTab(tabName);
        });
    });
    
    // Check for hash in URL to open specific tab
    const hash = window.location.hash.substring(1);
    if (hash) {
        openTab(hash);
    }
    
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
});

function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show the selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to the clicked button
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function saveSprinklerLog() {
    const log = {
        id: Date.now().toString(),
        date: document.getElementById('sprinklerDate').value,
        time: document.getElementById('sprinklerTime').value,
        status: document.getElementById('sprinklerStatus').value,
        comments: document.getElementById('sprinklerComments').value,
        createdAt: new Date().toISOString()
    };
    
    const logs = JSON.parse(localStorage.getItem('sprinklerLogs')) || [];
    logs.unshift(log);
    localStorage.setItem('sprinklerLogs', JSON.stringify(logs));
    
    document.getElementById('sprinklerForm').reset();
    loadLogs();
    alert('Sprinkler log saved successfully!');
}

function saveTemperatureLog() {
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
    
    const logs = JSON.parse(localStorage.getItem('temperatureLogs')) || [];
    logs.unshift(log);
    localStorage.setItem('temperatureLogs', JSON.stringify(logs));
    
    document.getElementById('temperatureForm').reset();
    loadLogs();
    alert('Temperature log saved successfully!');
}

function saveInspectionLog() {
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
    
    const logs = JSON.parse(localStorage.getItem('inspectionLogs')) || [];
    logs.unshift(log);
    localStorage.setItem('inspectionLogs', JSON.stringify(logs));
    
    document.getElementById('inspectionForm').reset();
    loadLogs();
    alert('Inspection record saved successfully!');
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
        container.innerHTML = '<p>No sprinkler logs found.</p>';
        return;
    }
    
    container.innerHTML = logs.slice(0, 10).map(log => `
        <div class="log-item">
            <h4>${log.date} at ${log.time}</h4>
            <p><strong>Status:</strong> ${log.status}</p>
            <p><strong>Comments:</strong> ${log.comments || 'N/A'}</p>
            <button class="btn btn-small btn-secondary" onclick="deleteLog('sprinkler', '${log.id}')">Delete</button>
        </div>
    `).join('');
}

function loadTemperatureLogs() {
    const logs = JSON.parse(localStorage.getItem('temperatureLogs')) || [];
    const container = document.getElementById('temperatureLogsList');
    
    if (logs.length === 0) {
        container.innerHTML = '<p>No temperature logs found.</p>';
        return;
    }
    
    container.innerHTML = logs.slice(0, 10).map(log => `
        <div class="log-item">
            <h4>${log.date} at ${log.time}</h4>
            <p><strong>Location:</strong> ${log.location}</p>
            <p><strong>Temperature:</strong> ${log.temperature}°F</p>
            <p><strong>Inspector:</strong> ${log.inspector}</p>
            <p><strong>Comments:</strong> ${log.comments || 'N/A'}</p>
            <button class="btn btn-small btn-secondary" onclick="deleteLog('temperature', '${log.id}')">Delete</button>
        </div>
    `).join('');
}

function loadInspectionLogs() {
    const logs = JSON.parse(localStorage.getItem('inspectionLogs')) || [];
    const container = document.getElementById('inspectionLogsList');
    
    if (logs.length === 0) {
        container.innerHTML = '<p>No inspection records found.</p>';
        return;
    }
    
    container.innerHTML = logs.slice(0, 10).map(log => `
        <div class="log-item">
            <h4>${log.type} Inspection - ${log.date} at ${log.time}</h4>
            <p><strong>Area:</strong> ${log.area}</p>
            <p><strong>Inspector:</strong> ${log.inspector}</p>
            <p><strong>Details:</strong> ${log.details}</p>
            <p><strong>Result:</strong> ${log.result}</p>
            <p><strong>Notes:</strong> ${log.notes || 'N/A'}</p>
            <button class="btn btn-small btn-secondary" onclick="deleteLog('inspection', '${log.id}')">Delete</button>
        </div>
    `).join('');
}

function deleteLog(type, id) {
    if (confirm('Are you sure you want to delete this log?')) {
        const storageKey = type + 'Logs';
        let logs = JSON.parse(localStorage.getItem(storageKey)) || [];
        logs = logs.filter(log => log.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(logs));
        loadLogs();
    }
}

// Export to PDF function
function exportToPDF(type) {
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF) {
        alert('PDF export library not loaded. Please refresh the page.');
        return;
    }
    
    const doc = new jsPDF();
    const storageKey = type + 'Logs';
    const logs = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (logs.length === 0) {
        alert('No logs to export!');
        return;
    }
    
    let yPos = 20;
    doc.setFontSize(16);
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Logsheets`, 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    logs.forEach((log, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`Log ${index + 1}:`, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        Object.keys(log).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                doc.text(`${key}: ${log[key]}`, 25, yPos);
                yPos += 5;
            }
        });
        yPos += 5;
    });
    
    doc.save(`${type}-logsheets.pdf`);
}

// Export to Excel function
function exportToExcel(type) {
    if (typeof XLSX === 'undefined') {
        alert('Excel export library not loaded. Please refresh the page.');
        return;
    }
    
    const storageKey = type + 'Logs';
    const logs = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (logs.length === 0) {
        alert('No logs to export!');
        return;
    }
    
    // Prepare data for Excel
    const data = logs.map(log => {
        const row = {};
        Object.keys(log).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                row[key.charAt(0).toUpperCase() + key.slice(1)] = log[key];
            }
        });
        return row;
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Logs`);
    
    XLSX.writeFile(wb, `${type}-logsheets.xlsx`);
}
