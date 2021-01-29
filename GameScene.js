

class GameScene extends Phaser.Scene {
    constructor(width, height, chipWidth, chipHeight, scene) {
        super(scene);

        this.sceneName = scene;
        //self made objects
        this.gameBoard;
        this.bg;
        this.gridLayout;

        //game setup
        this.graphics;
        this.gameWidth = width;
        this.gameHeight = height;
        this.gridW = chipWidth;
        this.gridH = chipHeight;

        //buttons and sprites
        this.currentTurnChip;
        this.currentTurnText;

        this.emit = EventDispatcher.getInstance();
    }

    //overloaded methods
    preload() {
        this.load.audio("chipFalling", "assets/chipFalling.mp3");
        this.load.audio("allChipsFalling", "assets/allChipsFalling.mp3");
        this.load.audio("button", "assets/button.mp3");
    }

    create() {
        this.gridLayout = new GridLayout(this, this.gameWidth, this.gameHeight, this.gridW, this.gridH, 0.05);
        //this.gridLayout.showGrid();

        this.physics.world.timeScale = 0.25;
        this.graphics = this.add.graphics();

        this.chips = new Chips(this);
        this.bg = new BackGround(this, this.gameWidth, this.gameHeight, "0x9BCCFD");
        this.gameBoard = new GameBoard(this, this.gridW, this.gridH, this.gridLayout, "yellow", 0, 2);
        this.addButtons();
        this.updateTurn(false);
        this.emit.on("newChipPlaced", this.updateTurn.bind(this, false));
        this.emit.on("restartCurrentTurnChip", this.updateTurn.bind(this, true));
    }

    update(time, delta) {
        super.update(time, delta);
    }

    //you can check whether to use two blocks on top or just 1
    addButtons() {
        //current turn button
        this.currentTurnText = new Button(this, 0, 0, this.gameBoard.getGridWidth(), this.gridLayout.chipSize, "Current turn:", "0x81599F", null);
        this.gridLayout.insertAt(this.currentTurnText, 0, -1).update();

        //locating on grid
        var goback = new Button(this, 0, 0, this.gridLayout.chipSize * 2, this.gridLayout.chipSize, "Go back", "0x36D6E7", this.changeScene.bind(this));
        this.gridLayout.insertAt(goback, 0, -2).update();

        var resetGame = new Button(this, 0, 0, this.gridLayout.chipSize * 2, this.gridLayout.chipSize, "Reset", "0x92c9b1", this.gameBoard.dropChips.bind(this.gameBoard));
        this.gridLayout.insertAt(resetGame, this.gridLayout.numCols - 2, -2).update();

        //this.gridLayout.showGrid();
        //console.log(this.gameBoard.gridW - 2);
    }

    changeScene() {
        if (!this.gameBoard.blocked) {
            this.emit.emit("restartAI");
            this.emit.emit("restartCurrentTurnChip");
            this.gameBoard.removeChipObjs();
            this.game.scene.switch(this.sceneName, "TitleScene");
        }
    }

    updateTurn(restart) {

        if (this.gameBoard.againstPC) {
            this.currentTurnText.update();
            if (this.gameBoard.currentTurnString != "blue") this.currentTurnText.textObj.text = "Player's turn";
            else this.currentTurnText.textObj.text = "PC's turn";

        }

        if (this.currentTurnChip != null) this.currentTurnChip.destroy();
        this.currentTurnChip = this.add.image(this.currentTurnText.textObj.x + this.currentTurnText.textObj.width + this.gridLayout.chipSize / 2, this.currentTurnText.textObj.y + this.currentTurnText.textObj.height / 2, this.gameBoard.currentTurnString);
        this.currentTurnChip.scale = 0.5;
        this.currentTurnChip.setDepth(5);


    }


    resize() {
        this.gameWidth = getWidth();
        this.gameHeight = getHeight();
        this.bg = new BackGround(this, this.gameWidth, this.gameHeight, "0x404040");
    }

}

