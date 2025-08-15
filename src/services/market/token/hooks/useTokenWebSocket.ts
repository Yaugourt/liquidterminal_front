import { useEffect } from 'react';
import { useTokenWebSocketStore } from '../websocket.service';
import { UseTokenWebSocketResult } from '../types';

/**
 * Custom hook to get real-time token data via WebSocket
 * @param coinId - The coin ID (e.g., "@107" for HYPE)
 */
export function useTokenWebSocket(coinId: string): UseTokenWebSocketResult {
  const { 
    currentPrice, 
    lastSide, 
    orderBook,
    trades,
    isConnected, 
    error, 
    connect,
    disconnect
  } = useTokenWebSocketStore();

  // Connect to WebSocket when component mounts or coinId changes
  useEffect(() => {
    if (coinId && coinId.trim() !== '') {
      // Add a small delay to prevent multiple rapid connections in development
      const timeoutId = setTimeout(() => {
        connect(coinId);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [coinId, connect]);

  // Cleanup: disconnect when component unmounts
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    price: currentPrice || null,
    lastSide,
    orderBook,
    trades,
    isLoading: !isConnected,
    error
  };
}
