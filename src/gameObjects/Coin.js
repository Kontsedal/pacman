import {gameObjectsTypes} from '../constants'

class Coin {
    constructor({ctx, row, ceil, size}) {
        this.ctx = ctx;

        this.x = ceil;
        this.y = row;
        this.size = size;
        this.color = "#efd050";

        this.type = gameObjectsTypes.COIN;
    }

    render() {
        this.ctx.beginPath();
        let circleWidth = 5;
        let xPos = this.x * this.size + (this.size) / 2;
        let yPos = this.y * this.size + (this.size) / 2;

        this.ctx.arc(xPos, yPos, circleWidth / 2, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();


    }
}

export default Coin;