import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { OWWindow } from "@overwolf/overwolf-api-ts";
import { UserSettingsForm } from '../components/UserSettings';
import { RoomCreation } from '../components/RoomCreation';
import { RoomJoin } from '../components/RoomJoin';
import { Room, UserSettings } from '../types';
import { STORAGE_KEYS } from '../types';

declare const overwolf: any;

type RoomMode = 'none' | 'create' | 'join';

function Desktop() {
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const [roomMode, setRoomMode] = useState<RoomMode>('none');
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load saved settings on mount
        const savedSettings = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        if (savedSettings) {
            setUserSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSettingsSave = (settings: UserSettings) => {
        setUserSettings(settings);
    };

    const handleCreateRoom = () => {
        setRoomMode('create');
        setError(null);
    };

    const handleJoinRoom = () => {
        setRoomMode('join');
        setError(null);
    };

    const handleRoomJoined = (room: Room) => {
        setCurrentRoom(room);
        // Store room information in localStorage
        localStorage.setItem(STORAGE_KEYS.CURRENT_ROOM, JSON.stringify(room));
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleBackToMenu = () => {
        setRoomMode('none');
        setCurrentRoom(null);
        // Clear room information from localStorage
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ROOM);
        setError(null);
    };

    // Update room information when participants change
    useEffect(() => {
        if (currentRoom) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_ROOM, JSON.stringify(currentRoom));
        }
    }, [currentRoom]);

    const onMinimizeClick = () => {
        const window = new OWWindow('desktop');
        window.minimize();
    };

    const onCloseClick = () => {
        const window = new OWWindow('desktop');
        window.close();
    };

    return (
        <div className="desktop-container">
            <div className="window-controls">
                <button onClick={onMinimizeClick}>_</button>
                <button onClick={onCloseClick}>X</button>
            </div>

            <div className="header">
                <h1>In-Game Map</h1>
            </div>

            <div className="content">
                {error && (
                    <div className="error-message">
                        {error}
                        <button className="close-error" onClick={() => setError(null)}>×</button>
                    </div>
                )}

                {!userSettings ? (
                    <UserSettingsForm onSave={handleSettingsSave} />
                ) : (
                    <div className="room-section">
                        <UserSettingsForm onSave={handleSettingsSave} />

                        {roomMode === 'none' && !currentRoom && (
                            <div className="room-actions">
                                <h2>Join or Create a Room</h2>
                                <div className="button-group">
                                    <button onClick={handleCreateRoom} className="primary-button">
                                        Create New Room
                                    </button>
                                    <button onClick={handleJoinRoom} className="secondary-button">
                                        Join Existing Room
                                    </button>
                                </div>
                            </div>
                        )}

                        {roomMode === 'create' && !currentRoom && (
                            <div className="room-actions">
                                <h2>Create a Room</h2>
                                <RoomCreation
                                    userSettings={userSettings}
                                    onRoomJoined={handleRoomJoined}
                                    onError={handleError}
                                />
                                <button onClick={handleBackToMenu} className="back-button">
                                    Back to Menu
                                </button>
                            </div>
                        )}

                        {roomMode === 'join' && !currentRoom && (
                            <div className="room-actions">
                                <h2>Join a Room</h2>
                                <RoomJoin
                                    userSettings={userSettings}
                                    onRoomJoined={handleRoomJoined}
                                    onError={handleError}
                                />
                                <button onClick={handleBackToMenu} className="back-button">
                                    Back to Menu
                                </button>
                            </div>
                        )}

                        {currentRoom && (
                            <div className="room-actions">
                                <h2>Current Room</h2>
                                <div className="room-info">
                                    <p>Room ID: <span className="room-id">{currentRoom.id}</span></p>
                                    <div className="participants">
                                        <h4>Participants:</h4>
                                        <ul>
                                            {currentRoom.participants.map((participant) => (
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
                                <button onClick={handleBackToMenu} className="back-button">
                                    Leave Room
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Desktop />
    </React.StrictMode>
); 