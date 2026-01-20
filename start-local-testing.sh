#!/bin/bash

# Local Testing Helper Script for Sendpulse-Bitrix24 Integration
# This script helps you quickly set up and start local testing with ngrok

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main script
main() {
    print_header "Sendpulse-Bitrix24 Local Testing Setup"

    # Check Node.js
    print_info "Checking Node.js installation..."
    if ! command_exists node; then
        print_error "Node.js is not installed!"
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js $(node --version) found"

    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed!"
        exit 1
    fi
    print_success "npm $(npm --version) found"

    # Check ngrok
    print_info "Checking ngrok installation..."
    if ! command_exists ngrok; then
        print_warning "ngrok is not installed!"
        echo ""
        echo "Please install ngrok:"
        echo "  - npm install -g ngrok"
        echo "  - Or download from https://ngrok.com/download"
        echo ""
        read -p "Do you want to install ngrok via npm now? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installing ngrok globally..."
            npm install -g ngrok
            print_success "ngrok installed successfully"
        else
            print_error "Cannot continue without ngrok"
            exit 1
        fi
    else
        print_success "ngrok found"
    fi

    # Check .env file
    print_info "Checking .env configuration..."
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        echo ""
        if [ -f .env.example ]; then
            read -p "Do you want to copy .env.example to .env? (Y/n): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                cp .env.example .env
                print_success ".env file created from .env.example"
                print_warning "Please edit .env and add your Sendpulse API credentials"
                echo ""
                read -p "Press Enter to open .env in your default editor..."
                ${EDITOR:-nano} .env
            fi
        else
            print_error ".env.example not found!"
            exit 1
        fi
    else
        print_success ".env file found"
    fi

    # Check if Sendpulse credentials are configured
    if grep -q "your_sendpulse_user_id" .env 2>/dev/null; then
        print_warning "Sendpulse credentials not configured in .env"
        echo "Please add your SENDPULSE_API_USER_ID and SENDPULSE_API_SECRET"
        read -p "Do you want to edit .env now? (Y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    fi

    # Install dependencies
    print_info "Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        print_info "Installing npm dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi

    # Test server startup
    print_info "Testing server startup..."
    timeout 5 npm start > /tmp/server-test.log 2>&1 &
    SERVER_PID=$!
    sleep 3
    
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        print_success "Server starts successfully"
        kill $SERVER_PID 2>/dev/null || true
    else
        print_error "Server failed to start"
        echo "Check the logs:"
        cat /tmp/server-test.log
        exit 1
    fi

    # Final instructions
    print_header "Setup Complete! Ready to Start"
    
    echo "To start local testing, you need TWO terminal windows:"
    echo ""
    echo -e "${GREEN}Terminal 1 - Start the server:${NC}"
    echo "  $ npm start"
    echo ""
    echo -e "${GREEN}Terminal 2 - Start ngrok:${NC}"
    echo "  $ ngrok http 3000"
    echo ""
    echo "Then:"
    echo "1. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)"
    echo "2. Configure it in Sendpulse as: https://abc123.ngrok.io/webhook/sendpulse"
    echo "3. Send a test message in Sendpulse chatbot"
    echo "4. Watch Terminal 1 for logs"
    echo "5. Check Bitrix24 Open Channel (Line 7) for the message"
    echo ""
    
    read -p "Do you want to start both now? (Y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_header "Starting Local Testing Environment"
        
        # Start server in background
        print_info "Starting server on port 3000..."
        npm start > server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > .server.pid
        
        # Wait for server to be ready
        sleep 3
        
        # Test if server is running
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            print_success "Server is running (PID: $SERVER_PID)"
        else
            print_error "Server failed to start. Check server.log for details"
            kill $SERVER_PID 2>/dev/null || true
            rm .server.pid 2>/dev/null || true
            exit 1
        fi
        
        echo ""
        print_success "Server logs: tail -f server.log"
        echo ""
        
        # Start ngrok
        print_info "Starting ngrok tunnel..."
        echo ""
        print_header "ngrok URL"
        echo -e "${YELLOW}Copy the HTTPS forwarding URL below:${NC}"
        echo -e "${YELLOW}Use it in Sendpulse: https://YOUR-URL.ngrok.io/webhook/sendpulse${NC}"
        echo ""
        
        # This will run in foreground
        ngrok http 3000
        
        # Cleanup when ngrok stops (user pressed Ctrl+C)
        if [ -f .server.pid ]; then
            SERVER_PID=$(cat .server.pid)
            print_info "Stopping server (PID: $SERVER_PID)..."
            kill $SERVER_PID 2>/dev/null || true
            rm .server.pid
            print_success "Server stopped"
        fi
    else
        echo ""
        print_info "You can start manually when ready!"
        echo ""
        echo "See NGROK_GUIDE.md for detailed instructions"
    fi
}

# Cleanup function
cleanup() {
    if [ -f .server.pid ]; then
        SERVER_PID=$(cat .server.pid)
        print_info "Cleaning up..."
        kill $SERVER_PID 2>/dev/null || true
        rm .server.pid 2>/dev/null || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Run main function
main
