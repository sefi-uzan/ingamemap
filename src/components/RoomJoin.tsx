import React, { useState, useEffect } from 'react';
import { Room, UserSettings } from '../types';
import { socketService } from '../services/socket';

interface Props {
    userSettings: UserSettings;
    onRoomJoined: (room: Room) => void;
    onError: (error: string) => void;
}

export function RoomJoin({ userSettings, onRoomJoined, onError }: Props) {
    const [roomId, setRoomId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [room, setRoom] = useState<Room | null>(null);

    useEffect(() => {
        // Connect to socket when component mounts
        socketService.connect();

        // Set up room event listeners
        socketService.onParticipantJoined(({ room }) => {
            setRoom(room);
        });

        socketService.onParticipantLeft(({ room }) => {
            setRoom(room);
        });

        socketService.onRoomClosed((roomId) => {
            if (room?.id === roomId) {
                setRoom(null);
                onError('The room has been closed');
            }
        });

        return () => {
            // Clean up when component unmounts
            if (room) {
                socketService.leaveRoom(userSettings);
            }
            socketService.disconnect();
        };
    }, []);

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomId.trim()) {
            onError('Please enter a room ID');
            return;
        }

        try {
            setIsJoining(true);
            const joinedRoom = await socketService.joinRoom(roomId.trim(), userSettings);
            setRoom(joinedRoom);
            onRoomJoined(joinedRoom);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to join room');
        } finally {
            setIsJoining(false);
        }
    };

    if (room) {
        return (
            <div className="room-info">
                <h3>Room Joined!</h3>
                <div className="room-details">
                    <p>Room ID: <span className="room-id">{room.id}</span></p>
                </div>
                <div className="participants">
                    <h4>Participants:</h4>
                    <ul>
                        {room.participants.map((participant) => (
                            <li
                                key={participant.nickname}
                                style={{ color: participant.color }}
                            >
                                {participant.nickname}
                                {participant.nickname === userSettings.nickname && ' (You)'}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="room-join">
            <form onSubmit={handleJoinRoom}>
                <div className="form-group">
                    <label htmlFor="roomId">Room ID:</label>
                    <input
                        type="text"
                        id="roomId"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID"
                        disabled={isJoining}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="secondary-button"
                    disabled={isJoining}
                >
                    {isJoining ? 'Joining Room...' : 'Join Room'}
                </button>
            </form>
        </div>
    );
} 