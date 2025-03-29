/**
 * Test Script for Optimized WebSocket Implementation
 * 
 * This script tests the performance and reliability of the optimized WebSocket connection
 * that uses direct connection without unnecessary health checks.
 * 
 * To run this test:
 * 1. Open your browser console on a page with the Chat component
 * 2. Copy and paste this entire script
 * 3. Call window.testOptimizedWebSocket()
 */

window.testOptimizedWebSocket = async function() {
  console.log('Starting Optimized WebSocket Test...');
  console.log('=====================================');
  
  const metrics = {
    apiCallStart: 0,
    apiCallEnd: 0,
    socketConnectStart: 0,
    socketConnectEnd: 0,
    totalConnectTime: 0,
    apiResponseTime: 0,
    socketEstablishTime: 0,
    errors: [],
    messages: []
  };
  
  const playerIdForTest = 'test_player';
  
  // Helper function to log metrics
  const logMetrics = () => {
    console.log('\nConnection Metrics:');
    console.log(`API Response Time: ${metrics.apiResponseTime}ms`);
    console.log(`WebSocket Establish Time: ${metrics.socketEstablishTime}ms`);
    console.log(`Total Connection Time: ${metrics.totalConnectTime}ms`);
    
    if (metrics.errors.length > 0) {
      console.log('\nErrors:');
      metrics.errors.forEach((error, i) => console.log(`${i+1}. ${error}`));
    }
    
    console.log('\nMessages:');
    metrics.messages.forEach((msg, i) => console.log(`${i+1}. ${msg}`));
  };
  
  try {
    // Step 1: Get WebSocket URL from API (Simplified Route)
    metrics.apiCallStart = performance.now();
    metrics.messages.push('Fetching WebSocket URL from API...');
    
    try {
      const response = await fetch(`/api/ws/chat?player_id=${playerIdForTest}`);
      
      metrics.apiCallEnd = performance.now();
      metrics.apiResponseTime = Math.round(metrics.apiCallEnd - metrics.apiCallStart);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      metrics.messages.push(`API responded in ${metrics.apiResponseTime}ms with WebSocket URL`);
      
      // Step 2: Establish WebSocket Connection
      if (!data.wsUrl) {
        throw new Error('API did not provide a WebSocket URL');
      }
      
      metrics.messages.push(`Connecting to WebSocket: ${data.wsUrl}`);
      metrics.socketConnectStart = performance.now();
      
      // Create WebSocket and measure connection time
      const ws = new WebSocket(data.wsUrl);
      
      // Set up Promise to handle WebSocket events
      const connectPromise = new Promise((resolve, reject) => {
        // Connection success
        ws.onopen = (event) => {
          metrics.socketConnectEnd = performance.now();
          metrics.socketEstablishTime = Math.round(metrics.socketConnectEnd - metrics.socketConnectStart);
          metrics.totalConnectTime = Math.round(metrics.socketConnectEnd - metrics.apiCallStart);
          
          metrics.messages.push(`WebSocket connected in ${metrics.socketEstablishTime}ms`);
          metrics.messages.push(`Total connection process took ${metrics.totalConnectTime}ms`);
          
          // Send a test heartbeat message
          try {
            ws.send(JSON.stringify({
              type: 'ping',
              timestamp: Date.now(),
              player_id: playerIdForTest
            }));
            metrics.messages.push('Sent heartbeat message successfully');
          } catch (error) {
            metrics.errors.push(`Failed to send test message: ${error.message}`);
          }
          
          // Close the connection after a small delay
          setTimeout(() => {
            ws.close(1000, 'Test completed');
            resolve('Connection test completed successfully');
          }, 2000);
        };
        
        // Connection error
        ws.onerror = (error) => {
          metrics.errors.push('WebSocket connection error');
          reject(new Error('WebSocket connection failed'));
        };
        
        // Message received
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            metrics.messages.push(`Received message: ${JSON.stringify(message)}`);
          } catch (error) {
            metrics.messages.push(`Received non-JSON message: ${event.data}`);
          }
        };
        
        // Connection closed
        ws.onclose = (event) => {
          metrics.messages.push(`WebSocket closed with code ${event.code}: ${event.reason || 'No reason provided'}`);
          if (event.code !== 1000) {
            metrics.errors.push(`Abnormal closure: ${event.code}`);
            reject(new Error(`WebSocket closed abnormally with code ${event.code}`));
          }
        };
        
        // Set timeout to fail the test if connection takes too long
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            metrics.errors.push('Connection timed out after 10 seconds');
            reject(new Error('Connection timed out'));
          }
        }, 10000);
      });
      
      // Wait for connection to complete or fail
      await connectPromise;
      
    } catch (error) {
      metrics.errors.push(`Error: ${error.message}`);
      console.error('Test failed:', error);
    } finally {
      // Log all metrics
      logMetrics();
    }
    
  } catch (error) {
    console.error('Test failed with critical error:', error);
    metrics.errors.push(`Critical error: ${error.message}`);
    logMetrics();
  }
  
  console.log('\nTest Complete!');
};

// Log that the test is ready
console.log('Optimized WebSocket Test Script loaded!');
console.log('Run the test by calling window.testOptimizedWebSocket()'); 