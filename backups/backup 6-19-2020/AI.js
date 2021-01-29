class AI {
    constructor(gameBoard, boardLogic, myTurnString, enemyTurnString) {
        this.gameBoard = gameBoard;
        this.boardLogic = boardLogic;
        this.myTurnString = myTurnString;
        this.enemyTurnString = enemyTurnString;

        this.doNotPlaceHereArr = [];
        this.lastPCTurn = new Phaser.Math.Vector2(0, 0);
        this.emit = EventDispatcher.getInstance();
        this.emit.on("playerWins", this.playerWins);

        this.enabled = true;
    }
    //we need a pattern recognition system, para agregar jugadas

    placeChip() { //havent started this
        //SHOULD CHECK EVERY LAST TOP CHIP INSTEAD
        if (this.myTurnString == this.gameBoard.currentTurnString && this.enabled) {
            if (this.boardLogic.threshold - 1 > this.boardLogic.turnNumber * 2 - 1) {
                if (this.boardLogic.turnNumber + 1 == 1) { //adding one because chip hasnt been added yet
                    this.boardLogic.randomizeChipLocs();
                    this.boardLogic.oddifyRankings(); //starting the first turn as odd
                }
                else if (this.boardLogic.turnNumber + 1 == 2) {
                    this.boardLogic.randomizeChipLocs();
                    this.boardLogic.evenifyRankings();
                }
                this.startingOut();
            }
            else {
                var justPlaced = false;

                justPlaced = this.selectWinningOrBlockingPlace(this.myTurnString);

                if (!justPlaced)
                    justPlaced = this.selectWinningOrBlockingPlace("yellow");

                //blocking not needed, not 3 in line chips
                if (!justPlaced) {
                    this.placeAtConvenientLoc();
                    justPlaced = true;
                }
            }
        }
        this.gameBoard.blocked = false;
    }

    selectWinningOrBlockingPlace(player) {
        var justPlaced = false;

        for (var horizontal = 0; horizontal < this.boardLogic.numCols; horizontal++ && !justPlaced) {

            for (var vertical = 0; vertical < this.boardLogic.numRows; vertical++ && !justPlaced) {

                if (this.boardLogic.arrChips[horizontal][vertical] != null && !justPlaced && this.boardLogic.arrChips[horizontal][vertical].texture.key == player) {
                    //my winning scenarios
                    var potentiallWin = this.boardLogic.checkWin(true, { x: horizontal, y: vertical }, this.boardLogic.arrChips[horizontal][vertical], this.boardLogic.threshold - 1);

                    //PC's possible winning scenarios are available
                    if (potentiallWin.length > 0 && !justPlaced) {
                        console.log("Placing to win or to block to : " + player);
                        //placing may to win is possible
                        justPlaced = this.winningOrBlockingScenarioAvailable(potentiallWin);
                    }
                }
            }
        }
        return justPlaced;
    }

    winningOrBlockingScenarioAvailable(winningOrBlockingScenarios) {
        this.boardLogic.refineArrays(winningOrBlockingScenarios);
        var ans = this.shouldBlockOrPlaceToWin(winningOrBlockingScenarios);
        //placing to win needed
        if (ans.shouldPlace) {
            //console.log("Placing to win");
            this.addAt(ans.x);
            return true;
        }
        //didnt place
        return false;
    }

    addAt(x) {
        this.gameBoard.addChipAt(x, true);
        //console.log("Last added at: x:" + x + " y: " + (this.boardLogic.arrChips[x].length - 1));
        return new Phaser.Math.Vector2(x, this.boardLogic.arrChips[x].length - 1);
    }

    placeAtConvenientLoc() {
        console.log("CONVENIENT");

        var arr = this.boardLogic.genLocs();
        var chip = this.getMinChip(arr);
        if (chip.pos == null) return; //game is over

        var playerPotentiallyWinArrs = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(chip.pos.x, chip.pos.y + 1), this.boardLogic.lastChipSprite, this.boardLogic.threshold - 1);

        while (playerPotentiallyWinArrs.length > 0 && arr.length > 1) {
            console.log(arr);
            arr.splice(chip.index, 1);
            console.log("Removing index: " + chip.pos.x);
            console.log(arr);
            chip = this.getMinChip(arr);
            playerPotentiallyWinArrs = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(chip.pos.x, chip.pos.y + 1), this.boardLogic.lastChipSprite, this.boardLogic.threshold - 1);

        }

        this.lastPCTurn = this.addAt(chip.pos.x);
    }


    //simply getting the minimum value depending on the ranking
    getMinChip(arr) {
        //console.log(arr);

        if (arr.length < 0) {
            console.log("GAME IS OVER");
            return;
        }

        var min = { pos: new Phaser.Math.Vector2(arr[0].pos.x, arr[0].pos.y), index: 0 };

        for (var i = 1; i < arr.length; i++) {
            //console.log(i);
            if (this.boardLogic.chipsRankings[arr[i].pos.x][arr[i].pos.y] < this.boardLogic.chipsRankings[min.pos.x][min.pos.y]) {
                min = { pos: arr[i].pos, index: i };
            }
        }
        return min;
    }

    shouldBlockOrPlaceToWin(potentiallyWinArrs) {
        for (var out = 0; out < potentiallyWinArrs.length; out++) {
            var loc = -1;
            for (var i = 0; i < potentiallyWinArrs[out].length; i++) {
                if (potentiallyWinArrs[out][i].chip == null) {
                    loc = potentiallyWinArrs[out][i].pos.x;
                    var length = this.boardLogic.arrChips[loc].length;
                    //console.log("x " + x + " length :" + length);
                    if (potentiallyWinArrs[out][i].pos.y == length && length < this.boardLogic.numRows) {
                        //put it there to block the player or to win
                        return { x: loc, shouldPlace: true };
                    }
                    //it is safe, do not worry
                }
            }
        }
        return { x: loc, shouldPlace: false };
    }

    //this does not work somehow
    startingOut() {
        //place randomly within the center 30%
        var random = 0.5;
        var arr = [];
        for (var i = 0; i < this.boardLogic.numCols; i++) {
            var tuple = { sprite: this.boardLogic.arrChips[i][0], pos: new Phaser.Math.Vector2(i, 0) };
            arr.push(tuple);
        }
        arr = this.removeOccupied(arr);
        //console.log(arr);
        var loc;
        loc = Math.trunc(random * arr.length);
        //console.log(loc);
        this.lastPCTurn = this.addAt(arr[loc].pos.x);
    }

    removeOccupied(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].sprite != null) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }

    setListeners() {
        this.emit.on("newChipPlaced", this.setTimeo.bind(this));
        this.emit.on("restartAI", this.restartAI.bind(this));
        this.emit.on("blockAI", this.blockAI.bind(this));
        this.emit.on("unblockAI", this.unblockAI.bind(this));
    }

    blockAI() {
        this.enabled = false;
    }

    unblockAI() {
        this.enabled = true;
    }

    restartAI() {
        console.log("restarting");
        this.gameBoard.currentTurnString = "yellow";

        this.doNotPlaceHereArr = [];
        this.lastPCTurn = new Phaser.Math.Vector2(0, 0);
    }

    setTimeo(elem) {

        this.gameBoard.blocked = true;
        //setTimeout(this.placeChip.bind(this), 1500); //change this
        setTimeout(this.placeChip.bind(this), 1500);
        //console.log("delayed call");
    }

    playerWins() {
        console.log("winning");
        var numOne = parseInt(localStorage.getItem("totalPCGames"), 10);
        if (numOne == null) localStorage.setItem("totalPCGames", 1);
        else {
            numOne++;
            localStorage.setItem("totalPCGames", JSON.stringify(numOne));
        }
    }
}

