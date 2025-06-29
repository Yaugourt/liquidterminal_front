interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-xs font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
        {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
      </span>
    </div>
  );
} 