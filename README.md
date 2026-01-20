# Sendpulse-Bitrix24 Integration

A Node.js application that integrates Sendpulse messaging service with Bitrix24 Open Channels, enabling bidirectional message forwarding between the two platforms.

## 🚀 Quick Start

**New to this project?** Check out the [Quick Start Guide](QUICKSTART.md) to get up and running in 5 minutes!

**Deploying to Hostinger?** See the [Hostinger Deployment Guide](HOSTINGER_DEPLOYMENT.md) for step-by-step instructions.

## Overview

This integration allows you to:
- Receive messages from Sendpulse chatbots and forward them to Bitrix24 Open Channels
- Send messages from Bitrix24 to Sendpulse chatbot users
- Maintain synchronized conversations across both platforms

## Features

- ✅ **Bidirectional messaging** - Messages flow seamlessly between Sendpulse and Bitrix24
- ✅ **Session management** - Automatic session creation and mapping between platforms
- ✅ **Webhook-based** - Real-time message delivery using webhooks
- ✅ **Easy configuration** - Environment-based configuration
- ✅ **Health monitoring** - Built-in health check and stats endpoints

## Architecture

```
Sendpulse Chatbot  <-->  Integration Server  <-->  Bitrix24 Open Channel
                              (Node.js)
```

### Message Flow

1. **Sendpulse → Bitrix24**
   - User sends message in Sendpulse chatbot
   - Sendpulse webhook triggers integration server
   - Server forwards message to Bitrix24 Open Channel
   - Session is created/mapped automatically

2. **Bitrix24 → Sendpulse**
   - Agent responds in Bitrix24 Open Channel
   - Bitrix24 webhook triggers integration server
   - Server forwards message to Sendpulse chatbot
   - Message delivered to original user

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Sendpulse account with API credentials
- Bitrix24 account with webhook access
- **For local testing:** ngrok ([installation guide](NGROK_GUIDE.md))
- **For production:** Public server URL for receiving webhooks

## Installation

**Quick Setup:** Run the interactive setup script:
```bash
npm install
./setup.sh
```

**For Local Testing:** Use the automated local testing helper:
```bash
./start-local-testing.sh
```
See [NGROK_GUIDE.md](NGROK_GUIDE.md) for detailed local testing instructions.

Or follow the manual steps below:

1. **Clone the repository**
```bash
git clone <repository-url>
cd ProjectB
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Sendpulse Configuration
SENDPULSE_API_USER_ID=your_sendpulse_user_id
SENDPULSE_API_SECRET=your_sendpulse_secret

# Bitrix24 Configuration
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/your_webhook_code/
BITRIX24_OPEN_LINE_ID=your_open_line_id

# Server Configuration
PORT=3000
WEBHOOK_BASE_URL=https://your-server.com
```

## Configuration Guide

### Sendpulse Setup

1. **Get API Credentials**
   - Log in to your Sendpulse account
   - Navigate to Settings → API
   - Create new API credentials
   - Copy the User ID and Secret

2. **Create a Chatbot**
   - Go to Chatbots section
   - Create a new chatbot (Telegram, WhatsApp, VK, etc.)
   - Note the bot ID

3. **Configure Webhook**
   - In your chatbot settings, set webhook URL to:
     ```
     https://your-server.com/webhook/sendpulse
     ```

### Bitrix24 Setup

1. **Create Incoming Webhook**
   - Go to Bitrix24 → Applications → Webhooks
   - Create an incoming webhook with permissions:
     - `imconnector` (read/write)
     - `imopenlines` (read/write)
   - Copy the webhook URL

2. **Create Open Channel**
   - Go to Contact Center → Open Channels
   - Create a new open channel
   - Note the Line ID

3. **Configure Outgoing Webhook**
   - In your open channel settings
   - Set handler URL to:
     ```
     https://your-server.com/webhook/bitrix24
     ```

## Usage

### Development Mode

```bash
npm run dev
```

This starts the server with auto-reload on file changes.

### Production Mode

```bash
npm start
```

### Using ngrok for Local Development

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in your webhook configurations
```

## API Endpoints

### Webhooks

- `POST /webhook/sendpulse` - Receives messages from Sendpulse
- `POST /webhook/bitrix24` - Receives messages from Bitrix24

### Monitoring

- `GET /health` - Health check endpoint
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

- `GET /stats` - Session statistics
  ```json
  {
    "activeSessions": 5,
    "sessions": [
      {
        "sendpulseContactId": "123456",
        "bitrixSessionId": "789"
      }
    ]
  }
  ```

## Project Structure

```
ProjectB/
├── src/
│   ├── controllers/
│   │   └── message.controller.js    # Message routing logic
│   ├── services/
│   │   ├── sendpulse.service.js     # Sendpulse API client
│   │   └── bitrix24.service.js      # Bitrix24 API client
│   ├── routes/
│   │   └── index.js                 # API routes
│   └── index.js                     # Application entry point
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## API Documentation

### Sendpulse API

The integration uses the following Sendpulse API endpoints:

- **Authentication**: `POST /oauth/access_token`
- **Send Message**: `POST /chatbots/send`
- **Get Bot Info**: `GET /chatbots/bots/{botId}`

Refer to [Sendpulse API Documentation](https://sendpulse.com/api) for more details.

### Bitrix24 API

The integration uses the following Bitrix24 REST API methods:

- **Send Message**: `imopenlines.message.add`
- **Start Session**: `imopenlines.session.start`
- **Receive Messages**: `imconnector.send.messages`
- **Update Status**: `imconnector.status.set`
- **Register Connector**: `imconnector.register`

Refer to [Bitrix24 REST API Documentation](https://dev.1c-bitrix.ru/rest_help/) for more details.

## Troubleshooting

### Common Issues

1. **Webhook not receiving messages**
   - Verify webhook URLs are publicly accessible
   - Check firewall settings
   - Ensure webhook URLs are correctly configured in both platforms

2. **Authentication errors**
   - Verify API credentials in `.env`
   - Check token expiration
   - Ensure proper permissions are granted

3. **Messages not forwarding**
   - Check server logs for errors
   - Verify session mapping in `/stats` endpoint
   - Ensure both services are properly configured

### Logs

The application logs all incoming webhooks and message forwarding activities. Monitor the console output for debugging information.

## Security Considerations

- Store credentials in environment variables, never in code
- Use HTTPS for webhook endpoints in production
- Implement webhook signature verification (recommended for production)
- Consider rate limiting for webhook endpoints
- Use a proper session store (Redis, database) in production instead of in-memory storage

## Deployment

### Deployment Options

- **Hostinger**: Complete guide for Hostinger shared/VPS hosting → [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)
- **Heroku**: Use the included `package.json` scripts → [DEPLOYMENT.md](DEPLOYMENT.md)
- **Docker**: Create a Dockerfile for containerized deployment → [DEPLOYMENT.md](DEPLOYMENT.md)
- **VPS**: Use PM2 for process management → [DEPLOYMENT.md](DEPLOYMENT.md)
- **Cloud Platforms**: AWS, Google Cloud, Azure → [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Hostinger Deployment

```bash
# 1. Upload files to Hostinger via FTP/SSH
# 2. SSH into your server
ssh username@your-domain.com

# 3. Navigate to your domain directory
cd domains/your-domain.com/public_html

# 4. Install dependencies
npm install --production

# 5. Configure environment
cp .env.example .env
nano .env  # Add your credentials

# 6. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

See [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md) for complete instructions.

### Example PM2 Configuration

The project includes `ecosystem.config.js` for PM2:

```bash
# Start application using ecosystem file
pm2 start ecosystem.config.js

# Or manually
pm2 start src/index.js --name sendpulse-bitrix24

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

## Future Enhancements

- [ ] Add message formatting and rich media support
- [ ] Implement persistent session storage (Redis/Database)
- [ ] Add webhook signature verification
- [ ] Support multiple Sendpulse bots
- [ ] Add message queue for reliability
- [ ] Implement retry logic for failed messages
- [ ] Add comprehensive logging and monitoring
- [ ] Create admin dashboard
- [ ] Add unit and integration tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please create an issue in the repository.