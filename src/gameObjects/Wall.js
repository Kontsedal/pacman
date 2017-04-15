import {gameObjectsTypes} from '../constants'
class Wall {
    constructor({ctx, row, ceil, size}) {
        this.ctx = ctx;
        this.x = ceil;
        this.y = row;
        this.size = size;
        this.color = "#4c4c4c";
        this.type = gameObjectsTypes.WALL;
    }

    render() {
        this.ctx.beginPath();
        this.ctx.rect(this.x * this.size, this.y * this.size, this.size, this.size);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

export default Wall;