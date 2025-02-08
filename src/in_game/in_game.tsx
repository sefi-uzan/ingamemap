import React from 'react';
import ReactDOM from 'react-dom/client';
import { OWWindow } from "@overwolf/overwolf-api-ts";

function App() {
    const onMinimizeClick = () => {
        const window = new OWWindow('in_game');
        window.minimize();
    };

    return (
        <div className="in-game-window">
            <div className="window-controls">
                <button onClick={onMinimizeClick}>_</button>
            </div>
            <h1>In-Game Window</h1>
            <p>This is the in-game window of your Overwolf app.</p>
            <p>Press Ctrl+F to show/hide this window.</p>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 