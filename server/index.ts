import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { generateRoomName } from './utils';
import { Room, UserSettings } from '../src/types';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store rooms in memory
const rooms = new Map<string, Room>();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Create a new room
    socket.on('create_room', (userSettings: UserSettings) => {
        const roomName = generateRoomName();
        const room: Room = {
            id: roomName,
            name: roomName,
            participants: [userSettings]
        };

        rooms.set(roomName, room);
        socket.join(roomName);

        // Send room info back to creator
        socket.emit('room_created', room);
        console.log(`Room created: ${roomName}`);
    });

    // Join existing room
    socket.on('join_room', ({ roomId, userSettings }: { roomId: string, userSettings: UserSettings }) => {
        const room = rooms.get(roomId);

        if (room) {
            room.participants.push(userSettings);
            socket.join(roomId);

            // Notify everyone in the room about the new participant
            io.to(roomId).emit('participant_joined', { room, participant: userSettings });
            console.log(`User ${userSettings.nickname} joined room: ${roomId}`);
        } else {
            socket.emit('error', { message: 'Room not found' });
        }
    });

    // Leave room
    socket.on('leave_room', ({ roomId, userSettings }: { roomId: string, userSettings: UserSettings }) => {
        const room = rooms.get(roomId);

        if (room) {
            room.participants = room.participants.filter(p => p.nickname !== userSettings.nickname);
            socket.leave(roomId);

            if (room.participants.length === 0) {
                rooms.delete(roomId);
                io.emit('room_closed', roomId);
            } else {
                io.to(roomId).emit('participant_left', { room, participant: userSettings });
            }
        }
    });

    // Handle canvas updates
    socket.on('canvas_update', ({ roomId, data }: { roomId: string, data: any }) => {
        // Broadcast the canvas update to all other participants in the room
        socket.to(roomId).emit('canvas_update', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // TODO: Handle removing user from rooms they were in
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 