import Ghost from './Ghost';
import {moveDirections} from './../../constants';

class Pinky extends Ghost {
    constructor() {
        super(...arguments);

        this.ghostColor = "#dd64b9"
    }

    goToPacman() {
        let goToX, goToY;
        let [y, x] = this.pacman.getPosition();
        let pacmanDirection = this.pacman.getDirection();
        switch (pacmanDirection) {
            case moveDirections.UP:
                goToX = x - 4;
                goToY = y - 4;
                break;
            case moveDirections.DOWN:
                goToX = x;
                goToY = y - 4;
                break;
            case moveDirections.RIGHT:
                goToX = x + 4;
                goToY = y;
                break;
            case moveDirections.LEFT:
                goToX = x - 4;
                goToY = y;
                break;
        }
        if(Math.abs(this.xPos - x) <= 2 || Math.abs(this.yPos - y) <= 2) {
            goToX = x;
            goToY = y;
        }
        if (!this.canGoHere({x: goToX, y: goToY})) {
            goToX = x;
            goToY = y;
        }
        this.goTo({x: goToX, y: goToY})
    }
}

export default Pinky;