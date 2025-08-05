#!/bin/bash

# Database Migration Scripts for SGMS
# This script helps with database migration management

ACTION=$1
NAME=$2
ENVIRONMENT=${3:-development}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}Database Migration Manager${NC}"
echo -e "${CYAN}===========================${NC}"

# Function to show help
show_help() {
    echo -e "${NC}Usage: ./migrate.sh [action] [name] [environment]${NC}"
    echo ""
    echo -e "${NC}Actions:${NC}"
    echo -e "${GRAY}  create [name]     - Create new migration${NC}"
    echo -e "${GRAY}  deploy            - Deploy migrations to target environment${NC}"
    echo -e "${GRAY}  status            - Check migration status${NC}"
    echo -e "${GRAY}  reset             - Reset database (development only)${NC}"
    echo -e "${GRAY}  generate          - Generate Prisma client${NC}"
    echo -e "${GRAY}  studio            - Open Prisma Studio${NC}"
    echo -e "${GRAY}  backup            - Create database backup${NC}"
    echo ""
    echo -e "${NC}Environments:${NC}"
    echo -e "${GRAY}  development (default), staging, production${NC}"
    echo ""
    echo -e "${NC}Examples:${NC}"
    echo -e "${GRAY}  ./migrate.sh create add_user_profile${NC}"
    echo -e "${GRAY}  ./migrate.sh deploy staging${NC}"
    echo -e "${GRAY}  ./migrate.sh status${NC}"
}

# Function to validate environment
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production|test)
            ;;
        *)
            echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
            echo -e "${GRAY}Valid environments: development, staging, production, test${NC}"
            exit 1
            ;;
    esac
}

# Function to check if .env exists
check_env_file() {
    if [ ! -f ".env" ]; then
        echo -e "${RED}Error: .env file not found${NC}"
        echo -e "${GRAY}Run: npm run env:setup:dev${NC}"
        exit 1
    fi
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}Creating database backup...${NC}"
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="backup_${timestamp}.sql"
    
    echo -e "${GRAY}Backup will be saved as: $backup_file${NC}"
    echo -e "${YELLOW}Note: This requires pg_dump to be installed and accessible${NC}"
    
    echo ""
    echo -e "${CYAN}Run this command to create backup:${NC}"
    echo -e "${NC}pg_dump -U your_user -h your_host your_database > $backup_file${NC}"
}

# Check if action is provided
if [ -z "$ACTION" ]; then
    echo -e "${RED}Error: No action specified${NC}"
    show_help
    exit 1
fi

# Validate environment
validate_environment
check_env_file

case $ACTION in
    "create")
        if [ -z "$NAME" ]; then
            echo -e "${RED}Error: Migration name is required for create action${NC}"
            echo -e "${GRAY}Usage: ./migrate.sh create migration_name${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}Creating new migration: $NAME${NC}"
        echo -e "${GRAY}Environment: $ENVIRONMENT${NC}"
        
        if [ "$ENVIRONMENT" != "development" ]; then
            echo -e "${RED}Error: Can only create migrations in development environment${NC}"
            exit 1
        fi
        
        command="npx prisma migrate dev --name $NAME"
        echo -e "${GRAY}Running: $command${NC}"
        $command
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Migration created successfully!${NC}"
            echo -e "${CYAN}Next steps:${NC}"
            echo -e "${GRAY}1. Review the generated migration file${NC}"
            echo -e "${GRAY}2. Test your application${NC}"
            echo -e "${GRAY}3. Deploy to staging: ./migrate.sh deploy staging${NC}"
        fi
        ;;
    
    "deploy")
        echo -e "${GREEN}Deploying migrations to: $ENVIRONMENT${NC}"
        
        if [ "$ENVIRONMENT" = "production" ]; then
            echo -e "${RED}WARNING: Deploying to PRODUCTION environment!${NC}"
            echo -e "${YELLOW}Make sure you have:${NC}"
            echo -e "${GRAY}1. Created a database backup${NC}"
            echo -e "${GRAY}2. Tested on staging${NC}"
            echo -e "${GRAY}3. Reviewed all migration files${NC}"
            
            read -p "Type 'YES' to continue: " confirmation
            if [ "$confirmation" != "YES" ]; then
                echo -e "${YELLOW}Migration cancelled${NC}"
                exit 0
            fi
        fi
        
        # Set environment variable
        export NODE_ENV=$ENVIRONMENT
        
        command="npx prisma migrate deploy"
        echo -e "${GRAY}Running: $command${NC}"
        $command
        
        if [ $? -eq 0 ]; then
            echo -e "${YELLOW}Generating Prisma client...${NC}"
            npx prisma generate
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Migration deployed successfully!${NC}"
            fi
        fi
        ;;
    
    "status")
        echo -e "${GREEN}Checking migration status for: $ENVIRONMENT${NC}"
        export NODE_ENV=$ENVIRONMENT
        
        command="npx prisma migrate status"
        echo -e "${GRAY}Running: $command${NC}"
        $command
        ;;
    
    "reset")
        if [ "$ENVIRONMENT" != "development" ]; then
            echo -e "${RED}Error: Database reset is only allowed in development environment${NC}"
            exit 1
        fi
        
        echo -e "${RED}WARNING: This will DELETE ALL DATA in development database!${NC}"
        read -p "Type 'RESET' to continue: " confirmation
        
        if [ "$confirmation" = "RESET" ]; then
            echo -e "${YELLOW}Resetting development database...${NC}"
            export NODE_ENV="development"
            npx prisma migrate reset
        else
            echo -e "${YELLOW}Reset cancelled${NC}"
        fi
        ;;
    
    "generate")
        echo -e "${GREEN}Generating Prisma client for: $ENVIRONMENT${NC}"
        export NODE_ENV=$ENVIRONMENT
        
        npx prisma generate
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Prisma client generated successfully!${NC}"
        fi
        ;;
    
    "studio")
        echo -e "${GREEN}Opening Prisma Studio for: $ENVIRONMENT${NC}"
        export NODE_ENV=$ENVIRONMENT
        
        echo -e "${YELLOW}Prisma Studio will open in your browser...${NC}"
        npx prisma studio
        ;;
    
    "backup")
        create_backup
        ;;
    
    "help"|"-h"|"--help")
        show_help
        ;;
    
    *)
        echo -e "${RED}Error: Unknown action '$ACTION'${NC}"
        show_help
        exit 1
        ;;
esac
