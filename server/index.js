require('dotenv').config()
const express = require('express')
const session = require('express-session')
const massive = require('massive')
const auth = require('./middleware/authMiddleware')
const ac = require('./controllers/authController')
const tr = require('./controllers/treasureController')

const {SERVER_PORT, CONNECTION_STRING, SESSION_SECRET, NODE_ENV} = process.env

const app = express()

app.use(express.json())

massive(CONNECTION_STRING)
    .then(db=>{
        app.set('db', db)
        console.log('DB Set')
        if (NODE_ENV === 'development') {
            db.seed([
                
            ]).then(() => console.log('DB Seeded'))
        }
    })
app.use(
    session({
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365
        }
    }))

app.post(`/auth/register`, ac.register)
app.post(`/auth/login`, ac.login)
app.get(`/auth/logout`, ac.logout)
app.get(`/api/treasure/dragon`, tr.dragonTreasure)
app.get('/api/treasure/user', auth.usersOnly, tr.getUserTreasure)
app.post(`/api/treasure/user`, auth.usersOnly, tr.addUserTreasure)
app.get(`/api/treasure/all`, auth.usersOnly, auth.adminsOnly, tr.getAllTreasure)
app.listen(SERVER_PORT, () => {console.log(`Running on ${SERVER_PORT}`)})