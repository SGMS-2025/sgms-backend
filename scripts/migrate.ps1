# Database Migration Scripts for SGMS
# This script helps with database migration management

param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$Name = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development"
)

Write-Host "Database Migration Manager" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Function to show help
function Show-Help {
    Write-Host "Usage: .\migrate.ps1 [action] [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor White
    Write-Host "  create [name]     - Create new migration" -ForegroundColor Gray
    Write-Host "  deploy            - Deploy migrations to target environment" -ForegroundColor Gray
    Write-Host "  status            - Check migration status" -ForegroundColor Gray
    Write-Host "  reset             - Reset database (development only)" -ForegroundColor Gray
    Write-Host "  generate          - Generate Prisma client" -ForegroundColor Gray
    Write-Host "  studio            - Open Prisma Studio" -ForegroundColor Gray
    Write-Host "  backup            - Create database backup" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  -Environment      - Target environment (development, staging, production)" -ForegroundColor Gray
    Write-Host "  -Name             - Migration name (for create action)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\migrate.ps1 create -Name 'add_user_profile'" -ForegroundColor Gray
    Write-Host "  .\migrate.ps1 deploy -Environment staging" -ForegroundColor Gray
    Write-Host "  .\migrate.ps1 status" -ForegroundColor Gray
}

# Function to validate environment
function Test-Environment {
    param([string]$Env)
    
    $validEnvs = @("development", "staging", "production", "test")
    if ($Env -notin $validEnvs) {
        Write-Host "Error: Invalid environment '$Env'" -ForegroundColor Red
        Write-Host "Valid environments: $($validEnvs -join ', ')" -ForegroundColor Gray
        exit 1
    }
}

# Function to check if .env exists
function Test-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Host "Error: .env file not found" -ForegroundColor Red
        Write-Host "Run: npm run env:setup:dev" -ForegroundColor Gray
        exit 1
    }
}

# Function to create backup
function New-DatabaseBackup {
    Write-Host "Creating database backup..." -ForegroundColor Yellow
    
    # Read database config
    $envContent = Get-Content ".env" | Where-Object { $_ -match '^DB_' -or $_ -match '^DATABASE_URL' }
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_${timestamp}.sql"
    
    Write-Host "Backup will be saved as: $backupFile" -ForegroundColor Gray
    Write-Host "Note: This requires pg_dump to be installed and accessible" -ForegroundColor Yellow
    
    # Show backup command (user needs to run manually)
    Write-Host ""
    Write-Host "Run this command to create backup:" -ForegroundColor Cyan
    Write-Host "pg_dump -U your_user -h your_host your_database > $backupFile" -ForegroundColor White
}

# Main script logic
Test-Environment $Environment
Test-EnvFile

switch ($Action.ToLower()) {
    "create" {
        if ([string]::IsNullOrEmpty($Name)) {
            Write-Host "Error: Migration name is required for create action" -ForegroundColor Red
            Write-Host "Usage: .\migrate.ps1 create -Name 'migration_name'" -ForegroundColor Gray
            exit 1
        }
        
        Write-Host "Creating new migration: $Name" -ForegroundColor Green
        Write-Host "Environment: $Environment" -ForegroundColor Gray
        
        if ($Environment -eq "development") {
            $command = "npx prisma migrate dev --name $Name"
        } else {
            Write-Host "Error: Can only create migrations in development environment" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Running: $command" -ForegroundColor Gray
        Invoke-Expression $command
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Migration created successfully!" -ForegroundColor Green
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Review the generated migration file" -ForegroundColor Gray
            Write-Host "2. Test your application" -ForegroundColor Gray
            Write-Host "3. Deploy to staging: .\migrate.ps1 deploy -Environment staging" -ForegroundColor Gray
        }
    }
    
    "deploy" {
        Write-Host "Deploying migrations to: $Environment" -ForegroundColor Green
        
        if ($Environment -eq "production") {
            Write-Host "WARNING: Deploying to PRODUCTION environment!" -ForegroundColor Red
            Write-Host "Make sure you have:" -ForegroundColor Yellow
            Write-Host "1. Created a database backup" -ForegroundColor Gray
            Write-Host "2. Tested on staging" -ForegroundColor Gray
            Write-Host "3. Reviewed all migration files" -ForegroundColor Gray
            
            $confirmation = Read-Host "Type 'YES' to continue"
            if ($confirmation -ne "YES") {
                Write-Host "Migration cancelled" -ForegroundColor Yellow
                exit 0
            }
        }
        
        # Set environment variable
        $env:NODE_ENV = $Environment
        
        $command = "npx prisma migrate deploy"
        Write-Host "Running: $command" -ForegroundColor Gray
        Invoke-Expression $command
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Generating Prisma client..." -ForegroundColor Yellow
            Invoke-Expression "npx prisma generate"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Migration deployed successfully!" -ForegroundColor Green
            }
        }
    }
    
    "status" {
        Write-Host "Checking migration status for: $Environment" -ForegroundColor Green
        $env:NODE_ENV = $Environment
        
        $command = "npx prisma migrate status"
        Write-Host "Running: $command" -ForegroundColor Gray
        Invoke-Expression $command
    }
    
    "reset" {
        if ($Environment -ne "development") {
            Write-Host "Error: Database reset is only allowed in development environment" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "WARNING: This will DELETE ALL DATA in development database!" -ForegroundColor Red
        $confirmation = Read-Host "Type 'RESET' to continue"
        
        if ($confirmation -eq "RESET") {
            Write-Host "Resetting development database..." -ForegroundColor Yellow
            $env:NODE_ENV = "development"
            Invoke-Expression "npx prisma migrate reset"
        } else {
            Write-Host "Reset cancelled" -ForegroundColor Yellow
        }
    }
    
    "generate" {
        Write-Host "Generating Prisma client for: $Environment" -ForegroundColor Green
        $env:NODE_ENV = $Environment
        
        Invoke-Expression "npx prisma generate"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Prisma client generated successfully!" -ForegroundColor Green
        }
    }
    
    "studio" {
        Write-Host "Opening Prisma Studio for: $Environment" -ForegroundColor Green
        $env:NODE_ENV = $Environment
        
        Write-Host "Prisma Studio will open in your browser..." -ForegroundColor Yellow
        Invoke-Expression "npx prisma studio"
    }
    
    "backup" {
        New-DatabaseBackup
    }
    
    { $_ -in @("help", "-h", "--help") } {
        Show-Help
    }
    
    default {
        Write-Host "Error: Unknown action '$Action'" -ForegroundColor Red
        Show-Help
        exit 1
    }
}
