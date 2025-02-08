import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { OWWindow } from "@overwolf/overwolf-api-ts";
import { UserSettingsForm } from '../components/UserSettings';
import { UserSettings } from '../types';
import { STORAGE_KEYS } from '../types';

declare const overwolf: any;

function Desktop() {
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

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
        // TODO: Implement room creation
    };

    const handleJoinRoom = () => {
        // TODO: Implement room joining
    };

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
            <div className="header">
                <h1>In-Game Map</h1>
            </div>

            <div className="content">
                {!userSettings ? (
                    <UserSettingsForm onSave={handleSettingsSave} />
                ) : (
                    <div className="room-section">
                        <UserSettingsForm onSave={handleSettingsSave} />
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default Desktop;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Desktop />
    </React.StrictMode>
); 