# Quick Start Guide

Get the Sendpulse-Bitrix24 integration running in 5 minutes!

## Prerequisites

- Node.js 14+ installed
- Sendpulse account with API access
- Bitrix24 account with webhook access
- (Optional) ngrok for local testing with external webhooks

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Credentials

### Option A: Interactive Setup (Recommended)

```bash
./setup.sh
```

Follow the prompts to enter your credentials.

### Option B: Manual Setup

```bash
cp .env.example .env
nano .env  # or use your favorite editor
```

Update these values:
- `SENDPULSE_API_USER_ID` - Your Sendpulse API User ID
- `SENDPULSE_API_SECRET` - Your Sendpulse API Secret
- `BITRIX24_WEBHOOK_URL` - Your Bitrix24 webhook URL
- `BITRIX24_OPEN_LINE_ID` - Your Bitrix24 Open Channel ID
- `WEBHOOK_BASE_URL` - Your public server URL

## Step 3: Start the Server

```bash
npm start
```

You should see:
```
===========================================
Sendpulse-Bitrix24 Integration Server
===========================================
Server running on port 3000
...
```

## Step 4: Test Locally

In a new terminal:

```bash
npm test
```

This will test all endpoints and verify the server is running correctly.

## Step 5: Configure Webhooks

### For Local Testing with ngrok

1. **Install and start ngrok:**
   ```bash
   ngrok http 3000
   ```

2. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

3. **Update webhooks:**

### Sendpulse Webhook Setup

1. Log in to Sendpulse
2. Go to your chatbot settings
3. Navigate to Webhooks/Integration section
4. Add webhook URL: `https://your-server.com/webhook/sendpulse`
5. Select event: "New Message Received"
6. Save

### Bitrix24 Webhook Setup

1. Log in to Bitrix24
2. Go to Contact Center → Open Channels
3. Select or create an Open Channel
4. Configure connector:
   - Type: Custom/External
   - Webhook URL: `https://your-server.com/webhook/bitrix24`
5. Save and activate

## Step 6: Test End-to-End

### Test Sendpulse → Bitrix24

1. Send a message in your Sendpulse chatbot (Telegram, WhatsApp, etc.)
2. The message should appear in your Bitrix24 Open Channel
3. Check the server logs to see the message flow

### Test Bitrix24 → Sendpulse

1. Reply to the message in Bitrix24
2. The response should be sent to the customer via Sendpulse
3. Customer receives the message in their chat

## Monitoring

### Check Server Health

```bash
curl http://localhost:3000/health
```

### View Active Sessions

```bash
curl http://localhost:3000/stats
```

### View Server Logs

Logs appear in the console where you ran `npm start`.

## Common Issues

### Issue: Server won't start

**Solution:**
- Check port 3000 is not in use: `lsof -i :3000`
- Verify Node.js is installed: `node --version`
- Check .env file exists and has correct values

### Issue: Webhooks not receiving messages

**Solution:**
- Verify webhook URLs are publicly accessible
- For local testing, ensure ngrok is running
- Check webhook configuration in Sendpulse/Bitrix24
- Review server logs for errors

### Issue: Authentication errors

**Solution:**
- Verify API credentials in .env file
- Check Sendpulse API access is enabled
- Verify Bitrix24 webhook has correct permissions

## What's Next?

- Read the [full documentation](README.md) for detailed information
- Check [API.md](API.md) for webhook payload formats
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- See [TESTING.md](TESTING.md) for comprehensive testing guide

## Getting Help

If you encounter issues:

1. Check the [TESTING.md](TESTING.md) troubleshooting section
2. Review server logs for error messages
3. Verify all credentials are correct
4. Test each endpoint individually
5. Create an issue in the repository

## Quick Commands Reference

```bash
# Start server (production)
npm start

# Start server (development with auto-reload)
npm run dev

# Run tests
npm test

# Check health
curl http://localhost:3000/health

# Check stats
curl http://localhost:3000/stats

# View logs (if using PM2)
pm2 logs sendpulse-bitrix24
```

---

**Need the test credentials?** Contact the project administrator for Sendpulse and Bitrix24 test account credentials.
