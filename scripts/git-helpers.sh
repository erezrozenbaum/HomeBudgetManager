#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to start a new feature
start_feature() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Feature name is required${NC}"
        echo "Usage: start_feature <feature-name>"
        return 1
    fi

    echo -e "${YELLOW}Starting new feature: $1${NC}"
    
    # Ensure we're on develop branch
    git checkout develop
    git pull origin develop
    
    # Create and switch to new feature branch
    git checkout -b "feature/$1"
    echo -e "${GREEN}Created and switched to feature/$1${NC}"
}

# Function to finish a feature
finish_feature() {
    current_branch=$(git symbolic-ref --short HEAD)
    
    if [[ ! $current_branch =~ ^feature/ ]]; then
        echo -e "${RED}Error: Not on a feature branch${NC}"
        return 1
    }

    echo -e "${YELLOW}Finishing feature: $current_branch${NC}"
    
    # Ensure all changes are committed
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${RED}Error: Uncommitted changes exist${NC}"
        git status
        return 1
    }

    # Switch to develop and merge
    git checkout develop
    git pull origin develop
    git merge "$current_branch"
    
    echo -e "${GREEN}Feature merged into develop${NC}"
    echo -e "${YELLOW}Don't forget to:${NC}"
    echo "1. Push changes: git push origin develop"
    echo "2. Delete feature branch: git branch -d $current_branch"
}

# Function to create a hotfix
start_hotfix() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Hotfix description is required${NC}"
        echo "Usage: start_hotfix <description>"
        return 1
    fi

    echo -e "${YELLOW}Starting new hotfix${NC}"
    
    # Ensure we're on main branch
    git checkout main
    git pull origin main
    
    # Create and switch to new hotfix branch
    git checkout -b "hotfix/$1"
    echo -e "${GREEN}Created and switched to hotfix/$1${NC}"
}

# Function to create a release
start_release() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Version number is required${NC}"
        echo "Usage: start_release <version>"
        return 1
    fi

    echo -e "${YELLOW}Starting new release: $1${NC}"
    
    # Ensure we're on develop branch
    git checkout develop
    git pull origin develop
    
    # Create and switch to new release branch
    git checkout -b "release/v$1"
    echo -e "${GREEN}Created and switched to release/v$1${NC}"
}

# Function to update current branch
update_branch() {
    current_branch=$(git symbolic-ref --short HEAD)
    base_branch="develop"
    
    if [[ $current_branch == "main" ]]; then
        base_branch="main"
    fi

    echo -e "${YELLOW}Updating $current_branch from $base_branch${NC}"
    
    git checkout $base_branch
    git pull origin $base_branch
    git checkout $current_branch
    git merge $base_branch
    
    echo -e "${GREEN}Branch updated successfully${NC}"
}

# Function to clean up merged branches
cleanup_branches() {
    echo -e "${YELLOW}Cleaning up merged branches${NC}"
    
    # Update local branches
    git fetch --prune
    
    # Delete merged feature branches
    git branch --merged develop | grep 'feature/' | xargs git branch -d
    
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Display help
show_help() {
    echo -e "${YELLOW}Git Helper Script${NC}"
    echo ""
    echo "Available commands:"
    echo "  start_feature <name>    - Start a new feature branch"
    echo "  finish_feature          - Finish current feature branch"
    echo "  start_hotfix <desc>     - Start a new hotfix branch"
    echo "  start_release <version> - Start a new release branch"
    echo "  update_branch           - Update current branch from base"
    echo "  cleanup_branches        - Clean up merged branches"
    echo ""
    echo "Examples:"
    echo "  start_feature user-auth"
    echo "  start_hotfix login-error"
    echo "  start_release 1.2.0"
}

# Main script
if [ "$1" == "help" ]; then
    show_help
elif [ "$1" == "start_feature" ]; then
    start_feature "$2"
elif [ "$1" == "finish_feature" ]; then
    finish_feature
elif [ "$1" == "start_hotfix" ]; then
    start_hotfix "$2"
elif [ "$1" == "start_release" ]; then
    start_release "$2"
elif [ "$1" == "update_branch" ]; then
    update_branch
elif [ "$1" == "cleanup_branches" ]; then
    cleanup_branches
else
    show_help
fi 