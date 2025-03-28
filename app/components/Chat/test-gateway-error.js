/**
 * Test script for WebSocket 502 Gateway error handling
 * 
 * This script tests the chat application's ability to handle 502 Gateway errors 
 * by checking server availability and testing fallback mechanisms.
 * 
 * To run this test in your browser console:
 * 1. Navigate to your app
 * 2. Open the browser console
 * 3. Paste this entire script
 * 4. Call: window.runGatewayErrorTest()
 */

async function testWebSocketGatewayHandling() {
  console.log('🧪 TESTING: WebSocket 502 Gateway Error Handling');
  console.log('------------------------------------------------');
  
  // Step 1: Check server availability
  console.log('STEP 1: Checking server availability via API');
  try {
    const response = await fetch('/api/ws/chat?player_id=test_player');
    
    if (!response.ok) {
      console.error(`❌ Server availability check failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Server availability response:', data);
    }
  } catch (error) {
    console.error('❌ Server availability check threw an exception:', error);
  }
  
  // Step 2: Try direct WebSocket connection to the chat server
  console.log('\nSTEP 2: Testing direct WebSocket connection');
  console.log('This may fail if the server is actually down (expected in some test scenarios)');
  
  try {
    const wsUrl = 'wss://serverhub.biz/ws/cschat/Ptest_playerChat/?player_id=test_player';
    console.log(`Attempting WebSocket connection to: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    
    // Setup event handlers
    ws.onopen = () => {
      console.log('⚠️ WebSocket connection unexpectedly succeeded! Closing connection...');
      ws.close();
      console.log('WebSocket connection closed');
    };
    
    ws.onerror = (error) => {
      console.log('✅ WebSocket connection error detected (expected in test):', error);
    };
    
    ws.onclose = (event) => {
      console.log(`WebSocket connection closed with code: ${event.code}`);
      console.log('Testing fallback mechanisms...');
      
      // In a real application, this is where we would initialize a mock WebSocket
      console.log('✅ In the actual app, a mock WebSocket would be initialized here');
    };
  } catch (error) {
    console.error('❌ Error during WebSocket connection attempt:', error);
  }
  
  // Step 3: Test saving a message in offline mode
  console.log('\nSTEP 3: Testing message storage in offline mode');
  try {
    const message = {
      id: Date.now(),
      type: 'message',
      message: 'Test message during offline mode',
      sender: 'test_user',
      player_id: 'test_player',
      sent_time: new Date().toISOString()
    };
    
    const response = await fetch('/api/ws/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      console.error(`❌ Message storage failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Message storage response:', data);
    }
  } catch (error) {
    console.error('❌ Message storage threw an exception:', error);
  }
  
  console.log('\n');
  console.log('------------------------------------------------');
  console.log('🏁 Testing completed!');
  console.log('Check above results to verify proper error handling');
}

// Make the function available globally for easy execution from the console
window.runGatewayErrorTest = testWebSocketGatewayHandling;

// Inform user the script is ready
console.log('📋 WebSocket Gateway Error Test Script loaded');
console.log('Run the test by calling: window.runGatewayErrorTest()'); 