# Home Budget Manager - Development

This is the development branch of Home Budget Manager. This branch contains work in progress and experimental features.

## ⚠️ Important Notice

This branch is for development purposes only. It may contain:
- Unstable code
- Experimental features
- Debugging code
- Development tools
- Incomplete implementations

**DO NOT USE THIS BRANCH IN PRODUCTION**

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- MongoDB (for development database)
- Redis (for caching)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/erezrozenbaum/HomeBudgetManager.git
   cd HomeBudgetManager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.development
   ```

4. Configure development environment variables in `.env.development`

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The application will be available at:
   - Electron app: Launches automatically
   - API: http://localhost:3001
   - WebSocket: ws://localhost:3001

### Development Tools

- **Testing**: `npm test`
- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Package**: `npm run package`

## Development Guidelines

1. **Branching Strategy**
   - `main`: Production code
   - `develop`: Development integration
   - `feature/*`: New features
   - `bugfix/*`: Bug fixes
   - `hotfix/*`: Urgent fixes

2. **Code Style**
   - Follow ESLint rules
   - Use Prettier for formatting
   - Write meaningful commit messages

3. **Testing**
   - Write unit tests for new features
   - Maintain test coverage > 80%
   - Run tests before pushing

4. **Documentation**
   - Document new features
   - Update API documentation
   - Keep README up to date

## Development Features

### Debugging Tools

- Redux DevTools
- React Developer Tools
- MongoDB Compass
- Redis Commander

### Development APIs

- Swagger UI: http://localhost:3001/api-docs
- GraphQL Playground: http://localhost:3001/graphql

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Create a pull request to `develop`

## Development Support

For development-related questions:
- Email: dev@homebudgetmanager.com
- Slack: #development channel

# Branch Strategy

Our repository follows a three-branch strategy:

- `production`: Stable, released versions only. All code here must be production-ready and tested.
- `main`: Integration/staging branch. Features are merged here before being promoted to production.
- `develop`: Active development branch. All new features and fixes start here.

## Release Process

1. Development
   - New features are developed in feature branches from `develop`
   - Feature branches are merged back to `develop` via pull requests

2. Integration
   - When features are ready, `develop` is merged into `main`
   - Testing and QA is performed on `main`

3. Production Release
   - After successful testing, `main` is merged into `production`
   - Tags are created for each production release
   - Installers are built from the `production` branch

## Contributing

1. Create feature branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push and create pull request to `develop`:
   ```bash
   git push origin feature/your-feature-name
   ```

4. After review and approval, your changes will be merged to `develop` 