 
// Authentication utilities
class AuthService {
    constructor() {
        this.baseUrl = 'http://localhost:7777/api';
        this.token = localStorage.getItem('token');
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                localStorage.setItem('token', this.token);
                localStorage.setItem('username', data.username);
                return { success: true, data };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    async register(username, password) {
        try {
            const response = await fetch(`api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                localStorage.setItem('token', this.token);
                localStorage.setItem('username', data.username);
                return { success: true, data };
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/';
    }

    isAuthenticated() {
        return !!this.token;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async apiCall(endpoint, method, body ) {
        console.log("API Call:"+ endpoint, method, body);
       
        const config = {
            method,
            headers: this.getAuthHeaders()
        };

        if (body) {
            config.body = JSON.stringify(body);
        }
       
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, config);
            
            if (response.status === 401) {
                this.logout();
                return { success: false, error: 'Unauthorized' };
            }

            if (response.ok) {
                // Try to parse JSON, but handle empty body gracefully
                const text = await response.text();
                if (text) {
                    try {
                        const data = JSON.parse(text);
                        return { success: true, data };
                    } catch (e) {
                        // Invalid JSON
                        return { success: false, error: 'Invalid JSON response' };
                    }
                } else {
                    // Empty body, treat as success with no data
                    return { success: true, data: null };
                }
            } else {
                const error = await response.text();
                return { success: false, error };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }
}

// Initialize auth service
const authService = new AuthService();

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const result = await authService.login(username, password);
            
            if (result.success) {
                window.location.href = '/game';
            } else {
                showError(result.error);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            console.log('Register attempt:', username, password, confirmPassword);
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            
            const result = await authService.register(username, password);
            
            if (result.success) {
                window.location.href = '/game';
            } else {
                showError(result.error);
            }
        });
    }
});


function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}
