//For this class, just create a parent class from which you can inherit from all the properties

class PCScene extends GameScene {
    constructor(width, height, chipWidth, chipHeight, scene) {
        super(width, height, chipWidth, chipHeight, scene);
        this.ai;
        this.conditionvariable = true;

    }


    update(time, delta) {
        super.update(time, delta);
    }

    create() {
        super.create();
        //override variable gameboard
        this.gameBoard.againstPC = true;
        this.ai = new AI(this.gameBoard, this.gameBoard.boardLogic, "blue", "yellow", this);
        this.ai.setListeners();
        this.gameBoard.startGame();


    }

}
