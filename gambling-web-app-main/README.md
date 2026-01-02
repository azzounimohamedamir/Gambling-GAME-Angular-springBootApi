# Gambling Web Application

## Overview

This Gambling Web Application allows users to register, log in, deposit and withdraw funds, and play a number guessing game with betting functionality. The application tracks game history and displays winning statistics to users.

## Features

- **User Authentication**
  - User registration and login with JWT-based authentication.
  - Secure password handling.
  
- **Account Management**
  - Deposit funds with validation and confirmation.
  - Withdraw funds with balance checks and confirmation.
  - Transfer funds securely between users.
  - Display current user balance.

- **Game Play**
  - Number guessing game where users input a 5-digit guess (digits 0-9).
  - Users place bets on their guesses.
  - Game evaluates the guess against a random number sequence.
  - Displays game results including correct positions, win/loss status, and win amount.
  - Game history showing recent plays with results and timestamps.

- **Winning Statistics**
  - Displays total games played, wins, losses, win rate, total winnings, total bets, net profit, and average correct positions.
  - Statistics are fetched from the backend and updated dynamically.

- **UI/UX**
  - Responsive and visually appealing interface with animations and effects.
  - Modal dialogs for deposit, withdrawal, and transfer.
  - Auto-advance input fields for number guessing.
  - Success and error messages with auto-dismiss.

- **Security**
  - JWT token handling for API calls.
  - Route protection to redirect unauthenticated users to login.
  - Password hashing
## Installation Guide

### Prerequisites

- Java Development Kit (JDK) 11 or higher
- Maven 3.6 or higher
- Node.js and npm (optional, if frontend build tools are used)
- A supported database (e.g., MySQL, PostgreSQL) configured in `application.properties`
- Xampp or Wamp server and activate Mysql service
### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gambling-web-app
   ```

2. **Configure Database**

   Edit `src/main/resources/application.properties` to set your database connection details.

3. **Build the project**

   Use Maven to build the project:

   ```bash
   mvn clean install
   ```

4. **Run the application**

   ```bash
   mvn spring-boot:run
   ```

5. **Access the application**

   Open your browser and navigate to:

   ```
   http://localhost:7777
   ```

## Usage

- Register a new user or log in with existing credentials.
- Deposit funds using the deposit modal.
- Transfer funds securely to other users using the transfer modal.
- Enter your 5-digit guess and bet amount, then play the game.
- View your game history and winning statistics on the game page.
- Withdraw funds using the withdrawal modal.
- Log out when finished.

## File Structure

- `src/main/java/com/gambling/` - Java backend source code
- `src/main/resources/static/` - Static frontend files (HTML, CSS, JS)
- `src/main/resources/application.properties` - Application configuration
- `pom.xml` - Maven project file

## API Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/userinfo` - Get current user info
- `POST /account/deposit` - Deposit funds
- `POST /account/withdraw` - Withdraw funds
- `POST /account/transfer` - Transfer funds between users
- `POST /games/play` - Play the guessing game
- `GET /games/history` - Get game history
- `GET /api/games/statistics` - Get winning statistics

## Testing

- Manual testing of user registration, login, deposit, withdrawal, transfer, game play, and statistics display is recommended.
- Verify edge cases such as invalid inputs, insufficient balance, and network errors.
- Check UI responsiveness and error message displays.

## Notes

- The logout function redirects users to the login page after confirmation.
- The application uses JWT tokens stored in the frontend for authenticated API calls.
- Ensure the backend server is running before accessing the frontend pages.

## Contact

For issues or feature requests, please open an issue in the repository or contact the maintainer.
