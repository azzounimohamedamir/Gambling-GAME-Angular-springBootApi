import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  
  isLoginActive: boolean = true;
  isLoading: boolean = false;
  
  loginError: string = '';
  registerError: string = '';
  loginSuccess: string = '';
  registerSuccess: string = '';
  
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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/game']);
    }

    // Load language preference
    this.loadLanguagePreference();

    // Add keyboard navigation
    this.setupKeyboardNavigation();
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Handle login form submission
   */
  onLogin(): void {
    console.log("Login form submitted", this.loginForm.value);
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loginSuccess = 'Login successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/game']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.loginError = error.error?.message || 'Login failed. Please check your credentials.';
        this.autoHideMessage('loginError');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle register form submission
   */
  onRegister(): void {
    console.log("Register form submitted", this.registerForm.value);
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    if (this.registerForm.errors?.['passwordMismatch']) {
      this.registerError = 'Passwords do not match!';
      this.autoHideMessage('registerError');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const { username,email, password } = this.registerForm.value;
    
    this.authService.register({ username ,email, password }).subscribe({
      next: (response) => {
        this.registerSuccess = 'Registration successful! You can now login.';
        this.registerForm.reset();
        
        // Switch to login form after 2 seconds
        setTimeout(() => {
          this.showLogin();
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.registerError = error.error?.message || 'Registration failed. Username may already exist.';
        this.autoHideMessage('registerError');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Switch to login form
   */
  showLogin(): void {
    this.isLoginActive = true;
    this.clearMessages();
  }

  /**
   * Switch to register form
   */
  showRegister(): void {
    this.isLoginActive = false;
    this.clearMessages();
  }

  /**
   * Clear all error and success messages
   */
  clearMessages(): void {
    this.loginError = '';
    this.registerError = '';
    this.loginSuccess = '';
    this.registerSuccess = '';
  }

  /**
   * Auto-hide error message after 5 seconds
   */
  autoHideMessage(messageType: string): void {
    setTimeout(() => {
      if (messageType === 'loginError') {
        this.loginError = '';
      } else if (messageType === 'registerError') {
        this.registerError = '';
      }
    }, 5000);
  }

  /**
   * Mark all fields in form as touched to show validation errors
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Language Switcher Methods
   */
  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  selectLanguage(language: any): void {
    this.currentLanguage = language.code;
    this.currentLanguageText = language.name;
    this.currentLanguageFlag = language.flag;
    this.isLanguageDropdownOpen = false;
    
    // Save preference
    localStorage.setItem('preferred-language', language.code);
    
    // Here you would typically call a translation service
    // this.translateService.use(language.code);
    console.log(`Language changed to: ${language.code}`);
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
   * Setup keyboard navigation (Alt+Tab to switch forms)
   */
  setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && e.altKey) {
        e.preventDefault();
        if (this.isLoginActive) {
          this.showRegister();
        } else {
          this.showLogin();
        }
      }
      
      // Close language dropdown on Escape
      if (e.key === 'Escape' && this.isLanguageDropdownOpen) {
        this.isLanguageDropdownOpen = false;
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e: any) => {
      const dropdown = document.getElementById('languageSwitcher');
      if (dropdown && !dropdown.contains(e.target)) {
        this.isLanguageDropdownOpen = false;
      }
    });
  }

  /**
   * Get validation error message for a field
   */
  getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    
    if (field?.hasError('required') && field.touched) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    
    if (field?.hasError('minlength') && field.touched) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    
    return '';
  }

  /**
   * Check if form field is invalid
   */
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}