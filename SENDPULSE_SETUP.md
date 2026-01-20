# Sendpulse Configuration Guide

This guide shows you how to configure your Sendpulse chatbot to send subscriber activity data to the integration server.

## Extracted Configuration

From your Bitrix24 URL: `https://rawajtech.bitrix24.com/contact_center/connector/?ID=facebook&LINE=7&action-line=create`

**Your Bitrix24 Open Line ID is: `7`**

This has been configured in your `.env.example` file as:
```env
BITRIX24_OPEN_LINE_ID=7
```

## Sendpulse Webhook Configuration

### Step 1: Get Your Server URL

First, you need your server's public URL. Choose one option:

#### Option A: Local Testing with ngrok
```bash
# Start ngrok
ngrok http 3000

# You'll get a URL like:
https://abc123xyz.ngrok.io
```

#### Option B: Production Server
Use your actual domain:
```
https://your-production-domain.com
```

### Step 2: Configure Webhook in Sendpulse

**Your webhook URL will be:**
```
https://your-server-url/webhook/sendpulse
```

Examples:
- ngrok: `https://abc123xyz.ngrok.io/webhook/sendpulse`
- Production: `https://api.yourdomain.com/webhook/sendpulse`

### Step 3: Add Webhook in Sendpulse Dashboard

1. **Log in to Sendpulse**
   - Go to https://sendpulse.com
   - Sign in to your account

2. **Navigate to Chatbots**
   - Click on "Chatbots" in the main menu
   - Select your chatbot (Telegram, WhatsApp, Instagram, Facebook, or VK)

3. **Open Bot Settings**
   - Click on your bot to open its settings
   - Look for "Webhooks", "API", or "Integration" section

4. **Add Webhook URL**
   - Find the "Webhook URL" or "Callback URL" field
   - Enter your webhook URL: `https://your-server-url/webhook/sendpulse`

5. **Select Events**
   Select which events should trigger the webhook:
   - ✅ **New Message** (Required) - When a user sends a message
   - ✅ **User Subscribed** (Optional) - When a user subscribes to your bot
   - ✅ **User Unsubscribed** (Optional) - When a user unsubscribes
   - ✅ **Bot Started** (Optional) - When a user starts the bot

6. **Save Configuration**
   - Click "Save" or "Update"
   - Sendpulse will verify the webhook URL

### Step 4: Test the Webhook

1. **Start your integration server:**
   ```bash
   npm start
   ```

2. **Send a test message** in your Sendpulse chatbot

3. **Check server logs** to see if the webhook was received:
   ```
   Received message from Sendpulse: {
     contactId: 'xxx',
     contactName: 'Test User',
     message: 'Hello'
   }
   ```

4. **Verify in Bitrix24** that the message appears in the Open Channel

## Sendpulse Chatbot Platforms

The webhook configuration works for all Sendpulse chatbot platforms:

### Telegram Bot
1. Go to Chatbots → Telegram
2. Select your bot
3. Settings → Webhooks
4. Add URL: `https://your-server-url/webhook/sendpulse`

### WhatsApp Bot
1. Go to Chatbots → WhatsApp
2. Select your bot
3. Settings → API & Webhooks
4. Add URL: `https://your-server-url/webhook/sendpulse`

### Facebook Messenger
1. Go to Chatbots → Facebook
2. Select your page
3. Settings → Webhooks
4. Add URL: `https://your-server-url/webhook/sendpulse`

### Instagram
1. Go to Chatbots → Instagram
2. Select your account
3. Settings → Webhooks
4. Add URL: `https://your-server-url/webhook/sendpulse`

### VK (VKontakte)
1. Go to Chatbots → VK
2. Select your group
3. Settings → Webhooks
4. Add URL: `https://your-server-url/webhook/sendpulse`

## Webhook Payload Format

When a user sends a message, Sendpulse will POST this data to your webhook:

```json
{
  "contact": {
    "id": "contact_unique_id",
    "name": "User Name",
    "phone": "+1234567890",
    "email": "user@example.com"
  },
  "message": {
    "text": "User's message text",
    "type": "text",
    "date": 1234567890
  },
  "bot": {
    "id": "bot_id",
    "name": "Bot Name"
  }
}
```

## Complete Configuration Example

### Your `.env` file should look like this:

```env
# Sendpulse Configuration
SENDPULSE_API_USER_ID=your_sendpulse_user_id
SENDPULSE_API_SECRET=your_sendpulse_secret
SENDPULSE_TOKEN_STORAGE=/tmp/sendpulse_token

# Bitrix24 Configuration (Rawajtech)
BITRIX24_REGISTER_URL=https://rawajtech.bitrix24.com/rest/1/vke55tpksfpzd9dk/imconnector.register.json
BITRIX24_SEND_MESSAGES_URL=https://rawajtech.bitrix24.com/rest/1/0z46v7smtazqbv39/imconnector.send.messages.json
BITRIX24_CRM_LEAD_URL=https://rawajtech.bitrix24.com/rest/1/9pgrdwxdwy3ol1sw/crm.lead.add.json
BITRIX24_BASE_URL=https://rawajtech.bitrix24.com/rest/1/vke55tpksfpzd9dk/
BITRIX24_OPEN_LINE_ID=7
BITRIX24_CREATE_LEADS=false

# Server Configuration
PORT=3000
NODE_ENV=development

# Webhook Base URL (for callbacks)
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io
# OR for production:
# WEBHOOK_BASE_URL=https://your-production-domain.com
```

## Troubleshooting

### Webhook URL Not Verified

**Issue:** Sendpulse says webhook URL is not reachable

**Solutions:**
1. Make sure your server is running: `npm start`
2. If using ngrok, ensure ngrok is running
3. Test the URL in a browser: `https://your-server-url/health`
4. Check firewall settings if using a production server

### Messages Not Appearing in Bitrix24

**Issue:** Webhook receives messages but they don't appear in Bitrix24

**Solutions:**
1. Verify `BITRIX24_OPEN_LINE_ID=7` is set correctly
2. Check Bitrix24 webhook URLs are accessible
3. Review server logs for Bitrix24 API errors
4. Ensure Open Line (Line ID 7) is active in Bitrix24

### Sendpulse API Credentials

**To get your Sendpulse API credentials:**

1. Log in to Sendpulse
2. Go to Settings → API
3. Create API credentials or view existing ones
4. Copy the User ID and Secret
5. Add to `.env`:
   ```env
   SENDPULSE_API_USER_ID=your_user_id_here
   SENDPULSE_API_SECRET=your_secret_here
   ```

## Quick Setup Commands

```bash
# 1. Copy example configuration
cp .env.example .env

# 2. Edit .env and add your Sendpulse credentials
# The Bitrix24 URLs and Line ID are already configured!
nano .env

# 3. Install dependencies
npm install

# 4. Start the server
npm start

# 5. (In another terminal) Start ngrok for testing
ngrok http 3000

# 6. Copy the ngrok URL and configure in Sendpulse
# Webhook URL: https://your-ngrok-url.ngrok.io/webhook/sendpulse
```

## Verification Checklist

- [ ] Server is running (`npm start`)
- [ ] ngrok is running (for local testing) or server is publicly accessible
- [ ] `.env` file has Sendpulse API credentials
- [ ] `.env` file has `BITRIX24_OPEN_LINE_ID=7`
- [ ] Webhook URL configured in Sendpulse: `https://your-server-url/webhook/sendpulse`
- [ ] Test message sent in Sendpulse chatbot
- [ ] Message appears in server logs
- [ ] Message appears in Bitrix24 Open Channel (Line ID 7)

## Next Steps

Once configured:
1. Messages from Sendpulse will automatically appear in your Bitrix24 Open Channel (Line 7)
2. Replies from Bitrix24 will be sent back to users via Sendpulse
3. Optionally enable `BITRIX24_CREATE_LEADS=true` to create CRM leads for new contacts

## Support

For issues, check:
- Server logs: Watch the console where `npm start` is running
- Health endpoint: `curl https://your-server-url/health`
- Stats endpoint: `curl https://your-server-url/stats`
- See `RAWAJTECH_CONFIG.md` for complete setup details
