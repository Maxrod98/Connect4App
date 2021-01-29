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

    numOfNonEmptyElems(arr) {
        var sum = 0;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].chip != null) {
                sum++;
            }
        }

        return sum;
    }

    //these could be static
    refineArrays(possibleWinScenarios) {
        for (var out = 0; out < possibleWinScenarios.length; out++) {
            var numOfConsNonEmptyElems = this.numOfConsecutiveNonEmptyElems(possibleWinScenarios[out]);
            if (numOfConsNonEmptyElems == 0) {
                //not a real deal, remove
                possibleWinScenarios.splice(out, 1);
                out--;
            }
            else if (numOfConsNonEmptyElems == 1) {
                //ok so there is an opportunity here to win
                //trimming if possible
                if (possibleWinScenarios[out][0].chip == null) possibleWinScenarios[out].splice(0, 1);
                if (possibleWinScenarios[out][possibleWinScenarios[out].length - 1].chip == null) possibleWinScenarios[out].splice(possibleWinScenarios[out].length - 1, 1);
            }
            else {
                //ok so winning is unavoidable
                //do nothing
            }
        }
    }

    //these could be static
    numOfConsecutiveNonEmptyElems(arr) {
        var sum = 0;
        for (var i = 0; i < arr.length - 1; i++) {
            if (arr[i].chip != null && arr[i + 1].chip != null) {
                sum++;
            }
        }

        return sum;
    }

    checkWin(countEmptySpaces, location, sprite, limit) {
        //console.log("SPRITE : " + sprite);

        var possibleWinScenarios = [];

        var topDown = this.traverse(0, 1, countEmptySpaces, location, sprite);
        if (this.numOfNonEmptyElems(topDown) >= limit) {
            //check top to down winning positions
            possibleWinScenarios.push(topDown);
        }
        var rightLeft = this.traverse(1, 0, countEmptySpaces, location, sprite);
        if (this.numOfNonEmptyElems(rightLeft) >= limit) {
            //check right to left winning positions
            possibleWinScenarios.push(rightLeft);
        }
        var diagonal1 = this.traverse(1, 1, countEmptySpaces, location, sprite);
        if (this.numOfNonEmptyElems(diagonal1) >= limit) {
            //check diagonal winning positions
            possibleWinScenarios.push(diagonal1);
        }
        var diagonal2 = this.traverse(1, -1, countEmptySpaces, location, sprite);
        if (this.numOfNonEmptyElems(diagonal2) >= limit) {
            //check diagonal winning positions
            possibleWinScenarios.push(diagonal2);
        }

        //console.log("topdown: " + topdown + "   rightleft:  " + rightleft + "  topright_bottomleft:  " + topright_bottomleft + "  bottomright_topleft :" + bottomright_topleft);
        return possibleWinScenarios;
    }

    //horizontal shift and vertical shift
    traverse(horizontal, vertical, countEmptySpaces, location, sprite) {
        var totalArr = [];
        totalArr.push({ chip: this.arrChips[location.x][location.y], pos: new Phaser.Math.Vector2(location.x, location.y) });

        var positiveSide = this.traverseHelper(horizontal, vertical, countEmptySpaces, true, location, sprite);
        var negativeSide = this.traverseHelper(-horizontal, -vertical, countEmptySpaces, false, location, sprite);

        //concatenate final array
        totalArr = positiveSide.concat(totalArr).concat(negativeSide);
        console.log(totalArr);

        return totalArr;
    }

    traverseHelper(horizontal, vertical, countEmptySpaces, positive, location, sprite) {
        var tempHorizontal = horizontal;
        var tempVertical = vertical;
        var numConsecutiveNulls = 0;

        var arr = [];

        //while loop continues only if next element in the positive direction is the same color as the last chip inserted and it is not null
        while (this.arrChips[location.x + tempHorizontal] != null) {
            if (((location.x + tempHorizontal) > this.numCols) || ((location.x + tempHorizontal) < 0)) return arr; //we have hit the limits horizontally
            if (((location.y + tempVertical) > this.numRows) || ((location.y + tempVertical) < 0)) return arr; //we have hit the limits vertically


            //checking for correctness
            if (!countEmptySpaces) {
                if (this.arrChips[location.x + tempHorizontal][location.y + tempVertical] == null)
                    break;
            }
            if (this.arrChips[location.x + tempHorizontal][location.y + tempVertical] != null) {
                numConsecutiveNulls = 0;
                //checking if next element is the same color
                if (this.arrChips[location.x + tempHorizontal][location.y + tempVertical].texture.key != sprite.texture.key) {
                    break;
                }
            }
            else {
                numConsecutiveNulls++;
                if (numConsecutiveNulls >= 2) return arr;
            }

            var elem = this.arrChips[location.x + tempHorizontal][location.y + tempVertical];
            var tuple = { chip: elem, pos: new Phaser.Math.Vector2(location.x + tempHorizontal, location.y + tempVertical) };
            //for the AI to work with
            if (positive)
                arr.unshift(tuple);
            else
                arr.push(tuple);

            tempHorizontal += horizontal;
            tempVertical += vertical;
        }

        return arr;
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