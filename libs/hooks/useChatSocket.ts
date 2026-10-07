import { useEffect, useState } from 'react';
import { REACT_APP_API_WS } from '../config';
import { getJwtToken } from '../auth';

/**
 * One WebSocket for the whole app, opened with the member's token.
 * Server events: { event: 'message' | 'read' | 'error' | 'info', data }
 */
export interface SocketEvent {
	event: string;
	data: any;
}

type Listener = (socketEvent: SocketEvent) => void;

let socket: WebSocket | null = null;
let socketToken = '';
let retry = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();
const statusListeners = new Set<(open: boolean) => void>();

const setStatus = (open: boolean) => statusListeners.forEach((fn) => fn(open));

const connect = () => {
	if (typeof window === 'undefined') return;
	const token = getJwtToken();
	if (!token) return;
	if (socket && socketToken === token && socket.readyState <= WebSocket.OPEN) return;

	socket?.close();
	socketToken = token;
	socket = new WebSocket(`${REACT_APP_API_WS}?token=${encodeURIComponent(token)}`);

	socket.onopen = () => {
		retry = 0;
		setStatus(true);
	};
	socket.onmessage = (msg) => {
		try {
			const parsed: SocketEvent = JSON.parse(msg.data);
			listeners.forEach((fn) => fn(parsed));
		} catch (err) {
			console.log('socket message parse error', err);
		}
	};
	socket.onclose = (event) => {
		setStatus(false);
		// 4001 = bad token, the member has to log in again
		if (event.code === 4001 || !getJwtToken()) return;
		retry = Math.min(retry + 1, 5);
		if (retryTimer) clearTimeout(retryTimer);
		retryTimer = setTimeout(connect, 1000 * 2 ** retry);
	};
};

export const sendSocketEvent = (event: string, data: any): boolean => {
	if (!socket || socket.readyState !== WebSocket.OPEN) return false;
	socket.send(JSON.stringify({ event, data }));
	return true;
};

export const isSocketOpen = () => !!socket && socket.readyState === WebSocket.OPEN;

// listen to socket events while the component is mounted
const useChatSocket = (listener?: Listener, enabled: boolean = true): boolean => {
	const [open, setOpen] = useState<boolean>(isSocketOpen());

	useEffect(() => {
		if (!enabled) return;
		connect();
		statusListeners.add(setOpen);
		if (listener) listeners.add(listener);
		return () => {
			statusListeners.delete(setOpen);
			if (listener) listeners.delete(listener);
		};
	}, [listener, enabled]);

	return open;
};

export default useChatSocket;
