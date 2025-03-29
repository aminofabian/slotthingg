/**
 * Test Script for Simplified WebSocket API
 * 
 * This script tests the simplified WebSocket connection flow
 * that bypasses health checks and always reports the server as available.
 * 
 * To run this test:
 * 1. Open your browser console on a page with the Chat component
 * 2. Copy and paste this entire script
 * 3. Call window.runSimplifiedApiTest()
 */

// Create the test function in the global scope
window.runSimplifiedApiTest = async function() {
  console.log('Starting Simplified WebSocket API Test...');
  console.log('===========================================');
  
  const playerIdForTest = 'test_player';
  
  // Step 1: Test the API route directly
  console.log('\n1. Testing API route...');
  try {
    const apiResponse = await fetch(`/api/ws/chat?player_id=${playerIdForTest}`);
    if (!apiResponse.ok) {
      console.error(`API route error: ${apiResponse.status} ${apiResponse.statusText}`);
      console.log('API test failed - our route is not responding correctly');
    } else {
      const data = await apiResponse.json();
      console.log('API route response:', data);
      
      if (data.available && data.wsUrl) {
        console.log('✅ API test passed - route returns available=true and a wsUrl');
      } else {
        console.warn('⚠️ API test partial - route response is missing expected fields');
        console.log('Expected: { available: true, wsUrl: "..." }');
        console.log('Received:', data);
      }
    }
  } catch (error) {
    console.error('Error testing API route:', error);
    console.log('❌ API test failed - exception occurred');
  }
  
  // Step 2: Test WebSocket connection directly using the API-provided URL
  console.log('\n2. Testing WebSocket connection with API-provided URL...');
  try {
    // First get the URL from our API
    const apiResponse = await fetch(`/api/ws/chat?player_id=${playerIdForTest}`);
    const data = await apiResponse.json();
    
    if (!data.wsUrl) {
      console.error('API did not provide a WebSocket URL');
      console.log('❌ WebSocket test failed - cannot proceed without URL');
      return;
    }
    
    console.log(`Attempting to connect to: ${data.wsUrl}`);
    
    // Try to establish connection
    const ws = new WebSocket(data.wsUrl);
    
    // Set up event handlers
    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully!');
      
      // Send a test message
      try {
        ws.send(JSON.stringify({
          type: 'presence',
          status: 'online',
          user_id: 'test_user',
          player_id: playerIdForTest
        }));
        console.log('Sent presence message');
        
        // Close the connection after a short delay
        setTimeout(() => {
          ws.close();
          console.log('Test WebSocket connection closed');
        }, 2000);
      } catch (error) {
        console.error('Error sending test message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      console.log('❌ WebSocket test failed - connection error');
    };
    
    ws.onclose = (event) => {
      console.log(`WebSocket closed with code: ${event.code}`);
      if (event.code === 1000) {
        console.log('✅ WebSocket closed normally');
      } else {
        console.warn(`⚠️ WebSocket closed with code ${event.code}: ${event.reason || 'No reason provided'}`);
      }
      
      // Test complete
      console.log('\nSimplified API Test Complete!');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
      } catch (error) {
        console.log('Received non-JSON message:', event.data);
      }
    };
  } catch (error) {
    console.error('Error establishing WebSocket connection:', error);
    console.log('❌ WebSocket test failed - exception occurred');
  }
  
  console.log('\nTest initiated! Check console for results...');
};

// Log that the test is ready
console.log('Simplified WebSocket API Test Script loaded!');
console.log('Run the test by calling window.runSimplifiedApiTest()'); 