import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {db} from '../database/sqlite.js'


const SECRET_KEY = 'my_secret_key'

// Função para Registrar usuarios
export const registerUser = (req, res) =>{
    const {username, password} = req.body
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) =>{
        if(row){
            return res.status(400).json({message: 'Usuário já existe'});
        }
        const passwordHash = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO (users, password) VALUES (?, ?)', [username, passwordHash], (err) =>{
            if (err){
                return res.status(500).json({message: 'Erro ao criar usuário'})
            }
            res.status(201).json({message: 'Usuário registado com sucesso!'})
        })
    })
}


// Função para logar um usuario
export const loginUser = (req, res) =>{
    const {username, password} = req.body

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if(!user || !bcrypt.compareSync(password, user.password)){
            return res.status(401).json({message: 'Credenciais inválidas'})
        }
        const token = jwt.sign({id: user.id, username: user.username}, SECRET_KEY, {expiresIn: '1h'})
        res.json({message: 'Login bem-sucedido', token})
    })
}
 
