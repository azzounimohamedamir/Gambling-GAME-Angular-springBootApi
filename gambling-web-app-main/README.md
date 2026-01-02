# 🎰 Gambling Game - Full Stack Application

[![Angular](https://img.shields.io/badge/Angular-17+-dd0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0+-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NgRx](https://img.shields.io/badge/NgRx-Latest-BA2BD2?style=for-the-badge&logo=ngrx&logoColor=white)](https://ngrx.io/)

A modern, full-stack gambling game application built with **Angular + NgRx** on the frontend and **Spring Boot REST API** on the backend. This application demonstrates best practices in state management, RESTful API design, and responsive web development.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
  - [Frontend Setup (Angular)](#frontend-setup-angular)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🎮 **Interactive Gambling Game** - Engaging gameplay with real-time updates
- 🔐 **User Authentication** - Secure login and registration system
- 💰 **Balance Management** - Track and manage user credits
- 📊 **State Management** - Powered by NgRx for predictable state flow
- 🌐 **RESTful API** - Clean and documented backend endpoints
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔄 **Real-time Updates** - Dynamic UI updates without page refresh
- 🎨 **Modern UI/UX** - Clean and intuitive interface

---

## 🛠 Tech Stack

### Frontend
- **Angular** 17+ - Modern web framework
- **NgRx** - State management library
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Angular Material / Bootstrap** - UI components
- **SCSS** - Styling

### Backend
- **Spring Boot** 3.0+ - Java framework
- **Spring Data JPA** - Data persistence
- **Spring Security** - Authentication & Authorization
- **MySQL** - Database
- **Maven** - Dependency management
- **Lombok** - Code reduction

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | 18.x or higher | [Download](https://nodejs.org/) |
| **npm** | 9.x or higher | Comes with Node.js |
| **Java JDK** | 17 or higher | [Download](https://www.oracle.com/java/technologies/downloads/) |
| **Maven** | 3.8+ | [Download](https://maven.apache.org/download.cgi) |
| **Git** | Latest | [Download](https://git-scm.com/) |
| **MySQL** | 8.0+ (Optional) | [Download](https://dev.mysql.com/downloads/) |

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Java version
java -version

# Check Maven version
mvn -version

# Check Git version
git --version
```

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/azzounimohamedamir/Gambling-GAME-Angular-springBootApi.git
cd Gambling-GAME-Angular-springBootApi
```

---

## 🔧 Backend Setup (Spring Boot)

### Step 1: Navigate to Backend Directory

```bash
cd backend
# OR if your backend is in a different folder
cd gambling-web-app-main
```

### Step 2: Configure Database

**Option A: Using H2 Database (For Development - No Setup Required)**



### Step 3: Install Dependencies

```bash
# Using Maven
mvn clean install
```

### Step 4: Run the Backend

```bash
# Using Maven
mvn spring-boot:run

# OR using Java
java -jar target/gambling-api-0.0.1-SNAPSHOT.jar
```

The backend API will start at: **http://localhost:7777**

---

## 🎨 Frontend Setup (Angular)

### Step 1: Navigate to Frontend Directory

```bash
# From the root directory
cd gambling-angular\gambling-angular
```

### Step 2: Install Dependencies

```bash
npm install
```

> **Note:** If you encounter any errors, try:
> ```bash
> npm install --legacy-peer-deps
> ```

### Step 3: Configure API Endpoint

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7777/api'
};
```

### Step 4: Run the Frontend

```bash
npm start
# OR
ng serve
```

The application will start at: **http://localhost:4200**

---

## 🎯 Running the Application

### Quick Start (Both Frontend & Backend)

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Access the Application

1. Open your browser and navigate to: **http://localhost:4200**
2. The frontend will communicate with the backend at: **http://localhost:7777**



## 📚 API Documentation

### Base URL
```
http://localhost:7777/api
```

### Main Endpoints

#### Authentication
```http
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # User login
POST   /api/auth/logout      # User logout
GET    /api/auth/me          # Get current user
```

#### Game Operations
```http
GET    /api/game       # Start new game
POST   /api/game/bet         # Place a bet
GET    /api/game/history     # Get game history
GET    /api/game/leaderboard # Get leaderboard
```

#### User Management
```http
GET    /api/users            # Get all users (Admin)
GET    /api/users/{id}       # Get user by ID
PUT    /api/users/{id}       # Update user
DELETE /api/users/{id}       # Delete user (Admin)
```

### Example API Request

```bash
# Login Example
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 📁 Project Structure

```
Gambling-GAME-Angular-springBootApi/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/gambling/
│   │   │   │       ├── controller/  # REST Controllers
│   │   │   │       ├── model/       # Entity Classes
│   │   │   │       ├── repository/  # JPA Repositories
│   │   │   │       ├── service/     # Business Logic
│   │   │   │       ├── dto/         # Data Transfer Objects
│   │   │   │       ├── config/      # Configuration Classes
│   │   │   │       └── security/    # Security Config
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data.sql         # Initial Data
│   │   └── test/                    # Unit Tests
│   ├── pom.xml                      # Maven Dependencies
│   └── README.md
│
├── frontend/                         # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # UI Components
│   │   │   ├── services/            # API Services
│   │   │   ├── models/              # TypeScript Models
│   │   │   ├── store/               # NgRx Store
│   │   │   │   ├── actions/
│   │   │   │   ├── reducers/
│   │   │   │   ├── effects/
│   │   │   │   └── selectors/
│   │   │   ├── guards/              # Route Guards
│   │   │   └── interceptors/        # HTTP Interceptors
│   │   ├── assets/                  # Images, Fonts, etc.
│   │   ├── environments/            # Environment Config
│   │   ├── styles.scss              # Global Styles
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                         # This file
```

---

## ⚙️ Configuration

### Backend Configuration

**Application Properties** (`application.properties` or `application.yml`)

```properties
# Server Configuration
server.port=8080

# CORS Configuration
cors.allowed.origins=http://localhost:4200

# JWT Configuration (if applicable)
jwt.secret=your-secret-key
jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.com.gambling=DEBUG
```

### Frontend Configuration

**Environment Files**

```typescript
// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  enableDebug: true
};

// src/environments/environment.prod.ts (Production)
export const environment = {
  production: true,
  apiUrl: 'https://your-domain.com/api',
  wsUrl: 'wss://your-domain.com/ws',
  enableDebug: false
};
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. **Port Already in Use**

**Backend (Port 8080):**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Frontend (Port 4200):**
```bash
# Run on different port
ng serve --port 4300
```

#### 2. **CORS Errors**

Add to your Spring Boot backend:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowCredentials(true);
            }
        };
    }
}
```

#### 3. **Database Connection Failed**

- Verify MySQL is running
- Check username and password in `application.properties`
- Ensure database exists: `CREATE DATABASE gambling_game;`

#### 4. **npm install fails**

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 5. **Maven Build Fails**

```bash
# Clean and rebuild
mvn clean install -U

# Skip tests if needed
mvn clean install -DskipTests
```

---

## 📖 Development Guide

### Building for Production

**Backend:**
```bash
mvn clean package -DskipTests
# JAR file will be in target/ directory
```

**Frontend:**
```bash
ng build --configuration production
# Build files will be in dist/ directory
```

### Running Tests

**Backend:**
```bash
mvn test
```

**Frontend:**
```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Style

- **Backend:** Follow Java coding conventions
- **Frontend:** Follow Angular style guide
- Use meaningful commit messages
- Add comments for complex logic
- Write unit tests for new features

---

## 📞 Support

If you encounter any issues or have questions:

- 📧 Email: azzounimohamedamir@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/azzounimohamedamir/Gambling-GAME-Angular-springBootApi/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/azzounimohamedamir/Gambling-GAME-Angular-springBootApi/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Spring Boot Team for the robust backend framework
- NgRx Team for state management
- All contributors who helped improve this project

---

## 📸 Screenshots


## 🗺️ Roadmap

- [ ] Add WebSocket support for real-time updates
- [ ] Implement payment gateway integration
- [ ] Add more game variants
- [ ] Mobile app (React Native / Flutter)
- [ ] Admin dashboard enhancements
- [ ] Multi-language support
- [ ] Social features (friends, chat)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Mohamed Amir Azzouni](https://github.com/azzounimohamedamir)

</div>
