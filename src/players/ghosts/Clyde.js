import Ghost from './Ghost';
import {gameRows, gameCells} from '../../settings';

class Clyde extends Ghost {
    constructor() {
        super(...arguments);

        this.ghostColor = "#dd952a"
    }

    goToPacman() {
        let goToX, goToY;
        let [y, x] = this.pacman.getPosition();
        let [posY, posX] = this.getPosition();
        goToX = x;
        goToY = y;
        if (Math.abs(posX - x) > 8 || Math.abs(posY - y) > 8) {
            goToY = gameRows - 2;
            goToX = gameCells - 2;
        }
        if (!this.canGoHere({x: goToX, y: goToY})) {
            goToX = x;
            goToY = y;
        }
        this.goTo({x: goToX, y: goToY});
    }
}

export default Clyde;