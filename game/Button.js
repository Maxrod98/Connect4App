var BUTTON_NUM = 0;

class Button {
    constructor(scene, x, y, width, height, text, color, callback) {
        this.text = text;
        this.x = x;
        this.y = y;

        this.scene = scene;

        this.buttonGraphicsPadding = 17;

        this.horizontalPadding = 0.05 * width;
        this.verticalPadding = 0.05 * height;

        this.col = Phaser.Display.Color.HexStringToColor(color);

        var graphics = scene.add.graphics();
        graphics.fillStyle(this.col.color, 1.0);
        graphics.fillRoundedRect(0, 0, width, height);
        graphics.fillStyle(this.col.lighten(10).color, 1.0);
        graphics.fillRoundedRect(0, 0, width - this.buttonGraphicsPadding, height - this.buttonGraphicsPadding);
        graphics.generateTexture("button" + BUTTON_NUM, width, height);
        graphics.clear();
        graphics.destroy();

        this.button = scene.add.sprite(x, y, "button" + BUTTON_NUM).setDepth(2);
        this.button.setOrigin(0, 0);
        this.button.setInteractive();
        if (callback != null) {
            this.button.on("pointerdown", callback);
            this.button.on("pointerdown", this.onPress.bind(this));
        }

        this.fontSize = this.button.height / 2;



        this.textObj = scene.add.text(0, 0, text, { fontSize: this.fontSize, color: '0xFFFFFF' }).setDepth(2);

        this.resizeText();

        this.offset = new Phaser.Math.Vector2(Math.abs((this.button.width - this.textObj.displayWidth - this.horizontalPadding * 2)) / 2, Math.abs(this.button.height - this.textObj.displayHeight - this.verticalPadding * 2) / 2);
        this.update();

        BUTTON_NUM++;

    }

    onPress() {

        this.scene.sound.play("button");

    }

    resizeText() {
        if (this.textObj.width + 2 * this.horizontalPadding > this.button.width) {
            //console.log("rescaling");
            this.textObj.scale = this.button.width / (this.textObj.width + this.horizontalPadding * 2);
            console.log(this.textObj.width);
        }
    }

    clear() {
        this.button.destroy();
        if (this.textObj != null) this.textObj.destroy();
    }


    update() {
        this.resizeText();

        this.button.x = this.x;
        this.button.y = this.y;
        //console.log("text " + this.x + " " + this.y);


        this.textObj.x = this.x + this.offset.x;
        this.textObj.y = this.y + this.offset.y;




        return this;
    }


    setX(x) {
        this.x = x;
        this.button.x = x;
        this.textObj.x = x;

        return this;
    }

    setY(y) {
        this.y = y;
        this.button.y = y;
        this.textObj.y = y;

        return this;
    }


}