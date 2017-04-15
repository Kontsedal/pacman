import Ghost from './Ghost';

class Blinky extends Ghost {
    constructor() {
        super(...arguments);

        this.ghostColor = "#dd352c"
    }

    goToPacman() {
        let [y, x] = this.pacman.getPosition();
        this.goTo({x, y})
    }
}

export default Blinky;