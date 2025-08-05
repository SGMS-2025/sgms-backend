# PowerShell Environment Setup Script
# This script helps set up different environment configurations

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = ""
)

Write-Host "🚀 SGMS Environment Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Function to copy environment file
function Copy-EnvFile {
    param (
        [string]$EnvType
    )
    
    $sourceFile = ".env.$EnvType.example"
    $targetFile = ".env"
    
    if (Test-Path $sourceFile) {
        Write-Host "📋 Copying $sourceFile to $targetFile" -ForegroundColor Yellow
        Copy-Item $sourceFile $targetFile -Force
        Write-Host "✅ Environment file copied successfully" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file with your actual configuration values" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $sourceFile not found" -ForegroundColor Red
        exit 1
    }
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\setup-environment.ps1 [environment]" -ForegroundColor White
    Write-Host ""
    Write-Host "Available environments:" -ForegroundColor White
    Write-Host "  dev        - Development environment" -ForegroundColor Gray
    Write-Host "  staging    - Staging environment" -ForegroundColor Gray
    Write-Host "  prod       - Production environment" -ForegroundColor Gray
    Write-Host "  help       - Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Example:" -ForegroundColor White
    Write-Host "  .\setup-environment.ps1 dev      # Setup development environment" -ForegroundColor Gray
    Write-Host "  .\setup-environment.ps1 prod     # Setup production environment" -ForegroundColor Gray
}

# Check if environment argument is provided
if ([string]::IsNullOrEmpty($Environment)) {
    Write-Host "❌ No environment specified" -ForegroundColor Red
    Show-Help
    exit 1
}

# Handle environment setup
switch ($Environment.ToLower()) {
    { $_ -in @("dev", "development") } {
        Write-Host "🔧 Setting up Development environment..." -ForegroundColor Green
        Copy-EnvFile "example"
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Edit .env file with your database credentials" -ForegroundColor Gray
        Write-Host "2. Run: npm run prisma:generate" -ForegroundColor Gray
        Write-Host "3. Run: npm run prisma:push" -ForegroundColor Gray
        Write-Host "4. Run: npm run dev" -ForegroundColor Gray
    }
    "staging" {
        Write-Host "🔧 Setting up Staging environment..." -ForegroundColor Green
        Copy-EnvFile "staging"
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Edit .env file with your staging database credentials" -ForegroundColor Gray
        Write-Host "2. Set NODE_ENV=staging" -ForegroundColor Gray
        Write-Host "3. Run: npm run prisma:generate" -ForegroundColor Gray
        Write-Host "4. Run: npm run prisma:migrate" -ForegroundColor Gray
        Write-Host "5. Run: npm start" -ForegroundColor Gray
    }
    { $_ -in @("prod", "production") } {
        Write-Host "🔧 Setting up Production environment..." -ForegroundColor Green
        Copy-EnvFile "production"
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Edit .env file with your production database credentials" -ForegroundColor Gray
        Write-Host "2. Set NODE_ENV=production" -ForegroundColor Gray
        Write-Host "3. Ensure DATABASE_URL is properly configured" -ForegroundColor Gray
        Write-Host "4. Run: npm run prisma:generate" -ForegroundColor Gray
        Write-Host "5. Run: npm run prisma:migrate" -ForegroundColor Gray
        Write-Host "6. Run: npm start" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  SECURITY REMINDERS:" -ForegroundColor Yellow
        Write-Host "- Use strong passwords" -ForegroundColor Red
        Write-Host "- Use HTTPS in production" -ForegroundColor Red
        Write-Host "- Set proper CORS origins" -ForegroundColor Red
        Write-Host "- Use secure JWT secret (min 32 characters)" -ForegroundColor Red
    }
    { $_ -in @("help", "-h", "--help") } {
        Show-Help
    }
    default {
        Write-Host "❌ Unknown environment: $Environment" -ForegroundColor Red
        Show-Help
        exit 1
    }
}
