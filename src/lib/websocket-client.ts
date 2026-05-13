export interface WebSocketClientConfig {
    url: string;
    onMessage: (data: unknown) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    maxReconnectAttempts?: number;
    baseReconnectDelay?: number;
    debug?: boolean;
}

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private config: WebSocketClientConfig;
    private isExplicitlyClosed = false;

    constructor(config: WebSocketClientConfig) {
        this.config = {
            maxReconnectAttempts: 5,
            baseReconnectDelay: 2000,
            debug: false,
            ...config
        };
    }

    public connect() {
        if (typeof window === 'undefined') return;

        // Don't connect if already connected or connecting
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.isExplicitlyClosed = false;
        this.clearReconnectTimeout();

        try {
            this.ws = new WebSocket(this.config.url);

            this.ws.onopen = () => {
                this.log('Connected');
                this.reconnectAttempts = 0;
                if (this.config.onOpen) this.config.onOpen();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.config.onMessage(data);
                } catch (err) {
                    this.log('Error parsing message', err);
                }
            };

            this.ws.onerror = (event) => {
                this.log('Error', event);
                if (this.config.onError) this.config.onError(event);
            };

            this.ws.onclose = (event) => {
                this.log('Closed', event.code, event.reason);
                if (this.config.onClose) this.config.onClose();

                if (!this.isExplicitlyClosed) {
                    this.handleReconnect();
                }
            };

        } catch (err) {
            this.log('Connection failed', err);
            // If immediate failure, try reconnect
            this.handleReconnect();
        }
    }

    public disconnect() {
        this.isExplicitlyClosed = true;
        this.clearReconnectTimeout();

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public send(data: unknown) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            this.log('Cannot send message, WS not ready');
        }
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    private handleReconnect() {
        const maxAttempts = this.config.maxReconnectAttempts || 5;

        if (this.reconnectAttempts < maxAttempts) {
            this.reconnectAttempts++;
            const baseDelay = this.config.baseReconnectDelay || 2000;
            const delay = baseDelay * Math.pow(2, this.reconnectAttempts - 1);

            this.log(`Attempting reconnect ${this.reconnectAttempts}/${maxAttempts} in ${delay}ms`);

            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            this.log('Max reconnect attempts reached');
            // maybe notify error via config?
        }
    }

    private clearReconnectTimeout() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    private log(...args: unknown[]) {
        if (this.config.debug) {
            console.log(`[WebSocketClient ${this.config.url}]`, ...args);
        }
    }
}
