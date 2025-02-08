const adjectives = [
    'happy', 'brave', 'mighty', 'clever', 'swift',
    'bright', 'wild', 'epic', 'cool', 'awesome'
];

const nouns = [
    'panda', 'dragon', 'tiger', 'eagle', 'wolf',
    'phoenix', 'hawk', 'lion', 'bear', 'falcon'
];

export function generateRoomName(): string {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adjective}-${noun}-${number}`;
} 