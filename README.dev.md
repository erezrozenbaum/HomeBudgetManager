# Home Budget Manager (Development)

A personal finance management desktop application built with Electron, React, and Node.js.

## Development Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

### Installation for Development

1. Clone the repository
```bash
git clone https://github.com/erezrozenbaum/HomeBudgetManager.git
cd HomeBudgetManager
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Project Structure

```
src/
├── main/              # Electron main process
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── services/      # Business logic
├── renderer/          # React frontend
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   └── contexts/      # React contexts
└── shared/            # Shared utilities
```

## Development Guidelines

### Code Style
- Use ESLint for code linting
- Follow Prettier formatting rules
- Write meaningful commit messages
- Document new features and changes

### Testing
Run the test suite:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

### Building
Build the application:
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Roadmap

### Phase 1 (Completed)
- ✅ Basic application structure
- ✅ User authentication
- ✅ Core budget tracking features
- ✅ Local data storage
- ✅ Basic reporting

### Phase 2 (In Progress)
- 🚧 Investment tracking
- 🚧 Advanced reporting
- 🚧 Data import/export
- 🚧 Multi-currency support

### Phase 3 (Planned)
- Mobile companion app
- Cloud sync options
- AI-powered insights
- Advanced analytics

## Known Issues

See the [Issues](https://github.com/erezrozenbaum/HomeBudgetManager/issues) page for a list of current issues and planned improvements.

## Development Team

- Erez Rozenbaum - Project Lead

## Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hot fixes for production

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 