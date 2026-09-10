// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const balanceDisplay = document.getElementById('total-balance');
const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const transactionList = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const typeSelect = document.getElementById('type');
const amountInput = document.getElementById('amount');
const editIdInput = document.getElementById('edit-id');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formHeading = document.getElementById('form-heading');

// Helper: Format currency
function formatCurrency(amount) {
    return '₱' + Math.abs(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Helper: Save to localStorage
function saveToStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ========================
// CRUD OPERATIONS
// ========================

// 1. CREATE
function createTransaction(description, type, amount) {
    const newTransaction = {
        id: Date.now().toString(),
        description: description.trim(),
        type: type,
        amount: parseFloat(amount)
    };

    transactions.unshift(newTransaction);
    saveToStorage();
    render();
}

// 2. READ / RENDER
function render() {
    // Clear list
    transactionList.innerHTML = '';

    if (transactions.length === 0) {
        transactionList.innerHTML = '<li class="empty-state">No transactions recorded yet.</li>';
    } else {
        transactions.forEach(t => {
            const isIncome = t.type === 'income';
            const sign = isIncome ? '+' : '-';
            const item = document.createElement('li');
            item.className = `transaction-item ${t.type}`;

            item.innerHTML = `
                <div class="item-info">
                    <span class="desc">${t.description}</span>
                    <span class="type-label">${t.type}</span>
                </div>
                <div class="item-actions">
                    <span class="amount">${sign}${formatCurrency(t.amount)}</span>
                    <button class="action-btn edit" onclick="startEdit('${t.id}')">Edit</button>
                    <button class="action-btn delete" onclick="deleteTransaction('${t.id}')">Delete</button>
                </div>
            `;

            transactionList.appendChild(item);
        });
    }

    updateMetrics();
}

// 3. UPDATE
function updateTransaction(id, description, type, amount) {
    transactions = transactions.map(t => {
        if (t.id === id) {
            return {
                ...t,
                description: description.trim(),
                type: type,
                amount: parseFloat(amount)
            };
        }
        return t;
    });

    saveToStorage();
    resetFormMode();
    render();
}

// 4. DELETE
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToStorage();
    
    // If the currently edited item is deleted, reset the form
    if (editIdInput.value === id) {
        resetFormMode();
    }
    
    render();
}

// ========================
// METRICS / CALCULATIONS
// ========================
function updateMetrics() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else {
            expense += t.amount;
        }
    });

    const balance = income - expense;

    // Update Overview Cards
    incomeDisplay.textContent = `+${formatCurrency(income)}`;
    expenseDisplay.textContent = `-${formatCurrency(expense)}`;
    balanceDisplay.textContent = balance < 0 ? `-${formatCurrency(balance)}` : formatCurrency(balance);
}

// ========================
// FORM CONTROLS & EVENTS
// ========================

// Start editing a specific transaction
window.startEdit = function(id) {
    const item = transactions.find(t => t.id === id);
    if (!item) return;

    editIdInput.value = item.id;
    descriptionInput.value = item.description;
    typeSelect.value = item.type;
    amountInput.value = item.amount;

    formHeading.textContent = 'Edit Transaction';
    submitBtn.textContent = 'Save Changes';
    cancelBtn.style.display = 'block';

    descriptionInput.focus();
};

// Reset form back to "Add" mode
function resetFormMode() {
    form.reset();
    editIdInput.value = '';
    formHeading.textContent = 'Add New Transaction';
    submitBtn.textContent = 'Add Transaction';
    cancelBtn.style.display = 'none';
}

// Handle Form Submission (Create or Update)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const desc = descriptionInput.value;
    const type = typeSelect.value;
    const amount = amountInput.value;
    const editId = editIdInput.value;

    if (editId) {
        updateTransaction(editId, desc, type, amount);
    } else {
        createTransaction(desc, type, amount);
        form.reset();
    }
});

// Cancel edit button handler
cancelBtn.addEventListener('click', resetFormMode);

// Initialize application on first load
render();