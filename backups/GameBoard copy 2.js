class GameBoard {
    //GameBoard(this, this.gridW, this.gridH, this.gridGraphicsLayout);
    constructor(scene, numCols, numRows, gridLayout, firstTurn, xoff, yoff) {
        this.gridGraphics;
        this.gridTex;
        this.scene = scene;
        this.hitBoxSquareSprite;

        //important numbers
        this.gridW = numCols;
        this.gridH = numRows;
        this.gridLayout = gridLayout;
        this.graphics;

        //game state
        this.arrChips = Array.from(Array(this.gridW), () => []);
        this.currentTurnString = firstTurn;
        this.lastChipSprite;
        this.lastHorizontal;
        this.lastVertical;

        //winning info
        this.threshold = 4;
        this.arrWinning = [];

        this.drawHitBoxSquare();
        this.placeBasedOnGrid(xoff, yoff);
        this.addHitboxSquare();
    }

    //**********Part 1 - Creating board
    placeBasedOnGrid(xoff, yoff) {
        this.gridTextureCreation();
        this.gridLayout.insertAt(this, xoff, yoff);
        this.drawBoard();
    }

    drawHitBoxSquare() {
        var graphics = this.scene.add.graphics();
        graphics.fillStyle(0x3722cb, 1.0);
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
        var graph2 = this.createCircles();
        var mask = graph2.createGeometryMask();
        mask.setInvertAlpha(true);

        if (this.graphics != null) this.graphics.destroy();
        this.graphics = this.scene.add.graphics();
        this.graphics.setMask(mask);
        this.graphics.fillStyle(0x3792cb, 1.0);
        this.graphics.fillRoundedRect(this.gridLayout.offset.x, this.gridLayout.offset.y, this.getGridWidth(), this.getGridHeight());
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

    createCircles() {
        var graph2 = this.scene.make.graphics();

        for (var out = 0; out < this.gridW; out++) {
            for (var i = 0; i < this.gridH; i++) {
                graph2.fillCircle(this.gridLayout.offset.x + out * this.gridLayout.chipSize + this.gridLayout.chipSize / 2, this.gridLayout.offset.y + this.gridLayout.chipSize / 2 + i * this.gridLayout.chipSize, this.gridLayout.chipSize / 2.4);
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

    addChipAt(xcord) {
        if (xcord < 0 || xcord > this.gridW) return;

        if (this.arrChips[xcord].length < this.gridH) {
            var newChip = this.addChipHelper(xcord);
            var length = this.arrChips[xcord].length;

            this.scene.physics.add.collider(newChip, this.hitBoxSquareSprite); //collide with bottom of board

            //to check winning game
            this.lastHorizontal = xcord;
            this.lastVertical = length;

            //adding a new chip to the list
            if (this.arrChips[xcord].length == 0) {
                this.arrChips[xcord].push(newChip);
            }
            else {
                //make the top element a static element and add collider
                this.arrChips[xcord][length - 1].body.destroy();
                this.arrChips[xcord][length - 1].body = new Phaser.Physics.Arcade.StaticBody(this.scene.physics.world, this.arrChips[xcord][length - 1]);

                //FIX ME: Add callback to make a sound when touching
                this.scene.physics.add.collider(newChip, this.arrChips[xcord][length - 1]);
                this.arrChips[xcord].push(newChip);
            }
            this.toggle();
            this.checkWin();
        }
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

        this.lastChipSprite = newChip;

        return newChip;
    }

    toggle() {
        if (this.currentTurnString == "yellow")
            this.currentTurnString = "blue";
        else
            this.currentTurnString = "yellow";
    }

    //winning mechanics
    checkWin() {
        var topdown = this.traverse(0, 1); //check winning top to down winning positions
        var rightleft = this.traverse(1, 0); //check right to left winning positions
        var topright_bottomleft = this.traverse(1, 1); //check diagonal winning positions
        var bottomright_topleft = this.traverse(1, -1); //check diagonal winning positions
        //console.log("topdown: " + topdown + "   rightleft:  " + rightleft + "  topright_bottomleft:  " + topright_bottomleft + "  bottomright_topleft :" + bottomright_topleft);
    }

    //horizontal shift and vertical shift
    traverse(horizontal, vertical) {
        var sum = 1; //self
        sum += this.traverseHelper(horizontal, vertical);
        sum += this.traverseHelper(-horizontal, -vertical);

        this.arrWinning.push(this.arrChips[this.lastHorizontal][this.lastVertical]);

        if (sum >= this.threshold)
            setTimeout(this.winningGame.bind(this), 1000);
        else
            this.arrWinning = [];

        return sum;
    }

    traverseHelper(horizontal, vertical, countEmptySpaces) {
        var tempHorizontal = horizontal;
        var tempVertical = vertical;
        var sum = 0;

        //while loop continues only if next element in the positive direction is the same color as the last chip inserted and it is not null
        while (this.arrChips[this.lastHorizontal + tempHorizontal] != null) {
            //checking for correctness
            if (!countEmptySpaces) {
                if (this.arrChips[this.lastHorizontal + tempHorizontal][this.lastVertical + tempVertical] == null)
                    break;
            }
            //checking for correctness
            if (this.arrChips[this.lastHorizontal + tempHorizontal][this.lastVertical + tempVertical].texture.key != this.lastChipSprite.texture.key)
                break;

            this.arrWinning.push(this.arrChips[this.lastHorizontal + tempHorizontal][this.lastVertical + tempVertical]);

            tempHorizontal += horizontal;
            tempVertical += vertical;
            sum++;
        }

        return sum;
    }

    winningGame() {
        console.log("we have a winner: ");
        console.log("length:  " + this.arrWinning.length);

        //debugger;
        this.arrWinning.forEach(function (element) {
            element.alpha = 0.5;
        });
        setTimeout(this.dropChips.bind(this), 2000);
    }

    //applies a function func to all the chips in the board
    forAllChips(func, arg1, arg2, arg3) {
        for (var i = 0; i < this.gridW; i++) {
            for (var o = 0; o < this.gridH; o++) {
                if (this.arrChips[i][o] != null) {
                    func(this.arrChips[i][o], arg1, arg2, arg3);
                }
            }
        }
    }

    //Helper functions
    dropChips() {
        this.forAllChips(this.replaceBodyChips.bind(this));
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
        //destroy the elements from the scene
        this.forAllChips((chip) => chip.destroy());
        //reset the initial array
        this.arrChips = Array.from(Array(this.gridW), () => []);
        this.lastChipSprite = null;

    }

    lastChipMoves(maxVelocity) {
        var lastMoves = false;
        if (this.lastChipSprite != null && this.lastChipSprite.body != null) {
            lastMoves = (Math.abs(this.lastChipSprite.body.velocity.y) >= maxVelocity);
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
        this.forAllChips((chip) => chip.setX(x));//FIX ME: this is not right
        if (this.lastChipSprite != null) this.lastChipSprite.x = x;
        this.drawBoard();
        this.hitBoxSquareSprite.setX(x + this.getGridWidth() / 2);


        return this;
    }

    setY(y) {
        this.gridLayout.offset.y = y;
        this.gridTex.y = y;
        this.forAllChips((chip) => chip.setY(y)); //FIX ME: this is not right
        if (this.lastChipSprite != null) this.lastChipSprite.y = y;
        this.drawBoard();
        this.hitBoxSquareSprite.setY(y + this.getGridHeight() + this.hitBoxSquareSprite.height / 2);

        return this;
    }
}