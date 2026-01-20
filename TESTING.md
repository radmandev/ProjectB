# Testing Guide

This guide explains how to test the Sendpulse-Bitrix24 integration both locally and in production.

## Prerequisites

- Node.js 14.x or higher installed
- Integration server running
- Valid API credentials (for production testing)

## Local Testing

### 1. Setup for Testing

```bash
# Install dependencies
npm install

# Copy and configure environment file
cp .env.example .env
# Edit .env with your test/production credentials
```

### 2. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server should start and display:
```
===========================================
Sendpulse-Bitrix24 Integration Server
===========================================
Server running on port 3000
...
```

### 3. Run Automated Tests

Open a new terminal and run:

```bash
node examples/test-integration.js
```

This will test:
- ✅ Health endpoint
- ✅ Stats endpoint
- ✅ Sendpulse webhook endpoint
- ✅ Bitrix24 webhook endpoint

### 4. Manual Testing with curl

#### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
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

#### Test Stats Endpoint
```bash
curl http://localhost:3000/stats
```

Expected response:
```json
{
  "activeSessions": 0,
  "sessions": []
}
```

#### Test Sendpulse Webhook
```bash
curl -X POST http://localhost:3000/webhook/sendpulse \
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

#### Test Bitrix24 Webhook
```bash
curl -X POST http://localhost:3000/webhook/bitrix24 \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ONIMBOTMESSAGEADD",
    "data": {
      "DIALOG_ID": "123",
      "MESSAGE": "Test response",
      "USER_ID": "1"
    }
  }'
```

## Testing with ngrok (Local Development)

For testing webhooks from external services (Sendpulse, Bitrix24):

### 1. Install ngrok

```bash
npm install -g ngrok
# OR download from https://ngrok.com/download
```

### 2. Start your local server

```bash
npm start
```

### 3. Start ngrok

In a new terminal:
```bash
ngrok http 3000
```

### 4. Configure webhooks

Use the ngrok URL (e.g., `https://abc123.ngrok.io`) in your webhook configurations:
- Sendpulse: `https://abc123.ngrok.io/webhook/sendpulse`
- Bitrix24: `https://abc123.ngrok.io/webhook/bitrix24`

### 5. Test end-to-end flow

1. Send a message in your Sendpulse chatbot
2. Check ngrok dashboard to see incoming webhook
3. Check server logs for processing
4. Verify message appears in Bitrix24
5. Reply from Bitrix24
6. Verify response reaches Sendpulse

## Production Testing

### 1. Deploy the application

Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide.

### 2. Configure production webhooks

Update webhook URLs in:
- Sendpulse dashboard
- Bitrix24 Contact Center

### 3. Test health endpoint

```bash
curl https://your-production-domain.com/health
```

### 4. End-to-End Testing

#### Test Sendpulse → Bitrix24:
1. Send message in Sendpulse chatbot (Telegram, WhatsApp, etc.)
2. Verify message appears in Bitrix24 Open Channel
3. Check stats endpoint to see session created:
   ```bash
   curl https://your-production-domain.com/stats
   ```

#### Test Bitrix24 → Sendpulse:
1. Reply to the message in Bitrix24
2. Verify customer receives response in Sendpulse chatbot
3. Verify conversation continues seamlessly

### 5. Load Testing (Optional)

Use tools like Apache Bench or Artillery for load testing:

```bash
# Install Artillery
npm install -g artillery

# Create test scenario
cat > load-test.yml <<EOF
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: "/webhook/sendpulse"
          json:
            contact:
              id: "{{ \$randomString() }}"
              name: "Test User"
            message:
              text: "Test message"
EOF

# Run load test
artillery run load-test.yml
```

## Monitoring

### Server Logs

Monitor logs in real-time:

```bash
# Local development
# Logs appear in console

# PM2
pm2 logs sendpulse-bitrix24 --lines 100

# Docker
docker-compose logs -f --tail=100

# Heroku
heroku logs --tail
```

### Key Metrics to Monitor

1. **Response Times**
   - Health endpoint should respond < 100ms
   - Webhook endpoints should respond < 500ms

2. **Error Rates**
   - Monitor 4xx and 5xx responses
   - Check for authentication failures

3. **Session Count**
   - Monitor active sessions via `/stats`
   - Watch for memory leaks

4. **Webhook Delivery**
   - Ensure webhooks are being received
   - Monitor forwarding success rates

## Debugging

### Enable Verbose Logging

Add console.log statements in key areas:

```javascript
// In message.controller.js
console.log('Received webhook:', req.body);
console.log('Forwarding to:', targetService);
```

### Check Session Mapping

```bash
# View current sessions
curl https://your-domain.com/stats | jq

# Should show active contact-to-session mappings
```

### Test API Credentials

Create a test script to verify credentials:

```javascript
// test-credentials.js
require('dotenv').config();
const SendpulseService = require('./src/services/sendpulse.service');

async function testSendpulse() {
  const sp = new SendpulseService();
  try {
    const token = await sp.getToken();
    console.log('✓ Sendpulse credentials valid');
  } catch (error) {
    console.log('✗ Sendpulse credentials invalid:', error.message);
  }
}

testSendpulse();
```

### Common Issues and Solutions

#### 1. Webhook not receiving requests

**Symptoms:**
- No logs appearing when sending messages
- Webhooks timeout

**Solutions:**
- Verify URL is publicly accessible
- Check firewall rules
- Ensure HTTPS is configured
- Check webhook configuration in platforms

#### 2. Authentication errors

**Symptoms:**
- 401/403 errors in logs
- "Failed to authenticate" messages

**Solutions:**
- Verify API credentials in `.env`
- Check token expiration
- Regenerate API keys if needed

#### 3. Messages not forwarding

**Symptoms:**
- Messages received but not forwarded
- 500 errors in webhook responses

**Solutions:**
- Check session mapping in `/stats`
- Verify target platform is accessible
- Check API permissions
- Review server logs for errors

#### 4. High memory usage

**Symptoms:**
- Server becomes slow over time
- Memory usage increases continuously

**Solutions:**
- Implement session cleanup (TTL)
- Use Redis for session storage
- Restart server periodically
- Monitor with tools like PM2

## Test Checklist

Before considering the integration production-ready:

- [ ] Health endpoint responds correctly
- [ ] Stats endpoint shows session data
- [ ] Sendpulse webhook receives and parses data
- [ ] Bitrix24 webhook receives and parses data
- [ ] Messages forward from Sendpulse to Bitrix24
- [ ] Messages forward from Bitrix24 to Sendpulse
- [ ] Session mapping works correctly
- [ ] Error handling works as expected
- [ ] Logs are clear and informative
- [ ] HTTPS is configured in production
- [ ] Credentials are secured
- [ ] Monitoring is set up
- [ ] Documentation is complete

## Continuous Testing

### Automated Health Checks

Set up automated health checks using services like:
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

Example configuration:
- URL: `https://your-domain.com/health`
- Interval: 5 minutes
- Alert on: Status code != 200

### Integration Tests in CI/CD

Add integration tests to your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm start &
      - run: sleep 5
      - run: node examples/test-integration.js
```

## Performance Benchmarks

Expected performance on modest hardware (2 CPU, 2GB RAM):

- **Concurrent connections:** 100+
- **Messages per second:** 50+
- **Average response time:** < 200ms
- **Memory usage:** < 100MB
- **CPU usage:** < 20%

## Getting Help

If tests fail:
1. Check server logs
2. Verify environment variables
3. Test API credentials separately
4. Review [API.md](API.md) for correct payload formats
5. Check [README.md](README.md) troubleshooting section
