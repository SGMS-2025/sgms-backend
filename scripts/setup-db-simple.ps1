# Simple Database Setup Script for SGMS
# This script creates the development database

Write-Host "Database SGMS Setup" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

# Read environment variables
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "Reading configuration from .env..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]*?)=(.*)$') {
            $name = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
} else {
    Write-Host "Error: .env file not found. Please create one first." -ForegroundColor Red
    Write-Host "Run: npm run env:setup:dev" -ForegroundColor Gray
    exit 1
}

$dbName = $env:DB_NAME
$dbUser = $env:DB_USER
$dbPassword = $env:DB_PASSWORD
$dbHost = $env:DB_HOST
$dbPort = $env:DB_PORT

if (-not $dbName) {
    $dbName = "sgms_dev"
}

Write-Host "Database Configuration:" -ForegroundColor White
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray  
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray

# Check if PostgreSQL is running
Write-Host ""
Write-Host "Checking PostgreSQL service..." -ForegroundColor Yellow
try {
    $service = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq "Running") {
        Write-Host "PostgreSQL service is running" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL service not found or not running" -ForegroundColor Yellow
        Write-Host "Please ensure PostgreSQL is installed and running" -ForegroundColor Gray
    }
} catch {
    Write-Host "Could not check PostgreSQL service status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Ensure PostgreSQL is running" -ForegroundColor Gray
Write-Host "2. Create database manually or using pgAdmin:" -ForegroundColor Gray
Write-Host "   CREATE DATABASE $dbName;" -ForegroundColor White
Write-Host "3. Run: npm run prisma:generate" -ForegroundColor Gray
Write-Host "4. Run: npm run prisma:push" -ForegroundColor Gray
Write-Host "5. Run: npm run test:config" -ForegroundColor Gray
Write-Host "6. Run: npm run dev" -ForegroundColor Gray

Write-Host ""
Write-Host "Setup instructions completed" -ForegroundColor Green
