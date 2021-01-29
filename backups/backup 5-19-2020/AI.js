class AI {
    constructor(gameBoard, boardLogic, myTurnString, enemyTurnString) {
        this.gameBoard = gameBoard;
        this.boardLogic = boardLogic;
        this.myTurnString = myTurnString;
        this.enemyTurnString = enemyTurnString;

        this.doNotPlaceHereArr = [];
        this.lastPCTurn = new Phaser.Math.Vector2(0, 0);
        this.emit = EventDispatcher.getInstance();

        this.enabled = true;
    }
    //we need a pattern recognition system, para agregar jugadas

    placeChip() { //havent started this
        //SHOULD CHECK EVERY LAST TOP CHIP INSTEAD
        if (this.myTurnString == this.gameBoard.currentTurnString && this.enabled) {
            if (this.boardLogic.threshold - 1 > this.boardLogic.turnNumber * 2 - 1) {
                if (this.boardLogic.turnNumber + 1 == 1) { //adding one because chip hasnt been added yet
                    //console.log("oddifying");
                    this.boardLogic.oddifyRankings(); //starting the first turn as odd
                }
                else if (this.boardLogic.turnNumber + 1 == 2) {
                    //console.log("evenifying");
                    this.boardLogic.evenifyRankings();
                }

                this.startingOut();
            }
            else {
                var justPlaced = false;

                //my winning scenarios
                var PCPotentiallyWinArrs = this.boardLogic.checkWin(true, this.lastPCTurn, this.boardLogic.arrChips[this.lastPCTurn.x][this.lastPCTurn.y], this.boardLogic.threshold - 1);

                //one up
                var PCPotentiallyWinArrsAbove = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(this.lastPCTurn.x, this.lastPCTurn.y + 1), this.boardLogic.arrChips[this.lastPCTurn.x][this.lastPCTurn.y], this.boardLogic.threshold - 1);

                //opponent's winning scenarios
                var playerPotentiallyWinArrs = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(this.boardLogic.lastHorizontal, this.boardLogic.lastVertical), this.boardLogic.lastChipSprite, this.boardLogic.threshold - 1);

                var playerPotentiallyWinArrsAbove = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(this.boardLogic.lastHorizontal, this.boardLogic.lastVertical + 1), this.boardLogic.lastChipSprite, this.boardLogic.threshold - 1);

                //in the last placed by player, check if winning is possible with 2, 
                var winWith3Chips = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(this.boardLogic.lastHorizontal, this.boardLogic.lastVertical), this.boardLogic.lastChipSprite, this.boardLogic.threshold - 2);


                //PC's possible winning scenarios are available
                if (PCPotentiallyWinArrs.length > 0) {
                    //placing may to win is possible
                    justPlaced = this.winningOrBlockingScenarioAvailable(PCPotentiallyWinArrs);
                }

                if (PCPotentiallyWinArrsAbove.length > 0 && !justPlaced) {
                    justPlaced = this.winningOrBlockingScenarioAvailable(PCPotentiallyWinArrsAbove);
                }

                if (winWith3Chips.length > 0 && !justPlaced) {
                    for (var i = 0; i < winWith3Chips.length; i++)
                        if (this.checkBlockWinBy3Chips(winWith3Chips[i])) console.log("WE NEED TO BLOCK THE 3");
                }
                //Player possible winning scenarios are available
                if (playerPotentiallyWinArrs.length > 0 && !justPlaced) {
                    //blocking may be needed
                    justPlaced = this.winningOrBlockingScenarioAvailable(playerPotentiallyWinArrs);
                }
                //PC placed a chip that is not directly correlated to another chips

                if (playerPotentiallyWinArrsAbove.length > 0 && !justPlaced) {
                    justPlaced = this.winningOrBlockingScenarioAvailable(playerPotentiallyWinArrsAbove);
                }

                //blocking not needed, not 3 in line chips
                if (!justPlaced) {
                    this.placeAtConvenientLoc();
                }
            }

        }
        this.gameBoard.blocked = false;
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
        //console.log("CONVENIENT");

        var arr = this.boardLogic.genLocs();
        var chip = this.getMinChip(arr);
        if (chip.pos == null) return; //game is over

        var playerPotentiallyWinArrs = this.boardLogic.checkWin(true, new Phaser.Math.Vector2(chip.pos.x, chip.pos.y + 1), this.boardLogic.lastChipSprite, this.boardLogic.threshold - 1);
        if (playerPotentiallyWinArrs.length > 0 && arr.length > 1) {
            arr.splice(chip.index, 1);
            chip = this.getMinChip(arr);
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


    checkBlockWinBy3Chips(arr) {
        //now, check if these have 1 consecutive chips and is of size 4 or greater, if they have then we go to next step
        var consCount = this.boardLogic.numOfConsecutiveNonEmptyElems(arr);
        //now check if a left exterior element or right exterior element is possible, if one of this is true, then block


        if (consCount == 1 && arr.length == 4) {
            console.log(arr);

            var head = arr[3].pos;
            var tail = arr[0].pos;

            var bottomChipDirection = { x: 0, y: -1 };

            //get slope: B - A
            var slope = addVectors(arr[1].pos, negativeVector(arr[0].pos));

            console.log(slope);

            //check if bottom chip in both sides are null or not
            var posChipPositive = addVectors(bottomChipDirection, addVectors(slope, head));
            var posChipNegative = addVectors(bottomChipDirection, addVectors(negativeVector(slope), tail));

            if (posChipPositive.y == -1 || posChipNegative.y == -1) return true; //negative -1 means it is sitting on the board floor

            //error checking
            if (posChipPositive.y >= 0 && posChipPositive.y < this.boardLogic.numRows && posChipPositive.x >= 0 && posChipPositive.x < this.boardLogic.numCols) {
                if (this.boardLogic.arrChips[posChipPositive.x][posChipPositive.y] != null) return true; //within range
            }

            if (posChipNegative.y >= 0 && posChipNegative.y < this.boardLogic.numRows && posChipNegative.x >= 0 && posChipNegative.x < this.boardLogic.numCols) {
                if (this.boardLogic.arrChips[posChipNegative.x][posChipNegative.y] != null) return true;
            }

            return false;
        }
        return false;
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

    patterns() {
        arr =
            [["any", "any", "any", "PC", "PC"],
            ["any", "any", "PC", "PC", "any"],
            ["any", "PC", "PC", "any", "any"],
            ["PC", "PC", "any", "any", "any"]];
    }

}

