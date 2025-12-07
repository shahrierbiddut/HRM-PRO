// === DATA STATE ===
let employees = [
    { id: 1, name: 'Md. Shahrier Hossain Biddut', dept: 'IT', role: 'Software Engineer', salary: 88880, email: 'dipu@test.com', joined: '07/12/2025', rating: 10 },
    { id: 2, name: 'Md biddut', dept: 'IT', role: 'Software Engineer', salary: 10000, email: 'test@test.com', joined: '01/01/2025', rating: 5 }
];

// Audit logs from your photo + dynamic ones
let auditLogs = [
    { time: '13:30', title: 'Bonus given', desc: 'to Md. Shahrier Hossain Biddut' },
    { time: '13:38', title: 'Bonus given', desc: 'to Md. Shahrier Hossain Biddut' },
    { time: '13:40', title: 'Updated record', desc: 'for Md. Shahrier Hossain' }
];

let totalBonuses = 2000; // Starting bonus amount based on logs (2 x 1000)

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderEmployees();
    renderReviews();
    renderReports();
});

// === NAVIGATION (SPA Logic) ===
function switchView(viewId, navItem) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    // Show target section
    document.getElementById(viewId + '-section').classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    navItem.classList.add('active');

    if (viewId === 'dashboard') updateDashboard();
}

// === DASHBOARD LOGIC ===
function updateDashboard() {
    // 1. Stats
    document.getElementById('totalStaff').innerText = employees.length;

    // Payroll = Sum(Salaries) + TotalBonuses
    const basePayroll = employees.reduce((sum, emp) => sum + Number(emp.salary), 0);
    const totalPayroll = basePayroll + totalBonuses;
    document.getElementById('totalPayroll').innerText = '$' + totalPayroll.toLocaleString();

    // Avg Rating
    const avg = employees.reduce((sum, emp) => sum + emp.rating, 0) / employees.length;
    document.getElementById('avgRating').innerText = avg.toFixed(1);

    // 2. Audit Log
    const logContainer = document.getElementById('auditList');
    logContainer.innerHTML = '';
    auditLogs.forEach(log => {
        logContainer.innerHTML += `
            <div class="log-item">
                <div class="log-time">${log.time}</div>
                <div class="log-content">
                    <h4>${log.title}</h4>
                    <p>${log.desc}</p>
                </div>
            </div>
        `;
    });

    // 3. Chart
    renderChart();
}

let chartInstance = null;

function renderChart() {
    const ctx = document.getElementById('deptChart').getContext('2d');

    // Define department colors
    const deptColors = {
        'IT': '#3b82f6', // Blue
        'HR': '#10b981', // Green
        'Sales': '#f59e0b', // Orange
        'Finance': '#ef4444', // Red
        'Marketing': '#8b5cf6' // Purple
    };

    // Count employees by department
    const deptCounts = {};
    const deptLabels = [];
    const deptData = [];
    const colors = [];

    employees.forEach(emp => {
        const dept = emp.dept || 'Other';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    // Build labels, data, and colors
    Object.keys(deptCounts).forEach(dept => {
        deptLabels.push(dept);
        deptData.push(deptCounts[dept]);
        colors.push(deptColors[dept] || '#94a3b8'); // Default gray for unknown departments
    });

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: deptLabels,
            datasets: [{
                data: deptData,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { display: false } }
        }
    });

    // Update legend
    const legendContainer = document.getElementById('deptLegend');
    legendContainer.innerHTML = '';
    deptLabels.forEach((dept, index) => {
        const span = document.createElement('span');
        span.style.color = colors[index];
        span.textContent = dept;
        legendContainer.appendChild(span);
    });
}

// === EMPLOYEES LOGIC ===
function renderEmployees() {
    const grid = document.getElementById('employeeGrid');
    const filter = document.getElementById('deptFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();

    grid.innerHTML = '';

    employees.forEach(emp => {
        if ((filter === 'All' || emp.dept === filter) && emp.name.toLowerCase().includes(search)) {
            const initial = emp.name.charAt(0);
            const card = `
                <div class="emp-card glass">
                    <span class="badge">${emp.dept}</span>
                    <div class="emp-header">
                        <div class="avatar">${initial}</div>
                        <div class="emp-details">
                            <h4>${emp.name}</h4>
                            <p>${emp.role}</p>
                        </div>
                    </div>
                    <div class="card-btns">
                        <button class="btn-outline" onclick="openProfile(${emp.id})">Profile</button>
                        <button class="btn-teal" onclick="giveBonus(${emp.id})">Bonus</button>
                    </div>
                    <div class="card-footer">
                        <i class="fa-solid fa-pen" onclick="alert('Edit feature coming soon')"></i>
                        <i class="fa-solid fa-trash trash-icon" onclick="deleteEmployee(${emp.id})"></i>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        }
    });
}

function giveBonus(id) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
        // Logic: Add to total bonuses
        totalBonuses += 1000;

        // Add to audit log
        const now = new Date();
        const timeString = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
        auditLogs.unshift({ time: timeString, title: 'Bonus given', desc: `to ${emp.name}` });

        showToast(`$1,000 Bonus sent to ${emp.name}`);
        updateDashboard(); // Refresh dash numbers
    }
}

function deleteEmployee(id) {
    if (confirm('Delete this employee?')) {
        employees = employees.filter(e => e.id !== id);
        renderEmployees();
        renderReports();
        updateDashboard();
        showToast('Employee removed');
    }
}

// === REPORTS LOGIC ===
function renderReports() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '';
    employees.forEach(emp => {
        tbody.innerHTML += `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.dept}</td>
                <td>$${Number(emp.salary).toLocaleString()}</td>
                <td class="status-reviewed">Reviewed</td>
            </tr>
        `;
    });
}

// === PERFORMANCE LOGIC ===
function renderReviews() {
    const list = document.getElementById('reviewList');
    list.innerHTML = '';
    employees.forEach(emp => {
        list.innerHTML += `
            <div class="review-card">
                <div>
                    <h4>${emp.name}</h4>
                    <span style="color:var(--text-muted); font-size:0.85rem;">"Very Good"</span>
                </div>
                <div class="star-rating">
                    ${emp.rating} <i class="fa-solid fa-star"></i>
                </div>
            </div>
        `;
    });

    // Populate select in modal
    const select = document.getElementById('reviewEmpSelect');
    select.innerHTML = '';
    employees.forEach(emp => {
        select.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
    });
}

// === MODAL FUNCTIONS ===
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openProfile(id) {
    const emp = employees.find(e => e.id === id);
    document.getElementById('pName').innerText = emp.name;
    document.getElementById('pAvatar').innerText = emp.name.charAt(0);
    document.getElementById('pRole').innerText = `${emp.role} • ${emp.dept}`;
    document.getElementById('pSalary').innerText = '$' + Number(emp.salary).toLocaleString();
    document.getElementById('pRating').innerText = `"Very Good" (${emp.rating}★)`;
    openModal('profileModal');
}

function calculateTax(val) {
    const tax = val * 0.15;
    document.getElementById('taxCalc').innerText = `Estimated Tax (15%): $${tax.toLocaleString()}`;
}

// === FORM HANDLERS ===
function handleAddEmployee(e) {
    e.preventDefault();
    const name = document.getElementById('newEmpName').value;
    const role = document.getElementById('newEmpRole').value;
    const dept = document.getElementById('newEmpDept').value;
    const email = document.getElementById('newEmpEmail').value;
    const salary = document.getElementById('newEmpSalary').value;

    const newEmp = {
        id: Date.now(),
        name,
        role,
        dept,
        email,
        salary,
        joined: new Date().toLocaleDateString(),
        rating: 10 // Default
    };



    employees.push(newEmp);
    renderEmployees();
    renderReports();
    renderReviews(); // update review dropdown
    updateDashboard();
    closeModal('addEmployeeModal');
    showToast('New employee added successfully');
}

function handleSubmitReview(e) {
    e.preventDefault();
    const empId = document.getElementById('reviewEmpSelect').value;
    const rating = document.getElementById('reviewRating').value;

    // Update employee rating
    const empIndex = employees.findIndex(e => e.id == empId);
    if (empIndex > -1) {
        employees[empIndex].rating = Number(rating);
        renderReviews();
        updateDashboard();
        closeModal('addReviewModal');
        showToast('Review submitted successfully');
    }
}

// === UTILS ===
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function toggleTheme() {
    // Placeholder - layout is inherently dark based on photos
    alert("Theme toggle logic would go here (Already in Dark Mode).");
}