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
    this.reverseSessionMap = new Map(); // Maps Bitrix24 session_id to Sendpulse contact_id
    
    // Warn if using in-memory storage in production
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: Using in-memory session storage in production. Consider using Redis or a database for persistent storage.');
    }
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

      // Optionally create a CRM lead for new contacts
      if (!bitrixSessionId && process.env.BITRIX24_CREATE_LEADS === 'true') {
        try {
          await this.bitrix24.createLead(
            contact.name || `User ${contact.id}`,
            contact.phone,
            contact.email,
            message.text
          );
          console.log('Created CRM lead for new contact');
        } catch (error) {
          console.error('Failed to create CRM lead, continuing with message:', error.message);
        }
      }

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
        this.reverseSessionMap.set(result.result.session.id, contact.id);
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

        // Find Sendpulse contact ID from reverse session mapping (O(1) lookup)
        const sendpulseContactId = this.reverseSessionMap.get(DIALOG_ID);

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
