import { OWGames, OWGameListener, OWWindow } from "@overwolf/overwolf-api-ts";

// Declare the overwolf types
declare var overwolf: any;

class BackgroundController {
    private static _instance: BackgroundController;
    private _windows: Record<string, OWWindow> = {};
    private _gameRunning: boolean = false;

    private constructor() {
        this._init();
    }

    public static instance() {
        if (!this._instance) {
            this._instance = new BackgroundController();
        }

        return this._instance;
    }

    private async _init() {
        this._windows.background = new OWWindow('background');
        this._windows.desktop = new OWWindow('desktop');
        this._windows.in_game = new OWWindow('in_game');

        // When a game starts running
        overwolf.games.onGameInfoUpdated.addListener(async (event: any) => {
            if (event.gameInfo.isRunning) {
                if (!this._gameRunning) {
                    this._gameRunning = true;
                    await this._windows.desktop.minimize();
                    await this._windows.in_game.restore();
                }
            } else {
                if (this._gameRunning) {
                    this._gameRunning = false;
                    await this._windows.in_game.minimize();
                    await this._windows.desktop.restore();
                }
            }
        });

        // Register hotkey
        overwolf.settings.hotkeys.onPressed.addListener(async (event: any) => {
            if (event.name === 'showhide') {
                const window = this._gameRunning ? this._windows.in_game : this._windows.desktop;
                const state = await window.getWindowState();
                if (state.success &&
                    (state.window_state === 'closed' || state.window_state === 'minimized')) {
                    window.restore();
                } else {
                    window.minimize();
                }
            }
        });

        // Start with desktop window
        this._windows.desktop.restore();
    }
}

BackgroundController.instance(); 