const expressJwt = require('express-jwt')

function authJwt(){
    const secret = process.env.SECRET_TOKEN
    const API_URL = process.env.API_URL
    return expressJwt({
        secret,
        algorithms:['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            `${API_URL}/user/login`,
            `${API_URL}/user/register`,
            {url: /(.*)\/products(.*)/, methods:['GET']},
            {url: /(.*)\/category(.*)/, methods:['GET']},
            {url: /(.*)\/public(.*)/, methods:['GET']},

        ]
    })
}

async function isRevoked(req,payload,done){
    if(!payload.isAdmin){
        done(null,true)
    }

    done()
}

module.exports = authJwt