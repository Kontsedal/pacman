import {moveDirections} from '../../constants';
import Player from '../Player';
import Events from  '../../events';
import EventEmitter from '../../helpers/EventEmmiter';

/**
 * Pseudo-class that represents all functionality of ghosts except going to pacman
 *
 * @param {object} ctx - canvas context. Required for drawing
 * @param {number} size - width and height of game ceil
 * @param {number} x - position on x axis
 * @param {number} y - position on y axis
 * @param {function} findPath - function for getting move instructions to reach provided place in shortest way
 * @param {number} speed - common ghost speed
 * @param {number} eatSpeed - pacman speed when he is eating
 * @param {Pacman} pacman - pacman instance
 * @param {number} goToX - x chord of place to where ghost must go in the beginning of the game
 * @param {number} goToY - y chord of place to where ghost must go in the beginning of the game
 * @param {boolean} enabled - is current ghost enabled
 * @param {number} escapeTime - how much time (ms) ghost will escape from pacman after eating of energizer
 * @param {number} dieTime - how much time (ms) ghost will be in dead state after pacman eats him
 * @param {number} findPacmanEverywhereInterval - interval (ms) in which ghost will detect pacman everywhere and
 *  go to him
 */
class Ghost extends Player {
    constructor({
        ctx, map, x, y, size, findPath, pacman, speed, goToX, goToY, enabled, escapeTime,
        dieTime, findPacmanEverywhereInterval
    }) {

        super(...arguments);

        this.startX = x;
        this.startY = y;
        this.size = size;
        this.ctx = ctx;
        this.ghostColor = "#7367ee";
        this.pacman = pacman;
        this.enabled = enabled;
        this.speed = speed;
        this.escapeTime = escapeTime;
        this.dieTime = dieTime;
        this.findPacmanEverywhereInterval = findPacmanEverywhereInterval;

        this.moveSides = {
            [moveDirections.LEFT]: false,
            [moveDirections.RIGHT]: false,
            [moveDirections.UP]: false,
            [moveDirections.DOWN]: false
        };

        this.behaviorTypes = {
            SEEK: "SEEK",
            FOLLOW: "FOLLOW",
            ESCAPE: "ESCAPE",
            DIE: "DIE"
        };

        this.behavior = this.behaviorTypes.SEEK;

        //current ghost move instructions
        this.moveSteps = [];
        this.moveDirection = null;

        //ceil in which ghost was at last move
        this.lastCeil = this.serializePosition(y, x);

        this.initEventHandlers();
        this.goTo({x: goToX, y: goToY});

        this.initFindEverywhere();
    }

    /**
     * Interval for detecting pacman everywhere and go to him
     */
    initFindEverywhere() {
        setInterval(() => {
            if (this.behavior == this.behaviorTypes.DIE || this.behavior == this.behaviorTypes.ESCAPE) {
                return;
            }
            this.goToPacman();
            this.finding = true;
            if (this.removeFindingTimeout) {
                clearTimeout(this.removeFindingTimeout);
                this.removeFindingTimeout = null;
            }
            this.removeFindingTimeout = setTimeout(() => {
                this.finding = false;
            }, 2000);

        }, this.findPacmanEverywhereInterval);
    }

    /**
     * Goes to provided chords
     *
     * @param {number} y
     * @param {number} x
     * @param {function} [callback] - will execute that callback after reach of provided point
     */
    goTo({y, x}, callback) {
        this.moveDirection = null;
        this.moveSteps = this.findPath({
            startX: this.xPos,
            startY: this.yPos,
            endX: x,
            endY: y
        });
        if (typeof callback == "function") {
            this.moveSteps.push(callback);
        }
    }

    /**
     * Looks to all visible direction to find pacman. Follows or escapes from him depends on current behaviour type
     */
    lookForPacman() {
        let [pacmanY, pacmanX] = this.pacman.getPosition();
        let [posY, posX] = this.getPosition();

        if (pacmanX == posX && pacmanY == posY) {
            return this.onCollisionWithPacman();
        }

        //if we have move instructions, we don't want to follow pacman
        if (this.moveSteps.length) {
            return;
        }

        let onSight = false;
        let pacmanSide = null;

        if (posX == pacmanX) {
            let iterator = posY;
            while (this.canGoHere({y: iterator, x: posX})) {
                if (iterator == pacmanY) {
                    onSight = true;
                    pacmanSide = moveDirections.DOWN;
                }
                iterator++;
            }
            iterator = posY;
            while (this.canGoHere({y: iterator, x: posX})) {
                if (iterator == pacmanY) {
                    onSight = true;
                    pacmanSide = moveDirections.UP;
                }
                iterator--;
            }
        }
        if (posY == pacmanY) {
            let iterator = posX;
            while (this.canGoHere({y: posY, x: iterator})) {
                if (iterator == pacmanX) {
                    onSight = true;
                    pacmanSide = moveDirections.RIGHT;
                }
                iterator++;
            }

            iterator = posX;
            while (this.canGoHere({y: posY, x: iterator})) {
                if (iterator == pacmanX) {
                    onSight = true;
                    pacmanSide = moveDirections.LEFT;
                }
                iterator--;
            }
        }
        if (onSight) {
            if (this.behavior == this.behaviorTypes.SEEK || this.behavior == this.behaviorTypes.FOLLOW) {
                this.goToPacman()
            } else if (this.behavior == this.behaviorTypes.ESCAPE) {
                this.escapeFromPacman({pacmanSide});
            }
        }
    }

    /**
     * Haunts pacman. Must be overrided by individual ghosts
     */
    goToPacman() {
        throw new Error("You must override goToPacman Ghost method!")
    }

    /**
     * Disallows to go to the pacman side
     *
     * @param {string} pacmanSide - from what side of ghost pacman now
     */
    escapeFromPacman({pacmanSide}) {
        this.moveSides[pacmanSide] = false;
        this.moveSteps = [];
    }

    /**
     * Fires when ghost meet pacman in same ceil. Depend on behaviour type or pacman or ghost will die
     */
    onCollisionWithPacman() {
        if (this.behavior === this.behaviorTypes.SEEK || this.behavior === this.behaviorTypes.FOLLOW) {
            EventEmitter.emit(Events.DIE_PACMAN);
        }
        if (this.behavior === this.behaviorTypes.ESCAPE) {
            EventEmitter.emit(Events.EAT_GHOST);
            this.die();
        }

    }

    die() {
        this.behavior = this.behaviorTypes.DIE;
        this.goTo({x: this.startX, y: this.startY}, () => {
            this.enabled = false;
            this.xPos = Math.round(this.xPos);
            this.yPos = Math.round(this.yPos);
            setTimeout(() => {
                this.enabled = true;
                this.behavior = this.behaviorTypes.SEEK;
            }, this.dieTime)

        });
    }

    serializePosition(y, x) {
        return [y, x].join(',')
    }

    render() {
        if (this.enabled) {
            this.move();
        }
        this.renderGhost();
    }

    /**
     * Sets random move direction. Ghost can go to opposite direction only there is no other ways
     * @returns {*}
     */
    setRandomDirection() {
        let currentMoveSide = this.moveDirection;
        let cantGoByCurrentWay = !this.moveSides[currentMoveSide];
        let oppositeDirection = this.getOppositeDirection(currentMoveSide);

        if (cantGoByCurrentWay || Math.random() > .5) {
            let sides = Object.keys(this.moveSides);
            let choose = [];
            sides.map(side => {
                if (this.moveSides[side] && side !== oppositeDirection) {
                    choose.push(side)
                }
            });
            if (choose.length == 0) {
                return this.moveDirection = oppositeDirection;
            }
            this.moveDirection = choose[Math.floor(Math.random() * choose.length)];
        }
    }

    move() {
        this.checkForPortal();
        this.checkMoveSides();
        this.lookForPacman();
        let [y, x] = this.getPosition();

        //set new move direction only if ghost leaves previous position or have no move direction
        if (this.lastCeil !== this.serializePosition(y, x) || !this.moveDirection) {
            this.lastCeil = this.serializePosition(y, x);

            if (this.moveSteps.length) {
                let moveStep = this.moveSteps.shift();
                if (typeof moveStep == "function") {
                    moveStep();
                } else {
                    this.moveDirection = moveStep;
                }

            } else {
                this.setRandomDirection();
            }
        }
        // if ghost can't go by current direction, we must set new one
        if (!this.moveSides[this.moveDirection]) {
            this.moveSteps = [];
            this.setRandomDirection();
        }

        let speed = this.speed;
        if (this.behavior == this.behaviorTypes.ESCAPE) {
            speed = speed / 1.5;
        }

        switch (this.moveDirection) {
            case moveDirections.RIGHT:
                if (!this.moveSides.RIGHT) {
                    this.xPos = Math.round(this.xPos);
                    return;
                }
                this.yPos = Math.round(this.yPos);
                this.xPos = this.xPos + speed;
                break;
            case moveDirections.DOWN:
                if (!this.moveSides.DOWN) {
                    this.yPos = Math.round(this.yPos);
                    return;
                }
                this.xPos = Math.round(this.xPos);
                this.yPos = this.yPos + speed;
                break;
            case moveDirections.LEFT:
                if (!this.moveSides.LEFT) {
                    this.xPos = Math.round(this.xPos);
                    return;
                }
                this.yPos = Math.round(this.yPos);
                this.xPos = this.xPos - speed;
                break;
            case moveDirections.UP:
                if (!this.moveSides.UP) {
                    this.yPos = Math.round(this.yPos);
                    return;
                }
                this.xPos = Math.round(this.xPos);
                this.yPos = this.yPos - speed;
                break;
        }

    }

    /**
     * Listens for global game events
     */
    initEventHandlers() {
        EventEmitter.on(Events.EAT_BIG_COIN, () => {
            if (this.behavior !== this.behaviorTypes.DIE) {
                this.behavior = this.behaviorTypes.ESCAPE;
            }
            if (this.setSeekTimeout) {
                clearTimeout(this.setSeekTimeout);
                this.setSeekTimeout = undefined;
            }
            this.setSeekTimeout = setTimeout(() => {
                this.behavior = this.behaviorTypes.SEEK;
            }, this.escapeTime)
        });

        EventEmitter.on(Events.DIE_PACMAN, () => {
            this.enabled = false;
        })
    }


    renderGhost() {
        let ghostColor = this.ghostColor;
        if (this.behavior == this.behaviorTypes.ESCAPE) {
            ghostColor = "#5548dd";
        }
        let eyeColor = "#fff";
        if (this.finding && (this.behavior == this.behaviorTypes.FOLLOW || this.behavior == this.behaviorTypes.SEEK)) {
            eyeColor = "#ff271a"
        }
        let ctx = this.ctx;
        let x = this.xPos * this.size;
        let y = this.yPos * this.size;
        let radius = (this.size - 2) / 2.5;
        ctx.beginPath();
        ctx.save();
        ctx.translate(x, y);
        let normalizer = this.size / 2 - radius;

        //draw ghost body
        if (this.behavior !== this.behaviorTypes.DIE) {
            ctx.arc(this.size / 2, radius + 1, radius, Math.PI * 2, 0);
            ctx.rect(normalizer, radius * 1.1, radius * 2, radius);
            ctx.rect(normalizer, radius * 2, radius / 2, radius / 2);
            ctx.rect(normalizer + radius * 0.75, radius * 2, radius / 2, radius / 2);
            ctx.rect(normalizer + radius * 1.5, radius * 2, radius / 2, radius / 2);
            ctx.fillStyle = ghostColor;
            ctx.fill();
        }

        //draw eyes
        let eyeRadius = radius / 3;
        ctx.beginPath();
        ctx.arc(normalizer + radius / 2, radius, eyeRadius, Math.PI * 2, 0);
        ctx.arc(normalizer + radius * 1.5, radius, eyeRadius, Math.PI * 2, 0);
        if (this.behavior == this.behaviorTypes.DIE) {
            ctx.strokeStyle = "#808182";
            ctx.stroke();
        }
        ctx.fillStyle = eyeColor;
        ctx.fill();


        // draw pupils
        ctx.beginPath();
        switch (this.moveDirection) {
            case moveDirections.RIGHT:
                ctx.arc(normalizer + radius / 2 + eyeRadius / 2, radius, eyeRadius / 2, Math.PI * 2, 0);
                ctx.arc(normalizer + radius * 1.5 + eyeRadius / 2, radius, eyeRadius / 2, Math.PI * 2, 0);
                break;
            case moveDirections.LEFT:
                ctx.arc(normalizer + radius / 2 - eyeRadius / 2, radius, eyeRadius / 2, Math.PI * 2, 0);
                ctx.arc(normalizer + radius * 1.5 - eyeRadius / 2, radius, eyeRadius / 2, Math.PI * 2, 0);
                break;
            case moveDirections.UP:
                ctx.arc(normalizer + radius / 2, radius - eyeRadius / 2, eyeRadius / 2, Math.PI * 2, 0);
                ctx.arc(normalizer + radius * 1.5, radius - eyeRadius / 2, eyeRadius / 2, Math.PI * 2, 0);
                break;
            case moveDirections.DOWN:
                ctx.arc(normalizer + radius / 2, radius + eyeRadius / 2, eyeRadius / 2, Math.PI * 2, 0);
                ctx.arc(normalizer + radius * 1.5, radius + eyeRadius / 2, eyeRadius / 2, Math.PI * 2, 0);
                break;
            default:
                ctx.arc(normalizer + radius / 2, radius, eyeRadius / 2, Math.PI * 2, 0);
                ctx.arc(normalizer + radius * 1.5, radius, eyeRadius / 2, Math.PI * 2, 0);
                break;
        }

        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.restore();
    }
}

export default Ghost;