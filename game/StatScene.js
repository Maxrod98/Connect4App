class StatScene extends Phaser.Scene {
    constructor(width, height) {
        super({ key: "StatScene" });
        this.width = width;
        this.height = height;
        this.padding = width * 0.05;
        this.background;
        this.gridLayout;
        this.totalGamesVsPc;
        this.winGamesVsPC;
        this.totalGamesNum;
        this.numWonAgainstPC;
        this.totalMultiplayersGames;
        this.totalMultiplayersGamesNum;
    }

    preload() {
        this.load.audio("button", "/game/assets/button.mp3");

    }

    create() {
        //let data = this.cache.json.get('gameData');

        //localStorage.setItem("item-key", JSON.stringify(number));
        //localStorage.getItem("item-key");





        this.gridLayout = new GridLayout(this, this.width, this.height, 6, 8, 0.05);
        //this.gridLayout.showGrid();

        this.totalGamesVsPc = new Button(this, 0, 0, this.gridLayout.chipSize * (this.gridLayout.numCols - 1), this.gridLayout.chipSize, "Total games played vs PC:", "0xADDFFF", null, this.height / 20);
        this.gridLayout.insertAt(this.totalGamesVsPc, 0, 1).update();
        var numOne = localStorage.getItem("totalPCGames");
        this.totalGamesNum = this.add.text(0, 0, (numOne == null ? numOne = 0 : numOne), { fontSize: 40, color: "0xFFFFFF" }).setDepth(3);
        this.gridLayout.insertAt(this.totalGamesNum, 5, 1.5);
        this.totalGamesNum.y = this.totalGamesVsPc.textObj.y;


        this.winGamesVsPC = new Button(this, 0, 0, this.gridLayout.chipSize * (this.gridLayout.numCols - 1), this.gridLayout.chipSize, "Games won against PC:", "0xADDFFF", null, this.height / 20);
        this.gridLayout.insertAt(this.winGamesVsPC, 0, 4).update();
        var numTwo = localStorage.getItem("totalPCWins");
        this.numWonAgainstPC = this.add.text(0, 0, (numTwo == null ? numTwo = 0 : numTwo), { fontSize: 40, color: "0xFFFFFF" }).setDepth(3);
        this.gridLayout.insertAt(this.numWonAgainstPC, 5, 4.5);
        this.numWonAgainstPC.y = this.winGamesVsPC.textObj.y;


        this.totalMultiplayersGames = new Button(this, 0, 0, this.gridLayout.chipSize * (this.gridLayout.numCols - 1), this.gridLayout.chipSize, "Total 2 player games:", "0xADDFFF", null, this.height / 20);
        this.gridLayout.insertAt(this.totalMultiplayersGames, 0, 7).update();
        var numThree = localStorage.getItem("totalMultiplayerGames");
        this.totalMultiplayersGamesNum = this.add.text(0, 0, (numThree == null ? numThree = 0 : numThree), { fontSize: 40, color: "0xFFFFFF" }).setDepth(3);
        this.gridLayout.insertAt(this.totalMultiplayersGamesNum, 5, 7.5);
        this.totalMultiplayersGamesNum.y = this.totalMultiplayersGames.textObj.y;


        var goback = new Button(this, 0, 0, this.gridLayout.chipSize * 2, this.gridLayout.chipSize, "Go back", "0x36D6E7", this.changeScene.bind(this));
        this.gridLayout.insertAt(goback, 0, 0).update();

        this.background = new BackGround(this, this.width, this.height, "0xFFFF99");

    }

    update(time, delta) {


    }

    changeScene() {
        this.game.scene.switch("StatScene", "TitleScene");

    }


}