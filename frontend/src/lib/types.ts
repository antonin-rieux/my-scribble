export interface Point {
	x: number;
	y: number;
}

export interface DrawStroke {
	points: Point[];
	color: string;
	width: number;
}

export interface Player {
	id: string;
	name: string;
	score: number;
}

export interface GameStateData {
	players: Player[];
	currentDrawer: string | null;
	round: number;
	scores: Record<string, number>;
}

export interface DrawMessage {
	type: 'Draw';
	data: DrawStroke;
}

export interface ChatMessage {
	type: 'Chat';
	data: {
		text: string;
	};
}

export interface JoinRoomMessage {
	type: 'JoinRoom';
	data: {
		roomId: string;
		playerName: string;
	};
}

export type ClientMessage = DrawMessage | ChatMessage | JoinRoomMessage;

export interface DrawStrokeServerMessage {
	type: 'DrawStroke';
	data: DrawStroke;
}

export interface GameStateServerMessage {
	type: 'GameState';
	data: GameStateData;
}

export interface PlayerJoinedServerMessage {
	type: 'PlayerJoined';
	data: {
		id: string;
		name: string;
	};
}

export interface ErrorServerMessage {
	type: 'Error';
	data: {
		message: string;
	};
}

export type ServerMessage =
	| DrawStrokeServerMessage
	| GameStateServerMessage
	| PlayerJoinedServerMessage
	| ErrorServerMessage;
