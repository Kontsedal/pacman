import {gameObjectsTypes} from './constants';
import Emptiness from './gameObjects/Emptiness';
import Wall from './gameObjects/Wall';
import Coin from './gameObjects/Coin';
import BigCoin from './gameObjects/BigCoin';
import Pacman from './players/Pacman';
import Events from './events';
import EventEmitter from './helpers/EventEmmiter';
import './helpers/KeyPressHandler';
import PathFinder from "./helpers/PathFinder";
import Blinky from "./players/ghosts/Blinky";
import Clyde from "./players/ghosts/Clyde";
import Inky from "./players/ghosts/Inky";
import Pinky from "./players/ghosts/Pinky";
import delegate from './helpers/delegate';
import {levels, selectors, blockSize, gameCells, scorePerObject, pacmanLives, scoreToAwardLife} from './settings'

/**
 * Our game entry point, contains render loop and layout operations
 */
class Game {
    constructor() {
        this.selectors = selectors;
        const canvasElement = document.querySelector(this.selectors.CANVAS);
        this.ctx = canvasElement.getContext('2d');

        //width and height of one game ceil in pixels
        this.blockSize = blockSize;

        //amount of game ceils
        this.gameCells = gameCells;

        // how much score points we can get for listed objects
        this.scorePerObject = scorePerObject;

        this.initEventListeners();
        this.initHtmlEventListeners();
    }

    /**
     * Start game with provided params
     *
     * @param {number} [lvl=1] - level from which game will be started
     * @param {number} [score=0] - game score with which game will be started
     * @param {number} [lives=pacmanLives] - pacman lives with which game will be started
     * @param {number} [awardedLives=0] - how much lives we already awarded to pacman for his score points
     */
    play(lvl = 1, score = 0, lives = pacmanLives, awardedLives = 0) {
        this.score = score;
        this.coinsLeft = 0;
        this.currentLvl = lvl;
        this.lives = lives;
        this.awardedLives = awardedLives;
        this.buildMap();
        this.pathFinder = new PathFinder({map: this.map});
        this.renderScence();
        this.createPacman();
        this.createGhosts();
        this.start();

        this.updateGameStatuses();
    }

    /**
     * Fires when pacman eats all coins on the lvl, shows start next lvl layout
     */
    win() {
        this.stop();
        this.showNextLvlView();
    }

    /**
     * Game render loop
     */
    renderLoop() {
        this.cleanCanvas();
        this.renderScence();
        this.renderPlayers();
        if (!this.stopped) {
            this.requestId = requestAnimationFrame(this.renderLoop.bind(this));
        } else {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }

    /**
     * Removes all objects from canvas
     */
    cleanCanvas() {
        this.ctx.clearRect(0, 0, 600, 600);
    }

    /**
     * Starts render loop
     */
    start() {
        setTimeout(() => {
            if (!this.requestId) {
                this.stopped = false;
                this.renderLoop();
            }
        }, 0);
    }

    /**
     * Stops render loop
     */
    stop() {
        if (this.requestId) {
            this.stopped = true;
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }

    /**
     * Renders non player objects(walls, coins etc)
     */
    renderScence() {
        this.map.map((row, rowIndex) => {
            row.map((gameObject, ceilIndex) => {
                if (!gameObject) {
                    return;
                }
                gameObject.render();
            })
        })
    }

    /**
     * Renders game players
     */
    renderPlayers() {
        this.renderGhosts();
        this.pacman.render();
    }

    /**
     * Renders ghosts
     */
    renderGhosts() {
        this.inky.render();
        this.blinky.render();
        this.pinky.render();
        this.clyde.render();
    }

    /**
     * Convert map array to array of game objects
     */
    buildMap() {
        this.map = [];
        let settings = this.getSettings();
        let worldMap = settings.map;
        worldMap.map((obj, index) => {
            let row = ~~(index / 27);
            this.map[row] = this.map[row] || [];
            let ceil = index;
            if (index >= this.gameCells) {
                ceil = index % this.gameCells;
            }
            let gameObject = this.createGameObject(obj, row, ceil);
            this.map[row].push(gameObject);
        });
    }

    /**
     * Factory for creating non player game objects (wall, coin etc)
     *
     * @param {string} objectType - type of game object
     * @param {number} row - position on y axis
     * @param {number} ceil - position on x axis
     * @returns {Emptiness|Wall|Coin|BigCoin}
     */
    createGameObject(objectType, row, ceil) {
        switch (objectType) {
            case gameObjectsTypes.EMPTINESS:
                return new Emptiness();
            case gameObjectsTypes.WALL:
                return new Wall({size: this.blockSize, row, ceil, ctx: this.ctx});
            case gameObjectsTypes.COIN:
                this.coinsLeft += 1;
                return new Coin({size: this.blockSize, row, ceil, ctx: this.ctx});
            case gameObjectsTypes.BIG_COIN:
                this.coinsLeft += 1;
                return new BigCoin({size: this.blockSize, row, ceil, ctx: this.ctx});
        }
    }

    /**
     * Creates new pacman depend of current lvl settings
     */
    createPacman() {
        let settings = this.getSettings();

        this.pacman = new Pacman({
            ctx: this.ctx,
            size: this.blockSize,
            map: this.map,
            x: settings.pacman.x,
            y: settings.pacman.y,
            speed: settings.pacman.speed,
            eatSpeed: settings.pacman.eatSpeed
        });
    }

    /**
     * Fires after pacman die animation ends after collision with ghost
     * If it was last pacman life, shows gameover layout, otherwise continue the game
     */
    onPacmanDie() {
        this.stop();
        this.lives--;
        if (this.lives < 0) {
            this.showGameOverView();
            return;
        }
        this.createPacman();
        this.createGhosts();

        this.updateGameStatuses();
        this.start();
    }

    /**
     * Gets provided lvl settings
     * @param {number} [lvl = this.currentLvl] - game level
     * @returns {*}
     */
    getSettings(lvl = this.currentLvl) {
        return levels[lvl] || levels.defaultLevel;
    }

    /**
     * Listens to global game events
     */
    initEventListeners() {
        EventEmitter.on(Events.EAT_COIN, ([x, y]) => {
            this.coinsLeft -= 1;
            this.score += this.scorePerObject[gameObjectsTypes.COIN];
            if (this.map[y][x]) {
                this.map[y][x] = new Emptiness();
            }
            this.updateGameStatuses();
            if (this.coinsLeft == 0) {
                this.win();
            }
        });

        EventEmitter.on(Events.EAT_BIG_COIN, ([x, y]) => {
            this.coinsLeft -= 1;
            this.score += this.scorePerObject[gameObjectsTypes.BIG_COIN];
            if (this.map[y][x]) {
                this.map[y][x] = new Emptiness();
            }
            this.updateGameStatuses();
            if (this.coinsLeft == 0) {
                this.win();
            }
        });

        EventEmitter.on(Events.EAT_GHOST, () => {
            this.score += this.scorePerObject.GHOST;
            this.updateGameStatuses();
        });

        EventEmitter.on(Events.PACMAN_DEAD, () => {
            this.onPacmanDie();
        })
    }

    /**
     * Creates new ghosts depend on current lvl
     */
    createGhosts() {
        let settings = this.getSettings();

        this.inky = new Inky({
            ctx: this.ctx,
            size: this.blockSize,
            map: this.map,
            findPath: this.pathFinder.findPath.bind(this.pathFinder),
            pacman: this.pacman,
            goToX: settings.inky.goToX,
            goToY: settings.inky.goToY,
            x: settings.inky.startX,
            y: settings.inky.startY,
            speed: settings.inky.speed,
            enabled: settings.inky.enabled,
            escapeTime: settings.escapeTime,
            findPacmanEverywhereInterval: settings.findPacmanEverywhereInterval
        });
        this.blinky = new Blinky({
            ctx: this.ctx,
            size: this.blockSize,
            map: this.map,
            findPath: this.pathFinder.findPath.bind(this.pathFinder),
            pacman: this.pacman,
            goToX: settings.blinky.goToX,
            goToY: settings.blinky.goToY,
            x: settings.blinky.startX,
            y: settings.blinky.startY,
            speed: settings.blinky.speed,
            enabled: settings.blinky.enabled,
            escapeTime: settings.escapeTime,
            dieTime: settings.dieTime,
            findPacmanEverywhereInterval: settings.findPacmanEverywhereInterval
        });
        this.pinky = new Pinky({
            ctx: this.ctx,
            size: this.blockSize,
            map: this.map,
            findPath: this.pathFinder.findPath.bind(this.pathFinder),
            pacman: this.pacman,
            goToX: settings.pinky.goToX,
            goToY: settings.pinky.goToY,
            x: settings.pinky.startX,
            y: settings.pinky.startY,
            speed: settings.pinky.speed,
            enabled: settings.pinky.enabled,
            escapeTime: settings.escapeTime,
            dieTime: settings.dieTime,
            findPacmanEverywhereInterval: settings.findPacmanEverywhereInterval
        });
        this.clyde = new Clyde({
            ctx: this.ctx,
            size: this.blockSize,
            map: this.map,
            findPath: this.pathFinder.findPath.bind(this.pathFinder),
            pacman: this.pacman,
            goToX: settings.clyde.goToX,
            goToY: settings.clyde.goToY,
            x: settings.clyde.startX,
            y: settings.clyde.startY,
            speed: settings.clyde.speed,
            enabled: settings.clyde.enabled,
            escapeTime: settings.escapeTime,
            dieTime: settings.dieTime,
            findPacmanEverywhereInterval: settings.findPacmanEverywhereInterval
        });
    }

    initHtmlEventListeners() {
        delegate('click', this.selectors.PLAY_BUTTON, () => {
            this.hidePlayView();
            this.hideGameOverView();
            this.play();
        });
        delegate('click', this.selectors.NEXT_LVL_BUTTON, () => {
            this.hideNextLvlView();
            this.play(this.currentLvl + 1, this.score, this.lives, this.awardedLives);
        });
    }

    hidePlayView() {
        document.querySelector(this.selectors.PLAY_VIEW).style.display = "none";
    }

    hideGameOverView() {
        document.querySelector(this.selectors.GAME_OVER_VIEW).style.display = "none";
    }

    showGameOverView() {
        document.querySelector(this.selectors.GAME_OVER_VIEW).style.display = "block";
    }

    showPlayView() {
        document.querySelector(this.selectors.PLAY_VIEW).style.display = "block";
    }

    updateGameStatuses() {
        if (this.score / ((this.awardedLives + 1) * scoreToAwardLife) >= 1) {
            this.lives++;
            this.awardedLives++;
        }

        document.querySelector(this.selectors.SCORE).innerText = this.score;
        document.querySelector(this.selectors.GAME_OVER_SCORE).innerText = this.score;
        document.querySelector(this.selectors.LIVES).innerText = this.lives;
        document.querySelector(this.selectors.LVL).innerText = this.currentLvl;
    }

    showNextLvlView() {
        let settings = this.getSettings(this.currentLvl + 1);
        document.querySelector(this.selectors.NEXT_LVL_VIEW).style.display = "block";
        document.querySelector(this.selectors.NEW_LVL_NUMBER).innerText = this.currentLvl + 1;
        document.querySelector(this.selectors.LVL_TITLE).innerText = settings.lvlTitle;
    }

    hideNextLvlView() {
        document.querySelector(this.selectors.NEXT_LVL_VIEW).style.display = "none";
    }
}

new Game();