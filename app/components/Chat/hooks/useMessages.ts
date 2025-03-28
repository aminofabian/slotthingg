import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMessageData } from '../components';
import { sharedMessageTracker } from '@/app/lib/socket';

interface UseMessagesProps {
  userId: string;
  userName: string;
  selectedAdmin: string;
}

export const useMessages = ({ userId, userName, selectedAdmin }: UseMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  // Create refs for tracking messages
  const localSentMessageIds = useRef<Set<string>>(new Set());
  const recentIncomingMessages = useRef<Map<string, number>>(new Map());

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      
      console.log('Fetching chat history with params:', {
        whitelabel_admin_uuid,
        userId,
        userName
      });
      
      try {
        const response = await fetch(
          `/api/chat/history?whitelabel_admin_uuid=${whitelabel_admin_uuid}&limit=1000`, 
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Chat history response:', data);

          if (Array.isArray(data.results)) {
            // Create a Map to track unique messages by ID and content
            const uniqueMessages = new Map();
            
            // Process each message and only keep the latest version
            data.results.forEach((msg: ChatMessageData) => {
              const messageId = typeof msg.id === 'string' ? parseInt(msg.id) : msg.id;
              const messageKey = `${messageId}`;
              
              // Only add if we haven't seen this message before
              if (!uniqueMessages.has(messageKey)) {
                uniqueMessages.set(messageKey, {
                  ...msg,
                  id: messageId,
                  sender: typeof msg.sender === 'string' ? parseInt(msg.sender) : msg.sender,
                  sent_time: msg.sent_time || new Date().toISOString(),
                  is_file: msg.is_file || false,
                  is_tip: msg.is_tip || false,
                  is_comment: msg.is_comment || false,
                  status: msg.status || 'delivered',
                  attachments: msg.attachments || [],
                  recipient_id: msg.recipient_id ? String(msg.recipient_id) : undefined,
                });
              }
            });

            // Convert Map back to array and sort by timestamp
            const processedMessages = Array.from(uniqueMessages.values()).sort((a, b) => 
              new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
            );

            console.log(`Loaded ${processedMessages.length} unique messages`);
            
            // Store the current time as the last message update time in localStorage
            localStorage.setItem('last_message_time', Date.now().toString());
            
            // Merge with existing messages to avoid UI flicker, only adding new ones
            setMessages(prevMessages => {
              // Create a map of existing messages by ID for quick lookup
              const existingMessageMap = new Map();
              prevMessages.forEach(msg => {
                existingMessageMap.set(`${msg.id}`, msg);
              });
              
              // Build a new array with all uniquified messages
              const mergedMessages = [...prevMessages];
              let addedCount = 0;
              
              processedMessages.forEach(msg => {
                const msgKey = `${msg.id}`;
                
                // Only add if we don't have this exact ID already
                if (!existingMessageMap.has(msgKey)) {
                  // For content messages, check for near-duplicates with slightly different IDs
                  let isDuplicate = false;
                  if (msg.message) {
                    // Look for very similar existing messages
                    isDuplicate = prevMessages.some(existingMsg => 
                      existingMsg.message === msg.message && 
                      existingMsg.sender === msg.sender &&
                      Math.abs(new Date(existingMsg.sent_time).getTime() - new Date(msg.sent_time).getTime()) < 5000
                    );
                  }
                  
                  if (!isDuplicate) {
                    mergedMessages.push(msg);
                    addedCount++;
                    
                    // Track this ID to avoid duplicate processing
                    existingMessageMap.set(msgKey, msg);
                    
                    // Add to sentMessageIds to prevent duplicate processing from WebSocket
                    // but only add to the component's set, not the shared tracker
                    setSentMessageIds(prev => new Set(prev).add(msgKey));
                  }
                }
              });
              
              console.log(`Added ${addedCount} new messages from history`);
              
              // Sort by timestamp
              return mergedMessages.sort((a, b) => 
                new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
              );
            });
          } else {
            console.warn('Invalid chat history format:', data);
            setMessages([]);
          }
        } else {
          console.warn('Chat history response error:', {
            status: response.status,
            statusText: response.statusText
          });
          setMessages([]);
        }
      } catch (error) {
        console.warn('Chat history endpoint error:', error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userName]);

  // Handle message reception from WebSocket
  const handleMessageReceived = useCallback((data: any) => {
    // Check if this is a real-time message from the WebSocket (not from history)
    const isRealTimeMessage = data.is_realtime === true;
    
    // Determine if this is a player-sent message early in the process
    const isPlayerSender = data.is_player_sender === true || 
                           data.sender_id === userId || 
                           data.sender === userId;
    
    // If it's a player message, we already have it in the UI
    if (isRealTimeMessage && isPlayerSender) {
      console.log('[OUTGOING] Player message received from server, ignoring to prevent duplicates');
      return;
    }
    
    // Quick check for message echoes - immediately discard them
    if (data._isEcho === true) {
      console.log('[ECHO] Server confirmed this is an echo of our own message, ignoring');
      return;
    }
    
    if (isRealTimeMessage) {
      console.log('%c[REALTIME] Received real-time message', 'background: #ff00ff; color: white', {
        message: data.message?.substring(0, 20) + (data.message?.length > 20 ? '...' : ''),
        sender: data.sender_name || 'Unknown'
      });
    } else {
      console.log('[HISTORY] Processing history message');
    }
    
    try {
      // Generate a message ID if one isn't provided
      const messageId = data.id ? 
        (typeof data.id === 'string' ? parseInt(data.id) : data.id) :
        Date.now() + Math.floor(Math.random() * 1000);
      
      // SPECIAL CHECK FOR INCOMING MESSAGES: If not from player and has content, check for duplicates
      if (!isPlayerSender && data.message) {
        // Create a normalized content hash without timestamp
        const senderKey = `${data.sender || data.sender_id || '0'}`; 
        const normalizedContent = `${senderKey}-${data.message.trim()}`;
        
        // Check if we've seen this content recently
        const now = Date.now();
        const lastSeen = recentIncomingMessages.current.get(normalizedContent);
        
        if (lastSeen && (now - lastSeen < 120000)) { // 2 minute window for duplicates
          console.log('[INCOMING] Duplicate message content detected within 2 minutes, ignoring:', data.message.substring(0, 30));
          return;
        }
        
        // Track this message content
        recentIncomingMessages.current.set(normalizedContent, now);
        
        // Cleanup old messages to prevent memory leaks (keep only last 100)
        if (recentIncomingMessages.current.size > 100) {
          const oldestKeys = Array.from(recentIncomingMessages.current.entries())
            .sort((a, b) => a[1] - b[1])
            .slice(0, recentIncomingMessages.current.size - 100)
            .map(entry => entry[0]);
            
          oldestKeys.forEach(key => recentIncomingMessages.current.delete(key));
        }
      }
      
      // Create a unique key for this message to check for duplicates
      const messageKey = `${messageId}`;
      
      // Check if we have this exact message ID in our localSentMessageIds
      if (localSentMessageIds.current.has(messageKey)) {
        console.log('[REALTIME] Message was sent by us locally, ignoring echo:', messageKey);
        return;
      }
      
      const contentKey = data._contentFingerprint || `${data.sender || data.sender_id}-${data.message}-${data.sent_time}`;
      
      // Skip if we've already processed this exact message ID in our component
      if (!isRealTimeMessage && sentMessageIds.has(messageKey)) {
        console.log('[HISTORY] Already processed this message ID, skipping');
        return;
      }
      
      // Even for real-time messages, avoid exact duplicates by ID
      if (isRealTimeMessage && sentMessageIds.has(messageKey)) {
        console.log('[REALTIME] Already processed exact message ID, skipping');
        return;
      }

      // More aggressive checking for outgoing messages that come back from server
      if (isRealTimeMessage && sharedMessageTracker.has(messageKey)) {
        console.log('[REALTIME] Message ID exists in shared tracker, likely an echo of our own message, skipping');
        return;
      }
      
      // Check content fingerprint for real-time messages
      if (isRealTimeMessage && contentKey && sentMessageIds.has(contentKey)) {
        console.log('[REALTIME] Content fingerprint match, skipping duplicate message');
        return;
      }
      
      // Extra duplication check for ALL messages - check if we already have a recent message
      // with identical content, regardless of sender
      if (data.message) {
        // Use a longer window for checking duplicate incoming messages
        const timeWindow = isPlayerSender ? 5000 : 60000; // 5 seconds for player messages, 60 seconds for incoming
        
        const duplicateExists = messages.some(msg => 
          msg.message === data.message &&
          msg.sender === (data.sender || data.sender_id) &&
          Math.abs(new Date().getTime() - new Date(msg.sent_time).getTime()) < timeWindow
        );
        
        if (duplicateExists) {
          console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Found recent duplicate message content, skipping`);
          return;
        }
      }
      
      // Determine sender name with fallbacks
      let senderName = data.sender_name;
      if (!senderName || senderName === "Unknown") {
        if (isPlayerSender) {
          senderName = userName || 'You';
        } else {
          senderName = 'Support';
        }
      }
      
      // Create the message object with all possible fields
      const newMessage: ChatMessageData = {
        id: messageId,
        type: data.type || 'message',
        message: data.message || '',
        sender: typeof data.sender === 'string' ? parseInt(data.sender) : (data.sender || (data.sender_id ? parseInt(data.sender_id) : 0)),
        sender_name: senderName,
        sent_time: data.sent_time || new Date().toISOString(),
        is_file: Boolean(data.is_file),
        file: data.file || null,
        is_player_sender: isPlayerSender,
        is_tip: Boolean(data.is_tip),
        is_comment: Boolean(data.is_comment),
        status: 'delivered',
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        recipient_id: data.recipient_id ? parseInt(data.recipient_id) : undefined,
        is_admin_recipient: Boolean(data.is_admin_recipient)
      };

      // Add to sentMessageIds to prevent duplicate processing
      setSentMessageIds(prev => {
        const updated = new Set(prev);
        updated.add(messageKey);
        // Also track by content for real-time messages
        if (isRealTimeMessage && contentKey) {
          updated.add(contentKey);
        }
        return updated;
      });

      // Update messages - using functional update to avoid race conditions
      setMessages(prev => {
        // Check for exact duplicates by ID
        if (prev.some(msg => msg.id === messageId)) {
          console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Message with this ID already exists, skipping:`, messageId);
          return prev;
        }

        // Additional check for content duplicates, but less strict for real-time messages
        let isDuplicate = false;
        
        if (newMessage.message && !isRealTimeMessage) {
          // For history messages, be more strict about duplicates
          isDuplicate = prev.some(msg => 
            msg.message === newMessage.message && 
            msg.sender === newMessage.sender &&
            Math.abs(new Date(msg.sent_time).getTime() - new Date(newMessage.sent_time).getTime()) < 5000
          );
        } else if (newMessage.message && isRealTimeMessage) {
          // For real-time messages, only check for very recent exact duplicates
          isDuplicate = prev.some(msg => 
            msg.message === newMessage.message && 
            msg.sender === newMessage.sender &&
            Math.abs(new Date(msg.sent_time).getTime() - new Date(newMessage.sent_time).getTime()) < 1000 // Much smaller window
          );
        }
        
        if (isDuplicate) {
          console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Similar message exists, skipping`);
          return prev;
        }

        console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Adding message to state:`, newMessage.message);
        
        // Add new message and maintain chronological order
        const updatedMessages = [...prev, newMessage].sort((a, b) => 
          new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
        );
        
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error processing message:', error, data);
    }
  }, [messages, sentMessageIds, userId, userName]);

  // Function to retry sending a failed message
  const retryMessage = useCallback((messageId: number) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (!failedMessage) return;
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sent' as const } 
          : msg
      )
    );
    
    // Return the message to be retried by the parent component
    return failedMessage;
  }, [messages]);

  // Clean up message tracking periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      // Only keep the last 200 sent message IDs to prevent memory leaks
      if (localSentMessageIds.current.size > 200) {
        console.log('Cleaning up localSentMessageIds');
        const idsArray = Array.from(localSentMessageIds.current);
        const newSet = new Set(idsArray.slice(idsArray.length - 200));
        localSentMessageIds.current = newSet;
      }
      
      // Clean up recentIncomingMessages - remove messages older than 2 hours
      if (recentIncomingMessages.current.size > 0) {
        console.log('Cleaning up recentIncomingMessages');
        const now = Date.now();
        const twoHoursAgo = now - (2 * 60 * 60 * 1000);
        
        Array.from(recentIncomingMessages.current.entries())
          .filter(([_, timestamp]) => timestamp < twoHoursAgo)
          .forEach(([key, _]) => recentIncomingMessages.current.delete(key));
      }
    }, 300000); // Every 5 minutes
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Helper to add a sent message to tracking
  const trackSentMessage = useCallback((messageId: string | number, contentFingerprint: string) => {
    const messageKey = `${messageId}`;
    localSentMessageIds.current.add(messageKey);
    
    setSentMessageIds(prev => {
      const updated = new Set(prev);
      updated.add(messageKey);
      updated.add(contentFingerprint);
      return updated;
    });
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    fetchChatHistory,
    handleMessageReceived,
    retryMessage,
    trackSentMessage,
    sentMessageIds
  };
}; 