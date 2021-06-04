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
        name: 'Balle'
    });
})

router.get('/admin/users', adminAuth, (req, res) => {
    res.render('users', {
        title: 'Users',
        name: 'Calle'
    });
})

router.get('/admin/Leaderboards', adminAuth, async (req, res) => {

    try{
        const highscores = await Highscore.find({ }).sort({date: -1});

        res.send(highscores)
    }catch(e){
        res.status(404).send();
    }
})

router.get('/admin/Userboard', adminAuth, async (req, res) => {

    try{
        const users = await User.find({ });

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