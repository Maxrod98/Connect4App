class BoardLogic {
    constructor(numCols, numRows) {
        this.numRows = numRows;
        this.numCols = numCols;

        this.lastHorizontal;
        this.lastVertical;
        this.lastChipSprite;
        this.chipsRankings = Array.from(Array(numCols), () => []);

        this.arrChips = Array.from(Array(numCols), () => []);
        this.threshold = 4;
        this.arrWinning = [];
        this.rankChips();
    }

    updateStats(lastHorizontal, lastVertical, lastChipSprite) {
        this.lastVertical = lastVertical;
        this.lastHorizontal = lastHorizontal;
        this.lastChipSprite = lastChipSprite;
    }

    checkWin(countEmptySpaces, location, sprite) {
        //console.log("SPRITE : " + sprite);

        if (this.traverse(0, 1, countEmptySpaces, location, sprite)) return this.arrWinning; //check winning top to down winning positions
        if (this.traverse(1, 0, countEmptySpaces, location, sprite)) return this.arrWinning; //check right to left winning positions
        if (this.traverse(1, 1, countEmptySpaces, location, sprite)) return this.arrWinning; //check diagonal winning positions
        if (this.traverse(1, -1, countEmptySpaces, location, sprite)) return this.arrWinning; //check diagonal winning positions


        this.arrWinning = [];
        //console.log("topdown: " + topdown + "   rightleft:  " + rightleft + "  topright_bottomleft:  " + topright_bottomleft + "  bottomright_topleft :" + bottomright_topleft);
        return null;
    }

    //horizontal shift and vertical shift
    traverse(horizontal, vertical, countEmptySpaces, location, sprite) {
        var sum = 1; //self
        //console.log("traversing location at:");
        //console.log(location);
        if (countEmptySpaces)
            this.arrWinning.push({ chip: this.arrChips[location.x][location.y], pos: new Phaser.Math.Vector2(location.x, location.y) });
        else
            this.arrWinning.push(this.arrChips[this.lastHorizontal][location.y]);

        sum += this.traverseHelper(horizontal, vertical, countEmptySpaces, true, location, sprite);
        sum += this.traverseHelper(-horizontal, -vertical, countEmptySpaces, false, location, sprite);

        //trimming
        /*
        if (countEmptySpaces && this.arrWinning.length <= this.BoardLogic.threshold + 1) {// if there are 3 elements, add them
            console.log("insert null ends here");
        }
        */

        if (sum >= this.threshold - 1 && countEmptySpaces) {
            //this.iluminate();
            return true;
        }
        else if (sum >= this.threshold)
            return true;
        else
            this.arrWinning = [];

        return false;
    }

    traverseHelper(horizontal, vertical, countEmptySpaces, positive, location, sprite) {
        var tempHorizontal = horizontal;
        var tempVertical = vertical;
        var sum = 0;
        var numConsecutiveNulls = 0;
        var totalNumNulls = 0;

        //while loop continues only if next element in the positive direction is the same color as the last chip inserted and it is not null
        while (this.arrChips[location.x + tempHorizontal] != null) {
            if (((location.x + tempHorizontal) > this.numCols) || ((location.x + tempHorizontal) < 0)) return sum;
            if (((location.y + tempVertical) > this.numRows) || ((location.y + tempVertical) < 0)) return sum;

            //checking for correctness
            if (!countEmptySpaces) {
                if (this.arrChips[location.x + tempHorizontal][location.y + tempVertical] == null)
                    break;
            }

            if (this.arrChips[location.x + tempHorizontal][location.y + tempVertical] != null) {
                numConsecutiveNulls = 0;
                //checking for correctness
                if (this.arrChips[location.x + tempHorizontal][location.y + tempVertical].texture.key != sprite.texture.key) {
                    break;
                }
                sum++;
            }
            else {
                totalNumNulls++;
                numConsecutiveNulls++;
                if (numConsecutiveNulls >= 2) return sum;
            }

            var elem = this.arrChips[location.x + tempHorizontal][location.y + tempVertical];
            var tuple = { chip: elem, pos: new Phaser.Math.Vector2(location.x + tempHorizontal, location.y + tempVertical) };
            //for the AI to work with
            if (positive && countEmptySpaces)
                this.arrWinning.push(tuple);
            else if (countEmptySpaces)
                this.arrWinning.unshift(tuple);

            //for the checking winning scenario
            if (positive && !countEmptySpaces)
                this.arrWinning.push(elem);
            else if (!countEmptySpaces)
                this.arrWinning.unshift(elem);

            tempHorizontal += horizontal;
            tempVertical += vertical;


        }

        return sum;
    }


    genLocs() {
        var arr = [];

        for (var i = 0; i < this.numCols; i++) {
            var length = this.arrChips[i].length;
            var tuple = { chip: this.arrChips[i][length], pos: new Phaser.Math.Vector2(i, length) }
            arr.push(tuple);
        }
        return arr;
    }


    reset() {
        this.forAllChips((chip) => chip.destroy());
        this.arrChips = Array.from(Array(this.numCols), () => []);
        this.lastChipSprite = null;
    }

    iluminate() {
        this.arrWinning.forEach(function (chip, index) {

            if (chip == null) return;
            chip.alpha = 0.15 * index + 0.05;
        });
    }

    rankChips() {
        var centerX = this.numCols / 2 - 1;
        var centerY = this.numRows / 2;

        for (var i = 0; i < this.numRows; i++) {
            for (var o = 0; o < this.numCols; o++) {
                this.chipsRankings[o][i] = Math.abs(i - centerX) + Math.abs(o - centerY);
            }
        }
    }

    //applies a function func to all the chips in the board
    forAllChips(func, arg1, arg2, arg3) {
        for (var i = 0; i < this.numCols; i++) {
            for (var o = 0; o < this.numRows; o++) {
                if (this.arrChips[i][o] != null) {
                    func(this.arrChips[i][o], arg1, arg2, arg3);
                }
            }
        }
    }


}