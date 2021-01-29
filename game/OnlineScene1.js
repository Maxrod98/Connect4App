var socket = null;

class OnlineScene1 extends Phaser.Scene {
    constructor(width, height) {
        super({ key: "OnlineScene1" });
        this.width = width;
        this.height = height;
        this.padding = width * 0.05;
        this.background;
        this.gridLayout;
        this.buttonToStartMatch;
        this.buttonToConnectToPlayer;


    }

    preload() {
        this.load.audio("button", "/game/assets/button.mp3");
    }

    create() {
        this.gridLayout = new GridLayout(this, this.width, this.height, 6, 6, 0.05);
        //this.gridLayout.showGrid();

        this.buttonToStartMatch = new Button(this, 0, 0, this.gridLayout.chipSize * this.gridLayout.numCols, this.gridLayout.chipSize, "Start Match", "0x178a94", this.startMatch.bind(this), this.height / 20);
        this.gridLayout.insertAt(this.buttonToStartMatch, 0, 1).update();

        this.buttonToConnectToPlayer = new Button(this, 0, 0, this.gridLayout.chipSize * this.gridLayout.numCols, this.gridLayout.chipSize, "Join other player's match", "0x178a94", this.promptOpponent.bind(this), this.height / 20);
        this.gridLayout.insertAt(this.buttonToConnectToPlayer, 0, 3.5).update();


        this.background = new BackGround(this, this.width, this.height, "0xbfd8d1");

    }

    update(time, delta) {

    }

    promptOpponent() {
        this.requestedUser = prompt("Type opponent's username: ", "opponent's username here");
        if (this.requestedUser == null) {
            alert("Canceled");
        }
        else {
            this.connect(getUsername());
            socket.emit("request_match", getUsername(), this.requestedUser);
        }
    }


    startMatch() {
        this.connect(getUsername());

    }

    connect(username) {
        socket = io('http://localhost:3000');

        socket.emit('username', getUsername());
        this.game.scene.switch("OnlineScene1", "OnlineScene");
    }
}

