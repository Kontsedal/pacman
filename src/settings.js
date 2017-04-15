import {gameObjectsTypes} from './constants';

export const selectors = {
    SCORE: ".js-score",
    PLAY_BUTTON: ".js-play",
    CANVAS: "#game",
    PLAY_VIEW: ".js-play-view",
    NEXT_LVL_VIEW: ".js-new-lvl-view",
    NEW_LVL_NUMBER: ".js-new-lvl",
    NEXT_LVL_BUTTON: ".js-next-lvl-btn",
    LVL_TITLE: ".js-lvl-title",
    LIVES: ".js-lives",
    LVL: ".js-lvl",
    GAME_OVER_VIEW: ".js-game-over-view",
    GAME_OVER_SCORE: ".js-gameover-score"
};

export const blockSize = 20;
export const gameRows  = 22;
export const gameCells = 27;
export const pacmanLives = 3;
export const scoreToAwardLife = 5000;

export const scorePerObject = {
    [gameObjectsTypes.COIN]: 10,
    [gameObjectsTypes.BIG_COIN]: 50,
    GHOST: 200
};

export const defaultMap = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,
    1,2,1,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,1,2,1,
    1,3,1,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,1,3,1,
    1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
    1,2,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,2,1,
    1,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,2,1,
    1,1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1,1,
    0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,
    1,1,1,1,1,1,2,1,0,1,1,1,0,0,0,1,1,1,0,1,2,1,1,1,1,1,1,
    0,0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0,0,
    1,1,1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,1,1,1,1,1,
    0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,
    1,1,1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,1,1,1,1,1,
    1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,
    1,2,1,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,1,2,1,
    1,3,2,2,2,1,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,1,2,2,2,3,1,
    1,1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1,1,
    1,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,2,1,
    1,2,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,2,1,
    1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
];
let defaultGhostSpeed = 0.105;

export let levels = {
    "1": {
        map: defaultMap,

        //how much time ghost will escape from pacman after eating of energizer
        escapeTime: 10000,

        //how much time ghost will be in die state
        dieTime: 5000,

        //interval of seeking pacman by ghosts on whole map
        findPacmanEverywhereInterval: 5000,
        lvlTitle: "It's only beginning",
        pacman: {
            speed: 0.15,
            eatSpeed: 0.1,
            x: 13,
            y: 16
        },
        inky: {
            enabled: true,
            startX: 11,
            startY: 10,

            //will go to that chords at begin of game
            goToX: 1,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        blinky: {
            enabled: true,
            startX: 12,
            startY: 10,
            goToX: 25,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        clyde: {
            enabled: false,
            startX: 14,
            startY: 10,
            goToX: 1,
            goToY: 20,
            speed: defaultGhostSpeed
        },
        pinky: {
            enabled: false,
            startX: 15,
            startY: 10,
            goToX: 25,
            goToY: 20,
            speed: defaultGhostSpeed
        }
    },
    "2": {
        map: defaultMap,
        escapeTime: 10000,
        dieTime: 5000,
        findPacmanEverywhereInterval: 5000,
        lvlTitle: "Clyde awakening",
        pacman: {
            speed: 0.15,
            eatSpeed: 0.1,
            x: 13,
            y: 16
        },
        inky: {
            enabled: true,
            startX: 11,
            startY: 10,
            goToX: 1,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        blinky: {
            enabled: true,
            startX: 12,
            startY: 10,
            goToX: 25,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        clyde: {
            enabled: true,
            startX: 14,
            startY: 10,
            goToX: 1,
            goToY: 20,
            speed: defaultGhostSpeed
        },
        pinky: {
            enabled: false,
            startX: 15,
            startY: 10,
            goToX: 25,
            goToY: 20,
            speed: defaultGhostSpeed
        }
    },
    "3": {
        map: defaultMap,
        escapeTime: 10000,
        dieTime: 5000,
        findPacmanEverywhereInterval: 5000,
        lvlTitle: "Pinky awakening",
        pacman: {
            speed: 0.15,
            eatSpeed: 0.1,
            x: 13,
            y: 16
        },
        inky: {
            enabled: true,
            startX: 11,
            startY: 10,
            goToX: 1,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        blinky: {
            enabled: true,
            startX: 12,
            startY: 10,
            goToX: 25,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        clyde: {
            enabled: true,
            startX: 14,
            startY: 10,
            goToX: 1,
            goToY: 20,
            speed: defaultGhostSpeed
        },
        pinky: {
            enabled: true,
            startX: 15,
            startY: 10,
            goToX: 25,
            goToY: 20,
            speed: defaultGhostSpeed
        }
    },
    "4": {
        map: defaultMap,
        escapeTime: 5000,
        dieTime: 2000,
        findPacmanEverywhereInterval: 1000,
        lvlTitle: "Pure hardcore",
        pacman: {
            speed: 0.14,
            eatSpeed: 0.09,
            x: 13,
            y: 16
        },
        inky: {
            enabled: true,
            startX: 11,
            startY: 10,
            goToX: 1,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        blinky: {
            enabled: true,
            startX: 12,
            startY: 10,
            goToX: 25,
            goToY: 1,
            speed: defaultGhostSpeed
        },
        clyde: {
            enabled: true,
            startX: 14,
            startY: 10,
            goToX: 1,
            goToY: 20,
            speed: defaultGhostSpeed
        },
        pinky: {
            enabled: true,
            startX: 15,
            startY: 10,
            goToX: 25,
            goToY: 20,
            speed: defaultGhostSpeed
        }
    }
};
levels.defaultLevel = levels["1"];
