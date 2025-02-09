import React, { useState, useEffect } from 'react';
import { Room, UserSettings } from '../types';
import { socketService } from '../services/socket';

interface Props {
    userSettings: UserSettings;
    onRoomJoined: (room: Room) => void;
    onError: (error: string) => void;
}

export function RoomCreation({ userSettings, onRoomJoined, onError }: Props) {
    const [isCreating, setIsCreating] = useState(false);
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

    const handleCreateRoom = async () => {
        try {
            setIsCreating(true);
            const newRoom = await socketService.createRoom(userSettings);
            setRoom(newRoom);
            onRoomJoined(newRoom);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to create room');
        } finally {
            setIsCreating(false);
        }
    };

    if (room) {
        return (
            <div className="room-info">
                <h3>Room Created!</h3>
                <div className="room-details">
                    <p>Room ID: <span className="room-id">{room.id}</span></p>
                    <button
                        className="copy-button"
                        onClick={() => navigator.clipboard.writeText(room.id)}
                    >
                        Copy Room ID
                    </button>
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
        <div className="room-creation">
            <button
                className="primary-button"
                onClick={handleCreateRoom}
                disabled={isCreating}
            >
                {isCreating ? 'Creating Room...' : 'Create New Room'}
            </button>
        </div>
    );
} 