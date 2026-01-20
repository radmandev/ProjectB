const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Sendpulse API Client
 * Handles authentication and message sending via Sendpulse
 */
class SendpulseService {
  constructor() {
    this.userId = process.env.SENDPULSE_API_USER_ID;
    this.secret = process.env.SENDPULSE_API_SECRET;
    this.tokenStorage = process.env.SENDPULSE_TOKEN_STORAGE || '/tmp/sendpulse_token';
    this.baseURL = 'https://api.sendpulse.com';
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token (from cache or request new one)
   */
  async getToken() {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Try to load token from file
    if (fs.existsSync(this.tokenStorage)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.tokenStorage, 'utf8'));
        if (data.expiry && Date.now() < data.expiry) {
          this.token = data.token;
          this.tokenExpiry = data.expiry;
          return this.token;
        }
      } catch (error) {
        console.error('Error reading token from storage:', error);
      }
    }

    // Request new token
    return await this.requestNewToken();
  }

  /**
   * Request new access token from Sendpulse
   */
  async requestNewToken() {
    try {
      const response = await axios.post(`${this.baseURL}/oauth/access_token`, {
        grant_type: 'client_credentials',
        client_id: this.userId,
        client_secret: this.secret
      });

      this.token = response.data.access_token;
      // Token typically expires in 1 hour, store expiry time
      const expiresIn = response.data.expires_in || 3600; // Default to 1 hour if not provided
      if (typeof expiresIn !== 'number' || expiresIn <= 0) {
        throw new Error('Invalid token expiration time received from Sendpulse');
      }
      this.tokenExpiry = Date.now() + (expiresIn * 1000) - 60000; // 1 min buffer

      // Save token to file
      try {
        const dir = path.dirname(this.tokenStorage);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.tokenStorage, JSON.stringify({
          token: this.token,
          expiry: this.tokenExpiry
        }));
      } catch (error) {
        console.error('Error saving token to storage:', error);
      }

      return this.token;
    } catch (error) {
      console.error('Error getting Sendpulse token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Sendpulse');
    }
  }

  /**
   * Send a message via Sendpulse chatbot
   */
  async sendMessage(chatId, message) {
    try {
      const token = await this.getToken();
      
      const response = await axios.post(
        `${this.baseURL}/chatbots/send`,
        {
          contact_id: chatId,
          message: {
            text: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending message via Sendpulse:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get bot info
   */
  async getBotInfo(botId) {
    try {
      const token = await this.getToken();
      
      const response = await axios.get(
        `${this.baseURL}/chatbots/bots/${botId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting bot info:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = SendpulseService;
