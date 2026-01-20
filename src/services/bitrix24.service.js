const axios = require('axios');

/**
 * Bitrix24 API Client
 * Handles communication with Bitrix24 Open Channels
 */
class Bitrix24Service {
  constructor() {
    // Support for separate webhook URLs or a single base URL
    this.registerUrl = process.env.BITRIX24_REGISTER_URL;
    this.sendMessagesUrl = process.env.BITRIX24_SEND_MESSAGES_URL;
    this.crmLeadUrl = process.env.BITRIX24_CRM_LEAD_URL;
    this.baseUrl = process.env.BITRIX24_BASE_URL || process.env.BITRIX24_WEBHOOK_URL;
    this.openLineId = process.env.BITRIX24_OPEN_LINE_ID;
  }

  /**
   * Get the appropriate URL for a specific method
   */
  getUrl(method) {
    // If specific URLs are configured, use them
    if (method === 'imconnector.register' && this.registerUrl) {
      return this.registerUrl;
    }
    if (method === 'imconnector.send.messages' && this.sendMessagesUrl) {
      return this.sendMessagesUrl;
    }
    if (method === 'crm.lead.add' && this.crmLeadUrl) {
      return this.crmLeadUrl;
    }
    
    // Otherwise, construct URL from base URL
    return `${this.baseUrl}${method}`;
  }

  /**
   * Send a message to Bitrix24 Open Channel
   */
  async sendMessage(sessionId, message) {
    try {
      const response = await axios.post(this.getUrl('imopenlines.message.add'), {
        CHAT_ID: sessionId,
        MESSAGE: message
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message to Bitrix24:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Register a new session in Bitrix24 Open Channel
   */
  async registerSession(userId, userName) {
    try {
      const response = await axios.post(this.getUrl('imopenlines.session.start'), {
        USER: {
          ID: userId,
          NAME: userName
        },
        LINE_ID: this.openLineId
      });

      return response.data;
    } catch (error) {
      console.error('Error registering session in Bitrix24:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send incoming message from external source to Bitrix24
   */
  async receiveMessage(sessionId, userId, userName, message) {
    // Validate required parameters
    if (!userId || typeof userId !== 'string') {
      throw new Error('userId is required and must be a string');
    }
    if (!userName || typeof userName !== 'string') {
      throw new Error('userName is required and must be a string');
    }
    if (!message || typeof message !== 'string') {
      throw new Error('message is required and must be a string');
    }

    try {
      // First ensure session exists or create new one
      let chatId = sessionId;
      
      if (!chatId) {
        const sessionResponse = await this.registerSession(userId, userName);
        chatId = sessionResponse.result?.session?.id;
      }

      // Send the message to the open channel
      const response = await axios.post(this.getUrl('imconnector.send.messages'), {
        CONNECTOR: 'sendpulse',
        LINE: this.openLineId,
        MESSAGES: [{
          im: {
            message_id: Date.now(),
            user_id: userId,
            date: Math.floor(Date.now() / 1000)
          },
          message: {
            user_id: userId,
            date: Math.floor(Date.now() / 1000),
            text: message,
            user: {
              id: userId,
              name: userName
            }
          }
        }]
      });

      return response.data;
    } catch (error) {
      console.error('Error receiving message in Bitrix24:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a CRM lead from message
   */
  async createLead(userName, userPhone, userEmail, message) {
    try {
      const response = await axios.post(this.getUrl('crm.lead.add'), {
        fields: {
          TITLE: `New lead from ${userName}`,
          NAME: userName,
          PHONE: userPhone ? [{ VALUE: userPhone, VALUE_TYPE: 'WORK' }] : undefined,
          EMAIL: userEmail ? [{ VALUE: userEmail, VALUE_TYPE: 'WORK' }] : undefined,
          COMMENTS: message,
          SOURCE_ID: 'WEB',
          STATUS_ID: 'NEW'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating lead in Bitrix24:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update connector status
   */
  async updateConnectorStatus(active = true) {
    try {
      const response = await axios.post(this.getUrl('imconnector.status.set'), {
        CONNECTOR: 'sendpulse',
        LINE: this.openLineId,
        ACTIVE: active
      });

      return response.data;
    } catch (error) {
      console.error('Error updating connector status:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Register connector in Bitrix24
   */
  async registerConnector(handlerUrl) {
    try {
      const response = await axios.post(this.getUrl('imconnector.register'), {
        CONNECTOR: 'sendpulse',
        LINE: this.openLineId,
        NAME: 'Sendpulse Integration',
        ICON_PATH: '',
        HANDLER: handlerUrl
      });

      return response.data;
    } catch (error) {
      console.error('Error registering connector:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = Bitrix24Service;
