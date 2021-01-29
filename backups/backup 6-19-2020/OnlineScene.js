
//For this class, just create a parent class from which you can inherit from all the properties
function getUsername() {
    if (localStorage.getItem("username") == null) {
        localStorage.setItem("username", "player1");
        return localStorage.getItem("username");
    }
    else {
        return localStorage.getItem("username");
    }
}

class OnlineScene extends GameScene {
    constructor(width, height, chipWidth, chipHeight, scene) {
        super(width, height, chipWidth, chipHeight, scene);
        console.log("Starting online scene");


    }

    update(time, delta) {
        super.update(time, delta);
    }

    create() {
        super.create();
        //override variable gameboard

        this.gameBoard.startGame();


        //overwritting current winningGame function
        var cached_function = this.gameBoard.winningGame;
        this.gameBoard.winningGame = (function () {


            return function () {
                cached_function.apply(this);
                socket.emit("winner");
            };


        })();

        this.gameBoard.blocked = true;

        socket.on('connection', function (data) {

        });

        socket.on('blocked', (function () {
            this.gameBoard.blocked = true;
            this.currentTurnText.textObj.text = "Opponent's turn";
            this.updateTurn();
        }).bind(this));

        socket.on('unblocked', (function () {
            this.gameBoard.blocked = false;
            this.currentTurnText.textObj.text = "Your turn";
            this.updateTurn();
        }).bind(this));

        socket.on('opponent_disconnected', (function () {
            this.gameBoard.blocked = true;

            this.currentTurnText.textObj.text = "Opponent disconnected";
            this.updateTurn();
            alert("Opponent not connected");
            this.scene.restart();
            this.game.scene.switch("OnlineScene", "OnlineScene1");

        }).bind(this));




        console.log("Client side: connected");

        socket.on('new chip', function (data) {
            var emit = EventDispatcher.getInstance();

            emit.emit("placingChipOnline", data);
        });

        this.emit.on("placingChipOnline", (data) => this.gameBoard.addChipAt(data, true, true));
    }



}



