#!/usr/bin/env node

/**
 * Quick Test Script for ngrok Setup
 * Tests your ngrok URL and server connectivity
 */

const axios = require('axios');

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

async function testNgrokSetup() {
  // Get ngrok URL from command line or ask user
  let ngrokUrl = process.argv[2];
  
  if (!ngrokUrl) {
    log('\n=== ngrok Setup Test ===\n', 'blue');
    log('Usage: node test-ngrok-setup.js <your-ngrok-url>', 'yellow');
    log('Example: node test-ngrok-setup.js https://abc123.ngrok.io\n', 'yellow');
    process.exit(1);
  }

  // Remove trailing slash if present
  ngrokUrl = ngrokUrl.replace(/\/$/, '');

  log('\n=== Testing ngrok Setup ===\n', 'blue');
  log(`Testing URL: ${ngrokUrl}`, 'blue');
  log('');

  let passed = 0;
  let failed = 0;

  // Test 1: Health Endpoint
  log('Test 1: Health Endpoint', 'blue');
  try {
    const response = await axios.get(`${ngrokUrl}/health`, { timeout: 5000 });
    if (response.status === 200 && response.data.status === 'healthy') {
      log('✓ Health endpoint is accessible and healthy\n', 'green');
      passed++;
    } else {
      log('✗ Health endpoint returned unexpected response\n', 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Failed to access health endpoint: ${error.message}\n`, 'red');
    log('  Make sure your server is running: npm start\n', 'yellow');
    failed++;
  }

  // Test 2: Stats Endpoint
  log('Test 2: Stats Endpoint', 'blue');
  try {
    const response = await axios.get(`${ngrokUrl}/stats`, { timeout: 5000 });
    if (response.status === 200) {
      log('✓ Stats endpoint is accessible', 'green');
      log(`  Active sessions: ${response.data.activeSessions}\n`, 'blue');
      passed++;
    } else {
      log('✗ Stats endpoint returned unexpected response\n', 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Failed to access stats endpoint: ${error.message}\n`, 'red');
    failed++;
  }

  // Test 3: Sendpulse Webhook Endpoint (POST)
  log('Test 3: Sendpulse Webhook Endpoint', 'blue');
  try {
    const testPayload = {
      contact: {
        id: 'test_ngrok_123',
        name: 'ngrok Test User'
      },
      message: {
        text: 'This is a test message from ngrok test script',
        type: 'text',
        date: Math.floor(Date.now() / 1000)
      },
      bot: {
        id: 'test_bot',
        name: 'Test Bot'
      }
    };

    const response = await axios.post(
      `${ngrokUrl}/webhook/sendpulse`,
      testPayload,
      { 
        timeout: 10000,
        validateStatus: () => true // Accept all status codes
      }
    );

    if (response.status === 200 || response.status === 500) {
      // 500 is expected if Bitrix24 credentials aren't configured
      log('✓ Sendpulse webhook endpoint is accessible', 'green');
      if (response.status === 500) {
        log('  Note: Got 500 error (expected if Bitrix24 not fully configured)\n', 'yellow');
      } else {
        log('  Response:', 'blue');
        log(`  ${JSON.stringify(response.data, null, 2)}\n`, 'blue');
      }
      passed++;
    } else {
      log(`✗ Unexpected response: ${response.status}\n`, 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Failed to access webhook endpoint: ${error.message}\n`, 'red');
    failed++;
  }

  // Summary
  log('='.repeat(50), 'blue');
  log('Test Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`Total Tests: ${passed + failed}`);
  log(`Passed: ${passed}`, passed === (passed + failed) ? 'green' : 'yellow');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log('');

  if (passed === (passed + failed)) {
    log('✓ All tests passed!', 'green');
    log('');
    log('Your ngrok setup is working correctly!', 'green');
    log('');
    log('Next steps:', 'blue');
    log('1. Configure this webhook URL in Sendpulse:', 'blue');
    log(`   ${ngrokUrl}/webhook/sendpulse`, 'yellow');
    log('2. Send a test message in your Sendpulse chatbot', 'blue');
    log('3. Check your server logs (terminal running npm start)', 'blue');
    log('4. Verify message appears in Bitrix24 Open Channel', 'blue');
    log('');
  } else {
    log('⚠ Some tests failed', 'yellow');
    log('');
    log('Troubleshooting:', 'blue');
    log('1. Is your server running? Run: npm start', 'yellow');
    log('2. Is ngrok running? Run: ngrok http 3000', 'yellow');
    log('3. Is the ngrok URL correct?', 'yellow');
    log('4. Check ngrok web interface: http://localhost:4040', 'yellow');
    log('');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testNgrokSetup().catch(error => {
  log(`\n✗ Test failed with error: ${error.message}`, 'red');
  process.exit(1);
});
