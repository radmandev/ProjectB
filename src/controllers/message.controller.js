const SendpulseService = require('../services/sendpulse.service');
const Bitrix24Service = require('../services/bitrix24.service');

/**
 * Message Bridge Controller
 * Routes messages between Sendpulse and Bitrix24
 */
class MessageController {
  constructor() {
    this.sendpulse = new SendpulseService();
    this.bitrix24 = new Bitrix24Service();
    // In-memory session mapping (in production, use Redis or database)
    this.sessionMap = new Map(); // Maps Sendpulse contact_id to Bitrix24 session_id
  }

  /**
   * Handle incoming webhook from Sendpulse
   * Forwards messages from Sendpulse to Bitrix24
   */
  async handleSendpulseWebhook(req, res) {
    try {
      const { contact, message, bot } = req.body;

      if (!contact || !message) {
        return res.status(400).json({ error: 'Invalid webhook data' });
      }

      console.log('Received message from Sendpulse:', {
        contactId: contact.id,
        contactName: contact.name,
        message: message.text
      });

      // Get or create Bitrix24 session
      let bitrixSessionId = this.sessionMap.get(contact.id);

      // Forward message to Bitrix24
      const result = await this.bitrix24.receiveMessage(
        bitrixSessionId,
        contact.id,
        contact.name || `User ${contact.id}`,
        message.text
      );

      // Store session mapping if new
      if (result.result?.session?.id) {
        this.sessionMap.set(contact.id, result.result.session.id);
      }

      console.log('Message forwarded to Bitrix24 successfully');

      res.json({ success: true, message: 'Message received and forwarded' });
    } catch (error) {
      console.error('Error handling Sendpulse webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  }

  /**
   * Handle incoming webhook from Bitrix24
   * Forwards messages from Bitrix24 to Sendpulse
   */
  async handleBitrix24Webhook(req, res) {
    try {
      const { event, data } = req.body;

      console.log('Received event from Bitrix24:', event);

      // Handle message send event
      if (event === 'ONIMBOTMESSAGEADD' || event === 'OnImMessageAdd') {
        const { DIALOG_ID, MESSAGE, USER_ID } = data;

        // Find Sendpulse contact ID from session mapping
        let sendpulseContactId = null;
        for (const [contactId, sessionId] of this.sessionMap.entries()) {
          if (sessionId === DIALOG_ID) {
            sendpulseContactId = contactId;
            break;
          }
        }

        if (!sendpulseContactId) {
          console.warn('No Sendpulse contact found for Bitrix24 session:', DIALOG_ID);
          return res.json({ success: false, message: 'Contact not found' });
        }

        // Forward message to Sendpulse
        await this.sendpulse.sendMessage(sendpulseContactId, MESSAGE);

        console.log('Message forwarded to Sendpulse successfully');
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error handling Bitrix24 webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  }

  /**
   * Get session mapping statistics
   */
  getStats(req, res) {
    res.json({
      activeSessions: this.sessionMap.size,
      sessions: Array.from(this.sessionMap.entries()).map(([contactId, sessionId]) => ({
        sendpulseContactId: contactId,
        bitrixSessionId: sessionId
      }))
    });
  }

  /**
   * Health check endpoint
   */
  healthCheck(req, res) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        sendpulse: !!process.env.SENDPULSE_API_USER_ID,
        bitrix24: !!process.env.BITRIX24_WEBHOOK_URL
      }
    });
  }
}

module.exports = MessageController;
