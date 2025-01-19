let balance = 0;

function addTransaction() {
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value.trim());

    if (description && !isNaN(amount)) {
        const transactionList = document.getElementById('transaction-list');
        const listItem = document.createElement('li');
        listItem.innerHTML = `${description} <span>$${amount.toFixed(2)}</span>`;

        transactionList.appendChild(listItem);

        balance += amount;
        document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;

        descriptionInput.value = '';
        amountInput.value = '';
    }
}
