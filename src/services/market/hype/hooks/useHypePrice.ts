import { useEffect } from 'react';
import { useHypePriceStore } from '../websocket.service';
import { UseHypePriceResult } from '../types';

/**
 * Custom hook to get the real-time HYPE token price
 */
export function useHypePrice(): UseHypePriceResult {
  const { 
    currentPrice, 
    lastSide, 
    isConnected, 
    error, 
    connect, 
    disconnect 
  } = useHypePriceStore();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Connect to WebSocket if not already connected
    if (!isConnected) {
      connect();
    }

    // Cleanup: disconnect WebSocket when component unmounts
    return () => {
      // We don't want to disconnect if other components are using the same WebSocket
      // Only disconnect if navigating away or unmounting the last component using it
      // For simplicity, we'll leave the connection open
      // disconnect();
    };
  }, [isConnected, connect]);

  return {
    price: currentPrice || null,
    lastSide,
    isLoading: !isConnected,
    error
  };
} 