import React from 'react';
import ReactDOM from 'react-dom/client';
import { OWWindow } from "@overwolf/overwolf-api-ts";

function App() {
    const onMinimizeClick = () => {
        const window = new OWWindow('desktop');
        window.minimize();
    };

    const onCloseClick = () => {
        const window = new OWWindow('desktop');
        window.close();
    };

    return (
        <div className="desktop-window">
            <div className="window-controls">
                <button onClick={onMinimizeClick}>_</button>
                <button onClick={onCloseClick}>X</button>
            </div>
            <h1>Desktop Window</h1>
            <p>This is the desktop window of your Overwolf app.</p>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 