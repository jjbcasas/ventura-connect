const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')/*(session)*/
const methodOverride = require('method-override')
const flash = require('express-flash')
const logger = require('morgan')
const connectDB = require('./config/database')
const mainRoutes = require('./routes/main')
const feedRoutes = require('./routes/feed')
const profileRoutes = require('./routes/profile')
const postRoutes = require('./routes/post')

require('dotenv').config({path:'./config/.env'})

// Passport config
require('./config/passport')(passport)

// Passport google-oauth20 config
require('./config/passport-oauth')(passport)

connectDB()

app.set('view engine','ejs')

app.use(express.static('public'))

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(logger('dev'))

app.use(methodOverride('_method'))

// Sessions
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.DB_STRING
        })
        /*new MongoStore({ mongooseConnection: mongoose.connection})*/
    })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use('/',mainRoutes)
app.use('/feed', feedRoutes)
app.use('/profile', profileRoutes)
app.use('/post', postRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}, you better catch it`)
})