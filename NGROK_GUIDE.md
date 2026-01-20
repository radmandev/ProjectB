# Local Testing with ngrok

This guide shows you how to test the Sendpulse-Bitrix24 integration locally using ngrok.

## What is ngrok?

ngrok creates a secure tunnel from a public URL to your local server, allowing external services (like Sendpulse) to send webhooks to your local development environment.

## Prerequisites

- Node.js installed
- Integration server code downloaded
- Sendpulse account
- Bitrix24 account

## Step 1: Install ngrok

### Option A: Using npm (Recommended)

```bash
npm install -g ngrok
```

### Option B: Download Binary

1. Go to https://ngrok.com/download
2. Download for your operating system
3. Extract the file
4. Move to your PATH or local directory

### Option C: Using Package Managers

**macOS (Homebrew):**
```bash
brew install ngrok
```

**Linux (Snap):**
```bash
snap install ngrok
```

**Windows (Chocolatey):**
```bash
choco install ngrok
```

## Step 2: Sign Up for ngrok (Optional but Recommended)

Free account provides:
- Longer session time
- Reserved subdomain
- More concurrent tunnels

1. Go to https://ngrok.com/signup
2. Create a free account
3. Get your authtoken from dashboard
4. Configure authtoken:
   ```bash
   ngrok authtoken YOUR_AUTH_TOKEN
   ```

## Step 3: Configure Environment

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   # Sendpulse Configuration
   SENDPULSE_API_USER_ID=your_sendpulse_user_id
   SENDPULSE_API_SECRET=your_sendpulse_secret
   SENDPULSE_TOKEN_STORAGE=/tmp/sendpulse_token

   # Bitrix24 Configuration (Already configured for Rawajtech)
   BITRIX24_REGISTER_URL=https://rawajtech.bitrix24.com/rest/1/vke55tpksfpzd9dk/imconnector.register.json
   BITRIX24_SEND_MESSAGES_URL=https://rawajtech.bitrix24.com/rest/1/0z46v7smtazqbv39/imconnector.send.messages.json
   BITRIX24_CRM_LEAD_URL=https://rawajtech.bitrix24.com/rest/1/9pgrdwxdwy3ol1sw/crm.lead.add.json
   BITRIX24_BASE_URL=https://rawajtech.bitrix24.com/rest/1/vke55tpksfpzd9dk/
   BITRIX24_OPEN_LINE_ID=7
   BITRIX24_CREATE_LEADS=false

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Webhook Base URL (will be your ngrok URL)
   WEBHOOK_BASE_URL=http://localhost:3000
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

## Step 4: Start the Integration Server

Open a terminal window and start the server:

```bash
npm start
```

You should see:
```
===========================================
Sendpulse-Bitrix24 Integration Server
===========================================
Server running on port 3000
Environment: development
===========================================
Webhook URLs:
- Sendpulse: http://localhost:3000/webhook/sendpulse
- Bitrix24:  http://localhost:3000/webhook/bitrix24
===========================================
Health check: http://localhost:3000/health
Stats:        http://localhost:3000/stats
===========================================
```

**Keep this terminal open!**

## Step 5: Start ngrok Tunnel

Open a **NEW terminal window** and start ngrok:

```bash
ngrok http 3000
```

You'll see output like this:

```
ngrok                                                                    

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Important:** Copy the `Forwarding` URL (e.g., `https://abc123xyz.ngrok.io`)

**Keep this terminal open too!**

## Step 6: Test Your ngrok Setup

Before configuring Sendpulse, test that ngrok is working correctly:

```bash
# Test your ngrok URL (replace with your actual URL)
npm run test:ngrok https://abc123xyz.ngrok.io
```

This will test:
- ✓ Health endpoint accessibility
- ✓ Stats endpoint accessibility  
- ✓ Sendpulse webhook endpoint

If all tests pass, your ngrok setup is working!

## Step 7: Update Webhook Base URL (Optional)

If you want the server logs to show the correct ngrok URL:

1. Stop the server (Ctrl+C in the first terminal)
2. Edit `.env` and update:
   ```env
   WEBHOOK_BASE_URL=https://abc123xyz.ngrok.io
   ```
3. Restart the server: `npm start`

## Step 8: Configure Sendpulse Webhook

Now configure Sendpulse to send webhooks to your ngrok URL:

**Your Webhook URL:**
```
https://abc123xyz.ngrok.io/webhook/sendpulse
```

### Configure in Sendpulse:

1. Log in to Sendpulse
2. Go to Chatbots → Select your bot
3. Navigate to Settings → Webhooks or API
4. Enter webhook URL: `https://abc123xyz.ngrok.io/webhook/sendpulse`
5. Select events: "New Message"
6. Save

## Step 8: Test the Integration

### Test 1: Health Check

In a new terminal or browser, test the health endpoint:

```bash
curl https://abc123xyz.ngrok.io/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "services": {
    "sendpulse": true,
    "bitrix24": true
  }
}
```

### Test 2: Send a Message

1. Open your Sendpulse chatbot (Telegram, WhatsApp, etc.)
2. Send a test message: "Hello, this is a test"
3. Watch the server terminal for logs

**Expected output:**
```
2024-01-20T10:30:00.123Z - POST /webhook/sendpulse
Received message from Sendpulse: {
  contactId: 'contact123',
  contactName: 'Test User',
  message: 'Hello, this is a test'
}
Message forwarded to Bitrix24 successfully
```

### Test 3: Check Bitrix24

1. Log in to Bitrix24
2. Go to Contact Center → Open Channels
3. Find Open Line 7
4. You should see the message from the test user

### Test 4: Reply from Bitrix24

1. In Bitrix24, reply to the message
2. The user should receive your reply in Sendpulse chatbot

## ngrok Web Interface

ngrok provides a web interface to inspect traffic:

1. Open browser to: http://localhost:4040
2. You'll see all HTTP requests and responses
3. Very useful for debugging webhook payloads

### Features:
- View all requests in real-time
- Inspect request headers and body
- See response status and data
- Replay requests for testing

## Common Issues & Solutions

### Issue 1: ngrok URL Changes

**Problem:** ngrok URL changes every time you restart it (free plan)

**Solutions:**
- Use a reserved domain (paid ngrok plan)
- Update Sendpulse webhook URL each time
- Or: Keep ngrok running continuously during development

### Issue 2: Webhook Not Receiving Data

**Checklist:**
- [ ] Is the server running? (`npm start`)
- [ ] Is ngrok running? (`ngrok http 3000`)
- [ ] Is the ngrok URL correct in Sendpulse?
- [ ] Test health endpoint: `curl https://your-ngrok-url.ngrok.io/health`
- [ ] Check ngrok web interface: http://localhost:4040

### Issue 3: Connection Timeout

**Problem:** Requests timeout or fail

**Solutions:**
1. Check your internet connection
2. Restart ngrok
3. Try a different ngrok region:
   ```bash
   ngrok http 3000 --region=eu  # Europe
   ngrok http 3000 --region=ap  # Asia Pacific
   ngrok http 3000 --region=au  # Australia
   ```

### Issue 4: Rate Limiting

**Problem:** Free ngrok plan has limits

**Solution:**
- Sign up for free account (increases limits)
- Upgrade to paid plan for production use
- Use ngrok only for testing, deploy to real server for production

## Advanced ngrok Usage

### Custom Subdomain (Paid Plan)

```bash
ngrok http 3000 --subdomain=mycompany-integration
# URL will be: https://mycompany-integration.ngrok.io
```

### Basic Authentication

Protect your webhook with basic auth:

```bash
ngrok http 3000 --basic-auth="user:password"
```

### Regional Endpoint

Choose closer region for better performance:

```bash
ngrok http 3000 --region=eu  # Europe
ngrok http 3000 --region=ap  # Asia Pacific
ngrok http 3000 --region=au  # Australia
ngrok http 3000 --region=sa  # South America
ngrok http 3000 --region=jp  # Japan
ngrok http 3000 --region=in  # India
```

### Configuration File

Create `ngrok.yml` for persistent configuration:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  sendpulse-integration:
    proto: http
    addr: 3000
    inspect: true
```

Then run:
```bash
ngrok start sendpulse-integration
```

## Quick Start Script

Save this as `start-local-testing.sh`:

```bash
#!/bin/bash

echo "========================================="
echo "Starting Local Testing Environment"
echo "========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start server in background
echo "Starting server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start ngrok
echo "Starting ngrok..."
echo ""
echo "📋 Copy the HTTPS URL below and use it in Sendpulse:"
echo ""
ngrok http 3000

# Cleanup when ngrok stops
kill $SERVER_PID
```

Make it executable:
```bash
chmod +x start-local-testing.sh
```

Run it:
```bash
./start-local-testing.sh
```

## Testing Workflow

### Daily Development Flow:

1. **Morning:**
   ```bash
   # Terminal 1: Start server
   npm start
   
   # Terminal 2: Start ngrok
   ngrok http 3000
   ```

2. **Copy ngrok URL** from Terminal 2

3. **If URL changed:** Update Sendpulse webhook with new ngrok URL

4. **Develop and test** throughout the day

5. **Evening:** Stop both terminals (Ctrl+C)

### Quick Test Flow:

```bash
# 1. Start everything
npm start & ngrok http 3000

# 2. Test health
curl https://your-ngrok-url.ngrok.io/health

# 3. Send test message in Sendpulse

# 4. Check logs

# 5. Verify in Bitrix24
```

## Monitoring & Debugging

### Server Logs

Watch server terminal for:
```
✓ Received message from Sendpulse
✓ Message forwarded to Bitrix24 successfully
✗ Error messages (if any)
```

### ngrok Web Interface

1. Open: http://localhost:4040
2. Click on any request to see:
   - Request headers
   - Request body (webhook payload)
   - Response status
   - Response body

### Check Session Stats

```bash
curl https://your-ngrok-url.ngrok.io/stats
```

## Production Deployment

When ready for production:

1. Deploy server to cloud (see DEPLOYMENT.md)
2. Get permanent domain/URL
3. Update Sendpulse webhook with production URL
4. No longer need ngrok!

## Resources

- ngrok Documentation: https://ngrok.com/docs
- ngrok Dashboard: https://dashboard.ngrok.com
- Integration Logs: http://localhost:4040 (while ngrok running)
- Server Health: https://your-ngrok-url.ngrok.io/health
- Server Stats: https://your-ngrok-url.ngrok.io/stats

## Troubleshooting Checklist

- [ ] Node.js installed and working
- [ ] ngrok installed and working
- [ ] `.env` file created and configured
- [ ] Dependencies installed (`npm install`)
- [ ] Server running (`npm start`)
- [ ] ngrok running (`ngrok http 3000`)
- [ ] ngrok URL copied correctly
- [ ] Sendpulse webhook configured with ngrok URL
- [ ] Health endpoint responds: `curl https://your-ngrok-url.ngrok.io/health`
- [ ] Test message sent in Sendpulse
- [ ] Server logs show message received
- [ ] Message appears in Bitrix24 Open Channel 7

## Next Steps

Once local testing is complete:
- Review DEPLOYMENT.md for production deployment options
- Set up monitoring and logging
- Configure production environment variables
- Deploy to Heroku, VPS, or cloud platform
