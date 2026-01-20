const axios = require('axios');

/**
 * Bitrix24 API Client
 * Handles communication with Bitrix24 Open Channels
 */
class Bitrix24Service {
  constructor() {
    this.webhookUrl = process.env.BITRIX24_WEBHOOK_URL;
    this.openLineId = process.env.BITRIX24_OPEN_LINE_ID;
  }

  /**
   * Send a message to Bitrix24 Open Channel
   */
  async sendMessage(sessionId, message) {
    try {
      const response = await axios.post(`${this.webhookUrl}imopenlines.message.add`, {
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
      const response = await axios.post(`${this.webhookUrl}imopenlines.session.start`, {
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
    try {
      // First ensure session exists or create new one
      let chatId = sessionId;
      
      if (!chatId) {
        const sessionResponse = await this.registerSession(userId, userName);
        chatId = sessionResponse.result?.session?.id;
      }

      // Send the message to the open channel
      const response = await axios.post(`${this.webhookUrl}imconnector.send.messages`, {
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
   * Update connector status
   */
  async updateConnectorStatus(active = true) {
    try {
      const response = await axios.post(`${this.webhookUrl}imconnector.status.set`, {
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
      const response = await axios.post(`${this.webhookUrl}imconnector.register`, {
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
