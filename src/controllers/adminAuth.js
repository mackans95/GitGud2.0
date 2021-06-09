const jwt = require('jsonwebtoken');
const User = require("../models/users");

const adminAuth = async (req, res, next) => {
    try{
        // hämtar cookien
        const {cookies} = req;
        // plockar ut token från cookien
        const token = cookies.jwt;
        // plockar ut logged in user id med token
        const decoded = jwt.verify(token, process.env.JWT_SIGNINGKEY)
        // kollar så usern finns 
        const user = await User.findById(decoded.id)

        if(!user){
            //skickas till catch
            throw new Error()
        }
        if(!user.isAdmin){
            throw new Error()
        }
        
        // skickar med user till req, för att slippa hämta user fler gånger(belasta db)
        req.user = user;

        // sätter vilket spel det är från route namnet istället för hårdkodat från client JS posten, (ONÖDIGT?)
        req.game = req.route.path.replace('/', '');
        
        // req.token = token;
        next();
    }catch(e){
        res.status(401).send({error: 'Admin role required to access page.'})
    }
}

module.exports = adminAuth;