# Example Webhook Payloads

This directory contains example payloads and test scripts for the Sendpulse-Bitrix24 integration.

## Test Integration Script

Run the test script to verify all endpoints are working:

```bash
# Make sure the server is running first
npm start

# In another terminal, run the test script
node examples/test-integration.js
```

## Manual Testing with curl

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Stats

```bash
curl http://localhost:3000/stats
```

### 3. Sendpulse Webhook Example

```bash
curl -X POST http://localhost:3000/webhook/sendpulse \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "id": "contact_12345",
      "name": "Alice Johnson",
      "phone": "+1234567890",
      "email": "alice@example.com"
    },
    "message": {
      "text": "Hello, I have a question about my recent purchase",
      "type": "text",
      "date": 1642531200
    },
    "bot": {
      "id": "bot_001",
      "name": "Customer Support Bot"
    }
  }'
```

### 4. Bitrix24 Webhook Example

```bash
curl -X POST http://localhost:3000/webhook/bitrix24 \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ONIMBOTMESSAGEADD",
    "data": {
      "DIALOG_ID": "chat_789",
      "MESSAGE": "Hi Alice! I can help you with your purchase. What is your order number?",
      "USER_ID": "agent_001"
    }
  }'
```

## Example Payloads

### Sendpulse Message Payload

```json
{
  "contact": {
    "id": "unique_contact_id",
    "name": "Customer Name",
    "phone": "+1234567890",
    "email": "customer@example.com"
  },
  "message": {
    "text": "Customer message text",
    "type": "text",
    "date": 1642531200
  },
  "bot": {
    "id": "bot_identifier",
    "name": "Bot Name"
  }
}
```

### Bitrix24 Event Payload

```json
{
  "event": "ONIMBOTMESSAGEADD",
  "data": {
    "DIALOG_ID": "session_or_chat_id",
    "MESSAGE": "Agent response message",
    "USER_ID": "agent_user_id"
  }
}
```

## Expected Behavior

1. **Sendpulse → Bitrix24 Flow:**
   - User sends message in Sendpulse chatbot
   - Webhook triggers integration server
   - Server creates/finds Bitrix24 session
   - Message appears in Bitrix24 Open Channel
   - Agent can see and respond to the message

2. **Bitrix24 → Sendpulse Flow:**
   - Agent sends response in Bitrix24
   - Webhook triggers integration server
   - Server looks up corresponding Sendpulse contact
   - Message sent to customer via Sendpulse API
   - Customer receives response in their chat

## Webhook Configuration

### Sendpulse Configuration

1. Go to your Sendpulse chatbot settings
2. Navigate to "Webhooks" or "Integration" section
3. Add webhook URL: `https://your-domain.com/webhook/sendpulse`
4. Select events: "New Message Received"
5. Save configuration

### Bitrix24 Configuration

1. Go to your Bitrix24 Contact Center
2. Navigate to your Open Channel settings
3. Configure connector webhook
4. Add webhook URL: `https://your-domain.com/webhook/bitrix24`
5. Enable connector
6. Save configuration

## Debugging Tips

1. **Check server logs:**
   ```bash
   # If using PM2
   pm2 logs sendpulse-bitrix24
   
   # If running directly
   npm start
   ```

2. **Check session mapping:**
   ```bash
   curl http://localhost:3000/stats
   ```

3. **Test with verbose curl:**
   ```bash
   curl -v -X POST http://localhost:3000/webhook/sendpulse \
     -H "Content-Type: application/json" \
     -d @examples/sendpulse-payload.json
   ```

4. **Use request logging:**
   The server logs all incoming requests with timestamps.

## Common Issues

1. **Webhook not receiving data:**
   - Verify URL is publicly accessible
   - Check firewall settings
   - Ensure HTTPS is configured (required by most platforms)

2. **Messages not forwarding:**
   - Check API credentials in `.env`
   - Verify session mapping in `/stats`
   - Check server logs for errors

3. **Authentication failures:**
   - Verify Sendpulse API credentials
   - Check Bitrix24 webhook URL and permissions
   - Ensure tokens haven't expired
