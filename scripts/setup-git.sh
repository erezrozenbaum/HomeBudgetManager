#!/bin/bash

# Initialize Git repository
git init

# Create main branches
git checkout -b main
git checkout -b develop

# Create initial commit
git add .
git commit -m "Initial commit: Project setup"

# Set up branch protection rules
echo "Setting up branch protection rules..."
git config branch.main.protect true
git config branch.develop.protect true

# Create feature branch template
git checkout -b feature/template
git checkout develop

echo "Git repository setup complete!"
echo "Current branch structure:"
git branch -a

echo "
Next steps:
1. Add remote repository: git remote add origin <repository-url>
2. Push branches: git push -u origin main develop
3. Create your first feature branch: git checkout -b feature/your-feature-name
" 