import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { OWWindow } from "@overwolf/overwolf-api-ts";
import { SharedCanvas } from '../components/SharedCanvas';
import { UserSettings, Room, STORAGE_KEYS } from '../types';
import { socketService } from '../services/socket';

declare const overwolf: any;

function InGame() {
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load saved settings and current room
        const savedSettings = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        const savedRoom = localStorage.getItem(STORAGE_KEYS.CURRENT_ROOM);

        if (savedSettings) {
            setUserSettings(JSON.parse(savedSettings));
        }

        if (savedRoom) {
            setCurrentRoom(JSON.parse(savedRoom));
        }

        // Connect to socket and set up room listeners
        socketService.connect();

        socketService.onParticipantJoined(({ room }) => {
            setCurrentRoom(room);
            localStorage.setItem(STORAGE_KEYS.CURRENT_ROOM, JSON.stringify(room));
        });

        socketService.onParticipantLeft(({ room }) => {
            setCurrentRoom(room);
            localStorage.setItem(STORAGE_KEYS.CURRENT_ROOM, JSON.stringify(room));
        });

        socketService.onRoomClosed((roomId) => {
            if (currentRoom?.id === roomId) {
                setCurrentRoom(null);
                localStorage.removeItem(STORAGE_KEYS.CURRENT_ROOM);
                setError('The room has been closed');
            }
        });

        // Set up storage event listener to detect changes from desktop window
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEYS.CURRENT_ROOM) {
                if (e.newValue) {
                    setCurrentRoom(JSON.parse(e.newValue));
                } else {
                    setCurrentRoom(null);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            if (currentRoom && userSettings) {
                socketService.leaveRoom(userSettings);
            }
            socketService.disconnect();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const onMinimizeClick = () => {
        const window = new OWWindow('in_game');
        window.minimize();
    };

    if (!userSettings) {
        return (
            <div className="in-game-window">
                <div className="window-controls">
                    <button onClick={onMinimizeClick}>_</button>
                </div>
                <div className="error-message">
                    Please set up your profile in the desktop window first.
                </div>
            </div>
        );
    }

    if (!currentRoom) {
        return (
            <div className="in-game-window">
                <div className="window-controls">
                    <button onClick={onMinimizeClick}>_</button>
                </div>
                <div className="error-message">
                    Please join a room in the desktop window first.
                </div>
            </div>
        );
    }

    return (
        <div className="in-game-window">
            <div className="window-controls">
                <button onClick={onMinimizeClick}>_</button>
            </div>

            <div className="room-header">
                <h2>Room: {currentRoom.id}</h2>
                <div className="participants">
                    {currentRoom.participants.map((participant) => (
                        <span
                            key={participant.nickname}
                            className="participant"
                            style={{ color: participant.color }}
                        >
                            {participant.nickname}
                            {participant.nickname === userSettings.nickname && ' (You)'}
                        </span>
                    ))}
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button className="close-error" onClick={() => setError(null)}>×</button>
                </div>
            )}

            <SharedCanvas userSettings={userSettings} />
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <InGame />
    </React.StrictMode>
); 