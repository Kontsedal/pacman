import Player from './Player';
import {gameObjectsTypes, moveDirections} from '../constants';
import EventEmitter from '../helpers/EventEmmiter';
import Events from "../events";
import {KeyPressEvents} from '../helpers/KeyPressHandler';

/**
 * Pseudo-class that represents pacman
 *
 * @param {object} ctx - canvas context. Required for drawing
 * @param {number} size - width and height of game ceil
 * @param {number} x - position on x axis
 * @param {number} y - position on y axis
 * @param {function} findPath - function for getting move instructions to reach provided place in shortest way
 * @param {number} speed - common pacman speed
 * @param {number} eatSpeed - pacman speed when he is eating
 *
 */
class Pacman extends Player {
    constructor({ctx, size, map, x, y, findPath, speed, eatSpeed}) {
        super(...arguments);

        this.speed = speed;
        this.eatSpeed = eatSpeed;
        this.map = map;
        this.ctx = ctx;
        this.size = size;
        this.animationState = 0;

        this.pacmanColor = "#ffc215";

        // angles of pacman arcs (rendering) for directions of move
        this.pacmanRenderAngles = {
            [moveDirections.LEFT]: [1.25, 0.25, 1.75, 0.75, -1],
            [moveDirections.RIGHT]: [0.25, 1.25, 0.75, 1.75, -1],
            [moveDirections.UP]: [0.25, 1.25, 1.75, 0.75, 1],
            [moveDirections.DOWN]: [0.75, 1.75, 1.25, 0.25, -1],
        };
        this.pacmanRenderAngles[moveDirections.STOP] = this.pacmanRenderAngles[moveDirections.RIGHT];

        this.isEating = false;
        this.eatTimeoutTime = 200;

        // go to that direction as soon as possible
        this.nextState = null;

        //current move direction
        this.moveDirection = moveDirections.STOP;

        this.render();
        this.addHandlers();
    }

    /**
     * Listen for global game events and keyboard events
     */
    addHandlers() {
        EventEmitter.on(KeyPressEvents.PRESS_UP, () => {
            if (this.inPortal || this.died) {
                return;
            }
            if (!this.moveSides.UP) {
                this.nextState = moveDirections.UP;
                return;
            }
            this.moveDirection = moveDirections.UP;
        });
        EventEmitter.on(KeyPressEvents.PRESS_DOWN, () => {
            if (this.inPortal || this.died) {
                return;
            }
            if (!this.moveSides.DOWN) {
                this.nextState = moveDirections.DOWN;
                return;
            }
            this.moveDirection = moveDirections.DOWN;
        });
        EventEmitter.on(KeyPressEvents.PRESS_LEFT, () => {
            if (this.inPortal || this.died) {
                return;
            }
            if (!this.moveSides.LEFT) {
                this.nextState = moveDirections.LEFT;
                return;
            }
            this.moveDirection = moveDirections.LEFT;
        });
        EventEmitter.on(KeyPressEvents.PRESS_RIGHT, () => {
            if (this.inPortal || this.died) {
                return;
            }
            if (!this.moveSides.RIGHT) {
                this.nextState = moveDirections.RIGHT;
                return;
            }
            this.moveDirection = moveDirections.RIGHT;
        });

        EventEmitter.on(Events.DIE_PACMAN, () => {
            this.died = true;
        });
    }

    /**
     * Calls on every game render loop, main logic is here
     *
     * @param {number} x
     * @param {number} y
     */
    render(x = this.xPos, y = this.yPos) {
        if (this.died) {
            this.animateDeath();
            return;
        }
        this.move();
        this.animateEating();
        this.renderPacman(x, y);
        if (this.inPortal) {
            this.renderPacman(this.mirriorX, this.mirriorY);
        }
    }

    /**
     * Sets available move directions and moves pacman
     */
    move() {
        this.checkMoveSides();
        this.checkForPortal();
        this.checkForCoin();
        let newPos;

        let speed = this.speed;

        if (this.isEating) {
            speed = this.eatSpeed;
        }
        switch (this.moveDirection) {
            case moveDirections.RIGHT:
                newPos = this.xPos + speed;
                if (!this.moveSides.RIGHT) {
                    this.xPos = Math.round(this.xPos);
                    return;
                }
                this.yPos = Math.round(this.yPos);
                this.xPos = newPos;
                break;
            case moveDirections.DOWN:
                newPos = this.yPos + speed;
                if (!this.moveSides.DOWN) {
                    this.yPos = Math.round(this.yPos);
                    return;
                }
                this.xPos = Math.round(this.xPos);
                this.yPos = newPos;
                break;
            case moveDirections.LEFT:
                newPos = this.xPos - speed;
                if (!this.moveSides.LEFT) {
                    this.xPos = Math.round(this.xPos);
                    return;
                }
                this.yPos = Math.round(this.yPos);
                this.xPos = newPos;
                break;
            case moveDirections.UP:
                newPos = this.yPos - speed;
                if (!this.moveSides.UP) {
                    this.yPos = Math.round(this.yPos);
                    return;
                }
                this.xPos = Math.round(this.xPos);
                this.yPos = newPos;
                break;
        }
    }

    /**
     * Check for coin under pacman, eats it if exist by sending global game events
     */
    checkForCoin() {
        let x = Math.ceil(this.xPos - 0.5);
        let y = Math.ceil(this.yPos - 0.5);

        let row = this.map[y] || [];
        let ceil = row[x];

        if (ceil && ceil.type === gameObjectsTypes.COIN) {
            EventEmitter.emit(Events.EAT_COIN, [x, y]);
            this.eat();
        }

        if (ceil && ceil.type === gameObjectsTypes.BIG_COIN) {
            EventEmitter.emit(Events.EAT_BIG_COIN, [x, y]);
            this.eat();
        }
    }

    /**
     * Sets eat flag that required for eating animation and changing of speed
     */
    eat() {
        this.isEating = true;
        if (this.eatTimeout) {
            clearTimeout(this.eatTimeout);
            this.eatTimeout = undefined;
        }
        this.eatTimeout = setTimeout(() => {
            this.isEating = false;
        }, this.eatTimeoutTime)
    }

    renderPacman(xPos, yPos) {
        let angles = this.pacmanRenderAngles[this.moveDirection];
        let ctx = this.ctx;
        let x = xPos * this.size + this.size / 2;
        let y = yPos * this.size + this.size / 2;
        ctx.beginPath();
        let animationAngle = 0.20 * this.animationCoef;
        ctx.arc(x, y, (this.size - 2) / 2, (angles[0] + animationAngle * angles[4]) * Math.PI, (angles[1] + animationAngle * angles[4]) * Math.PI, false);
        ctx.fillStyle = this.pacmanColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, (this.size - 2) / 2, (angles[2] + animationAngle * (angles[4] * -1)) * Math.PI, (angles[3] + animationAngle * (angles[4] * -1)) * Math.PI, false);
        ctx.fill();
    }

    /**
     * Increments values for eating animation
     */
    animateEating() {
        if (!this.isEating) {
            this.animationState = 0;
            this.animationCoef = 0;
            return;
        }
        this.animationState += 5;
        this.animationCoef = (this.animationState % 100) / 100;
    }

    animateDeath() {
        this.deathAnimationStep = this.deathAnimationStep ? this.deathAnimationStep * 1.07 : 1;
        let [yPos, xPos] = this.getPosition();
        let angles = this.pacmanRenderAngles[this.moveDirection];
        let ctx = this.ctx;
        let x = xPos * this.size + this.size / 2;
        let y = yPos * this.size + this.size / 2;
        let rotateAngle = Math.PI * 3 * this.deathAnimationStep / 80;

        let animationAngle = 0.20 * this.animationCoef;
        let radius = ((this.size - 2) / 2) * this.deathAnimationStep;
        ctx.save();
        ctx.rotate(rotateAngle);
        ctx.translate(x - radius, y - radius);
        ctx.beginPath();
        ctx.arc(0, 0, radius, (angles[0] + animationAngle * angles[4]) * Math.PI, (angles[1] + animationAngle * angles[4]) * Math.PI, false);
        ctx.fillStyle = this.pacmanColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, radius, (angles[2] + animationAngle * (angles[4] * -1)) * Math.PI, (angles[3] + animationAngle * (angles[4] * -1)) * Math.PI, false);
        ctx.fill();
        ctx.restore();
        if (this.deathAnimationStep >= 40) {
            EventEmitter.emit(Events.PACMAN_DEAD);
        }
    }
}

export default Pacman;