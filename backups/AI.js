class AI {
    constructor(gameBoard, boardLogic, myTurnString, enemyTurnString) {
        this.gameBoard = gameBoard;
        this.boardLogic = boardLogic;
        this.myTurnString = myTurnString;
        this.enemyTurnString = enemyTurnString;
        this.potentiallyWinArr = [];
        this.myPotentialWinArr = [];
        this.myWinningTurn = null;
        this.turnNumber = 1;
        this.doNotPlaceHereArr = [];

        this.lastPlayerPlacement = new Phaser.Math.Vector2(0, 0);

        this.emit = EventDispatcher.getInstance();
    }
    //we need a pattern recognition system, para agregar jugadas

    placeChip() { //havent started this

        if (this.myTurnString == this.gameBoard.currentTurnString && !this.gameBoard.blocked) {
            console.log("PC turn");
            //FIX ME: modify this so that you can add 3 or 2 only in the bottom row only
            if (this.boardLogic.threshold - 1 > this.turnNumber) {
                this.placeAtCenterRandomly();
                //console.log("STEP 1: starting game. ");
            }
            else {
                this.potentiallyWinArr = this.boardLogic.checkWin(true);
                //FIX ME: this wont work anymore because you have to figure
                //out a way to check every single new inserted blue chip. The solution is to store
                //the two previous chips inserted
                if (this.myWinningTurn != null) {
                    console.log("STEP 2: PC winning turn- not happening");
                    this.gameBoard.addChipAt(this.myWinningTurn.x);
                }

                else if (this.potentiallyWinArr != null) {
                    //THIS IS GOOD
                    //blocking needed
                    var x = this.checkIfBlockable(this.potentiallyWinArr);
                    console.log("X is ::" + x);
                    if (x.blocking && this.boardLogic.arrChips[x.x].length < this.boardLogic.numRows) {
                        this.addAt(x.x);
                        console.log("STEP 3: blocking player");
                    }
                    //blocking not needed, not high enough to score
                    else {
                        //the thinking of this is good, es como no pisar una mina, but it needs refining
                        if (x.active) {
                            console.log("x.active " + x.active);
                            console.log("STEP 4: place randomly 2");
                            this.doNotPlaceHereArr.push(x.x);
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
            //this.gameBoard.blocked = false;
        }

    }

    addAt(x) {

        for (var i = 0; i < this.doNotPlaceHereArr.length; i++) {
            //not a good idea to place here
            console.log(i);
            if (x == this.doNotPlaceHereArr[i]) {
                console.log("I SHOULDNT PLACE HERE: " + this.doNotPlaceHereArr[i]);

            }
        }
        //go ahead man


        this.gameBoard.addChipAt(x);
    }

    placeAtConvenientLoc() {
        var arr = this.boardLogic.genLocs();

        var chip = this.getMinChip(arr);
        console.log(chip.pos.x);
        this.addAt(chip.pos.x);
    }

    PCJustPlacedChip() {
        var myPotentialWinning = this.boardLogic.checkWin(true);
        if (myPotentialWinning != null) {
            console.log("I detected that I almost win" + myPotentialWinning);
            var x = this.checkIfBlockable(myPotentialWinning);
            this.myWinningTurn = x;
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
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].chip == null) {
                var x = arr[i].pos.x;
                var length = this.boardLogic.arrChips[x].length;
                //console.log("x " + x + " length :" + length);
                if (arr[i].pos.y == length) {
                    return { x: x, active: false, blocking: true };
                }
                return { x: x, active: true, blocking: false }
            }
        }

        return { x: x, active: false, blocking: false };
    }


    placeAtCenterRandomly() {
        //place randomly within the center 30%
        var random = Math.random();
        //console.log(random);
        var loc = 3 /*Math.round(random * this.boardLogic.numCols * 0.20 + this.boardLogic.numCols * 0.3); */;
        console.log(loc);
        this.gameBoard.addChipAt(loc);
    }

    setListeners() {
        this.emit.on("newChipPlaced", this.setTimeo.bind(this));
        this.emit.on("playerPlacedCheck", this.PCJustPlacedChip.bind(this));
    }

    setTimeo(elem) {
        this.lastPlayerPlacement.x = elem.lastHorizontal;
        this.lastPlayerPlacement.y = elem.lastVertical;
        setTimeout(this.placeChip.bind(this), 1200);
    }

    patterns() {
        arr =
            [["any", "any", "any", "PC", "PC"],
            ["any", "any", "PC", "PC", "any"],
            ["any", "PC", "PC", "any", "any"],
            ["PC", "PC", "any", "any", "any"]];
    }

}