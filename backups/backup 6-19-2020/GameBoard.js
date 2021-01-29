class GameBoard {
    //GameBoard(this, this.gridW, this.gridH, this.gridGraphicsLayout);
    constructor(scene, numCols, numRows, gridLayout, firstTurn, xoff, yoff) {
        this.gridGraphics;
        this.gridTex;
        this.scene = scene;
        this.hitBoxSquareSprite;
        this.blocked = false;
        this.gameOver = false;
        this.containsAtLeastOneChip = false;
        this.tapToRestartButton;

        //important numbers
        this.gridW = numCols;
        this.gridH = numRows;
        this.gridLayout = gridLayout;
        this.graphics;

        this.currentTurnString = firstTurn;
        this.boardLogic = new BoardLogic(numCols, numRows);

        this.drawHitBoxSquare();
        this.placeBasedOnGrid(xoff, yoff);
        this.addHitboxSquare();

        this.emit = EventDispatcher.getInstance();

    }

    startGame() {
        if (Math.random() > 0.5) {
            //console.log("PC starting");
            this.toggle();
            this.emit.emit("newChipPlaced");

        }
        this.emit.emit("restartCurrentTurnChip");
    }

    //**********Part 1 - Creating board
    placeBasedOnGrid(xoff, yoff) {
        this.gridTextureCreation();
        this.gridLayout.insertAt(this, xoff, yoff);
        //this.drawBoard();
    }

    drawHitBoxSquare() {
        var graphics = this.scene.add.graphics();
        graphics.fillStyle("0x0074DD", 1.0);
        graphics.fillRoundedRect(0, 0, this.getGridWidth(), this.gridLayout.chipSize);
        graphics.setDepth(5);
        graphics.generateTexture("hitbox", this.getGridWidth(), this.gridLayout.chipSize);
        graphics.destroy();

        this.hitBoxSquareSprite = this.scene.physics.add.sprite(this.getGridWidth() / 2, 622, "hitbox");
        this.hitBoxSquareSprite.body.destroy();
        this.hitBoxSquareSprite.setAlpha(0.2);

    }

    addHitboxSquare() {
        this.hitBoxSquareSprite.body = new Phaser.Physics.Arcade.StaticBody(this.scene.physics.world, this.hitBoxSquareSprite);
        this.hitBoxSquareSprite.setDepth(1);
    }

    drawBoard() {
        //var col = Phaser.Display.Color.HexStringToColor("0xFFFF00");
        var col = Phaser.Display.Color.HexStringToColor("0x0D5F8A");

        var graph2 = this.createMaskCircles();
        var mask = graph2.createGeometryMask();
        mask.setInvertAlpha(true);

        if (this.graphics != null) this.graphics.destroy();
        this.graphics = this.scene.add.graphics();
        this.graphics.setMask(mask);
        this.graphics.fillStyle(col.color, 1.0);
        this.graphics.fillRoundedRect(this.gridLayout.offset.x, this.gridLayout.offset.y, this.getGridWidth(), this.getGridHeight());

        /*
        this.gridGraphics.fillStyle(col.darken(10).color, 1.0);
        this.gridGraphics.fillRoundedRect(this.gridLayout.offset.x, this.gridLayout.offset.y, this.getGridWidth() - 10, this.getGridHeight() - 10);
        */

        //console.log("updating color");
        this.graphics.setDepth(2);
    }

    gridTextureCreation() {
        //add grid hitbox
        this.gridGraphics = this.scene.add.graphics();
        this.gridGraphics.fillStyle(0x3792cb, 1.0);
        this.gridGraphics.fillRect(0, 0, this.getGridWidth(), this.getGridHeight());

        this.gridGraphics.setDepth(0);
        this.gridGraphics.generateTexture("grid", this.getGridWidth(), this.getGridHeight());
        this.gridGraphics.destroy();

        if (this.gridTex != null) this.gridTex.destroy();
        this.gridTex = this.scene.add.image(this.gridLayout.x, this.gridLayout.y, "grid").setOrigin(0, 0);
        this.gridTex.setInteractive();

        this.gridTex.on("pointerdown", this.addChip.bind(this, this.scene.input.mousePointer));
        this.gridTex.on("pointerdown", this.addChip.bind(this, this.scene.input.pointer1));
        this.gridTex.setDepth(0);
        //this.addInfo();
    }

    createMaskCircles() {
        var graph2 = this.scene.make.graphics();

        for (var out = 0; out < this.gridW; out++) {
            for (var i = 0; i < this.gridH; i++) {
                graph2.fillCircle(this.gridLayout.offset.x + out * this.gridLayout.chipSize + this.gridLayout.chipSize / 2, this.gridLayout.offset.y + this.gridLayout.chipSize / 2 + i * this.gridLayout.chipSize, this.gridLayout.chipSize / 2.6);
            }
        }

        return graph2;
    }

    //***************Part 2 Game mechanics
    addChip(pointer) {
        //var withinlimits = (pointer.x > this.gridTex.x - this.gridTex.width / 2 && pointer.x < this.gridTex.x + this.gridTex.width / 2);
        var xcord = Math.trunc((pointer.x - this.gridLayout.offset.x) / this.gridLayout.chipSize);

        if (!this.lastChipMoves(10) && pointer.isDown) {
            this.addChipAt(xcord);
        }
    }

    addChipAt(xcord, PCturn, onlinePlacement) {
        //console.log("xcord " + xcord + "this.gameOver: " + this.gameOver + "bloced :" + this.blocked);
        if (xcord < 0 || xcord > this.gridW || this.gameOver) {
            //console.log("invalid chip xcord or gameboard is blocked");
            return;
        };

        if (PCturn != true) {
            if (this.blocked) {
                //console.log("BLOCKED");
                return;
            }
        }

        //online placement avoids an infinite loop
        if (socket != null && !onlinePlacement) {
            console.log("emitting chip at: " + xcord + "by user: " + getUsername());
            socket.emit("userPlaced", getUsername(), xcord);
            setTimeout(this.letOtherPlayerPlaceMultiplayer.bind(this), 1000);
        }


        //console.log("Adding at : " + xcord);
        if (this.boardLogic.arrChips[xcord] == null) xcord = Math.trunc(this.boardLogic.numCols / 2);

        if (this.boardLogic.arrChips[xcord].length < this.gridH) {
            this.boardLogic.turnNumber++;
            //console.log("Turn number: " + this.boardLogic.turnNumber);

            //this.scene.sound.play("chipFalling");
            //console.log("Player turn");
            this.containsAtLeastOneChip = true;

            var newChip = this.addChipHelper(xcord);
            var length = this.boardLogic.arrChips[xcord].length;

            this.scene.physics.add.collider(newChip, this.hitBoxSquareSprite); //collide with bottom of board

            //adding a new chip to the list
            if (this.boardLogic.arrChips[xcord].length == 0) {
                this.boardLogic.arrChips[xcord].push(newChip);
            }
            else {
                //make the top element a static element and add collider
                this.boardLogic.arrChips[xcord][length - 1].body.destroy();
                //console.log("length:    " + length);
                this.boardLogic.arrChips[xcord][length - 1].body = new Phaser.Physics.Arcade.StaticBody(this.scene.physics.world, this.boardLogic.arrChips[xcord][length - 1]);

                //FIX ME: Add callback to make a sound when touching
                this.scene.physics.add.collider(newChip, this.boardLogic.arrChips[xcord][length - 1]);
                this.boardLogic.arrChips[xcord].push(newChip);
            }
            this.toggle();
            this.boardLogic.updateStats(xcord, length, newChip);

            var winningArr = this.boardLogic.checkWin(false, new Phaser.Math.Vector2(xcord, length), newChip, this.boardLogic.threshold);
            if (winningArr.length > 0) {
                this.blocked = true;
                console.log("WINNER");
                setTimeout(this.blinkWinningChips.bind(this, winningArr[0]), 300);

                this.addStats(winningArr[0][0].chip);

                this.winningGame();
            };


            setTimeout(this.notifyPC.bind(this, xcord, length), 350);
        }
    }

    letOtherPlayerPlaceMultiplayer() {
        socket.emit("boardUnlocked", getUsername());
    }

    addStats(winningSprite) {
        console.log("Adding stats");
        if (this.againstPC) updateStatsData("totalPCGames");

        if (winningSprite.texture.key != "blue" && this.againstPC) updateStatsData("totalPCWins");

        if (this.againstPC == null) updateStatsData("totalMultiplayerGames");
    }



    blinkWinningChips(chips) {
        for (var i = 0; i < chips.length; i++) {

            if (chips[i].chip != null) {
                chips[i].chip.alpha = 0.67;
            }

            if (chips[i].chip != null) {
                chips[i].chip.tintBottomLeft += 30;
                chips[i].chip.tintTopRight += 30;
            }


        }
        if (this.gameOver)
            setTimeout(this.blinkWinningChips.bind(this, chips), 50);
    }

    notifyPC(xcord, length) {
        //console.log(xcord, length);
        this.emit.emit("newChipPlaced", { lastHorizontal: xcord, lastVertical: length });
    }

    addChipHelper(xcord) {
        var newChip = this.scene.add.sprite(this.gridLayout.offset.x + xcord * this.gridLayout.chipSize + this.gridLayout.chipSize / 2, this.gridLayout.offset.y - this.gridLayout.chipSize / 2, this.currentTurnString);

        //update physics 
        this.scene.sys.displayList.add(newChip);
        this.scene.sys.updateList.add(newChip);
        this.scene.sys.arcadePhysics.world.enableBody(newChip, 0);

        //set the newChip's physics
        newChip.body.setBounce(0.5);
        newChip.setDepth(1);

        return newChip;
    }

    toggle() {

        if (this.currentTurnString == "yellow")
            this.currentTurnString = "blue";
        else
            this.currentTurnString = "yellow";

    }

    //Helper functions
    dropChips() {
        if (this.tapToRestartButton != null) this.tapToRestartButton.clear();
        this.blocked = true;
        this.gameOver = true;
        this.emit.emit("restartCurrentTurnChip");
        this.emit.emit("blockAI");
        this.boardLogic.forAllChips(this.replaceBodyChips.bind(this));

        if (this.containsAtLeastOneChip) this.scene.sound.play("allChipsFalling");
        setTimeout(this.removeChipObjs.bind(this), 2000);
    }

    replaceBodyChips(chip) {
        var tempColor = chip.texture.key;
        var tempX = chip.x;
        var tempY = chip.y;

        chip.destroy();
        chip = this.scene.physics.add.sprite(tempX, tempY, tempColor);
        chip.body.setGravityY(1000);
        chip.setDepth(1);
    }

    removeChipObjs() {

        this.boardLogic.reset();
        this.emit.emit("unblockAI");
        this.emit.emit("restartAI");
        this.blocked = false;
        this.gameOver = false;
        this.containsAtLeastOneChip = false;
        this.startGame();
    }

    lastChipMoves(maxVelocity) {
        var lastMoves = false;
        if (this.boardLogic.lastChipSprite != null && this.boardLogic.lastChipSprite.body != null) {
            lastMoves = (Math.abs(this.boardLogic.lastChipSprite.body.velocity.y) >= maxVelocity);
            //console.log(this.lastChip.body.velocity.y);
        }
        return lastMoves;
    }

    getGridWidth() {
        return this.gridW * this.gridLayout.chipSize;
    }

    getGridHeight() {
        return this.gridH * this.gridLayout.chipSize;
    }

    setX(x) {
        this.gridLayout.offset.x = x;
        this.gridTex.x = x;
        //this.forAllChips((chip) => chip.setX(x));//FIX ME: this is not right
        this.drawBoard();
        this.hitBoxSquareSprite.setX(x + this.getGridWidth() / 2);

        return this;
    }

    setY(y) {
        this.gridLayout.offset.y = y;
        this.gridTex.y = y;
        //this.forAllChips((chip) => chip.setY(y)); //FIX ME: this is not right
        this.drawBoard();
        this.hitBoxSquareSprite.setY(y + this.getGridHeight() + this.hitBoxSquareSprite.height / 2);

        return this;
    }

    winningGame() {
        console.log("we have a winner: ");
        this.gameOver = true;
        //constructor(scene, x, y, width, height, text, color, callback) {
        this.tapToRestartButton = new Button(this.scene, 0, 0, this.gridLayout.chipSize * this.gridLayout.numCols, this.gridLayout.chipSize * this.gridH, "", "0xFFFFFF", this.dropChips.bind(this));
        this.gridLayout.insertAt(this.tapToRestartButton, 0, 0).update();
        this.tapToRestartButton.button.alpha = 0.1;

        //setTimeout(this.dropChips.bind(this), 4000);
    }

}

function updateStatsData(dataName) {
    var value = parseInt(localStorage.getItem(dataName), 10);
    if (localStorage.getItem(dataName) == null) value = null;
    if (typeof value != "number" || value == null) localStorage.setItem(dataName, 1);
    else {
        value++;
        localStorage.setItem(dataName, value);
    }
}