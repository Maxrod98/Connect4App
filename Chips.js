class Chips {
    constructor(scene) {
        this.scene = scene;
        this.g;
        this.drawElements();
    }

    drawChip(key, color) {
        var col = Phaser.Display.Color.HexStringToColor(color);
        //bigger circle

        this.g = this.scene.add.graphics();

        this.g.lineStyle(5, 0x22FFFF, 1.0);
        this.g.fillStyle(color, 1.0);
        this.g.fillCircle(this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 2);

        //medium circle
        this.g.fillStyle(col.darken(10).color, 1.0);
        this.g.fillCircle(this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 2.5);

        //small circle inside
        this.g.fillStyle(col.darken(3).color, 1.0);
        this.g.fillCircle(this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 10);

        this.g.fillStyle(0xFFFFFF, 0.05);
        this.g.slice(this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 2, this.scene.gridLayout.chipSize / 2, -Math.PI / 4, Math.PI * 3 / 4, true).fillPath();

        //generate grid
        this.g.generateTexture(key, this.scene.gridLayout.chipSize + 1, this.scene.gridLayout.chipSize + 1);
        this.g.clear();
    }

    drawElements() {
        this.drawChip("yellow", "0xFFFF00");
        this.drawChip("blue", "0x43464B");
    }

}