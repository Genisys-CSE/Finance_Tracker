// State management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const transactionsList = document.getElementById('transactionsList');
const totalBalance = document.getElementById('totalBalance');
const monthlyIncome = document.getElementById('monthlyIncome');
const monthlyExpenses = document.getElementById('monthlyExpenses');
const topExpense = document.getElementById('topExpense');

// Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function calculateStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyStats = transactions.reduce((stats, transaction) => {
        const transactionDate = new Date(transaction.date);
        const amount = parseFloat(transaction.amount);

        if (transactionDate >= firstDayOfMonth) {
            if (transaction.type === 'income') {
                stats.income += amount;
            } else {
                stats.expenses += amount;
                stats.expensesByCategory[transaction.category] = 
                    (stats.expensesByCategory[transaction.category] || 0) + amount;
            }
        }
        return stats;
    }, { 
        income: 0, 
        expenses: 0,
        expensesByCategory: {}
    });

    const totalStats = transactions.reduce((total, transaction) => {
        return total + (transaction.type === 'income' ? 
            parseFloat(transaction.amount) : 
            -parseFloat(transaction.amount));
    }, 0);

    // Find top expense category
    const topExpenseCategory = Object.entries(monthlyStats.expensesByCategory)
        .sort(([,a], [,b]) => b - a)[0];

    // Update UI
    totalBalance.textContent = formatCurrency(totalStats);
    monthlyIncome.textContent = formatCurrency(monthlyStats.income);
    monthlyExpenses.textContent = formatCurrency(monthlyStats.expenses);
    topExpense.textContent = topExpenseCategory ? 
        topExpenseCategory[0].charAt(0).toUpperCase() + topExpenseCategory[0].slice(1) : 
        'None';
}

function createTransactionElement(transaction) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
        <div class="transaction-header">
            <div class="transaction-info">
                <h4>${transaction.description}</h4>
                <p class="transaction-date">${formatDate(transaction.date)}</p>
                <p class="transaction-category">Category: ${transaction.category}</p>
            </div>
            <div class="transaction-amount-info">
                <p class="transaction-amount ${
                    transaction.type === 'income' ? 'amount-income' : 'amount-expense'
                }">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </p>
                <p class="transaction-type">${transaction.category}</p>
            </div>
        </div>
        ${transaction.notes ? `
            <p class="transaction-notes">${transaction.notes}</p>
        ` : ''}
    `;
    return div;
}

function updateTransactionsList() {
    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                <p>No transactions recorded yet. Start tracking your finances today!</p>
            </div>
        `;
        return;
    }

    const sortedTransactions = [...transactions].reverse();
    sortedTransactions.forEach(transaction => {
        transactionsList.appendChild(createTransactionElement(transaction));
    });
}

// Event Listeners
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTransaction = {
        id: crypto.randomUUID(),
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        notes: document.getElementById('notes').value,
        date: new Date().toISOString()
    };

    transactions.push(newTransaction);
    saveTransactions();
    updateTransactionsList();
    calculateStats();
    transactionForm.reset();
});

// Navigation
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Initialize app
updateTransactionsList();
calculateStats();
