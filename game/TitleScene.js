class TitleScene extends Phaser.Scene {
    constructor(width, height) {
        super({ key: "TitleScene" });
        this.width = width;
        this.height = height;
        this.padding = width * 0.05;
        this.background;
        this.gridLayout;
        this.buttonToMultiplayer;
        this.buttonToSinglePlayer;
        this.buttonToStats;

    }

    preload() {
        this.load.audio("button", "/game/assets/button.mp3");
    }

    create() {
        this.botGame = true;
        this.gridLayout = new GridLayout(this, this.width, this.height, 6, 6, 0.05);
        //this.gridLayout.showGrid();

        this.buttonToMultiplayer = new Button(this, 0, 0, this.gridLayout.chipSize * this.gridLayout.numCols, this.gridLayout.chipSize, "2 Players Game", "0x178a94", this.switchToMultiplayer.bind(this), this.height / 20);
        this.gridLayout.insertAt(this.buttonToMultiplayer, 0, 1).update();

        this.buttonToSinglePlayer = new Button(this, 0, 0, this.gridLayout.chipSize * this.gridLayout.numCols, this.gridLayout.chipSize, "Play Against PC", "0x178a94", this.switchToPCvsPlayer.bind(this), this.height / 20);
        this.gridLayout.insertAt(this.buttonToSinglePlayer, 0, 3.5).update();

        this.buttonToStats = new Button(this, 0, 0, this.gridLayout.chipSize * this.gridLayout.numCols, this.gridLayout.chipSize, "Game Stats", "0x178a94", this.switchToStats.bind(this), this.height / 20);
        this.gridLayout.insertAt(this.buttonToStats, 0, 6).update();


        this.background = new BackGround(this, this.width, this.height, "0xbfd8d1");

    }

    update(time, delta) {

    }

    addButtons() {
        var text = this.add.text(400, 400, "testing");

        window.text = text;
        var button1 = this.add.image("button", 800, 700, 100, 100);
        button1.setDepth(2);
    }

    switchToMultiplayer() {
        var socket = io('http://localhost:3000');

        socket.on('connection', function (data) {
            console.log("Client side: connected");
        })
        //var sc = this.game.scene.getScene("GameScene");
        //sc.scene.restart();
        this.game.scene.switch("TitleScene", "GameScene");
    }


    switchToPCvsPlayer() {
        //var sc = this.game.scene.getScene("PCScene");
        //sc.scene.restart();
        this.game.scene.switch("TitleScene", "PCScene");
    }

    switchToStats() {
        var sc = this.game.scene.getScene("StatScene");
        sc.scene.restart();
        this.game.scene.switch("TitleScene", "StatScene");
    }


}

