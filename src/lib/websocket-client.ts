export interface WebSocketClientConfig {
    url: string;
    onMessage: (data: unknown) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    /**
     * Called once when the reconnect budget is exhausted. The client then waits
     * for the network to come back (`online`) or the tab to be shown again,
     * and starts over with a fresh budget.
     */
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
    /**
     * Keep-alive: while the socket is open, `message` is sent every
     * `intervalMs`, and a socket that receives nothing at all (not even the
     * reply) for `timeoutMs` is treated as dead: dropped, `onClose`, reconnect.
     * The server must answer `message`, or a quiet stream would trip the timeout.
     */
    heartbeat?: { message: unknown; intervalMs: number; timeoutMs: number };
}

/**
 * Grace period before a `pauseWhenHidden` stream closes in a background tab:
 * a quick tab switch never reconnects.
 */
export const HIDDEN_TAB_PAUSE_MS = 60_000;

/**
 * Heartbeat for Hyperliquid's sockets (api and rpc, which answer
 * `{channel: "pong"}`) and our own `/ws` (which answers `{type: "heartbeat"}`).
 * Hyperliquid closes a connection after 60 s without a message for it, which
 * a quiet channel (an illiquid coin's trades) hits every minute (measured
 * 2026-09-28). The timeout leaves room for background tabs, where Chrome may
 * run timers only once a minute.
 */
export const PING_HEARTBEAT = {
    message: { method: 'ping' },
    intervalMs: 30_000,
    timeoutMs: 75_000,
} as const;

/** Stop a socket from reporting anything more (late close, message, error). */
function detach(ws: WebSocket): void {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
}

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
    /** Reconnect budget exhausted: waiting for `online` / a visible tab. */
    private failed = false;
    private watchingNetwork = false;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private lastMessageAt = 0;

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
        this.watchNetwork();
        // Paused while the tab is hidden: the visibility handler reconnects.
        if (this.paused) return;

        // Don't connect if already connected or connecting
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.isExplicitlyClosed = false;
        if (this.failed) {
            // Gave up earlier: a new connect() starts over with a fresh budget.
            this.failed = false;
            this.reconnectAttempts = 0;
        }
        this.clearReconnectTimeout();

        try {
            const ws = new WebSocket(this.config.url);
            this.ws = ws;

            ws.onopen = () => {
                this.log('Connected');
                this.reconnectAttempts = 0;
                this.lastMessageAt = Date.now();
                this.startHeartbeat();
                if (this.config.onOpen) this.config.onOpen();
            };

            ws.onmessage = (event) => {
                this.lastMessageAt = Date.now();
                try {
                    const data = JSON.parse(event.data);
                    this.config.onMessage(data);
                } catch (err) {
                    this.log('Error parsing message', err);
                }
            };

            ws.onerror = (event) => {
                this.log('Error', event);
                if (this.config.onError) this.config.onError(event);
            };

            ws.onclose = (event) => {
                this.log('Closed', event.code, event.reason);
                this.stopHeartbeat();
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
        this.failed = false;
        this.clearReconnectTimeout();
        this.stopHeartbeat();
        this.unwatchVisibility();
        this.unwatchNetwork();

        if (this.ws) {
            const ws = this.ws;
            this.ws = null;
            // Nothing reports after an explicit disconnect: a late close event
            // would otherwise mark the owner's next socket as disconnected.
            detach(ws);
            ws.close();
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
            // ±25 % jitter: sockets dropped together (a server restart, a
            // network blip) don't all come back on the same tick.
            const delay = Math.round(baseDelay * Math.pow(2, this.reconnectAttempts - 1) * (0.75 + Math.random() * 0.5));

            this.log(`Attempting reconnect ${this.reconnectAttempts}/${maxAttempts} in ${delay}ms`);

            this.reconnectTimeout = setTimeout(() => {
                this.reconnectTimeout = null;
                this.connect();
            }, delay);
        } else {
            this.log('Max reconnect attempts reached');
            this.failed = true;
            if (this.config.onReconnectFailed) this.config.onReconnectFailed();
        }
    }

    private startHeartbeat() {
        const heartbeat = this.config.heartbeat;
        if (!heartbeat) return;
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
            if (Date.now() - this.lastMessageAt > heartbeat.timeoutMs) {
                this.dropDeadSocket();
                return;
            }
            this.send(heartbeat.message);
        }, heartbeat.intervalMs);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * The socket looks open but nothing came back, not even the heartbeat
     * reply (a connection lost without a close event): replace it.
     */
    private dropDeadSocket() {
        this.log('No message within the heartbeat timeout, reconnecting');
        this.stopHeartbeat();
        if (this.ws) {
            const ws = this.ws;
            this.ws = null;
            detach(ws);
            ws.close();
        }
        if (this.config.onClose) this.config.onClose();
        this.handleReconnect();
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

    private watchNetwork() {
        if (this.watchingNetwork || typeof document === 'undefined') return;
        this.watchingNetwork = true;
        window.addEventListener('online', this.handleNetworkBack);
        document.addEventListener('visibilitychange', this.handleNetworkBack);
    }

    private unwatchNetwork() {
        if (this.watchingNetwork && typeof document !== 'undefined') {
            window.removeEventListener('online', this.handleNetworkBack);
            document.removeEventListener('visibilitychange', this.handleNetworkBack);
        }
        this.watchingNetwork = false;
    }

    /**
     * The network is back or the tab is shown again: a socket that gave up
     * starts over with a fresh budget, and one waiting out a backoff (on
     * `online`) retries now.
     */
    private handleNetworkBack = (event: Event) => {
        if (this.isExplicitlyClosed || this.paused || document.visibilityState === 'hidden') return;
        if (this.failed) {
            this.log('Network back, starting over');
            this.connect();
        } else if (event.type === 'online' && this.reconnectTimeout) {
            this.log('Network back, retrying now');
            this.clearReconnectTimeout();
            this.connect();
        }
    };

    private pause() {
        this.log('Pausing (tab hidden)');
        this.paused = true;
        this.clearReconnectTimeout();
        this.stopHeartbeat();
        if (this.ws) {
            const ws = this.ws;
            this.ws = null;
            // Silent close: detach the handlers so the old socket can't report
            // a late close (or reconnect) after the resumed one is open.
            detach(ws);
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
