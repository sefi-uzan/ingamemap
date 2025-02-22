export interface UserSettings {
    nickname: string;
    color: string;
}

export interface Room {
    id: string;
    name: string;
    participants: UserSettings[];
}

// Local storage keys
export const STORAGE_KEYS = {
    USER_SETTINGS: 'ingamemap_user_settings',
    CURRENT_ROOM: 'ingamemap_current_room'
} as const; 