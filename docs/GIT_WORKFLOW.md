# Git Workflow Documentation

## Branch Structure

### Main Branches
- `main`: Production-ready code
- `develop`: Integration branch for features

### Supporting Branches
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes
- `release/*`: Release preparation

## Branch Naming Conventions

### Feature Branches
```
feature/<feature-name>
```
Example: `feature/user-authentication`

### Bug Fix Branches
```
bugfix/<issue-number>-<description>
```
Example: `bugfix/123-login-error`

### Hotfix Branches
```
hotfix/<issue-number>-<description>
```
Example: `hotfix/456-critical-security-fix`

### Release Branches
```
release/v<version-number>
```
Example: `release/v1.2.0`

## Development Workflow

### Starting a New Feature
1. Create feature branch from develop:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Develop and commit changes:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push changes:
   ```bash
   git push origin feature/your-feature-name
   ```

### Completing a Feature
1. Create pull request to develop
2. Code review
3. Merge to develop
4. Delete feature branch

### Release Process
1. Create release branch from develop:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.2.0
   ```

2. Version bump and final testing
3. Merge to main and develop
4. Tag release:
   ```bash
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push origin v1.2.0
   ```

### Hotfix Process
1. Create hotfix branch from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/issue-description
   ```

2. Fix and test
3. Merge to main and develop
4. Tag new version

## Commit Message Convention

Format: `<type>(<scope>): <subject>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

Example:
```
feat(auth): add user authentication
fix(api): resolve login error
docs(readme): update installation instructions
```

## Branch Protection Rules

### Main Branch
- Require pull request reviews
- Require status checks to pass
- Require linear history
- No direct commits

### Develop Branch
- Require pull request reviews
- Require status checks to pass
- No direct commits

## Code Review Process

1. Create pull request
2. Assign reviewers
3. Address review comments
4. Get approval
5. Merge to target branch

## Best Practices

1. Keep branches up to date:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git merge develop
   ```

2. Use meaningful commit messages
3. Keep commits focused and atomic
4. Regularly push changes
5. Delete merged branches
6. Use pull requests for all changes
7. Follow the commit message convention
8. Keep the history clean with rebase when needed

## Troubleshooting

### Resolving Merge Conflicts
1. Update your branch:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git merge develop
   ```

2. Resolve conflicts
3. Commit changes:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts"
   ```

### Reverting Changes
1. Revert a commit:
   ```bash
   git revert <commit-hash>
   ```

2. Reset to a previous state:
   ```bash
   git reset --hard <commit-hash>
   ```
   (Use with caution, as this will discard all changes after the specified commit) 