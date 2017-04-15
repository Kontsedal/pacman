import Ghost from './Ghost';
import {moveDirections} from './../../constants';

class Inky extends Ghost {
    constructor() {
        super(...arguments);

        this.ghostColor = "#4ad6dd"
    }

    goToPacman() {
        let goToX, goToY;
        let [y, x] = this.pacman.getPosition();
        let pacmanDirection = this.pacman.getDirection();
        let [posY, posX] = this.getPosition();
        switch (pacmanDirection) {
            case moveDirections.UP:
                goToX = x + x - posX;
                goToY = y - 2 + y - 2 - posY;
                break;
            case moveDirections.DOWN:
                goToX = x + x - posX;
                goToY = y + 2 + y + 2 - posY;
                break;
            case moveDirections.RIGHT:
                goToX = x + 2 + x + 2 - posX;
                goToY = y + y - posY;
                break;
            case moveDirections.LEFT:
                goToX = x - 2 + x - 2 - posX;
                goToY = y + y - posY;
                break;
        }
        if (Math.abs(this.xPos - x) <= 2 || Math.abs(this.yPos - y) <= 2) {
            goToX = x;
            goToY = y;
        }
        if (!this.canGoHere({x: goToX, y: goToY})) {
            goToX = x;
            goToY = y;
        }
        this.goTo({x: goToX, y: goToY});
    }
}

export default Inky;