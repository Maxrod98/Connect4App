
BACKGROUND_NUM = 0;

class BackGround {
    constructor(scene, width, height, col) {
        this.width = width;
        this.height = height;
        this.color = Phaser.Display.Color.HexStringToColor(col);
        this.numChunks = 15;
        this.chunkHeight = height / this.numChunks;
        this.graphics = scene.add.graphics();

        this.generate();


        this.sprite = scene.add.sprite(0, 0, "background" + BACKGROUND_NUM).setOrigin(0, 0).setDepth(1);

        //console.log("background" + BACKGROUND_NUM);
        BACKGROUND_NUM++;
    }

    generate() {
        for (var i = this.numChunks - 1; i >= 0; i--)
            this.fillChunk(i);

        this.graphics.generateTexture("background" + BACKGROUND_NUM, this.width, this.height);
        this.graphics.clear();
        this.graphics.destroy();
    }


    fillChunk(i) {
        this.graphics.fillStyle(this.color.lighten(1).color, 1.0);
        this.graphics.fillRect(0, i * this.chunkHeight, this.width, this.chunkHeight + 1);
    }


}