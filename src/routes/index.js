const express = require('express');
const MessageController = require('../controllers/message.controller');

const router = express.Router();
const messageController = new MessageController();

/**
 * Webhook endpoint for Sendpulse
 * Receives messages from Sendpulse and forwards to Bitrix24
 */
router.post('/webhook/sendpulse', (req, res) => {
  messageController.handleSendpulseWebhook(req, res);
});

/**
 * Webhook endpoint for Bitrix24
 * Receives messages from Bitrix24 and forwards to Sendpulse
 */
router.post('/webhook/bitrix24', (req, res) => {
  messageController.handleBitrix24Webhook(req, res);
});

/**
 * Stats endpoint
 * Returns current session statistics
 */
router.get('/stats', (req, res) => {
  messageController.getStats(req, res);
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  messageController.healthCheck(req, res);
});

module.exports = router;
