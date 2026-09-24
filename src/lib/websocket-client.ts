export interface WebSocketClientConfig {
    url: string;
    onMessage: (data: unknown) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    /** Called once when the reconnect budget is exhausted (no further retries). */
    onReconnectFailed?: () => void;
    maxReconnectAttempts?: number;
    baseReconnectDelay?: number;
    debug?: boolean;
    /**
     * Close the socket once the tab has been hidden this long (ms) and reopen
     * it when the tab is visible again — `onOpen` runs again and re-subscribes.
     * The pause is silent (no `onClose`), so the UI doesn't flash "offline" on
     * return. Only for streams where nothing is lost: every message is a full
     * snapshot, or the store keeps a rolling window that refills in seconds.
     * A stream that accumulates history would get a gap.
     */
    pauseWhenHidden?: number;
}

/**
 * Grace period before a `pauseWhenHidden` stream closes in a background tab:
 * a quick tab switch never reconnects.
 */
export const HIDDEN_TAB_PAUSE_MS = 60_000;

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private config: WebSocketClientConfig;
    private isExplicitlyClosed = false;
    /** Closed because the tab is hidden (`pauseWhenHidden`); reopened on return. */
    private paused = false;
    private pauseTimeout: ReturnType<typeof setTimeout> | null = null;
    private watchingVisibility = false;

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

        this.watchVisibility();
        // Paused while the tab is hidden: the visibility handler reconnects.
        if (this.paused) return;

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

                if (!this.isExplicitlyClosed && !this.paused) {
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
        this.unwatchVisibility();

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
            if (this.config.onReconnectFailed) this.config.onReconnectFailed();
        }
    }

    private watchVisibility() {
        if (!this.config.pauseWhenHidden || this.watchingVisibility || typeof document === 'undefined') return;
        this.watchingVisibility = true;
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        // Created in a background tab: start the grace period right away.
        if (document.visibilityState === 'hidden') this.handleVisibilityChange();
    }

    private unwatchVisibility() {
        if (this.watchingVisibility && typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
        this.watchingVisibility = false;
        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
        }
        this.paused = false;
    }

    private handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            if (this.paused || this.pauseTimeout) return;
            this.pauseTimeout = setTimeout(() => {
                this.pauseTimeout = null;
                if (document.visibilityState === 'hidden' && !this.isExplicitlyClosed) {
                    this.pause();
                }
            }, this.config.pauseWhenHidden);
            return;
        }

        if (this.pauseTimeout) {
            clearTimeout(this.pauseTimeout);
            this.pauseTimeout = null;
        }
        if (this.paused) {
            this.paused = false;
            this.reconnectAttempts = 0;
            this.log('Resuming (tab visible)');
            this.connect();
        }
    };

    private pause() {
        this.log('Pausing (tab hidden)');
        this.paused = true;
        this.clearReconnectTimeout();
        if (this.ws) {
            const ws = this.ws;
            this.ws = null;
            // Silent close: detach the handlers so the old socket can't report
            // a late close (or reconnect) after the resumed one is open.
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;
            ws.close(1000, 'Tab hidden');
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
