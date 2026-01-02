 
// Game functionality
async function loadWinningStatistics() {
    try {
        console.log('Loading winning statistics...'); // Debug log
        const response = await fetch('/api/games/statistics', {
            headers: {
                'Authorization': `Bearer ${authService.token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch winning statistics');
        }
        const stats = await response.json();
        console.log('Winning statistics:', stats); // Debug log
                document.getElementById('totalWins').textContent = stats.wins;

        document.getElementById('totalGames').textContent = stats.totalGames;
        document.getElementById('totalLosses').textContent = stats.losses;
        document.getElementById('winRate').textContent = (stats.winRate * 100).toFixed(2) + '%';
        document.getElementById('totalWinnings').textContent = '$' + parseFloat(stats.totalWinnings).toFixed(2);
        document.getElementById('totalBets').textContent = '$' + parseFloat(stats.totalBets).toFixed(2);
        document.getElementById('netProfit').textContent = '$' + parseFloat(stats.netProfit).toFixed(2);
        // Fix for avgCorrectPositions display
        document.getElementById('avgCorrectPositions').textContent = stats.averageCorrectPositions !== undefined && stats.averageCorrectPositions !== null ? stats.averageCorrectPositions.toFixed(4) : '0';
    } catch (error) {
        console.error('Error loading winning statistics:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    // Initialize page
    loadUserData();
    loadGameHistory();
    loadWinningStatistics();
});

async function loadUserData() {
    const result = await authService.apiCall('auth/userinfo');
    if (result.success) {
        const user = result.data;
        console.log('Loading user data for:', user);
        document.getElementById('username').textContent = user.username;
        document.getElementById('userId').textContent = user.id;

        document.getElementById('balance').textContent = parseFloat(user.balance).toFixed(2);
    } else {
        console.error('Failed to load user info:', result.error);
    }
}

async function playGame() {
    const inputs = document.querySelectorAll('.number-input');
    const betAmount = document.getElementById('betAmount').value;
    const numbers = [];

    // Validate inputs
    for (let input of inputs) {
        if (!input.value || input.value < 0 || input.value > 9) {
            showMessage('Please enter all numbers (0-9)', 'error');
            return;
        }
        numbers.push(parseInt(input.value));
    }

    if (!betAmount || betAmount <= 0) {
        showMessage('Please enter a valid bet amount', 'error');
        return;
    }

    const guess = numbers.join('');

    // Clear previous messages and show loading
    hideGameMessages();
    const playButton = document.querySelector('button[onclick="playGame()"]');
    playButton.disabled = true;
    playButton.textContent = 'Playing...';

    try {
        const result = await authService.apiCall('games/play', 'POST', {
            guess: guess,
            betAmount: parseFloat(betAmount)
        });

        if (result.success) {
            const game = result.data;
            console.log('Game result:', game); // Debug log
            console.log('New balance:', game.userBalance); // Debug log

            showGameResult(game);
            await loadGameHistory();
            clearInputs();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    } finally {
        playButton.disabled = false;
        playButton.textContent = 'Play';
    }
}

function showMessage(message, type) {
    const resultElement = document.getElementById('gameResult');
    const errorElement = document.getElementById('gameError');

    if (type === 'success') {
        resultElement.textContent = message;
        resultElement.style.display = 'block';
        errorElement.style.display = 'none';
    } else {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        resultElement.style.display = 'none';
    }

    setTimeout(() => {
        resultElement.style.display = 'none';
        errorElement.style.display = 'none';
    }, 5000);
}

function addToHistory(numbers, bet, won, amount) {
    const historyContainer = document.getElementById('historyContainer');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';

    const time = new Date().toLocaleTimeString();
    historyItem.innerHTML = `
        <div>Numbers: ${numbers.join(', ')}</div>
        <div>Bet: $${bet} • Result: ${won ? 'Win' : 'Loss'} ${amount > 0 ? '+' : ''}$${Math.abs(amount)}</div>
        <div style="font-size: 0.8em; color: #888;">${time}</div>
    `;

    historyContainer.insertBefore(historyItem, historyContainer.firstChild);

    // Keep only last 10 items
    while (historyContainer.children.length > 10) {
        historyContainer.removeChild(historyContainer.lastChild);
    }
}

function showGameResult(game) {
    const resultDiv = document.getElementById('gameResult');
    let message = `Number was: ${game.numberSequence}\n`;
    message += `Your guess: ${game.userGuess}\n`;
    message += `Correct positions: ${game.correctPositions}\n`;

    if( game.correctPositions ===1 && game.status === 'LOSE') {
        message += `No Win & No Lose $${game.winAmount}!`;
        resultDiv.className = 'success-message';
    }
    if (game.status === 'WIN') {
        message += `You won $${game.winAmount}!`;
        resultDiv.className = 'success-message';
         document.getElementById('balance').value = parseFloat(document.getElementById('balance').textContent).toFixed(2)+ parseFloat(game.winAmount).toFixed(2);
            document.getElementById('balance').value = parseFloat(document.getElementById('balance').textContent);
    } else {
        message += `You lost $${game.betAmount}`;
        resultDiv.className = 'error-message';
         document.getElementById('balance').value = parseFloat(document.getElementById('balance').textContent).toFixed(2)-parseFloat(game.betAmount).toFixed(2);
            document.getElementById('balance').value = parseFloat(document.getElementById('balance').textContent);
    }

    resultDiv.textContent = message;
    resultDiv.style.display = 'block';
}

function showGameError(message) {
    const errorDiv = document.getElementById('gameError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideGameMessages() {
    document.getElementById('gameResult').style.display = 'none';
    document.getElementById('gameError').style.display = 'none';
}

function clearInputs() {
    const inputs = document.querySelectorAll('.number-input');
    inputs.forEach(input => input.value = '');
}

async function loadGameHistory() {
    const result = await authService.apiCall('games/history/all');
    if (result.success) {
        displayGameHistory(result.data);
    }
}

function displayGameHistory(games) {
    const container = document.getElementById('historyContainer');
    container.innerHTML = '';

    if (!games || games.length === 0) {
        container.innerHTML = '<p>No games played yet.</p>';
        return;
    }

    games.forEach(game => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const statusClass = game.status === 'WIN' ? 'win' : 'lose';
        const amount = game.status === 'WIN' ? `+$${game.winAmount}` : `-$${game.betAmount}`;

        item.innerHTML = `
            <div>
                <strong>${game.numberSequence}</strong> vs <strong>${game.userGuess}</strong>
                <br>
                <small>Correct: ${game.correctPositions}/5</small>
            </div>
            <div class="${statusClass}">
                ${amount}
            </div>
        `;

        container.appendChild(item);
    });
}

// Modal functions
function showDepositModal() {
    document.getElementById('depositModal').style.display = 'block';
}

function showWithdrawModal() {
    document.getElementById('withdrawModal').style.display = 'block';
}

function showTransferModal() {
    document.getElementById('transferModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function deposit() {
    const amount = document.getElementById('depositAmount').value;
    const depositButton = document.querySelector('#depositModal button');

    if (!amount || amount <= 0 || amount > 10000) {
        alert('Please enter a valid amount between $1 and $10,000');
        return;
    }

    if (!confirm(`Are you sure you want to deposit $${amount}?`)) {
        return;
    }

    depositButton.disabled = true;
    depositButton.textContent = 'Processing...';

    try {
        const result = await authService.apiCall('account/deposit', 'POST', {
            amount: parseFloat(amount)
        });
        console.log('Deposit API result:', result);
        if (result.success) {
            await loadUserData(); // Update balance display after successful deposit
            closeModal('depositModal');
            document.getElementById('depositAmount').value = '';
            showSuccessMessage('Deposit successful!');
            console.log("balance current", parseFloat(document.getElementById('balance').textContent).toFixed(2));
                        console.log("amoun current",parseFloat(amount).toFixed(2));

            // Optionally, you can also update the balance display here
            const currentBalance = parseFloat(document.getElementById('balance').textContent);
            console.log("current balance", currentBalance);
            console.log("amount to deposit", parseFloat(amount));
            
            const newBalance = currentBalance 
            document.getElementById('balance').textContent = newBalance;
            
        } else {
            alert('Deposit failed: ' + result.error);
        }
    } catch (error) {
        alert('Network error. Please try again.');
    } finally {
        depositButton.disabled = false;
        depositButton.textContent = 'Deposit';
    }
}

async function withdraw() {
    const amount = document.getElementById('withdrawAmount').value;
    const withdrawButton = document.querySelector('#withdrawModal button');
    
    console.log('Withdraw amount:', amount); // Debug log
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (!confirm(`Are you sure you want to withdraw $${amount}?`)) {
        return;
    }

    withdrawButton.disabled = true;
    withdrawButton.textContent = 'Processing...';

    try {
        const result = await authService.apiCall('account/withdraw', 'POST', {
            amount: parseFloat(amount)
        });
        
        console.log('Withdraw API result:', result);

        if (result.success) {
            // Update balance and close modal on success
            closeModal('withdrawModal');
            document.getElementById('withdrawAmount').value = '';
            showSuccessMessage('Withdrawal successful!');
               console.log("balance current", parseFloat(document.getElementById('balance').textContent).toFixed(2));
                        console.log("amoun current",parseFloat(amount).toFixed(2));
            // Optionally, you can also update the balance display here
            const currentBalance = parseFloat(document.getElementById('balance').textContent);
            const newBalance = (currentBalance - parseFloat(amount)).toFixed(2);
            document.getElementById('balance').textContent = newBalance;
        } else {
            // Handle API errors but keep modal open
            alert('Withdrawal failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Withdraw API error:', error);
        
        // More detailed error handling
        let errorMessage = 'Network error. Please try again.';
        
        if (error.message) {
            errorMessage = `Error: ${error.message}`;
        } else if (error.status) {
            errorMessage = `Server error (${error.status}). Please try again.`;
        }
        
        alert(errorMessage);
        
        // Modal stays open on error so user can retry
    } finally {
        // Always re-enable the button
        withdrawButton.disabled = false;
        withdrawButton.textContent = 'Withdraw';
    }
}
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.position = 'fixed';
    successDiv.style.top = '20px';
    successDiv.style.right = '20px';
    successDiv.style.zIndex = '1000';
    successDiv.style.padding = '10px 20px';
    successDiv.style.borderRadius = '4px';
    successDiv.style.backgroundColor = '#00ff00';
    successDiv.style.color = '#000';

    document.body.appendChild(successDiv);

    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

// Auto-advance to next input when typing
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.number-input input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
});

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

};

async function transfer() {
    const receiverId = document.getElementById('transferReceiverId').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    if (!receiverId) {
        alert('Please enter a receiver user ID.');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid transfer amount.');
        return;
    }

    const transferButton = document.querySelector('#transferModal button');
    transferButton.disabled = true;
    transferButton.textContent = 'Processing...';

    try {
        const result = await authService.apiCall('account/transfer', 'POST', {
            receiverId: receiverId,
            amount: amount
        });

        if (result.success) {
            alert('Transfer successful!');
            closeModal('transferModal');
            document.getElementById('transferReceiverId').value = '';
            document.getElementById('transferAmount').value = '';
            await loadUserData(); // Refresh user data including balance
        } else {
            alert('Transfer failed: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error during transfer: ' + error.message);
    } finally {
        transferButton.disabled = false;
        transferButton.textContent = 'Transfer';
    }
}

