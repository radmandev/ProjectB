#!/bin/bash

# Hostinger Setup Script
# Quick setup script for deploying to Hostinger

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header "Hostinger Deployment Setup"

# Check if running on server
if [ -z "$SSH_CONNECTION" ]; then
    print_warning "This script should be run on your Hostinger server via SSH"
    echo ""
    read -p "Are you running this on Hostinger? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Please SSH into your Hostinger server and run this script there"
        print_info "Command: ssh username@your-domain.com"
        exit 0
    fi
fi

# Check Node.js
print_info "Checking Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    print_info "Please install Node.js from Hostinger control panel"
    exit 1
fi
print_success "Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
print_success "npm $(npm --version) found"

# Check if .env exists
print_info "Checking configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found"
    
    if [ -f .env.example ]; then
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_success ".env created"
        
        # Prompt for domain
        echo ""
        read -p "Enter your domain (e.g., example.com): " DOMAIN
        if [ ! -z "$DOMAIN" ]; then
            sed -i "s|WEBHOOK_BASE_URL=.*|WEBHOOK_BASE_URL=https://$DOMAIN|g" .env
            print_success "Domain configured: https://$DOMAIN"
        fi
        
        # Prompt for Sendpulse credentials
        echo ""
        print_info "Sendpulse API Credentials (optional, can be added later)"
        read -p "Sendpulse API User ID (press Enter to skip): " SP_USER_ID
        if [ ! -z "$SP_USER_ID" ]; then
            sed -i "s|SENDPULSE_API_USER_ID=.*|SENDPULSE_API_USER_ID=$SP_USER_ID|g" .env
        fi
        
        read -p "Sendpulse API Secret (press Enter to skip): " SP_SECRET
        if [ ! -z "$SP_SECRET" ]; then
            sed -i "s|SENDPULSE_API_SECRET=.*|SENDPULSE_API_SECRET=$SP_SECRET|g" .env
        fi
        
        print_warning "Please review and update .env with your credentials"
        read -p "Press Enter to continue or Ctrl+C to exit and edit .env first..."
    else
        print_error ".env.example not found!"
        exit 1
    fi
else
    print_success ".env file found"
fi

# Install dependencies
print_info "Installing dependencies..."
if npm install --production; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Check PM2
print_info "Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not installed globally"
    read -p "Install PM2 globally? (Y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        npm install -g pm2
        print_success "PM2 installed"
    fi
fi

# Create logs directory
if [ ! -d "logs" ]; then
    mkdir -p logs
    print_success "Logs directory created"
fi

# Start application
print_header "Starting Application"

if command -v pm2 &> /dev/null; then
    # Check if already running
    if pm2 list | grep -q "sendpulse-bitrix24"; then
        print_info "Application already running, restarting..."
        pm2 restart sendpulse-bitrix24
    else
        print_info "Starting with PM2..."
        if [ -f ecosystem.config.js ]; then
            pm2 start ecosystem.config.js
        else
            pm2 start src/index.js --name sendpulse-bitrix24
        fi
        pm2 save
    fi
    print_success "Application started"
    
    echo ""
    print_info "Setting up PM2 to start on server reboot..."
    pm2 startup
    
    echo ""
    print_header "Application Status"
    pm2 list
    
else
    print_warning "PM2 not available, starting with node..."
    nohup node src/index.js > logs/app.log 2>&1 &
    echo $! > .app.pid
    print_success "Application started (PID: $(cat .app.pid))"
fi

# Get domain from .env
DOMAIN=$(grep WEBHOOK_BASE_URL .env | cut -d'=' -f2 | sed 's|https://||g' | sed 's|http://||g')

print_header "Setup Complete!"

echo "Your integration is now running!"
echo ""
echo "Webhook URLs:"
echo "  - Sendpulse: https://$DOMAIN/webhook/sendpulse"
echo "  - Bitrix24:  https://$DOMAIN/webhook/bitrix24"
echo ""
echo "Monitoring:"
echo "  - Health: https://$DOMAIN/health"
echo "  - Stats:  https://$DOMAIN/stats"
echo ""

if command -v pm2 &> /dev/null; then
    echo "Useful PM2 commands:"
    echo "  - View logs:    pm2 logs sendpulse-bitrix24"
    echo "  - Restart:      pm2 restart sendpulse-bitrix24"
    echo "  - Stop:         pm2 stop sendpulse-bitrix24"
    echo "  - Monitor:      pm2 monit"
else
    echo "View logs: tail -f logs/app.log"
fi

echo ""
echo "Next steps:"
echo "1. Test health endpoint: curl https://$DOMAIN/health"
echo "2. Configure Sendpulse webhook URL"
echo "3. Send test message and verify"
echo ""
echo "See HOSTINGER_DEPLOYMENT.md for more information"
