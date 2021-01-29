const express = require('express');
const path = require('path');
const port = process.env.PORT || 5000;

const app = express();

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.use("/phaser", express.static('./phaser/'));
app.use("/game", express.static('./game/'));

app.listen(port, () => console.log(`Connect-4 app listening on port ${port}`));