import { Component, OnInit, OnDestroy, HostListener, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { AccountService } from '../../services/account.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { GameHistory } from '../../models/game.model';



interface GameStatistics {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWinnings: number;
  totalBets: number;
  netProfit: number;
  averageCorrectPositions: number;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
    standalone: false

})
export class GameComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timeouts: any[] = [];
@ViewChildren('numberInput') numberInputElements!: QueryList<ElementRef>;
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    this.isLanguageDropdownOpen = false;
  }
}
  // User info
  username: string = 'Loading...';
  userId: string = 'Loading...';
  balance: number = 0;

  // Number inputs (10 digits)
  numberInputs: (number | null )[] = new Array(10).fill(null);

  // Bet amount
  betAmount: number = 10;

  // Messages
  gameResult: string = '';
  gameError: string = '';
  gameNeutral: string = '';
  showResult: boolean = false;
  showError: boolean = false;
  showNeutral: boolean = false;

  // Game history
  gameHistory: GameHistory[] = [];

  // Statistics
  statistics: GameStatistics = {
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalWinnings: 0,
    totalBets: 0,
    netProfit: 0,
    averageCorrectPositions: 0
  };

  // Modals
  depositModal: boolean = false;
  withdrawModal: boolean = false;
  transferModal: boolean = false;

  // Forms
  depositForm: FormGroup;
  withdrawForm: FormGroup;
  transferForm: FormGroup;

  // Loading states
  isPlaying: boolean = false;
  isDepositing: boolean = false;
  isWithdrawing: boolean = false;
  isTransferring: boolean = false;

  // Language switcher
  currentLanguage = 'en';
  currentLanguageText = 'English';
  currentLanguageFlag = 'en';
  isLanguageDropdownOpen = false;

  languages = [
    { code: 'en', name: 'English', flag: 'en' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'de', name: 'Deutsch', flag: 'de' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private gameService: GameService,
    private accountService: AccountService,
    private router: Router
  ) {
   this.depositForm = this.fb.group({
    amount: ['', [Validators.required, Validators.min(1), Validators.max(10000)]]
  });
  
  this.withdrawForm = this.fb.group({
    amount: ['', [Validators.required, Validators.min(1)]]
  });
  
  this.transferForm = this.fb.group({
    receiverId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    amount: ['', [Validators.required, Validators.min(1)]]
  });
  }

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load user info
    this.loadUserInfo();

    // Load game history
    this.loadGameHistory();

    // Load statistics
    this.loadStatistics();

    // Load language preference
    this.loadLanguagePreference();

    // Auto-refresh balance every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadUserInfo();
      });
  }

  ngOnDestroy(): void {
      this.timeouts.forEach(timeout => clearTimeout(timeout));

    this.destroy$.next();
    this.destroy$.complete();
  }
 

  /**
   * Load user information
   */
  loadUserInfo(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.username = user.username;
        this.userId = user.id.toString();
        this.balance = user.balance;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
      }
    });
  }

  /**
   * Load game history
   */
  loadGameHistory(): void {
    this.gameService.getGameHistory().subscribe(history => {
        console.log('Game history loaded:', history);
        this.gameHistory = history ;
      
    });
  }

  /**
   * Load statistics
   */
  loadStatistics(): void {
    this.gameService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }



  /**
   * Play the game
   */
  playGame(): void {
    // Validate inputs
const inputs = document.querySelectorAll('.number-input') as NodeListOf<HTMLInputElement>;
let hasEmptyInputs = false;
inputs.forEach(input => {
  if (!input.value) hasEmptyInputs = true;
});
    if (hasEmptyInputs) {
      this.showErrorMessage('Please fill in all 10 numbers!');
      return;
    }

    if (!this.betAmount || this.betAmount < 1) {
      this.showErrorMessage('Please enter a valid bet amount!');
      return;
    }

    if (this.betAmount > this.balance) {
      this.showErrorMessage('Insufficient balance!');
      return;
    }

    // Validate all numbers are filled

  
  // Validate bet amount
  if (!this.betAmount || this.betAmount <= 0) {
    this.showError = true;
    this.gameError = 'Please enter a valid bet amount!';
    setTimeout(() => this.showError = false, 3000);
    return;
  }
  
  if (this.betAmount > this.balance) {
    this.showError = true;
    this.gameError = 'Insufficient balance!';
    setTimeout(() => this.showError = false, 3000);
    return;
  }
  
    this.isPlaying = true;
    this.clearMessages();

const guess = this.getNumberInputsValues();

    this.gameService.playGame({ guess, betAmount: this.betAmount }).subscribe({
      next: (result) => {
        this.isPlaying = false;

        if (result.isWin) {
          this.showSuccessMessage(
            `🎉 CONGRATULATIONS! You won $${result.winAmount}! ` +
            `You got ${result.correctPositions} positions correct!`
          );
          this.createFireworks();
        } else if (result.correctPositions > 0) {
          this.showNeutralMessage(
            `😐 Close! You got ${result.correctPositions} positions correct. ` +
            `You lost $${result.betAmount}. Try again!`
          );
          this.createSparkles();
        } else {
          this.showErrorMessage(
            `😢 Sorry, you lost $${result.betAmount}. No positions were correct. Better luck next time!`
          );
          this.createSadRain();
        }

        // Update balance
        this.loadUserInfo();

        // Reload history and statistics
        this.loadGameHistory();
        this.loadStatistics();

        // Clear number inputs
        this.numberInputs = new Array(10).fill(null);
        const inputs = document.querySelectorAll('.number-input');
        inputs.forEach((input: any) => {
          input.value = '';
        });
      },
      error: (error) => {
        this.isPlaying = false;
        this.showErrorMessage(error.error?.message || 'Game failed. Please try again.');
      }
    });

inputs.forEach(input => {
  input.value = '';
});
  }

 


  /**
   * Deposit funds
   */
  deposit(): void {
    if (this.depositForm.invalid) {
      return;
    }

    this.isDepositing = true;

    this.accountService.deposit(this.depositForm.value).subscribe({
      next: (response) => {
        this.isDepositing = false;
        this.depositModal = false;
        this.showSuccessMessage(`Successfully deposited $${this.depositForm.value.amount}!`);
        this.loadUserInfo();
      },
      error: (error) => {
        this.isDepositing = false;
        this.showErrorMessage(error.error?.message || 'Deposit failed. Please try again.');
      }
    });
  }

  /**
   * Withdraw funds
   */
  withdraw(): void {
    if (this.withdrawForm.invalid) {
      return;
    }

    const amount = this.withdrawForm.value.amount;
    if (amount > this.balance) {
      this.showErrorMessage('Insufficient balance!');
      return;
    }

    this.isWithdrawing = true;

    this.accountService.withdraw(this.withdrawForm.value).subscribe({
      next: (response) => {
        this.isWithdrawing = false;
        this.withdrawModal = false;
        this.showSuccessMessage(`Successfully withdrew $${amount}!`);
        this.loadUserInfo();
      },
      error: (error) => {
        this.isWithdrawing = false;
        this.showErrorMessage(error.error?.message || 'Withdrawal failed. Please try again.');
      }
    });
  }

  /**
   * Transfer funds
   */
  transfer(): void {
    if (this.transferForm.invalid) {
      return;
    }

    const amount = this.transferForm.value.amount;
    if (amount > this.balance) {
      this.showErrorMessage('Insufficient balance!');
      return;
    }

    this.isTransferring = true;

    this.accountService.transfer(this.transferForm.value).subscribe({
      next: (response) => {
        this.isTransferring = false;
        this.transferModal = false;
        this.showSuccessMessage(`Successfully transferred $${amount}!`);
        this.loadUserInfo();
      },
      error: (error) => {
        this.isTransferring = false;
        this.showErrorMessage(error.error?.message || 'Transfer failed. Please try again.');
      }
    });
  }

  /**
   * Logout
   */
  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Message methods
   */
  showSuccessMessage(message: string): void {
    this.gameResult = message;
    this.showResult = true;
    this.showError = false;
    this.showNeutral = false;
    this.autoHideMessages();
  }

  showErrorMessage(message: string): void {
    this.gameError = message;
    this.showError = true;
    this.showResult = false;
    this.showNeutral = false;
    this.autoHideMessages();
  }

  showNeutralMessage(message: string): void {
    this.gameNeutral = message;
    this.showNeutral = true;
    this.showResult = false;
    this.showError = false;
    this.autoHideMessages();
  }

  clearMessages(): void {
    this.showResult = false;
    this.showError = false;
    this.showNeutral = false;
  }

  autoHideMessages(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  /**
   * Animation effects
   */
  createFireworks(): void {
    // Trigger fireworks animation
    const event = new CustomEvent('triggerFireworks');
    window.dispatchEvent(event);
  }

  createSadRain(): void {
    // Trigger sad rain animation
    const event = new CustomEvent('triggerSadRain');
    window.dispatchEvent(event);
  }

  createSparkles(): void {
    // Trigger sparkles animation
    const event = new CustomEvent('triggerSparkles');
    window.dispatchEvent(event);
  }

  /**
   * Language switcher methods
   */
  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  selectLanguage(language: any): void {
    this.currentLanguage = language.code;
    this.currentLanguageText = language.name;
    this.currentLanguageFlag = language.flag;
    this.isLanguageDropdownOpen = false;
    localStorage.setItem('preferred-language', language.code);
  }

  loadLanguagePreference(): void {
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    const language = this.languages.find(lang => lang.code === savedLang);
    if (language) {
      this.currentLanguage = language.code;
      this.currentLanguageText = language.name;
      this.currentLanguageFlag = language.flag;
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }


  closeModal(type: string): void {
  switch(type) {
    case 'deposit':
      this.depositModal = false;
      this.depositForm.reset();
      break;
    case 'withdraw':
      this.withdrawModal = false;
      this.withdrawForm.reset();
      break;
    case 'transfer':
      this.transferModal = false;
      this.transferForm.reset();
      break;
  }
}


// Use this instead of setTimeout
private safeTimeout(callback: () => void, delay: number): void {
  const timeout = setTimeout(() => {
    callback();
    this.timeouts = this.timeouts.filter(t => t !== timeout);
  }, delay);
  this.timeouts.push(timeout);
}
// Add these modal show methods
showDepositModal(): void {
  this.depositModal = true;
}

showWithdrawModal(): void {
  this.withdrawModal = true;
}

showTransferModal(): void {
  this.transferModal = true;
}


handleKeydown(index: number, event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  
  // Handle backspace
  if (event.key === 'Backspace') {
    if (!input.value && index > 0) {
      const inputs = input.parentElement?.querySelectorAll('input');
      if (inputs && inputs[index - 1]) {
        (inputs[index - 1] as HTMLInputElement).focus();
      }
    }
  }
  
  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    const inputs = input.parentElement?.querySelectorAll('input');
    if (inputs && inputs[index - 1]) {
      (inputs[index - 1] as HTMLInputElement).focus();
    }
  }
  
  if (event.key === 'ArrowRight' && index < this.numberInputs.length - 1) {
    const inputs = input.parentElement?.querySelectorAll('input');
    if (inputs && inputs[index + 1]) {
      (inputs[index + 1] as HTMLInputElement).focus();
    }
  }
}

handlePaste(index: number, event: ClipboardEvent): void {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text') || '';
  const digits = pastedData.replace(/[^0-9]/g, '').split('');
  
  digits.forEach((digit, i) => {
    const targetIndex = index + i;
    if (targetIndex < this.numberInputs.length) {
      this.numberInputs[targetIndex] = parseInt(digit);
    }
  });
  
  // Focus the last filled input or the next empty one
  const nextFocusIndex = Math.min(index + digits.length, this.numberInputs.length - 1);
  const inputs = (event.target as HTMLElement).parentElement?.querySelectorAll('input');
  if (inputs && inputs[nextFocusIndex]) {
    setTimeout(() => {
      (inputs[nextFocusIndex] as HTMLInputElement).focus();
    }, 0);
  }
}

limitInput(event: any): void {
  const input = event.target as HTMLInputElement;
  
  // Exact same logic as your HTML code
  if (input.value.length > 1) {
    input.value = input.value.slice(-1);
  }
}

// Ajoutez aussi cette fonction pour récupérer les valeurs lors du jeu
getNumberInputsValues(): string {
  const inputs = document.querySelectorAll('.number-input') as NodeListOf<HTMLInputElement>;
  let guess = '';
  inputs.forEach(input => {
    guess += input.value || '0';
  });
  return guess;

}
}