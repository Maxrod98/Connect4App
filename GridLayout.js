class GridLayout {
    constructor(scene, width, height, numBoardCols, numBoardRows, paddingPercent) {
        this.scene = scene;
        this.numCols = numBoardCols;
        this.numRows = numBoardRows;

        this.paddingPercent = paddingPercent;
        this.originalWidth = width;
        this.originalHeight = height;

        this.overallWidth = width - 2 * paddingPercent * width;
        this.overallHeight = height - 2 * paddingPercent * height;
        this.gameInfoHeight = this.overallHeight * 0.25; //at least 1/4 of screen height for anything other than game grid

        this.update();

        //this.xoffset = Math.max(this.paddingX, this.gameWidth / 2 - (this.getGridWidth() / 2));
        //this.yoffset = Math.min((this.gameHeight / 2 - this.getGridHeight() / 2 + this.gameInfoHeight / 2));
    }

    update() {
        this.chipSize = Math.min(((this.overallWidth) / this.numCols), ((this.overallHeight - this.gameInfoHeight) / this.numRows));
        this.numRows = this.overallHeight / this.chipSize;
        this.offset = new Phaser.Math.Vector2(Math.max(this.getHorizontalPadding(), (this.originalWidth - this.chipSize * this.numCols) / 2), Math.max(this.getVerticalPadding(), this.getMaxVerticalOffset()));
    }

    getMaxVerticalOffset() {
        if (this.overallHeight > this.overallWidth * 1.5) return (this.originalHeight - this.gameInfoHeight / 2 - this.chipSize * this.numRows / 2 - this.getVerticalPadding()) / 2;
        return 0;
    }

    showGrid() {
        var lines = this.scene.add.graphics();
        lines.setDepth(5);
        lines.lineStyle(5, 0xFF00FF, 1.0);

        for (var cols = 0; cols < this.numCols + 1; cols++) {
            var xLoc = this.chipSize * cols + this.offset.x;
            lines.lineBetween(xLoc, 0, xLoc, this.originalHeight);
        }

        for (var rows = 0; rows < this.numRows + 1; rows++) {
            var yLoc = this.chipSize * rows + this.getVerticalPadding();
            lines.lineBetween(0, yLoc, this.originalWidth, yLoc);
        }
    }

    getVerticalPadding() {
        //console.log("verpad:" + this.paddingPercent * this.originalHeight);
        return this.paddingPercent * this.originalHeight;
    }

    getHorizontalPadding() {
        return this.paddingPercent * this.originalWidth;
    }

    //what if element needs to be inserted in the center, when the number of cols/rows is odd?
    insertAt(elem, x, y) {
        var xcord = this.chipSize * x + this.offset.x;
        var ycord = this.chipSize * y + this.offset.y;
        elem.setX(xcord);
        elem.setY(ycord);

        return elem;
    }


}