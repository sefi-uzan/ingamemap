import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { STORAGE_KEYS } from '../types';

interface Props {
    onSave: (settings: UserSettings) => void;
}

const defaultColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FF8800', '#8800FF'
];

export function UserSettingsForm({ onSave }: Props) {
    const [nickname, setNickname] = useState('');
    const [color, setColor] = useState(defaultColors[0]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load saved settings
        const savedSettings = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
        if (savedSettings) {
            const settings: UserSettings = JSON.parse(savedSettings);
            setNickname(settings.nickname);
            setColor(settings.color);
            setSaved(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const settings: UserSettings = { nickname, color };
        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
        onSave(settings);
        setSaved(true);
    };

    return (
        <div className="settings-form">
            <h2>{saved ? 'Your Settings' : 'Welcome! Set Up Your Profile'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nickname">Nickname:</label>
                    <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                        minLength={3}
                        maxLength={15}
                        placeholder="Enter your nickname"
                    />
                </div>
                <div className="form-group">
                    <label>Color:</label>
                    <div className="color-picker">
                        {defaultColors.map((c) => (
                            <button
                                key={c}
                                type="button"
                                className={`color-option ${c === color ? 'selected' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>
                <button type="submit" className="save-button">
                    {saved ? 'Update Settings' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
} 