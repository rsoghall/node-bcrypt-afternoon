const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req, res) => {
        const {username, password, isAdmin} = req.body
        const db = req.app.get('db')
        let result = await db.get_user([username])
        const existingUser = result[0]
        if(existingUser) {
            return res.status(409).send('Username already exists')
        }
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)
        let registeredUser = await db.register_user([
            isAdmin, username, hash
        ])
        let user = registeredUser[0]
        req.session.user = {isAdmin: user.is_admin, username: user.username, id: user.id}
        return res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        const {username, password} = req.body
        const db = req.app.get('db')
        const foundUser = await db.get_user([username])
        const user = foundUser[0]
        if(!user){
            res.status(401).send('Please register before logging in.')
        }
        const isAuthenticated = bcrypt.compareSync(password, user.hash)
        if(!isAuthenticated){
            return res.status(403).send('Incorrect Password')
        }
        req.session.user = {isAmin: user.is_admin, id: user.id, username: user.username}
        return res.send(req.session.user)
    },
    logout: (req, res) => {
        req.session.destroy()
        return res.sendStatus(200)
    }
}



