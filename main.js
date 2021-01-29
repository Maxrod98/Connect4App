//ssh -R 80:localhost:8080 ssh.localhost.run
var WIDTH = getWidth();
var HEIGHT = getHeight();

var CHIP_WIDTH = 7;
var CHIP_HEIGHT = 6;


let gameScene = new GameScene(WIDTH, HEIGHT, CHIP_WIDTH, CHIP_HEIGHT, "GameScene");
let onlineScene = new OnlineScene(WIDTH, HEIGHT, CHIP_WIDTH, CHIP_HEIGHT, "OnlineScene");
let onlineScene1 = new OnlineScene1(WIDTH, HEIGHT);
let pc = new PCScene(WIDTH, HEIGHT, CHIP_WIDTH, CHIP_HEIGHT, "PCScene");
//window.scene = gameScene;
let statScene = new StatScene(WIDTH, HEIGHT);
let titleScene = new TitleScene(WIDTH, HEIGHT);


var gameConfig = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    resolution: window.devicePixelRatio,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    }
};

let game = new Phaser.Game(gameConfig);
game.scene.add('StatScene', statScene);
game.scene.add('OnlineScene', onlineScene);
game.scene.add('OnlineScene1', onlineScene1);
game.scene.add('PCScene', pc);
game.scene.add('GameScene', gameScene);
game.scene.add('TitleScene', titleScene);
game.scene.start('OnlineScene1');


window.gameScene = gameScene;
window.pc = pc;
window.titleScene = titleScene;
window.game = game;
window.statScene = statScene;
window.onlineScene = onlineScene;

//window.addEventListener('resize', resize.bind(null, game));

function resize(gam) {
    console.log(gam.canvas.height);
    gam.canvas.height = getHeight();
    gam.canvas.width = getWidth();
    gameScene.resize();
}

function getHeight() {
    /*
    let scrollHeight = Math.min(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
    */
    scrollHeight = document.documentElement.clientHeight;
    return scrollHeight;
}

function getWidth() {
    scrollWidth = document.documentElement.clientWidth;
    return scrollWidth;
}

/*
function resize(scene) {
    scene.resize();
}

*/

function resize(game) {
    var canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height, ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
}


