class AI {
    constructor(gameBoard, boardLogic, myTurnString, enemyTurnString, scene) {
        this.gameBoard = gameBoard;
        this.boardLogic = boardLogic;
        this.myTurnString = myTurnString;
        this.enemyTurnString = enemyTurnString;
        this.scene = scene;

        this.potentiallyWinArr = [];
        this.myPotentialWinArr = [];
        this.myWinningTurnArr = null;

        this.doNotPlaceHereArr = [];
        this.turnNumber = 1;
        this.lastPCTurn = new Phaser.Math.Vector2(0, 0);

        this.lastPlayerPlacement = new Phaser.Math.Vector2(0, 0);

        this.emit = EventDispatcher.getInstance();
    }
    //we need a pattern recognition system, para agregar jugadas

    placeChip() { //havent started this

        if (this.myTurnString == this.gameBoard.currentTurnString) {
            console.log("PC turn Turn number: " + this.turnNumber);

            if (this.boardLogic.threshold - 1 > this.turnNumber) {
                this.startingOut();
            }
            else {
                //opponent's winning scenarios
                var playerPotentiallyWinArrs = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(this.boardLogic.lastHorizontal, this.boardLogic.lastVertical), this.boardLogic.lastChipSprite, this.boardLogic.threshold - 1);
                //my winning scenarios
                var PCPotentiallyWinArrs = this.boardLogic.checkWin(true, this.lastPCTurn, this.boardLogic.arrChips[this.lastPCTurn.x][this.lastPCTurn.y], this.boardLogic.threshold - 1);

                //PC's possible winning scenarios are available
                if (PCPotentiallyWinArrs.length > 0) {
                    //placing may to win is possible
                    this.boardLogic.refineArrays(PCPotentiallyWinArrs);
                    var ans = this.shouldBlockOrPlaceToWin(PCPotentiallyWinArrs);
                    //placing to win needed
                    if (ans.shouldPlace) {
                        console.log("Placing to win");
                        this.addAt(ans.x);
                    }
                    //placing to win not needed
                    else {
                        this.placeAtConvenientLoc();
                    }
                }
                //Player possible winning scenarios are available
                else if (playerPotentiallyWinArrs.length > 0) {
                    //blocking may be needed
                    this.boardLogic.refineArrays(playerPotentiallyWinArrs);
                    var ans = this.shouldBlockOrPlaceToWin(playerPotentiallyWinArrs);

                    //blocking definetly needed
                    if (ans.shouldPlace) {
                        console.log("Placing to block");
                        this.addAt(ans.x);
                    }
                    //blocking not needed
                    else {
                        this.placeAtConvenientLoc();
                    }
                }
                //blocking not needed, not 3 in line chips
                else {
                    this.placeAtConvenientLoc();
                }
            }
            this.turnNumber++;
        }
        this.gameBoard.blocked = false;
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
        if (chip == null) return; //game is over
        this.lastPCTurn = this.addAt(chip.x);
    }


    //for ranking system
    getMinChip(arr) {
        console.log(arr);
        var min = null;

        if (arr.length < 0) {
            console.log("GAME IS OVER");
            return;
        }


        var min = new Phaser.Math.Vector2(arr[0].pos.x, arr[0].pos.y);

        for (var i = 1; i < arr.length; i++) {
            console.log(i);
            if (this.boardLogic.chipsRankings[arr[i].pos.x][arr[i].pos.y] < this.boardLogic.chipsRankings[min.x][min.y]) {
                min = arr[i].pos;
            }
        }



        //this.boardLogic.chipsRankings[x][y] 
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
        if (this.turnNumber == 1) {
            loc = Math.trunc(0.5 * arr.length);
        }
        else {
            loc = Math.trunc(random * arr.length);
        }
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
    }

    restartAI() {
        console.log("restarting");
        this.gameBoard.currentTurnString = "yellow";
        this.turnNumber = 1;

        this.potentiallyWinArr = [];
        this.myPotentialWinArr = [];
        this.myWinningTurnArr = null;

        this.doNotPlaceHereArr = [];
        this.turnNumber = 1;
        this.lastPCTurn = new Phaser.Math.Vector2(0, 0);

        this.lastPlayerPlacement = new Phaser.Math.Vector2(0, 0);
    }

    setTimeo(elem) {
        this.gameBoard.blocked = true;
        this.lastPlayerPlacement.x = elem.lastHorizontal;
        this.lastPlayerPlacement.y = elem.lastVertical;
        //setTimeout(this.placeChip.bind(this), 1500); //change this
        setTimeout(this.placeChip.bind(this), 2000);
        //console.log("delayed call");
    }

    patterns() {
        arr =
            [["any", "any", "any", "PC", "PC"],
            ["any", "any", "PC", "PC", "any"],
            ["any", "PC", "PC", "any", "any"],
            ["PC", "PC", "any", "any", "any"]];
    }

}