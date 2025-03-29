/**
 * Test script for WebSocket 403 Authentication error handling
 * 
 * This script tests the chat application's ability to handle 403 Forbidden errors 
 * by checking server availability with invalid credentials and testing fallback mechanisms.
 * 
 * To run this test in your browser console:
 * 1. Navigate to your app
 * 2. Open the browser console
 * 3. Paste this entire script
 * 4. Call: window.runAuthErrorTest()
 */

async function testAuthenticationErrorHandling() {
  console.log('🧪 TESTING: WebSocket 403 Authentication Error Handling');
  console.log('-------------------------------------------------------');
  
  // Step 1: Check server availability with invalid auth
  console.log('STEP 1: Testing server availability check with invalid auth');
  
  // First, let's clear any existing token to simulate auth error
  console.log('Simulating missing auth by checking cookies...');
  let hasAuthCookies = false;
  
  // Check for existence of auth cookies
  if (document.cookie.includes('token') || document.cookie.includes('user_session')) {
    hasAuthCookies = true;
    console.log('Found authentication cookies in browser');
  } else {
    console.log('No authentication cookies found, proceeding with test');
  }
  
  try {
    const response = await fetch('/api/ws/chat?player_id=test_player');
    
    if (!response.ok) {
      console.error(`❌ Server availability check failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Server availability response:', data);
      
      // Check if we got a 403 response
      if (data.status === 403) {
        console.log('✅ Correctly detected 403 Forbidden error');
      } else if (!data.isAvailable) {
        console.log('Server reported as unavailable:', data);
      } else {
        console.log('⚠️ Server available - no authentication error detected. Test may not be valid.');
      }
    }
  } catch (error) {
    console.error('❌ Server availability check threw an exception:', error);
  }
  
  // Step 2: Try direct WebSocket connection with invalid auth
  console.log('\nSTEP 2: Testing direct WebSocket connection with invalid auth');
  
  try {
    // First try connecting through our API
    const wsUrl = `wss://${window.location.host}/api/ws/chat?player_id=test_player`;
    console.log(`Attempting WebSocket connection to API proxy: ${wsUrl}`);
    
    const apiWs = new WebSocket(wsUrl);
    let apiWsSucceeded = false;
    
    // Set up timeout to abort the connection if it takes too long
    const apiTimeout = setTimeout(() => {
      if (!apiWsSucceeded) {
        console.log('API WebSocket connection timed out, which is expected for auth errors');
        
        // Now try direct connection to chat server
        testDirectConnection();
      }
    }, 5000);
    
    // Setup event handlers
    apiWs.onopen = () => {
      clearTimeout(apiTimeout);
      apiWsSucceeded = true;
      console.log('⚠️ API WebSocket connection unexpectedly succeeded, closing connection...');
      apiWs.close();
      
      // If the API connection succeeds, still try the direct connection
      testDirectConnection();
    };
    
    apiWs.onerror = (error) => {
      console.log('✅ API WebSocket connection error detected (expected with auth issues):', error);
    };
    
    apiWs.onclose = (event) => {
      clearTimeout(apiTimeout);
      console.log(`API WebSocket connection closed with code: ${event.code}`);
      if (!apiWsSucceeded) {
        console.log('API connection failed, proceeding to test direct connection');
        testDirectConnection();
      }
    };
  } catch (error) {
    console.error('❌ Error during API WebSocket connection attempt:', error);
    testDirectConnection();
  }
  
  function testDirectConnection() {
    try {
      const directWsUrl = 'wss://serverhub.biz/ws/cschat/Ptest_playerChat/?player_id=test_player';
      console.log(`Attempting direct WebSocket connection to: ${directWsUrl}`);
      
      const directWs = new WebSocket(directWsUrl);
      
      // Setup event handlers
      directWs.onopen = () => {
        console.log('⚠️ Direct WebSocket connection unexpectedly succeeded! Closing connection...');
        directWs.close();
      };
      
      directWs.onerror = (error) => {
        console.log('✅ Direct WebSocket connection error detected (expected in test):', error);
      };
      
      directWs.onclose = (event) => {
        console.log(`Direct WebSocket connection closed with code: ${event.code}`);
        console.log('Testing offline mode fallback...');
        
        // Test offline mode storage
        testOfflineMode();
      };
    } catch (error) {
      console.error('❌ Error during direct WebSocket connection attempt:', error);
      testOfflineMode();
    }
  }
  
  // Step 3: Test saving a message in offline mode
  function testOfflineMode() {
    console.log('\nSTEP 3: Testing message storage in offline mode');
    
    fetch('/api/ws/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: Date.now(),
        type: 'message',
        message: 'Test message during auth failure',
        sender: 'test_user',
        player_id: 'test_player',
        sent_time: new Date().toISOString()
      })
    })
    .then(response => {
      if (!response.ok) {
        console.error(`❌ Message storage failed with status: ${response.status}`);
        return response.text().then(text => {
          console.error('Error details:', text);
        });
      } else {
        return response.json().then(data => {
          console.log('✅ Message storage response:', data);
        });
      }
    })
    .catch(error => {
      console.error('❌ Message storage threw an exception:', error);
    })
    .finally(() => {
      console.log('\n');
      console.log('-------------------------------------------------------');
      console.log('🏁 Testing completed!');
      console.log('Check above results to verify proper auth error handling');
      
      if (hasAuthCookies) {
        console.log('\n⚠️ NOTE: Authentication cookies were found in your browser.');
        console.log('This might affect test results if the app is actually authenticated.');
        console.log('For a more accurate test, try clearing cookies or using incognito mode.');
      }
    });
  }
}

// Make the function available globally for easy execution from the console
window.runAuthErrorTest = testAuthenticationErrorHandling;

// Inform user the script is ready
console.log('📋 WebSocket Authentication Error Test Script loaded');
console.log('Run the test by calling: window.runAuthErrorTest()'); 