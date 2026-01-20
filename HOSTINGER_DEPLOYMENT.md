# Hostinger Deployment Guide

This guide explains how to deploy the Sendpulse-Bitrix24 integration on Hostinger hosting.

## Prerequisites

- Hostinger account with Node.js hosting support
- Domain name configured in Hostinger
- FTP/SSH access to your Hostinger account
- Git installed locally

## Hostinger Requirements

Hostinger supports Node.js applications on their Business and Cloud hosting plans. Make sure you have:
- Node.js version 14.x or higher
- npm installed
- Access to SSH/terminal

## Step 1: Prepare Your Application

### 1.1 Create Hostinger-specific Configuration

The project is already configured to work with Hostinger. The key files are:
- `package.json` - Node.js dependencies and scripts
- `.htaccess` - Apache configuration (created below)
- `public_html` structure compatibility

### 1.2 Create .htaccess File

Create `.htaccess` in your project root (if using Apache):

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirect all requests to Node.js app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## Step 2: Upload Files to Hostinger

### Option A: Using FTP/SFTP

1. **Connect to Hostinger via FTP:**
   - Host: Your Hostinger FTP hostname
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Upload project files:**
   - Upload all files to `public_html` or your domain's directory
   - Ensure all files maintain their structure

### Option B: Using SSH and Git

1. **Connect via SSH:**
   ```bash
   ssh username@your-domain.com
   ```

2. **Navigate to your domain directory:**
   ```bash
   cd domains/your-domain.com/public_html
   ```

3. **Clone the repository:**
   ```bash
   git clone <your-repository-url> .
   ```

## Step 3: Configure Environment Variables

### 3.1 Create .env File

SSH into your Hostinger account and create `.env`:

```bash
nano .env
```

Add your configuration:

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
NODE_ENV=production

# Webhook Base URL (your Hostinger domain)
WEBHOOK_BASE_URL=https://your-domain.com
```

**Important:** Replace `your-domain.com` with your actual Hostinger domain.

## Step 4: Install Dependencies

```bash
cd domains/your-domain.com/public_html
npm install --production
```

## Step 5: Configure Node.js Application in Hostinger

### 5.1 Access Hostinger Control Panel

1. Log in to your Hostinger account
2. Go to **Hosting** → Select your hosting plan
3. Navigate to **Advanced** → **Node.js**

### 5.2 Set Up Node.js Application

1. **Application root:** `/domains/your-domain.com/public_html`
2. **Application URL:** `https://your-domain.com`
3. **Application startup file:** `src/index.js`
4. **Node.js version:** Select 14.x or higher
5. Click **Create** or **Update**

### 5.3 Set Environment Variables in Hostinger Panel

In the Node.js application settings, add environment variables:
- `NODE_ENV` = `production`
- `PORT` = `3000`
- `WEBHOOK_BASE_URL` = `https://your-domain.com`
- Add all other variables from your `.env` file

## Step 6: Start the Application

### Using Hostinger Panel

1. Go to Node.js application settings
2. Click **Start Application**

### Using SSH/PM2

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start application with PM2
pm2 start src/index.js --name sendpulse-bitrix24

# Save PM2 configuration
pm2 save

# Set PM2 to start on server reboot
pm2 startup
```

## Step 7: Verify Deployment

### 7.1 Test Health Endpoint

```bash
curl https://your-domain.com/health
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

### 7.2 Check Application Logs

**Using Hostinger Panel:**
- Go to Node.js application settings
- View application logs

**Using SSH/PM2:**
```bash
pm2 logs sendpulse-bitrix24
```

## Step 8: Configure Sendpulse Webhook

Now that your domain is live, configure Sendpulse:

1. Log in to Sendpulse
2. Go to your chatbot settings
3. Configure webhook URL:
   ```
   https://your-domain.com/webhook/sendpulse
   ```
4. Save and test

## Step 9: Test the Integration

1. **Send a test message** in your Sendpulse chatbot
2. **Check logs:**
   ```bash
   pm2 logs sendpulse-bitrix24
   ```
3. **Verify in Bitrix24** that the message appears in Open Channel (Line 7)
4. **Reply from Bitrix24** and verify the response reaches Sendpulse

## Hostinger-Specific Configuration

### Directory Structure

```
public_html/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   └── index.js
├── examples/
├── node_modules/
├── .env
├── .htaccess
├── package.json
└── README.md
```

### Port Configuration

Hostinger typically uses port 3000 for Node.js applications. If you need a different port:

1. Update `.env`:
   ```env
   PORT=your_port_number
   ```

2. Update Hostinger Node.js settings to match

### SSL/HTTPS

Hostinger provides free SSL certificates:

1. Go to **Hosting** → **SSL**
2. Enable SSL for your domain
3. Force HTTPS redirection (already configured in `.htaccess`)

## Troubleshooting

### Application Won't Start

**Check:**
1. Node.js version compatibility (14.x or higher)
2. All dependencies installed: `npm install`
3. `.env` file exists and is configured
4. Application startup file path is correct

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install --production

# Restart application
pm2 restart sendpulse-bitrix24
```

### Webhooks Not Working

**Check:**
1. Domain is accessible: `curl https://your-domain.com/health`
2. SSL certificate is active
3. Firewall allows incoming webhooks
4. Webhook URL in Sendpulse is correct

**Solution:**
- Verify `.htaccess` configuration
- Check Hostinger firewall settings
- Test webhook manually: `curl -X POST https://your-domain.com/webhook/sendpulse -H "Content-Type: application/json" -d '{"contact":{"id":"test","name":"Test"},"message":{"text":"test"}}'`

### Port Already in Use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Restart application
pm2 restart sendpulse-bitrix24
```

### Environment Variables Not Loading

**Check:**
1. `.env` file exists in the correct directory
2. File permissions: `chmod 600 .env`
3. Variables set in Hostinger panel

**Solution:**
- Use Hostinger panel to set environment variables instead of `.env`
- Restart the application after changing variables

## Performance Optimization

### Enable PM2 Cluster Mode

```bash
pm2 start src/index.js -i max --name sendpulse-bitrix24
```

This starts multiple instances for better performance.

### Monitor Performance

```bash
# View PM2 dashboard
pm2 monit

# View detailed stats
pm2 show sendpulse-bitrix24
```

## Updating the Application

### Using SSH and Git

```bash
# Navigate to application directory
cd domains/your-domain.com/public_html

# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Restart application
pm2 restart sendpulse-bitrix24
```

### Using FTP

1. Download updated files
2. Upload via FTP to your Hostinger account
3. Restart application via Hostinger panel or PM2

## Backup and Maintenance

### Backup Configuration

```bash
# Backup .env file
cp .env .env.backup

# Backup entire application
tar -czf backup-$(date +%Y%m%d).tar.gz src/ package.json .env
```

### Regular Maintenance

1. **Update dependencies monthly:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor logs:**
   ```bash
   pm2 logs sendpulse-bitrix24 --lines 100
   ```

3. **Check disk space:**
   ```bash
   df -h
   ```

## Security Best Practices

1. **Keep .env secure:**
   ```bash
   chmod 600 .env
   ```

2. **Use HTTPS only** (already configured)

3. **Regular updates:**
   ```bash
   npm audit
   npm update
   ```

4. **Monitor access logs** in Hostinger panel

5. **Set up webhook signature verification** (see main README.md)

## Support and Resources

- **Hostinger Support:** https://www.hostinger.com/tutorials/
- **Node.js on Hostinger:** Check Hostinger documentation
- **PM2 Documentation:** https://pm2.keymetrics.io/
- **Project Documentation:** See README.md and other guides

## Quick Reference

### Your Webhook URLs

Once deployed on Hostinger:

- **Sendpulse webhook:** `https://your-domain.com/webhook/sendpulse`
- **Bitrix24 webhook:** `https://your-domain.com/webhook/bitrix24`
- **Health check:** `https://your-domain.com/health`
- **Stats:** `https://your-domain.com/stats`

### Useful Commands

```bash
# Start application
pm2 start src/index.js --name sendpulse-bitrix24

# Stop application
pm2 stop sendpulse-bitrix24

# Restart application
pm2 restart sendpulse-bitrix24

# View logs
pm2 logs sendpulse-bitrix24

# Monitor performance
pm2 monit

# List all PM2 processes
pm2 list
```

## Next Steps

1. ✅ Deploy to Hostinger
2. ✅ Configure environment variables
3. ✅ Start the application
4. ✅ Test health endpoint
5. ✅ Configure Sendpulse webhook URL
6. ✅ Test end-to-end integration
7. ✅ Monitor logs and performance
8. ✅ Set up regular backups

Your integration is now live on Hostinger!
