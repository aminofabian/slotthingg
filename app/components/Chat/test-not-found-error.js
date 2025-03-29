/**
 * WebSocket 404 Not Found Test Script
 * 
 * This script tests the chat system's handling of 404 Not Found responses.
 * Run this script in your browser console to verify that the app correctly handles when 
 * the WebSocket server endpoint cannot be found.
 * 
 * Usage:
 * 1. Open your browser console
 * 2. Execute window.runNotFoundErrorTest()
 */

// Store the original fetch function
const originalFetch = window.fetch;

// Function to run the test
window.runNotFoundErrorTest = async function() {
  console.log('🧪 STARTING 404 NOT FOUND TEST');
  console.log('This test will verify that the app correctly handles 404 Not Found responses');
  
  // Step 1: Mock the fetch function to simulate a 404 error for the server check
  window.fetch = async function(url, options) {
    if (url.includes('/api/ws/chat')) {
      console.log('🔍 Intercepted API call to check server availability');
      
      // Create a mock Response object with a 404 status
      return Promise.resolve({
        ok: false,
        status: 200, // Our API returns 200 with content indicating a 404 from the server
        json: () => Promise.resolve({
          available: false,
          error: 'Server endpoint not found (Mocked for testing)',
          status: 404,
          diagnostics: {
            serverStatus: 404,
            timestamp: new Date().toISOString()
          }
        })
      });
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, options);
  };
  
  // Create a test div to show results
  const testDiv = document.createElement('div');
  testDiv.style.position = 'fixed';
  testDiv.style.top = '10px';
  testDiv.style.right = '10px';
  testDiv.style.width = '300px';
  testDiv.style.padding = '15px';
  testDiv.style.backgroundColor = '#f0f0f0';
  testDiv.style.border = '1px solid #ccc';
  testDiv.style.borderRadius = '5px';
  testDiv.style.zIndex = '9999';
  testDiv.style.maxHeight = '80vh';
  testDiv.style.overflowY = 'auto';
  
  testDiv.innerHTML = `
    <h3 style="margin-top: 0">404 Error Test</h3>
    <div id="test-log" style="font-family: monospace; font-size: 12px;"></div>
    <button id="restore-fetch" style="margin-top: 10px; padding: 5px 10px;">Restore Normal Behavior</button>
  `;
  
  document.body.appendChild(testDiv);
  
  // Function to log messages to the test div
  const logToDiv = (message, isError = false) => {
    const logDiv = document.getElementById('test-log');
    if (logDiv) {
      const entry = document.createElement('div');
      entry.style.marginBottom = '5px';
      entry.style.color = isError ? 'red' : 'black';
      entry.textContent = message;
      logDiv.appendChild(entry);
      logDiv.scrollTop = logDiv.scrollHeight;
    }
  };
  
  // Add event listener to restore button
  document.getElementById('restore-fetch').addEventListener('click', () => {
    window.fetch = originalFetch;
    logToDiv('✅ Restored original fetch function');
    logToDiv('You can now refresh the page to reset everything');
  });
  
  // Log the start of the test
  logToDiv('🧪 404 NOT FOUND TEST STARTED');
  
  try {
    // Step 2: Trigger a connection attempt
    logToDiv('Triggering a WebSocket connection...');
    
    // Find the chat component and get its player ID
    // This assumes you have a chat component on the page
    const chatComponents = Array.from(document.querySelectorAll('[data-testid="chat-container"]'));
    
    if (chatComponents.length === 0) {
      logToDiv('⚠️ No chat component found. Try opening the chat first.', true);
      console.error('No chat component found');
      return;
    }
    
    // Get a sample player ID
    const playerId = window.__PLAYER_ID__ || '123';
    const userId = window.__USER_ID__ || playerId;
    
    logToDiv(`Using player ID: ${playerId}`);
    
    // Step 3: Try to manually check server availability
    logToDiv('Checking server availability...');
    
    try {
      // Use the socket.ts functions if they're available in the window scope
      if (window.__checkServerAvailability) {
        const available = await window.__checkServerAvailability(playerId);
        logToDiv(`Server availability: ${available ? 'AVAILABLE' : 'UNAVAILABLE'}`);
        
        if (!available) {
          logToDiv('✅ Server correctly reported as unavailable');
        } else {
          logToDiv('❌ Server incorrectly reported as available', true);
        }
      } else {
        // Fallback - make the request directly
        logToDiv('Using direct request to check server...');
        
        // This will be intercepted by our mock fetch
        const response = await fetch(`/api/ws/chat?player_id=${playerId}`);
        const data = await response.json();
        
        logToDiv(`API response status: ${data.status} - ${data.error || ''}`);
        
        if (data.status === 404) {
          logToDiv('✅ Server correctly indicated 404 Not Found');
        } else {
          logToDiv(`❌ Unexpected status: ${data.status}`, true);
        }
      }
    } catch (error) {
      logToDiv(`Error checking server: ${error.message}`, true);
    }
    
    // Step 4: Try to connect directly and verify it goes to mock mode
    logToDiv('Testing WebSocket connection and fallback...');
    
    // Wait for the system to detect the 404 and go to mock mode
    setTimeout(() => {
      try {
        // Check if we're in mock mode
        if (window.__isUsingMockWebSocket) {
          const mockMode = window.__isUsingMockWebSocket;
          logToDiv(`Mock WebSocket mode: ${mockMode ? 'ENABLED' : 'DISABLED'}`);
          
          if (mockMode) {
            logToDiv('✅ System correctly switched to mock mode for 404 error');
          } else {
            logToDiv('❌ System did not switch to mock mode', true);
          }
        } else {
          logToDiv('⚠️ Cannot check mock mode status - variable not exposed', true);
        }
        
        // Try to send a test message
        if (window.__sendChatMessage) {
          const testMessage = {
            id: Date.now(),
            type: 'message',
            message: '🧪 This is a test message during 404 error simulation',
            sender: userId,
            sent_time: new Date().toISOString()
          };
          
          const sendResult = window.__sendChatMessage(testMessage);
          
          if (sendResult) {
            logToDiv('✅ Message was handled (likely stored for later)');
          } else {
            logToDiv('⚠️ Message handling returned false', true);
          }
        } else {
          logToDiv('❌ sendChatMessage function not available', true);
        }
        
        // Final status
        logToDiv('');
        logToDiv('🏁 404 NOT FOUND TEST COMPLETED');
        logToDiv('Check the console for additional logs');
        logToDiv('Click "Restore Normal Behavior" when done');
      } catch (error) {
        logToDiv(`Error in connection test: ${error.message}`, true);
      }
    }, 2000);
    
  } catch (error) {
    console.error('Error running 404 Not Found test:', error);
    logToDiv(`❌ Test failed: ${error.message}`, true);
  }
  
  console.log('🧪 404 NOT FOUND TEST INITIATED. Check the test panel in the upper right corner.');
}; 