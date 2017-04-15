import {gameObjectsTypes, moveDirections} from '../constants';
import {gameCells, gameRows} from '../settings';
import isNotUndefined from '../helpers/isNotUndefined';

/**
 * Pseudo-class for extending by ghosts and pacman. Contains shared functionality
 * @param {array} map - array of arrays that represents game map with objects in ceils
 * @param {number} x - player position on x axis
 * @param {number} y - player position on y axis
 * @param {function} findPath - function for getting move instructions to reach provided place in shortest way
 */
class Player {
    constructor({map, x, y, findPath}) {
        this.map = map;
        this.findPath = findPath;

        //on which sides player can go at the current moment
        this.moveSides = {
            LEFT: false,
            RIGHT: false,
            UP: false,
            DOWN: false
        };
        this.xPos = x;
        this.yPos = y;
    }

    /**
     * Check on which sides player can go at the current moment
     */
    checkMoveSides() {
        let x = Math.round(this.xPos);
        let y = Math.round(this.yPos);

        this.moveSides = {
            LEFT: this.checkWallExistence(x - 1, y),
            RIGHT: this.checkWallExistence(x + 1, y),
            UP: this.checkWallExistence(x, y - 1),
            DOWN: this.checkWallExistence(x, y + 1),
        };

        if (this.nextState && this.moveSides[this.nextState]) {
            this.moveDirection = this.nextState;
            this.nextState = null;
        }
    }

    /**
     * Checks is player can go to provided point
     *
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    checkWallExistence(x, y) {
        let row = this.map[y] || [];
        let gameObject = row[x];
        if (!gameObject) {
            return (x < 0 || y < 0 || x >= gameCells || y >= gameRows) && this.inPortal
        }
        return gameObject.type !== gameObjectsTypes.WALL;
    }

    getOppositeDirection(direction) {
        switch (direction) {
            case moveDirections.RIGHT:
                return moveDirections.LEFT;
            case moveDirections.DOWN:
                return moveDirections.UP;
            case moveDirections.LEFT:
                return moveDirections.RIGHT;
            case moveDirections.UP:
                return moveDirections.DOWN;
        }
    }

    /**
     * If player moves outside of the map, we must create mirrored copy of him on the other side of the map
     */
    checkForPortal() {
        this.inPortal = false;

        let [y, x] = this.getPosition();

        this.mirriorX = x;
        if (x <= 0 && this.moveDirection == moveDirections.LEFT) {
            this.inPortal = true;
            this.mirriorX = gameCells + x;
        }
        if (x <= -1 && this.moveDirection == moveDirections.LEFT) {
            this.xPos = gameCells - x - 1;
            this.inPortal = false;
        }
        if (x >= gameCells - 1 && this.moveDirection == moveDirections.RIGHT) {
            this.inPortal = true;
            this.mirriorX = x - gameCells;
        }
        if (x >= gameCells && this.moveDirection == moveDirections.RIGHT) {
            this.xPos = x - gameCells;
            this.inPortal = false;
        }

        this.mirriorY = y;
        if (y <= 0 && this.moveDirection == moveDirections.UP) {
            this.inPortal = true;
            this.mirriorY = gameRows + y;
        }
        if (y <= -1 && this.moveDirection == moveDirections.UP) {
            this.yPos = gameRows - y - 1;
            this.inPortal = false;
        }
        if (y >= gameRows - 1 && this.moveDirection == moveDirections.DOWN) {
            this.inPortal = true;
            this.mirriorY = y - gameRows;
        }
        if (y >= gameRows && this.moveDirection == moveDirections.DOWN) {
            this.yPos = y - gameRows;
            this.inPortal = false;
        }
    }

    getPosition() {
        return [Math.round(this.yPos), Math.round(this.xPos)];
    }

    getDirection() {
        return this.moveDirection;
    }


    canGoHere({x, y}) {
        return isNotUndefined(this.map[y]) && isNotUndefined(this.map[y][x])
            && this.map[y][x].type !== gameObjectsTypes.WALL;
    }
}

export default Player;