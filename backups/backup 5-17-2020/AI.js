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
            //FIX ME: modify this so that you can add 3 or 2 only in the bottom row only
            if (this.boardLogic.threshold - 1 > this.turnNumber) {
                this.startingOut();
            }
            else {
                this.potentiallyWinArr = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(this.boardLogic.lastHorizontal, this.boardLogic.lastVertical), this.boardLogic.lastChipSprite);
                //FIX ME: this wont work anymore because you have to figure
                //out a way to check every single new inserted blue chip. The solution is to store
                //the two previous chips inserted
                this.boardLogic.arrWinning = [];
                this.myWinningTurnArr = this.boardLogic.checkWin(true, this.lastPCTurn, this.boardLogic.arrChips[this.lastPCTurn.x][this.lastPCTurn.y]);
                if (this.myWinningTurnArr != null) {
                    console.log("STEP 2: PC winning turn");
                    var loc = this.checkIfBlockable(this.myWinningTurnArr);
                    //ok so no null elements to block in that arr
                    if (loc.x == -1 || typeof loc.x != "number") {
                        console.log("THIS BUG THAT I HATE");
                        console.log(loc);
                        this.placeAtConvenientLoc();
                    }
                    else
                        this.lastPCTurn = this.addAt(loc.x);
                }

                else if (this.potentiallyWinArr != null) {
                    //THIS IS GOOD
                    //blocking needed
                    var loc = this.checkIfBlockable(this.potentiallyWinArr);
                    if (loc.blocking && this.boardLogic.arrChips[loc.x].length < this.boardLogic.numRows) {
                        this.lastPCTurn = this.addAt(loc.x);
                        console.log("STEP 3: blocking player");
                    }
                    //blocking not needed, not high enough to score
                    else {
                        //the thinking of this is good, es como no pisar una mina, but it needs refining
                        if (loc.active) {
                            console.log("STEP 4: place randomly 2");
                            this.doNotPlaceHereArr.push(loc.x);
                            this.placeAtConvenientLoc();
                        }
                        //but be vigilant because he/she can still win with these
                        //this.doNotPlaceHereArr.push(x); //FIX ME: 
                        else {
                            console.log("STEP 5: else");
                            this.placeAtConvenientLoc();
                        }
                    }
                }
                //blocking not needed, not 3 in line chips
                else {
                    console.log("STEP 4: place randomly 1");
                    this.placeAtConvenientLoc();
                }
            }

            this.turnNumber++;
        }
        this.gameBoard.blocked = false;
    }

    addAt(x) {

        this.gameBoard.addChipAt(x, true);
        console.log("Last added at: x:" + x + " y: " + (this.boardLogic.arrChips[x].length - 1));
        return new Phaser.Math.Vector2(x, this.boardLogic.arrChips[x].length - 1);
    }

    placeAtConvenientLoc() {
        var arr = this.boardLogic.genLocs();
        var chip = this.getMinChip(arr);
        this.lastPCTurn = this.addAt(chip.pos.x);
    }

    PCJustPlacedChip() {
        var myPotentialWinning = this.boardLogic.checkWin(true, this.lastPCTurn);
        if (myPotentialWinning != null) {
            //console.log("I detected that I almost win" + myPotentialWinning);
            var x = this.checkIfBlockable(myPotentialWinning);
            this.myWinningTurnArr = x;
        }

    }

    getMinChip(arr) {
        var min = null;

        for (var i = 0; i < arr.length; i++) {
            var x = arr[i].pos.x;
            var y = arr[i].pos.y;

            if (i != 0) {
                var Xmin = min.pos.x;
                var Ymin = min.pos.y;
            }
            //console.log(this.boardLogic.chipsRankings[x][y]);
            if (i == 0) min = arr[0];
            else if (this.boardLogic.chipsRankings[x][y] < this.boardLogic.chipsRankings[Xmin][Ymin]) {
                min = arr[x];
            }
        }

        return min;
    }

    checkIfBlockable(arr) {
        var loc = -1;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].chip == null) {
                //console.log(arr);
                loc = arr[i].pos.x;
                var length = this.boardLogic.arrChips[loc].length;
                //console.log("x " + x + " length :" + length);
                if (arr[i].pos.y == length) {
                    //put it there to block the player
                    return { x: loc, active: false, blocking: true };
                }
                //it is safe, do not worry
                return { x: loc, active: true, blocking: false }
            }
        }
        return { x: loc, active: false, blocking: false };
    }

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
        //this.emit.on("playerPlacedCheck", this.PCJustPlacedChip.bind(this));
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
        console.log("delayed call");
    }

    patterns() {
        arr =
            [["any", "any", "any", "PC", "PC"],
            ["any", "any", "PC", "PC", "any"],
            ["any", "PC", "PC", "any", "any"],
            ["PC", "PC", "any", "any", "any"]];
    }

}