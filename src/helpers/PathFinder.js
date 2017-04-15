import PF from 'pathfinding';
import {moveDirections, gameObjectsTypes} from '../constants';

/**
 * Helper class for finding shortest way between two chords
 */
class PathFinder {
    constructor({map}) {
        this.map = map;
        this.matrix = this._mapToBinaryMatrix();
        this.grid = new PF.Grid(this.matrix);
        this.finder = new PF.AStarFinder();
    }

    _mapToBinaryMatrix() {
        return this.map.map(row => {
            return row.map(ceil => {
                if (ceil.type == gameObjectsTypes.WALL) {
                    return 1;
                }
                return 0;
            });
        })
    }

    _pathToInstructions(path) {
        let initialPosition = path.shift();
        let currentX = initialPosition[0];
        let currentY = initialPosition[1];
        let instructions = [];
        path.map(([newX, newY]) => {
            let action = null;
            if (newX > currentX) {
                action = moveDirections.RIGHT
            }
            if (newX < currentX) {
                action = moveDirections.LEFT
            }
            if (newY > currentY) {
                action = moveDirections.DOWN
            }
            if (newY < currentY) {
                action = moveDirections.UP
            }
            instructions.push(action);
            currentX = newX;
            currentY = newY;
        });
        return instructions;
    }

    findPath({startX, startY, endX, endY}) {
        startX = Math.round(startX);
        startY = Math.round(startY);
        endX = Math.round(endX);
        endY = Math.round(endY);
        let path = this.finder.findPath(startX, startY, endX, endY, this.grid.clone());
        return this._pathToInstructions(path);
    }
}

export default PathFinder;