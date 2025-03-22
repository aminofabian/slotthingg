import React, { useState } from 'react';
import { Button, Input, VStack, Text, Code, Box } from '@chakra-ui/react';

const WebSocketTester = () => {
  const [testMessage, setTestMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendTestMessage = () => {
    try {
      // Create a test WebSocket connection
      const ws = new WebSocket(`wss://serverhub.biz/ws/cschat/test`);
      
      ws.onopen = () => {
        ws.send(testMessage);
      };

      ws.onmessage = (event) => {
        setResponse(`Received: ${event.data}`);
      };

      ws.onerror = (event: Event) => {
        setResponse(`Error: Connection failed`);
      };

      ws.onclose = () => {
        setResponse(prev => `${prev}\nConnection closed`);
      };
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text>Test WebSocket Connection</Text>
      <Input
        value={testMessage}
        onChange={(e) => setTestMessage(e.target.value)}
        placeholder="Enter test message"
      />
      <Button onClick={sendTestMessage} colorScheme="blue">
        Send Test Message
      </Button>
      <Box>
        <Text>Response:</Text>
        <Code p={2} borderRadius="md" whiteSpace="pre-wrap">
          {response || 'No response yet'}
        </Code>
      </Box>
    </VStack>
  );
};

export default WebSocketTester; 