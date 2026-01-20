#!/usr/bin/env node

/**
 * Test script for Sendpulse-Bitrix24 Integration
 * This script simulates webhook calls to test the integration
 */

const axios = require('axios');

const BASE_URL = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthEndpoint() {
  log('\n=== Testing Health Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    log('✓ Health check passed', 'green');
    log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    log('✗ Health check failed: ' + error.message, 'red');
    return false;
  }
}

async function testStatsEndpoint() {
  log('\n=== Testing Stats Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/stats`);
    log('✓ Stats retrieved successfully', 'green');
    log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    log('✗ Stats check failed: ' + error.message, 'red');
    return false;
  }
}

async function testSendpulseWebhook() {
  log('\n=== Testing Sendpulse Webhook ===', 'blue');
  try {
    const testPayload = {
      contact: {
        id: 'test_contact_123',
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com'
      },
      message: {
        text: 'Hello, I need help with my order',
        type: 'text',
        date: Math.floor(Date.now() / 1000)
      },
      bot: {
        id: 'bot_123',
        name: 'Support Bot'
      }
    };

    log('Sending test payload:', 'yellow');
    log(JSON.stringify(testPayload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/webhook/sendpulse`,
      testPayload
    );

    if (response.data.success) {
      log('✓ Sendpulse webhook processed successfully', 'green');
    } else {
      log('⚠ Sendpulse webhook returned non-success response', 'yellow');
    }
    log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    log('✗ Sendpulse webhook test failed: ' + error.message, 'red');
    if (error.response?.data) {
      log('Error details: ' + JSON.stringify(error.response.data, null, 2), 'red');
    }
    return false;
  }
}

async function testBitrix24Webhook() {
  log('\n=== Testing Bitrix24 Webhook ===', 'blue');
  try {
    const testPayload = {
      event: 'ONIMBOTMESSAGEADD',
      data: {
        DIALOG_ID: '123',
        MESSAGE: 'Thank you for contacting us! How can I help you?',
        USER_ID: '1'
      }
    };

    log('Sending test payload:', 'yellow');
    log(JSON.stringify(testPayload, null, 2));

    const response = await axios.post(
      `${BASE_URL}/webhook/bitrix24`,
      testPayload
    );

    if (response.data.success) {
      log('✓ Bitrix24 webhook processed successfully', 'green');
    } else {
      log('⚠ Bitrix24 webhook returned non-success response', 'yellow');
    }
    log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    log('✗ Bitrix24 webhook test failed: ' + error.message, 'red');
    if (error.response?.data) {
      log('Error details: ' + JSON.stringify(error.response.data, null, 2), 'red');
    }
    return false;
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(50), 'blue');
  log('  Sendpulse-Bitrix24 Integration Test Suite  ', 'blue');
  log('='.repeat(50) + '\n', 'blue');

  const results = {
    passed: 0,
    failed: 0,
    total: 4
  };

  // Test 1: Health Check
  if (await testHealthEndpoint()) {
    results.passed++;
  } else {
    results.failed++;
    log('\n⚠ Stopping tests - server is not healthy', 'yellow');
    return;
  }

  await sleep(500);

  // Test 2: Stats
  if (await testStatsEndpoint()) {
    results.passed++;
  } else {
    results.failed++;
  }

  await sleep(500);

  // Test 3: Sendpulse Webhook
  if (await testSendpulseWebhook()) {
    results.passed++;
  } else {
    results.failed++;
  }

  await sleep(500);

  // Test 4: Bitrix24 Webhook
  if (await testBitrix24Webhook()) {
    results.passed++;
  } else {
    results.failed++;
  }

  await sleep(500);

  // Test 5: Check stats again to see session count
  log('\n=== Checking Stats After Tests ===', 'blue');
  await testStatsEndpoint();

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('  Test Summary  ', 'blue');
  log('='.repeat(50), 'blue');
  log(`Total Tests: ${results.total}`);
  log(`Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log('='.repeat(50) + '\n', 'blue');

  if (results.passed === results.total) {
    log('✓ All tests passed!', 'green');
  } else {
    log('⚠ Some tests failed. Check the output above for details.', 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n✗ Test suite failed with error: ${error.message}`, 'red');
  process.exit(1);
});
