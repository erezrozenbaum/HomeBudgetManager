# Local-Only Desktop App – MyBudgetManager

### 💡 Description
A privacy-focused, fully-featured personal/family budget management tool. All operations are performed locally with support for real-time insights, AI analysis, and external API integrations. Built for families who want powerful functionality with full data control.

---

### 🧱 Tech Stack
- **Frontend:** React + TailwindCSS via Electron
- **Backend:** Node.js with SQLite for local DB
- **Packaging:** Electron cross-platform desktop installer (Windows/macOS/Linux)
- **API Layer:** Local REST API using Express.js with OpenAPI/Swagger documentation
- **Testing:** Jest for unit and integration tests
- **Performance Monitoring:** Built-in monitoring and analytics
- **Backup System:** Encrypted local backups with versioning

---

### 🔐 Security and Data Control
- No internet required for functionality
- All data stored locally (in SQLite or local files)
- Optional file-based encryption
- Optional local password protection for app access
- Full audit log written locally
- Encrypted backup system with password protection
- Automatic backup versioning

---

### ✅ Included Features (Full Functionality)
- ✅ Multi-currency support (ILS, USD, EUR, GBP, JPY)
- ✅ CRUD support for all modules
- ✅ Excel Import/Export with schema validation
- ✅ Tooltips on all fields
- ✅ Real-time investment price APIs (optional/opt-in)
- ✅ AI financial advisor (runs locally or via optional cloud LLM integration)
- ✅ REST API endpoints for potential local extensions or scripts
- ✅ BI-style dashboard with dynamic reports and graphs
- ✅ Performance monitoring and analytics
- ✅ Automated backup and restore system
- ✅ Database migration system
- ✅ Comprehensive API documentation
- ✅ Unit and integration testing framework

---

### 📦 Modules
#### 🔵 Bank Accounts
- Fields: Name, Branch, Currency, Color, Initial Balance
- Balance updates from linked transactions or card activity
- Performance metrics tracking
- Backup and restore support

#### 🟣 Credit Cards
- Fields: Name, Type, Issuer, Limit, Last 4 Digits, Billing Day
- Inherits currency and color from linked bank
- Billing logic handled locally
- Performance monitoring for transactions

#### 🟡 Transactions
- CRUD & bulk Excel import/export
- Flags: Recurring, Unplanned, Entitlement
- Automatically affect linked accounts' balance
- Performance tracking for large datasets
- Backup and restore support

#### 🟢 Investments
- Crypto, Stock, Real Estate
- Manual input or optional real-time via API
- Linked to Saving Goals and Businesses
- Performance analytics
- Backup and restore support

#### 🟠 Saving Goals
- Tracks progress with target, amount saved, currency, and end date
- Status: On Track / Off Track
- Performance tracking
- Backup and restore support

#### 🔴 Loans
- Tracks monthly payments, source, duration, interest
- Integrated into net worth
- Performance monitoring
- Backup and restore support

#### ⚪ Insurances
- One-time or recurring payments
- Categories are color-coded
- Performance tracking
- Backup and restore support

#### 🟤 Businesses
- Local metadata tracking (Users, Financials, Profile)
- No OCR unless locally supported
- Performance monitoring
- Backup and restore support

---

### 🤖 AI Financial Advisor
- Runs locally or via optional cloud API
- Analyzes trends, predicts spending, answers queries
- Pre-built + Free-text queries supported
- Performance monitoring for AI operations
- Backup and restore support for AI models

---

### 📊 Reports & Dashboard
- Cards: Net Balance, Total Income, Total Expenses
- Graphs: Income vs Expenses, Category Breakdown
- Time filters, account filters
- Exportable reports (CSV/PDF)
- Performance analytics
- Backup and restore support

---

### ⚙️ Settings
- Language, Timezone, Currency, Theme
- Manage main/sub categories
- Import/Export/Delete Data
- Sidebar customization
- Backup configuration
- Performance monitoring settings
- API documentation access

---

### 🛠 Developer Options
- Local REST API available for custom automations
- Swagger/OpenAPI documentation for local extensions
- Can connect to local n8n or other tools
- Performance monitoring dashboard
- Backup management interface
- Migration management tools
- Testing framework access

---

### 📦 Packaging Notes
- Built with Electron Builder
- Output: `.exe`, `.dmg`, `.AppImage`
- Optional auto-update (manual trigger)
- No internet dependency for core features
- Performance monitoring included
- Backup system integrated
- Testing framework bundled

---

### 🚀 Deployment Guide
1. **Prerequisites**
   - Node.js 16.x or later
   - npm 7.x or later
   - Git

2. **Installation**
   ```bash
   git clone [repository-url]
   cd MyBudgetManager
   npm install
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Building**
   ```bash
   npm run build
   ```

5. **Packaging**
   ```bash
   npm run package
   ```

6. **Testing**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Run tests in watch mode
   npm run test:coverage # Generate test coverage report
   ```

7. **Backup Management**
   ```bash
   # Create backup
   npm run backup -- --password your-password
   
   # Restore backup
   npm run restore -- --file backup-file.db --password your-password
   ```

8. **Performance Monitoring**
   ```bash
   # View performance metrics
   npm run monitor
   
   # Generate performance report
   npm run performance-report
   ```

---

### 🔧 Performance Optimization
1. **Database Optimization**
   - Indexes on frequently queried columns
   - Materialized views for complex queries
   - Connection pooling
   - Query caching
   - Performance monitoring
   - Backup optimization

2. **Frontend Optimization**
   - Lazy loading of components
   - Virtualized lists for large datasets
   - Memoization of expensive calculations
   - Debounced API calls
   - Performance monitoring
   - Backup state management

3. **Memory Management**
   - Regular cleanup of temporary files
   - Efficient data structures
   - Proper resource disposal
   - Performance monitoring
   - Backup memory optimization

---

### 🔄 Maintenance
1. **Backup & Restore**
   - Automatic daily backups
   - Manual backup triggers
   - Encrypted backup storage
   - Point-in-time recovery
   - Version control
   - Performance monitoring

2. **Updates**
   - Manual update checks
   - Changelog tracking
   - Version compatibility checks
   - Data migration scripts
   - Performance monitoring
   - Backup verification

3. **Monitoring**
   - Performance metrics
   - Error logging
   - Usage statistics
   - Resource utilization
   - Backup status
   - Migration status

---

### 📚 API Documentation
- Local REST API endpoints documented with OpenAPI/Swagger
- Authentication methods
- Rate limiting
- Error handling
- Response formats
- Performance metrics
- Backup endpoints
- Migration endpoints

---

### 🧪 Testing
1. **Unit Tests**
   - Jest for JavaScript/TypeScript
   - SQLite in-memory testing
   - Mock services
   - Performance testing
   - Backup testing
   - Migration testing

2. **Integration Tests**
   - API endpoint testing
   - Database operations
   - File system operations
   - Performance testing
   - Backup testing
   - Migration testing

3. **Performance Tests**
   - Load testing
   - Memory profiling
   - CPU utilization
   - Backup performance
   - Migration performance

---

### 🐛 Bug Reporting
- Use GitHub Issues
- Include error logs
- Steps to reproduce
- Expected vs actual behavior
- Performance metrics
- Backup status
- Migration status

---

### 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request
6. Include performance tests
7. Include backup tests
8. Include migration tests

---

### 📄 License
MIT License - See LICENSE file for details