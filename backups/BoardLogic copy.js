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

    checkWin(countEmptySpaces) {

        if (this.traverse(0, 1, countEmptySpaces)) return this.arrWinning; //check winning top to down winning positions
        if (this.traverse(1, 0, countEmptySpaces)) return this.arrWinning; //check right to left winning positions
        if (this.traverse(1, 1, countEmptySpaces)) return this.arrWinning; //check diagonal winning positions
        if (this.traverse(1, -1, countEmptySpaces)) return this.arrWinning; //check diagonal winning positions

        //console.log("topdown: " + topdown + "   rightleft:  " + rightleft + "  topright_bottomleft:  " + topright_bottomleft + "  bottomright_topleft :" + bottomright_topleft);
        return null;
    }

    //horizontal shift and vertical shift
    traverse(horizontal, vertical, countEmptySpaces) {
        var sum = 1; //self
        sum += this.traverseHelper(horizontal, vertical, countEmptySpaces);
        sum += this.traverseHelper(-horizontal, -vertical, countEmptySpaces);

        this.arrWinning.push(this.arrChips[this.lastHorizontal][this.lastVertical]);

        if (sum >= this.threshold)
            return true;
        else
            this.arrWinning = [];

        return false;
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

            /*
            if ((this.lastHorizontal + tempHorizontal) > this.numCols || (this.lastHorizontal + tempHorizontal) < 0) return;
            if ((this.lastVertical + tempVertical) > this.numRows || (this.lastHorizontal + tempHorizontal) < 0) return;
            */
            sum++;
        }

        return sum;
    }

    reset() {
        this.forAllChips((chip) => chip.destroy());
        this.arrChips = Array.from(Array(this.numCols), () => []);
        this.lastChipSprite = null;
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
                    console.log("destroying");
                    func(this.arrChips[i][o], arg1, arg2, arg3);
                }
            }
        }
    }


}