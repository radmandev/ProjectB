# API Documentation

## Webhook Endpoints

### 1. Sendpulse Webhook

**Endpoint**: `POST /webhook/sendpulse`

Receives incoming messages from Sendpulse chatbot.

#### Request Body

```json
{
  "contact": {
    "id": "123456789",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "message": {
    "text": "Hello, I need help",
    "type": "text",
    "date": 1234567890
  },
  "bot": {
    "id": "bot123",
    "name": "Support Bot"
  }
}
```

#### Response

```json
{
  "success": true,
  "message": "Message received and forwarded"
}
```

#### Error Response

```json
{
  "error": "Invalid webhook data"
}
```

### 2. Bitrix24 Webhook

**Endpoint**: `POST /webhook/bitrix24`

Receives outgoing messages from Bitrix24 Open Channel.

#### Request Body

```json
{
  "event": "ONIMBOTMESSAGEADD",
  "data": {
    "DIALOG_ID": "789",
    "MESSAGE": "Thank you for contacting us",
    "USER_ID": "1"
  }
}
```

#### Response

```json
{
  "success": true
}
```

## Monitoring Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

Returns the health status of the integration server.

#### Response

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

### 2. Statistics

**Endpoint**: `GET /stats`

Returns current session statistics.

#### Response

```json
{
  "activeSessions": 5,
  "sessions": [
    {
      "sendpulseContactId": "123456789",
      "bitrixSessionId": "789"
    },
    {
      "sendpulseContactId": "987654321",
      "bitrixSessionId": "790"
    }
  ]
}
```

## Message Flow Examples

### Example 1: Customer Initiates Conversation

1. **Customer sends message in Sendpulse chatbot**
   - Platform: Telegram/WhatsApp/etc.
   - Message: "I have a question about my order"

2. **Sendpulse triggers webhook**
   ```bash
   POST https://your-server.com/webhook/sendpulse
   ```

3. **Integration server processes**
   - Creates/retrieves Bitrix24 session
   - Maps Sendpulse contact ID to Bitrix24 session ID
   - Forwards message to Bitrix24

4. **Message appears in Bitrix24 Open Channel**
   - Agent receives notification
   - Can view customer information
   - Can respond to customer

### Example 2: Agent Responds from Bitrix24

1. **Agent types response in Bitrix24**
   - Message: "Hello! I'll help you with your order. What's your order number?"

2. **Bitrix24 triggers webhook**
   ```bash
   POST https://your-server.com/webhook/bitrix24
   ```

3. **Integration server processes**
   - Looks up Sendpulse contact ID from session mapping
   - Forwards message to Sendpulse

4. **Message delivered to customer**
   - Customer receives response in original chatbot
   - Conversation continues seamlessly

## Error Handling

### Common Error Codes

- `400 Bad Request` - Invalid webhook data
- `500 Internal Server Error` - Server processing error

### Error Response Format

```json
{
  "error": "Error description",
  "message": "Detailed error message (development only)"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

## Security

### Webhook Verification (Recommended)

For production deployments, implement webhook signature verification:

1. **Sendpulse**: Verify webhook signatures using shared secret
2. **Bitrix24**: Verify requests come from your Bitrix24 instance

Example implementation:

```javascript
function verifyWebhookSignature(req, secret) {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

## Testing

### Testing Sendpulse Webhook

```bash
curl -X POST https://your-server.com/webhook/sendpulse \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "id": "test123",
      "name": "Test User"
    },
    "message": {
      "text": "Test message"
    }
  }'
```

### Testing Bitrix24 Webhook

```bash
curl -X POST https://your-server.com/webhook/bitrix24 \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ONIMBOTMESSAGEADD",
    "data": {
      "DIALOG_ID": "789",
      "MESSAGE": "Test response",
      "USER_ID": "1"
    }
  }'
```

### Testing Health Endpoint

```bash
curl https://your-server.com/health
```

### Testing Stats Endpoint

```bash
curl https://your-server.com/stats
```
