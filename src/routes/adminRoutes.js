const express = require('express');
const router = new express.Router();
const path = require('path');
const Highscore = require('../models/highscores');
const User = require('../models/users');
const auth = require('../controllers/auth');
const adminAuth = require('../controllers/adminAuth')

const publicDirectoryPath = path.join(__dirname, '../../views');
router.use(express.static(publicDirectoryPath));

router.get('/admin/highscores', adminAuth, (req, res) => {
    
    res.render('highscores', {
        title: 'Highscores',
    });
})

router.get('/admin/users', adminAuth, (req, res) => {
    res.render('users', {
        title: 'Users',
    });
})

router.get('/admin/GetHighscores', adminAuth, async (req, res) => {

    if(req.query.GameName) {
        try{
            const highscores = await Highscore.find({ gamename: req.query.GameName }).sort({date: -1}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));
    
            res.send(highscores)
        }catch(e){
            res.status(404).send();
        }
    }else{
        try{
            const highscores = await Highscore.find({  }).sort({date: -1}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));
    
            res.send(highscores)
        }catch(e){
            res.status(404).send();
        }
    }
})


router.get('/admin/GetUsers', adminAuth, async (req, res) => {

    try{
        const users = await User.find({ }).collation({locale:'en',strength: 2}).sort({username: 1}).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));

        res.send(users)
    }catch(e){
        res.status(404).send();
    }
})


router.delete('/admin/deleteHighscore', adminAuth, async (req, res) => {

    console.log(req.body.id);
    try{

        const highscore = await Highscore.findByIdAndDelete(req.body.id);
        if(!highscore){
            return res.status(404).send();
        }

        res.send(highscore);

    }catch(e){
        res.status(500).send();
    }
})


router.delete('/admin/deleteUser', adminAuth, async (req, res) => {

    console.log(req.body.id);
    try{

        const user = await User.findByIdAndDelete(req.body.id);
        if(!user){
            return res.status(404).send();
        }

        res.send(user);

    }catch(e){
        res.status(500).send();
    }
})

router.patch('/admin/updateUser', adminAuth, async (req, res) => {
    try{
        const user = await User.findById(req.body.id);
        Object.assign(user, req.body);
        user.save();
        res.send(user)
    }catch(e){
        res.status(500).send();
    }
})

module.exports = router;