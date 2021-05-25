// TODO: implement server and routing with node/express
const path = require('path');
const express = require('express');

const app = express();
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath))


app.get('/about', (req, res) => {
    res.send('Created by Calle, Christian and Marcus')
    // res.sendFile(publicDirectoryPath +  '/reaction.html');
})

app.get('/GamePage', (req, res) => {
    res.sendFile(publicDirectoryPath +  '/gamePage.html');
    console.log("GamePage route");
})

app.get('/ReactionGame', (req, res) => {
    res.sendFile(publicDirectoryPath +  '/reaction.html');
    console.log("reactionGameRoute");
})

app.get('/AimGaim', (req, res) => {
    res.sendFile(publicDirectoryPath +  '/AimGaim.html');
    console.log("AimGameRoute");
})

app.listen(3000, () => {
    console.log('Server is up on port 3000.');
});