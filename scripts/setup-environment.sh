#!/bin/bash

# Environment Setup Script
# This script helps set up different environment configurations

echo "🚀 SGMS Environment Setup"
echo "=========================="

# Function to copy environment file
copy_env_file() {
    local env_type=$1
    local source_file=".env.${env_type}.example"
    local target_file=".env"
    
    if [ -f "$source_file" ]; then
        echo "📋 Copying $source_file to $target_file"
        cp "$source_file" "$target_file"
        echo "✅ Environment file copied successfully"
        echo "⚠️  Please edit .env file with your actual configuration values"
    else
        echo "❌ Error: $source_file not found"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Available environments:"
    echo "  dev        - Development environment"
    echo "  staging    - Staging environment" 
    echo "  prod       - Production environment"
    echo "  help       - Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 dev      # Setup development environment"
    echo "  $0 prod     # Setup production environment"
}

# Check if environment argument is provided
if [ $# -eq 0 ]; then
    echo "❌ No environment specified"
    show_help
    exit 1
fi

# Handle environment setup
case $1 in
    "dev"|"development")
        echo "🔧 Setting up Development environment..."
        copy_env_file "example"
        echo ""
        echo "📝 Next steps:"
        echo "1. Edit .env file with your database credentials"
        echo "2. Run: npm run prisma:generate"
        echo "3. Run: npm run prisma:push"
        echo "4. Run: npm run dev"
        ;;
    "staging")
        echo "🔧 Setting up Staging environment..."
        copy_env_file "staging"
        echo ""
        echo "📝 Next steps:"
        echo "1. Edit .env file with your staging database credentials"
        echo "2. Set NODE_ENV=staging"
        echo "3. Run: npm run prisma:generate"
        echo "4. Run: npm run prisma:migrate"
        echo "5. Run: npm start"
        ;;
    "prod"|"production")
        echo "🔧 Setting up Production environment..."
        copy_env_file "production"
        echo ""
        echo "📝 Next steps:"
        echo "1. Edit .env file with your production database credentials"
        echo "2. Set NODE_ENV=production"
        echo "3. Ensure DATABASE_URL is properly configured"
        echo "4. Run: npm run prisma:generate"
        echo "5. Run: npm run prisma:migrate"
        echo "6. Run: npm start"
        echo ""
        echo "⚠️  SECURITY REMINDERS:"
        echo "- Use strong passwords"
        echo "- Use HTTPS in production"
        echo "- Set proper CORS origins"
        echo "- Use secure JWT secret (min 32 characters)"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Unknown environment: $1"
        show_help
        exit 1
        ;;
esac
