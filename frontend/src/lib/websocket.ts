import { writable, type Writable } from 'svelte/store';
import type { ClientMessage, ServerMessage, GameStateData } from './types';

const WS_URL = 'ws://localhost:3000/ws';

export const connected: Writable<boolean> = writable(false);
export const gameState: Writable<GameStateData> = writable({
	players: [],
	currentDrawer: null,
	round: 0,
	scores: {}
});

type MessageHandler<T = unknown> = (data: T) => void;

class WebSocketManager {
	private ws: WebSocket | null = null;
	private messageHandlers: Map<string, MessageHandler> = new Map();

	connect(): void {
		this.ws = new WebSocket(WS_URL);

		this.ws.onopen = () => {
			console.log('Connected to server');
			connected.set(true);
		};

		this.ws.onmessage = (event: MessageEvent<string>) => {
			try {
				const message = JSON.parse(event.data) as ServerMessage;
				this.handleMessage(message);
			} catch (error) {
				console.error('Failed to parse message:', error);
			}
		};

		this.ws.onclose = () => {
			console.log('Disconnected from server');
			connected.set(false);
			// Auto-reconnect after 3 seconds
			setTimeout(() => this.connect(), 3000);
		};

		this.ws.onerror = (error: Event) => {
			console.error('WebSocket error:', error);
		};
	}

	private handleMessage(message: ServerMessage): void {
		const handler = this.messageHandlers.get(message.type);
		if (handler) {
			handler(message.data);
		}

		// Also update game state store if applicable
		if (message.type === 'GameState') {
			gameState.set(message.data);
		}
	}

	send(message: ClientMessage): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		} else {
			console.warn('WebSocket not connected');
		}
	}

	on<T = unknown>(messageType: string, handler: MessageHandler<T>): void {
		this.messageHandlers.set(messageType, handler as MessageHandler);
	}

	off(messageType: string): void {
		this.messageHandlers.delete(messageType);
	}

	disconnect(): void {
		this.ws?.close();
		this.ws = null;
	}
}

export const ws = new WebSocketManager();
