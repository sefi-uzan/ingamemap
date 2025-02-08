import { io, Socket } from 'socket.io-client';
import { Room, UserSettings } from '../types';

class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;
    private currentRoom: Room | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect() {
        if (!this.socket) {
            this.socket = io('http://localhost:3001', {
                reconnectionDelayMax: 10000,
            });
            this.setupListeners();
        }
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.currentRoom = null;
        }
    }

    private setupListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error.message);
        });
    }

    public createRoom(userSettings: UserSettings): Promise<Room> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected to server'));
                return;
            }

            this.socket.emit('create_room', userSettings);

            this.socket.once('room_created', (room: Room) => {
                this.currentRoom = room;
                resolve(room);
            });
        });
    }

    public joinRoom(roomId: string, userSettings: UserSettings): Promise<Room> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected to server'));
                return;
            }

            this.socket.emit('join_room', { roomId, userSettings });

            this.socket.once('participant_joined', ({ room }: { room: Room }) => {
                this.currentRoom = room;
                resolve(room);
            });

            this.socket.once('error', (error: { message: string }) => {
                reject(new Error(error.message));
            });
        });
    }

    public leaveRoom(userSettings: UserSettings) {
        if (!this.socket || !this.currentRoom) return;

        this.socket.emit('leave_room', {
            roomId: this.currentRoom.id,
            userSettings
        });
        this.currentRoom = null;
    }

    public onParticipantJoined(callback: (data: { room: Room, participant: UserSettings }) => void) {
        this.socket?.on('participant_joined', callback);
    }

    public onParticipantLeft(callback: (data: { room: Room, participant: UserSettings }) => void) {
        this.socket?.on('participant_left', callback);
    }

    public onRoomClosed(callback: (roomId: string) => void) {
        this.socket?.on('room_closed', callback);
    }

    public updateCanvas(data: any) {
        if (!this.socket || !this.currentRoom) return;

        this.socket.emit('canvas_update', {
            roomId: this.currentRoom.id,
            data
        });
    }

    public onCanvasUpdate(callback: (data: any) => void) {
        this.socket?.on('canvas_update', callback);
    }

    public getCurrentRoom(): Room | null {
        return this.currentRoom;
    }
}

export const socketService = SocketService.getInstance(); 