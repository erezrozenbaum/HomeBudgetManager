# HomeBudgetManager - Complete Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Core Features](#4-core-features)
5. [Database Structure](#5-database-structure)
6. [Security Implementation](#6-security-implementation)
7. [Build and Deployment](#7-build-and-deployment)
8. [Development Guidelines](#8-development-guidelines)
9. [Component Dependencies](#9-component-dependencies)
10. [Data Flow and Relationships](#10-data-flow-and-relationships)
11. [Setup and Installation Guide](#11-setup-and-installation-guide)
12. [Development Environment Setup](#12-development-environment-setup)
13. [Feature Implementation Guide](#13-feature-implementation-guide)
14. [Database Management Guide](#14-database-management-guide)
15. [Security Implementation Guide](#15-security-implementation-guide)
16. [Testing and Quality Assurance Guide](#16-testing-and-quality-assurance-guide)
17. [Build and Deployment Guide](#17-build-and-deployment-guide)
18. [Maintenance and Updates Guide](#18-maintenance-and-updates-guide)

## 1. Project Overview

### 1.1 Core Technologies
- **Frontend**: React 18.2.0 with Tailwind CSS
- **Backend**: Electron 28.3.3
- **Database**: SQLite (better-sqlite3)
- **Build Tools**: Electron Builder, Vite
- **Testing**: Jest, React Testing Library

### 1.2 Key Features
- Comprehensive budget management
- Investment tracking
- Debt management
- Financial planning
- Advanced analytics
- AI-powered financial advice
- Multi-currency support
- Data import/export
- Automated backups

## 2. Technical Architecture

### 2.1 Core Architecture
```
HomeBudgetManager/
├── Main Process (Electron)
│   ├── API Layer
│   ├── Database Layer
│   ├── Service Layer
│   └── Security Layer
│
└── Renderer Process (React)
    ├── UI Components
    ├── State Management
    ├── Services
    └── Pages
```

### 2.2 Data Flow
```
User Interface → IPC → Main Process → Database
      ↑            ↑         ↑
      └────────────┴─────────┘
```

## 3. Directory Structure

### 3.1 Root Directory
```
HomeBudgetManager/
├── dist/                    # Build output
├── src/                     # Source code
├── scripts/                 # Utility scripts
├── docs/                    # Documentation
├── nginx/                   # Nginx config
├── .github/                 # GitHub config
└── [Configuration Files]    # Various config files
```

### 3.2 Source Code Organization

#### 3.2.1 Main Process (`src/main/`)
```
src/main/
├── api/                    # API endpoint definitions
├── backup/                 # Data backup functionality
├── config/                 # Application configuration
├── controllers/            # Business logic controllers
├── database/               # Database initialization and management
├── docs/                   # API documentation
├── ipc/                    # Inter-Process Communication handlers
├── middleware/             # Express middleware
├── models/                 # Data models
├── monitoring/             # Application monitoring
├── routes/                 # API route definitions
├── scripts/                # Utility scripts
├── services/               # Core services
└── utils/                  # Utility functions
```

#### 3.2.2 Renderer Process (`src/renderer/`)
```
src/renderer/
├── components/             # Reusable React components
├── context/                # React context providers
├── contexts/               # Additional context providers
├── pages/                  # Page components
├── services/               # Frontend services
├── utils/                  # Utility functions
├── App.js                  # Main application component
├── index.css               # Global styles
├── index.html              # HTML template
├── index.js                # Renderer entry point
└── setupTests.js           # Test configuration
```

## 4. Core Features

### 4.1 Financial Management

#### 4.1.1 Budget Management
- **Components**: `BudgetPlanner.js`, `Transactions.js`
- **Features**:
  - Monthly budget planning
  - Expense tracking
  - Income management
  - Category-based budgeting
  - Budget vs. actual analysis
  - Custom budget categories
  - Budget templates

#### 4.1.2 Account Management
- **Components**: `Accounts.js`, `BankAccounts.js`, `CreditCards.js`
- **Features**:
  - Multiple account support
  - Account balance tracking
  - Transaction reconciliation
  - Account categorization
  - Account linking
  - Balance history

#### 4.1.3 Investment Tracking
- **Components**: `Investments.js`, `Stocks.js`, `Crypto.js`
- **Features**:
  - Portfolio management
  - Stock tracking
  - Cryptocurrency monitoring
  - Investment performance analysis
  - Asset allocation
  - Market data integration
  - Investment goals

### 4.2 Advanced Features

#### 4.2.1 Financial Planning
- **Components**: `Goals.js`, `SavingGoals.js`, `TaxPlanning.js`
- **Features**:
  - Goal setting and tracking
  - Savings planning
  - Tax optimization
  - Financial forecasting
  - Retirement planning
  - Education planning

#### 4.2.2 Analytics and Reporting
- **Components**: `Dashboard.js`, `FinancialReports.js`, `NetWorth.js`
- **Features**:
  - Financial overview
  - Net worth tracking
  - Custom reports
  - Data visualization
  - Performance metrics
  - Trend analysis
  - Export capabilities

## 5. Database Structure

### 5.1 Core Tables and Relationships

```
settings
  └── (Global application settings)

categories
  ├── transactions
  └── (Category hierarchy)

bank_accounts
  ├── credit_cards
  └── transactions

transactions
  ├── categories
  ├── bank_accounts
  └── credit_cards

investments
  ├── saving_goals
  └── businesses

saving_goals
  └── investments

loans
  └── (Loan management)

insurances
  └── (Insurance policies)

businesses
  ├── business_users
  └── investments

audit_log
  └── (Activity tracking)
```

### 5.2 Table Details

#### 5.2.1 Core Tables
- **Users**: User authentication and profiles
- **Accounts**: Financial accounts
- **Transactions**: Financial transactions
- **Categories**: Transaction categories
- **Budgets**: Budget plans
- **Investments**: Investment holdings
- **Goals**: Financial goals
- **Settings**: Application settings

## 6. Security Implementation

### 6.1 Security Layers
```
Application Security
├── Authentication
├── Authorization
├── Data Encryption
└── Audit Logging
```

### 6.2 Security Features
- JWT-based authentication
- Role-based access control
- Session management
- Password encryption
- Two-factor authentication
- Data encryption at rest
- Secure communication
- Regular backups
- Access logging
- Audit trails

## 7. Build and Deployment

### 7.1 Build Configuration
- **Platforms**:
  - Windows: NSIS installer
  - macOS: DMG package
  - Linux: AppImage and DEB packages
- **Build Tools**: electron-builder
- **Configuration**: `package.json`, `e.yml`

### 7.2 Deployment Process
1. Development setup
2. Testing and validation
3. Build generation
4. Package signing
5. Distribution

## 8. Development Guidelines

### 8.1 Code Organization
- Modular architecture
- Clear separation of concerns
- Consistent naming conventions
- Documentation requirements

### 8.2 Testing
- Unit tests
- Component tests
- Integration tests
- End-to-end tests
- Performance tests

## 9. Component Dependencies

### 9.1 Main Process Components

#### 9.1.1 API Layer (`src/main/api/`)
- **Dependencies**:
  - Express.js
  - Database services
  - Security middleware
  - Session management
- **Provides**:
  - REST endpoints
  - Data validation
  - Error handling
  - Response formatting

#### 9.1.2 Database Layer (`src/main/database/`)
- **Dependencies**:
  - better-sqlite3
  - Database schema
  - Migration scripts
- **Provides**:
  - Data persistence
  - Query execution
  - Transaction management
  - Data integrity

### 9.2 Renderer Process Components

#### 9.2.1 UI Components (`src/renderer/components/`)
- **Dependencies**:
  - React
  - Tailwind CSS
  - Context providers
- **Provides**:
  - Reusable components
  - Layout structures
  - Form elements
  - Data visualization

## 10. Data Flow and Relationships

### 10.1 Inter-Process Communication (IPC)

#### 10.1.1 IPC Channels
```
Main Process ↔ Renderer Process
├── Data Requests
├── State Updates
├── File Operations
└── System Events
```

#### 10.1.2 IPC Handlers
- **Backup Handlers**: Data backup and restore
- **Theme Handlers**: UI theme management
- **Timezone Handlers**: Timezone synchronization
- **Security Handlers**: Authentication and authorization

### 10.2 External Dependencies

#### 10.2.1 Core Dependencies
- **Electron**: Application framework
- **React**: UI framework
- **SQLite**: Database
- **Express**: API server

#### 10.2.2 UI Dependencies
- **Tailwind CSS**: Styling
- **Headless UI**: Components
- **Chart.js**: Data visualization
- **React Router**: Navigation

## 11. Setup and Installation Guide

### 11.1 Prerequisites Installation
1. Install Node.js (v16 or higher)
   ```bash
   # Verify installation
   node --version
   npm --version
   ```

2. Install Git
   ```bash
   # Verify installation
   git --version
   ```

3. Install Python (for some native modules)
   ```bash
   # Verify installation
   python --version
   ```

### 11.2 Project Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/HomeBudgetManager.git
   cd HomeBudgetManager
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Initialize the database
   ```bash
   npm run init-db
   ```

4. Start the development server
   ```bash
   npm start
   ```

## 12. Development Environment Setup

### 12.1 IDE Configuration
1. Install VS Code extensions:
   - ESLint
   - Prettier
   - React Developer Tools
   - SQLite Viewer

2. Configure VS Code settings:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "eslint.validate": ["javascript", "javascriptreact"]
   }
   ```

### 12.2 Environment Variables
1. Create `.env` file in root directory:
   ```env
   NODE_ENV=development
   DATABASE_PATH=./data/budget.db
   JWT_SECRET=your-secret-key
   ```

2. Create `.env.development` and `.env.production` files with appropriate values

## 13. Feature Implementation Guide

### 13.1 Budget Management
1. Create Budget Model:
   ```javascript
   // src/main/models/Budget.js
   class Budget {
     constructor(db) {
       this.db = db;
     }
     
     async create(data) {
       // Implementation
     }
     
     async get(id) {
       // Implementation
     }
   }
   ```

2. Implement Budget API:
   ```javascript
   // src/main/api/budget.js
   const express = require('express');
   const router = express.Router();
   const Budget = require('../models/Budget');
   
   router.post('/', async (req, res) => {
     try {
       const budget = await Budget.create(req.body);
       res.json(budget);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

3. Create Budget UI Component:
   ```javascript
   // src/renderer/components/BudgetForm.js
   import React, { useState } from 'react';
   
   function BudgetForm() {
     const [budget, setBudget] = useState({
       amount: 0,
       category: '',
       period: 'monthly'
     });
     
     const handleSubmit = async (e) => {
       e.preventDefault();
       // Submit budget
     };
     
     return (
       <form onSubmit={handleSubmit}>
         {/* Form fields */}
       </form>
     );
   }
   ```

## 14. Database Management Guide

### 14.1 Database Setup
1. Create database schema:
   ```sql
   -- src/main/database/schema.sql
   CREATE TABLE IF NOT EXISTS transactions (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     date DATE NOT NULL,
     amount DECIMAL(15,2) NOT NULL,
     description TEXT,
     category_id INTEGER,
     FOREIGN KEY (category_id) REFERENCES categories(id)
   );
   ```

2. Initialize database:
   ```javascript
   // src/main/database/init.js
   const sqlite3 = require('better-sqlite3');
   const path = require('path');
   
   function initDatabase() {
     const db = new sqlite3(path.join(__dirname, 'budget.db'));
     // Run schema
     // Set up indexes
     // Initialize data
     return db;
   }
   ```

## 15. Security Implementation Guide

### 15.1 Authentication
1. Set up JWT authentication:
   ```javascript
   // src/main/middleware/auth.js
   const jwt = require('jsonwebtoken');
   
   function authenticateToken(req, res, next) {
     const token = req.headers['authorization'];
     if (!token) return res.sendStatus(401);
     
     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
       if (err) return res.sendStatus(403);
       req.user = user;
       next();
     });
   }
   ```

2. Implement password hashing:
   ```javascript
   // src/main/utils/security.js
   const bcrypt = require('bcrypt');
   
   async function hashPassword(password) {
     return await bcrypt.hash(password, 10);
   }
   
   async function verifyPassword(password, hash) {
     return await bcrypt.compare(password, hash);
   }
   ```

## 16. Testing and Quality Assurance Guide

### 16.1 Unit Testing
1. Set up Jest configuration:
   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
     moduleNameMapper: {
       '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js'
     }
   };
   ```

2. Write component tests:
   ```javascript
   // src/renderer/components/__tests__/BudgetForm.test.js
   import { render, fireEvent } from '@testing-library/react';
   import BudgetForm from '../BudgetForm';
   
   test('submits budget data', async () => {
     const { getByLabelText, getByText } = render(<BudgetForm />);
     // Test implementation
   });
   ```

## 17. Build and Deployment Guide

### 17.1 Build Configuration
1. Configure electron-builder:
   ```json
   // package.json
   {
     "build": {
       "appId": "com.homebudgetmanager.app",
       "productName": "Home Budget Manager",
       "directories": {
         "output": "dist"
       },
       "win": {
         "target": "nsis"
       }
     }
   }
   ```

2. Create build script:
   ```bash
   # package.json
   {
     "scripts": {
       "build": "electron-builder",
       "build:win": "electron-builder --win",
       "build:mac": "electron-builder --mac"
     }
   }
   ```

### 17.2 Deployment Process
1. Prepare for release:
   ```bash
   npm run build
   ```

2. Test the build:
   ```bash
   # On Windows
   .\dist\HomeBudgetManager-Setup.exe
   
   # On macOS
   open dist/HomeBudgetManager.dmg
   ```

## 18. Maintenance and Updates Guide

### 18.1 Regular Maintenance
1. Database optimization:
   ```javascript
   // src/main/database/optimize.js
   async function optimizeDatabase(db) {
     // Run VACUUM
     // Rebuild indexes
     // Analyze tables
   }
   ```

2. Log rotation:
   ```javascript
   // src/main/utils/logger.js
   const winston = require('winston');
   
   const logger = winston.createLogger({
     // Configuration
   });
   ```

### 18.2 Update Process
1. Version management:
   ```json
   // package.json
   {
     "version": "1.0.0",
     "scripts": {
       "version": "npm run build && git add -A dist",
       "postversion": "git push && git push --tags"
     }
   }
   ```

2. Auto-update implementation:
   ```javascript
   // src/main/updater.js
   const { autoUpdater } = require('electron-updater');
   
   autoUpdater.checkForUpdatesAndNotify();
   ```

This comprehensive documentation provides a complete guide to the HomeBudgetManager application, including its architecture, features, implementation details, and maintenance procedures. The documentation is designed to help developers understand, implement, and maintain the application effectively. 