# Deployment Guide

This guide covers deploying the Sendpulse-Bitrix24 integration to various platforms.

## Prerequisites

- Completed [installation and configuration](README.md#installation)
- Public domain or server URL for webhooks
- SSL certificate (required for production webhooks)

## Deployment Options

### 1. Heroku Deployment

#### Setup

1. **Create Heroku app**
```bash
heroku create your-app-name
```

2. **Set environment variables**
```bash
heroku config:set SENDPULSE_API_USER_ID=your_user_id
heroku config:set SENDPULSE_API_SECRET=your_secret
heroku config:set BITRIX24_WEBHOOK_URL=your_webhook_url
heroku config:set BITRIX24_OPEN_LINE_ID=your_line_id
heroku config:set WEBHOOK_BASE_URL=https://your-app-name.herokuapp.com
```

3. **Deploy**
```bash
git push heroku main
```

4. **Configure webhooks**
- Sendpulse webhook: `https://your-app-name.herokuapp.com/webhook/sendpulse`
- Bitrix24 webhook: `https://your-app-name.herokuapp.com/webhook/bitrix24`

### 2. VPS Deployment (Ubuntu)

#### Setup

1. **Update system**
```bash
sudo apt update
sudo apt upgrade -y
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

3. **Install PM2**
```bash
sudo npm install -g pm2
```

4. **Clone repository**
```bash
cd /var/www
git clone <repository-url> sendpulse-bitrix24
cd sendpulse-bitrix24
```

5. **Install dependencies**
```bash
npm install --production
```

6. **Configure environment**
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

7. **Start with PM2**
```bash
pm2 start src/index.js --name sendpulse-bitrix24
pm2 save
pm2 startup
```

8. **Setup Nginx reverse proxy**
```bash
sudo nano /etc/nginx/sites-available/sendpulse-bitrix24
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. **Enable site and restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/sendpulse-bitrix24 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Docker Deployment

#### Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SENDPULSE_API_USER_ID=${SENDPULSE_API_USER_ID}
      - SENDPULSE_API_SECRET=${SENDPULSE_API_SECRET}
      - BITRIX24_WEBHOOK_URL=${BITRIX24_WEBHOOK_URL}
      - BITRIX24_OPEN_LINE_ID=${BITRIX24_OPEN_LINE_ID}
      - WEBHOOK_BASE_URL=${WEBHOOK_BASE_URL}
      - PORT=3000
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

#### Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 4. AWS EC2 Deployment

Similar to VPS deployment, but:

1. **Launch EC2 instance**
   - Use Ubuntu 20.04 or later
   - Open port 80 and 443 in security group
   - Assign Elastic IP

2. **Connect via SSH**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Follow VPS deployment steps**

### 5. Google Cloud Run

#### Setup

1. **Create Dockerfile** (see Docker section)

2. **Build and push to Container Registry**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/sendpulse-bitrix24
```

3. **Deploy to Cloud Run**
```bash
gcloud run deploy sendpulse-bitrix24 \
  --image gcr.io/PROJECT_ID/sendpulse-bitrix24 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SENDPULSE_API_USER_ID=xxx,SENDPULSE_API_SECRET=xxx,BITRIX24_WEBHOOK_URL=xxx,BITRIX24_OPEN_LINE_ID=xxx
```

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Test health endpoint
curl https://your-domain.com/health

# Should return:
# {"status":"healthy","timestamp":"...","services":{...}}
```

### 2. Configure Webhooks

Update webhook URLs in:
- Sendpulse chatbot settings
- Bitrix24 open channel settings

### 3. Test Integration

1. Send test message in Sendpulse chatbot
2. Verify message appears in Bitrix24
3. Reply from Bitrix24
4. Verify response appears in Sendpulse

### 4. Monitor Logs

```bash
# PM2
pm2 logs sendpulse-bitrix24

# Docker
docker-compose logs -f

# Heroku
heroku logs --tail
```

## Maintenance

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart application
pm2 restart sendpulse-bitrix24
```

### Backup

Backup configuration:
```bash
# Export environment variables
pm2 env 0 > backup.env

# Backup session data (if using database)
```

### Monitoring

Set up monitoring for:
- Server uptime
- Webhook endpoint availability
- Error rates
- Session count

Tools:
- UptimeRobot
- New Relic
- Datadog
- PM2 Plus

## Troubleshooting

### Webhooks Not Working

1. **Check webhook URLs are accessible**
```bash
curl https://your-domain.com/webhook/sendpulse
```

2. **Verify SSL certificate**
```bash
curl -I https://your-domain.com
```

3. **Check firewall rules**
```bash
sudo ufw status
```

### High Memory Usage

1. **Check active sessions**
```bash
curl https://your-domain.com/stats
```

2. **Restart application**
```bash
pm2 restart sendpulse-bitrix24
```

3. **Consider implementing session cleanup**

### Performance Issues

1. **Enable PM2 cluster mode**
```bash
pm2 start src/index.js -i max --name sendpulse-bitrix24
```

2. **Implement Redis for session storage**
3. **Add load balancer for multiple instances**

## Security Best Practices

1. **Use environment variables for secrets**
2. **Enable firewall** (ufw, AWS Security Groups)
3. **Keep dependencies updated**
```bash
npm audit
npm update
```
4. **Implement rate limiting**
5. **Add webhook signature verification**
6. **Use HTTPS only**
7. **Regular security audits**

## Cost Optimization

- Use serverless (Cloud Run, Lambda) for low traffic
- Use VPS for predictable, medium traffic
- Use Heroku free tier for development/testing
- Monitor usage and scale accordingly

## Support

For deployment issues, check:
- Server logs
- Webhook configurations
- Environment variables
- Network connectivity
