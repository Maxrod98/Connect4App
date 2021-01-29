

class GameScene extends Phaser.Scene {
    constructor(width, height, chipWidth, chipHeight) {
        super({ key: 'GameScene' });

        //graphics and textures
        this.graphics;
        this.grid;
        this.gridTex;
        this.bg;
        this.paddingX = width * 0.05; //3% padding
        this.paddingY = height * 0.05;
        this.gameInfoHeight = height * 0.25;


        //game setup
        this.gameWidth = width;
        this.gameHeight = height;
        this.gridW = chipWidth;
        this.gridH = chipHeight;
        this.chipSize = 50;
        this.xoffset;
        this.yoffset;
        this.arr = Array.from(Array(this.gridW), () => []);

        //state of the game
        this.currentTurn = "yellow";
        this.currentTurnChip;
        this.currentTurnText;
        this.lastChip;
        this.lastHorizontal;
        this.lastVertical;


        //winning info
        this.threshold = 4;
        this.arrWinning = [];

    }

    //overloaded methods
    preload() {
        this.load.image("bg", "assets/background.png");

    }

    create() {
        //this.bg = this.add.image(0, 0, "bg");
        //this.bg.setDepth(1);
        this.graphics = this.add.graphics();
        this.resize();

        this.drawElements();
        this.gridCreation();
        var bg = new BackGround(this, this.gameWidth, this.gameHeight, "0x404040");
    }

    update(time, delta) {
        super.update(time, delta);
    }

    addInfo() {
        if (this.currentTurnText == null) this.currentTurnText = new Button(this, this.gameWidth / 2, this.yoffset - this.gameInfoHeight / 2, this.getGridWidth(), this.gameInfoHeight / 2, "Current turn:", 0xFFFFFF, null, 40);

        if (this.currentTurnChip != null) this.currentTurnChip.destroy();
        this.currentTurnChip = this.add.image(this.currentTurnText.textObj.x + this.currentTurnText.textObj.width + this.chipSize / 2, this.yoffset - this.gameInfoHeight / 2, this.currentTurn);
        this.currentTurnChip.scale = 0.5;
        this.currentTurnChip.setDepth(5);


    }

    resize() {
        this.physics.world.timeScale = 0.4;
        this.chipSize = Math.min(((this.gameWidth - this.paddingX * 2) / this.gridW), ((this.gameHeight - this.paddingY * 2 - this.gameInfoHeight) / this.gridH));
        this.xoffset = Math.max(this.paddingX, this.gameWidth / 2 - (this.getGridWidth() / 2));
        this.yoffset = Math.min((this.gameHeight / 2 - this.getGridHeight() / 2 + this.gameInfoHeight / 2));
        this.graphics.clear();
    }

    drawElements() {
        this.drawChip("yellow", "0xFFFF00");
        this.drawChip("blue", "0x0000FF");
        this.drawBoard();

    }

    drawChip(key, color) {
        var col = Phaser.Display.Color.HexStringToColor(color);
        //bigger circle
        this.graphics.lineStyle(5, 0x22FFFF, 1.0);
        this.graphics.fillStyle(color, 1.0);
        this.graphics.fillCircle(this.chipSize / 2, this.chipSize / 2, this.chipSize / 2);

        //medium circle
        this.graphics.fillStyle(col.darken(10).color, 1.0);
        this.graphics.fillCircle(this.chipSize / 2, this.chipSize / 2, this.chipSize / 2.5);

        //small circle inside
        this.graphics.fillStyle(col.darken(3).color, 1.0);
        this.graphics.fillCircle(this.chipSize / 2, this.chipSize / 2, this.chipSize / 10);

        //generate grid
        this.graphics.generateTexture(key, this.chipSize + 1, this.chipSize + 1);
        this.graphics.clear();
    }



    drawBoard() {
        //var col = Phaser.Display.Color.HexStringToColor("0xFFFF00");
        var graph2 = this.createCircles();
        var mask = graph2.createGeometryMask();
        mask.setInvertAlpha(true);

        this.graphics.setMask(mask);
        this.graphics.fillStyle(0x3792cb, 1.0);
        this.graphics.fillRoundedRect(this.xoffset, this.yoffset, this.getGridWidth(), this.getGridHeight());
        this.graphics.setDepth(2);

        //add grid hitbox
        this.grid = this.add.graphics();
        this.grid.fillStyle(0x3792cb, 1.0);
        this.grid.fillRect(0, 0, this.getGridWidth(), this.getGridHeight());
        this.grid.setDepth(0);
        this.grid.generateTexture("grid", this.getGridWidth(), this.getGridHeight());
        this.grid.clear();

    }

    createCircles() {
        var graph2 = this.make.graphics();

        for (var out = 0; out < this.gridW; out++) {
            for (var i = 0; i < this.gridH; i++) {
                graph2.fillCircle(this.xoffset + out * this.chipSize + this.chipSize / 2, this.yoffset + this.chipSize / 2 + i * this.chipSize, this.chipSize / 2.4);
            }
        }

        return graph2;
    }

    lastChipMoves(maxVelocity) {
        var lastMoves = false;
        if (this.lastChip != null) {
            lastMoves = (Math.abs(this.lastChip.body.velocity.y) >= maxVelocity);
            //console.log(this.lastChip.body.velocity.y);
        }
        return lastMoves;
    }

    gridCreation() {
        this.gridTex = this.add.image(this.xoffset, this.yoffset, "grid").setOrigin(0, 0);
        this.gridTex.setInteractive();

        this.gridTex.on("pointerdown", this.addChip.bind(this, this.input.mousePointer));
        this.gridTex.on("pointerdown", this.addChip.bind(this, this.input.pointer1));
        this.gridTex.setDepth(0);

        this.physics.world.setBounds(0, 0, this.getGridWidth() + this.xoffset, this.getGridHeight() + this.yoffset);


        this.addInfo();
    }



    addChip(pointer) {
        //var withinlimits = (pointer.x > this.gridTex.x - this.gridTex.width / 2 && pointer.x < this.gridTex.x + this.gridTex.width / 2);
        var xcord = Math.trunc((pointer.x - this.xoffset) / this.chipSize);

        if (!this.lastChipMoves(10) && pointer.isDown) {
            this.addChipAt(xcord);
        }
    }

    addChipAt(xcord) {

        if (this.arr[xcord].length < this.gridH) {
            var newChip = this.addChipHelper(xcord);
            var length = this.arr[xcord].length;

            //to check winning game
            this.lastHorizontal = xcord;
            this.lastVertical = length;

            //adding a new chip to the list
            if (this.arr[xcord].length == 0) {
                this.arr[xcord].push(newChip);
            }
            else {
                //make the top element a static element and add collider
                this.arr[xcord][length - 1].body.destroy();
                this.arr[xcord][length - 1].body = new Phaser.Physics.Arcade.StaticBody(this.physics.world, this.arr[xcord][length - 1]);

                //Add callback to make a sound when touching
                this.physics.add.collider(newChip, this.arr[xcord][length - 1]);
                this.arr[xcord].push(newChip);
            }

            this.toggle();
            this.checkWin();
        }
    }

    addChipHelper(xcord) {
        var newChip = this.add.sprite(this.xoffset + xcord * this.chipSize + this.chipSize / 2, this.yoffset - this.chipSize / 2, this.currentTurn);

        //update physics 
        this.sys.displayList.add(newChip);
        this.sys.updateList.add(newChip);
        this.sys.arcadePhysics.world.enableBody(newChip, 0);

        //set the newChip's physics
        newChip.body.setCollideWorldBounds(true);
        newChip.body.setBounce(0.5);
        newChip.setDepth(1);

        this.lastChip = newChip;

        return newChip;
    }

    toggle() {
        if (this.currentTurn == "yellow")
            this.currentTurn = "blue";
        else
            this.currentTurn = "yellow";
        this.addInfo();
    }

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

        this.arrWinning.push(this.arr[this.lastHorizontal][this.lastVertical]);

        if (sum >= this.threshold)
            setTimeout(this.winningGame.bind(this), 1000);
        else
            this.arrWinning = [];

        return sum;
    }

    traverseHelper(horizontal, vertical) {
        var tempHorizontal = horizontal;
        var tempVertical = vertical;
        var sum = 0;

        //while loop continues only if next element in the positive direction is the same color as the last chip inserted and it is not null
        while (this.arr[this.lastHorizontal + tempHorizontal] != null) {
            //checking for correctness
            if (this.arr[this.lastHorizontal + tempHorizontal][this.lastVertical + tempVertical] == null)
                break;
            //checking for correctness
            if (this.arr[this.lastHorizontal + tempHorizontal][this.lastVertical + tempVertical].texture.key != this.lastChip.texture.key)
                break;

            this.arrWinning.push(this.arr[this.lastHorizontal + tempHorizontal][this.lastVertical + tempVertical]);

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
                if (this.arr[i][o] != null) {
                    func(this.arr[i][o], arg1, arg2, arg3);
                }
            }
        }
    }

    //once there is a winner
    dropChips() {
        this.forAllChips(this.replaceBodyChips.bind(this));
        setTimeout(this.removeChipObjs.bind(this), 2000);
        this.physics.world.checkCollision.down = false;
    }

    replaceBodyChips(chip) {
        var tempColor = chip.texture.key;
        var tempX = chip.x;
        var tempY = chip.y;

        chip.destroy();
        chip = this.physics.add.sprite(tempX, tempY, tempColor);
        chip.body.setGravityY(1000);
        chip.setDepth(1);
    }

    removeChipObjs() {
        //destroy the elements from the scene
        this.forAllChips((chip) => chip.destroy());
        //reset the initial array
        this.arr = Array.from(Array(this.gridW), () => []);
        this.lastChip = null;
        this.physics.world.checkCollision.down = true;
    }

    getGridWidth() {
        return this.gridW * this.chipSize;
    }

    getGridHeight() {
        return this.gridH * this.chipSize;
    }
}

