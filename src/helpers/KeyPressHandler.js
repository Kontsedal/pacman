import EventEmitter from './EventEmmiter';

class KeyPressHandler {
    constructor(){
        document.addEventListener('keydown', (e) => {
            switch (e.which) {
                case 39:
                    return EventEmitter.emit(KeyPressHandler.events.PRESS_RIGHT);
                case 40:
                    return EventEmitter.emit(KeyPressHandler.events.PRESS_DOWN);
                case 37:
                    return EventEmitter.emit(KeyPressHandler.events.PRESS_LEFT);
                case 38:
                    return EventEmitter.emit(KeyPressHandler.events.PRESS_UP);
                    break;
            }
        });
    }
}
KeyPressHandler.events = {
    PRESS_RIGHT: "PRESS_RIGHT",
    PRESS_LEFT: "PRESS_LEFT",
    PRESS_UP: "PRESS_UP",
    PRESS_DOWN: "PRESS_DOWN"
};

export default new KeyPressHandler();

export const KeyPressEvents = KeyPressHandler.events;