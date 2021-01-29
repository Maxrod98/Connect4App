var topdown =
    [[1],
    [1],
    [1],
    [1]];

var diagonal1 =
    [[1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]];

var diagonal2 =
    [[0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [1, 0, 0, 0]];

var leftRight =
    [[1, 1, 1, 1]];

var testBoard =
    [[0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]];

var testBoard2 =
    [0, 0, 1, 1, 0];

var testPattern =
    [1, 1];


function printPattern(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var o = 0; o < arr[i].length; o++) {
            process.stdout.write(arr[i][o] + " ");
        }
        console.log("");
    }
}
//

//returns the array of arrays of locations that dont match
function patternIsOn(board, pattern, operator) {
    var indexesArrs = [];
    //repeat board.length - pattern.length + 1
    for (var i = 0; i < board.length - pattern.length + 1; i++) {
        var chunk = board.slice(i, i + pattern.length);
        var indexes = matchesPartially(pattern, chunk, operator);
        indexesArrs.push(indexes);
    }
    return indexesArrs;
}
//usage: 
//patternIsOn([0, 0, 1, 1, 0], [1, 1], (l, r) => return l != r));


//returns an array with locations that don't match
function matchesPartially(original, other, operator, yLoc) {
    var indexes = [];
    for (var i = 0; i < original.length; i++) {
        if (operator(original[i], other[i]))
            indexes.push({ x: original[i], y: yLoc });
    }
    return indexes;
}




//Usage: 
//matchesPartially([0,0], [1,0], (l, r) => return l != r);


class Arr2d {
    constructor(width, height) {
        this.arr = new Array(height);
        this.width = width;
        this.height = height;

        for (var i = 0; i < this.arr.length; i++) {
            this.arr[i] = new Array(width);
        }

        for (var i = 0; i < this.height; i++) {
            for (var o = 0; o < this.width; o++) {
                this.arr[i][o] = new Chip(o, i, 0);
            }
        }


    }

    subArray(x, y, width, height) {
        var subArr = [];
        for (var o = y; o < y + height; o++) {
            subArr.push(this.arr[o].slice(x, x + width));
        }
        return subArr;
    }

    //assuming same size
    compareTo(other2dArr, operator) {
        var tempArr = [];
        for (var i = 0; i < other2dArr.arr.length; i++) {
            for (var o = 0; o < other2dArr.arr[i].length; o++) {
                if (operator(this.arr[i][o], other2dArr.arr[i][o])) {
                    tempArr.push(this.arr[i][o]);
                }
            }
        }
        return tempArr;
    }
}


//checks patterns in 2d
function patternIsOn2d(board2d, pattern2d, operator) {
    var arr = [];

    //repeat board.length - pattern.length + 1
    for (var i = 0; i < board2d.height - pattern2d.height + 1; i++) {
        for (var o = 0; o < board2.width - pattern2d.width + 1; o++) {
            arr.push(board2.subArr(o, i, pattern2d.width, pattern2d.height).compareTo(pattern2d, operator));
        }
    }
    return arr;
}

//Using it:
/*
patternIsOn2d(board2d, pattern2d, () => return (l.value == r.value));
*/

//Same as patterIsOn2d, but in 2d

class Chip {
    constructor(x, y, value) {
        this.pos = { x: x, y: y };
        this.value = value;
    }
}