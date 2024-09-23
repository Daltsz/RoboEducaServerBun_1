import jwt from 'jsonwebtoken'

const SECRET_KEY = 'my_secret_key'

export const autenticateToken = (req, res, next) =>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]


    if (!token) return res.sendStatus(403);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user;
        next()
    })
}