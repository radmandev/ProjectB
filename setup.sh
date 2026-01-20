#!/bin/bash

# Configuration script for Sendpulse-Bitrix24 Integration
# This script helps you set up your credentials interactively

echo "================================================"
echo "  Sendpulse-Bitrix24 Integration Setup"
echo "================================================"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy from example
cp .env.example .env

echo "Please provide the following credentials:"
echo ""

# Sendpulse credentials
read -p "Sendpulse API User ID: " SENDPULSE_USER_ID
read -p "Sendpulse API Secret: " SENDPULSE_SECRET

# Bitrix24 credentials
read -p "Bitrix24 Webhook URL (e.g., https://your-domain.bitrix24.com/rest/1/xxx/): " BITRIX24_URL
read -p "Bitrix24 Open Line ID: " BITRIX24_LINE_ID

# Server configuration
read -p "Server Port (default 3000): " PORT
PORT=${PORT:-3000}

read -p "Webhook Base URL (e.g., https://your-server.com or leave blank for localhost): " WEBHOOK_URL
if [ -z "$WEBHOOK_URL" ]; then
    WEBHOOK_URL="http://localhost:$PORT"
fi

# Update .env file
sed -i "s|SENDPULSE_API_USER_ID=.*|SENDPULSE_API_USER_ID=$SENDPULSE_USER_ID|g" .env
sed -i "s|SENDPULSE_API_SECRET=.*|SENDPULSE_API_SECRET=$SENDPULSE_SECRET|g" .env
sed -i "s|BITRIX24_WEBHOOK_URL=.*|BITRIX24_WEBHOOK_URL=$BITRIX24_URL|g" .env
sed -i "s|BITRIX24_OPEN_LINE_ID=.*|BITRIX24_OPEN_LINE_ID=$BITRIX24_LINE_ID|g" .env
sed -i "s|PORT=.*|PORT=$PORT|g" .env
sed -i "s|WEBHOOK_BASE_URL=.*|WEBHOOK_BASE_URL=$WEBHOOK_URL|g" .env

echo ""
echo "✅ Configuration saved to .env"
echo ""
echo "================================================"
echo "  Next Steps"
echo "================================================"
echo ""
echo "1. Review your configuration:"
echo "   cat .env"
echo ""
echo "2. Install dependencies (if not done already):"
echo "   npm install"
echo ""
echo "3. Start the server:"
echo "   npm start"
echo ""
echo "4. Configure webhooks in Sendpulse and Bitrix24:"
echo "   - Sendpulse webhook: $WEBHOOK_URL/webhook/sendpulse"
echo "   - Bitrix24 webhook:  $WEBHOOK_URL/webhook/bitrix24"
echo ""
echo "5. Test the integration:"
echo "   npm test"
echo ""
echo "================================================"
