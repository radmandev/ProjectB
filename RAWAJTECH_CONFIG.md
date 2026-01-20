# Configuration for Rawajtech Bitrix24

This document provides the specific configuration for your Rawajtech Bitrix24 instance.

## Bitrix24 Webhook URLs

You have provided the following Bitrix24 REST API webhook URLs:

1. **Register Connector:**
   ```
   https://rawajtech.bitrix24.com/rest/1/vke55tpksfpzd9dk/imconnector.register.json
   ```

2. **Send Messages:**
   ```
   https://rawajtech.bitrix24.com/rest/1/0z46v7smtazqbv39/imconnector.send.messages.json
   ```

3. **Create CRM Lead:**
   ```
   https://rawajtech.bitrix24.com/rest/1/9pgrdwxdwy3ol1sw/crm.lead.add.json
   ```

## Sendpulse Webhook URL

**This is the URL you need to configure in Sendpulse:**

Once your server is running, configure this URL in your Sendpulse chatbot settings:

```
https://your-server-domain.com/webhook/sendpulse
```

### For Local Testing with ngrok:

1. Start ngrok:
   ```bash
   ngrok http 3000
   ```

2. Use the ngrok URL in Sendpulse:
   ```
   https://your-ngrok-id.ngrok.io/webhook/sendpulse
   ```

### For Production:

Replace `your-server-domain.com` with your actual domain:
```
https://your-production-domain.com/webhook/sendpulse
```

## Environment Configuration

Create a `.env` file with the following configuration:

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
BITRIX24_OPEN_LINE_ID=your_open_line_id
BITRIX24_CREATE_LEADS=false

# Server Configuration
PORT=3000
NODE_ENV=development

# Webhook Base URL (for callbacks)
WEBHOOK_BASE_URL=https://your-server-domain.com
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file with the configuration above, filling in:
- Your Sendpulse API User ID and Secret
- Your Bitrix24 Open Line ID
- Your server's public URL (or ngrok URL for testing)
- Set `BITRIX24_CREATE_LEADS=true` if you want to automatically create CRM leads for new contacts

### 3. Start the Server

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
- Sendpulse: https://your-server-domain.com/webhook/sendpulse
- Bitrix24:  https://your-server-domain.com/webhook/bitrix24
===========================================
```

### 4. Configure Sendpulse Webhook

In your Sendpulse chatbot settings:

1. Go to your chatbot configuration
2. Find the "Webhooks" or "Integration" section
3. Add webhook URL: **`https://your-server-domain.com/webhook/sendpulse`**
4. Select event type: "New Message Received" or "Subscriber Activity"
5. Save the configuration

### 5. Test the Integration

#### Test Message Flow (Sendpulse → Bitrix24):

1. Send a test message in your Sendpulse chatbot
2. Check server logs to see the webhook received
3. Verify the message appears in your Bitrix24 Open Channel

#### Monitor with Endpoints:

```bash
# Check server health
curl https://your-server-domain.com/health

# Check active sessions
curl https://your-server-domain.com/stats
```

## What Data is Sent to Each Webhook

### From Sendpulse to Your Server

When a user sends a message in Sendpulse, it will POST to `/webhook/sendpulse` with:

```json
{
  "contact": {
    "id": "contact_id",
    "name": "User Name",
    "phone": "+1234567890",
    "email": "user@example.com"
  },
  "message": {
    "text": "User's message",
    "type": "text",
    "date": 1234567890
  },
  "bot": {
    "id": "bot_id",
    "name": "Bot Name"
  }
}
```

### From Your Server to Bitrix24

The integration will:

1. **Register the connector** (one-time, using `imconnector.register.json`)
2. **Send messages** to Open Channel (using `imconnector.send.messages.json`)
3. **Optionally create CRM leads** for new contacts (using `crm.lead.add.json`)

## Features

### Automatic CRM Lead Creation

If you set `BITRIX24_CREATE_LEADS=true`, the integration will automatically create a CRM lead in Bitrix24 when a new contact sends their first message.

The lead will include:
- Contact name
- Phone number (if available)
- Email (if available)
- First message as comments
- Source: WEB
- Status: NEW

### Session Management

The integration maintains a mapping between Sendpulse contact IDs and Bitrix24 session IDs, enabling:
- Continuous conversations
- Message history tracking
- Bidirectional messaging

## Troubleshooting

### Issue: Sendpulse webhook not receiving data

**Check:**
1. Is your server publicly accessible?
2. Is the webhook URL correct in Sendpulse settings?
3. Are there any firewall rules blocking incoming requests?

**Solution:**
- For local testing, use ngrok
- For production, ensure your server has HTTPS enabled
- Check server logs for incoming requests

### Issue: Messages not appearing in Bitrix24

**Check:**
1. Are the Bitrix24 webhook URLs correct?
2. Is the `BITRIX24_OPEN_LINE_ID` configured?
3. Check server logs for Bitrix24 API errors

**Solution:**
- Verify webhook URLs are accessible
- Test each URL individually with curl
- Check Bitrix24 permissions

### Issue: CRM leads not being created

**Check:**
1. Is `BITRIX24_CREATE_LEADS=true`?
2. Does the CRM lead webhook URL have correct permissions?

**Solution:**
- Enable lead creation in `.env`
- Verify the `crm.lead.add` webhook has write permissions
- Check server logs for lead creation errors

## Support

For issues specific to this configuration, check:
- Server logs for detailed error messages
- Bitrix24 webhook response codes
- Sendpulse webhook delivery status

## Next Steps

1. ✅ Configure `.env` with your credentials
2. ✅ Start the server
3. ✅ Configure the Sendpulse webhook URL
4. ✅ Test with a message
5. ✅ Verify in Bitrix24 Open Channel
6. ✅ Deploy to production when ready

---

**Important:** The Sendpulse webhook URL is:
```
https://your-server-domain.com/webhook/sendpulse
```

Configure this URL in your Sendpulse chatbot settings to start receiving subscriber activity data.
