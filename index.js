const express= require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const exphbs = require("express-handlebars"); 
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session)
dotenv.config({path:'./config/config.env'})
const mongoose = require("mongoose")
const methodOverride = require("method-override") 
require('./config/passport')(passport)
connectDB()

const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(morgan('dev'))

app.use(methodOverride(function(req,res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

const { formatDate,stripTags,truncate,editIcon,select } = require('./helpers/hbs')

app.engine('.hbs',exphbs({helpers:{
    formatDate,stripTags,truncate,editIcon,select
} ,defaultLayout:'main', extname:'.hbs'}))
app.set('view engine','.hbs')

app.use(session({
    secret: 'secret',
    resave:false,
    saveUninitialized:false,
    store: new MongoStore({mongooseConnection:mongoose.connection})
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(function (req,res,next){
    res.locals.user = req.user || null
    next()
})

app.use(express.static(path.join(__dirname,'public')))

app.use('/',require("./routes/index")) 
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

const PORT = process.env.PORT || 6000

app.listen(PORT,console.log(`server running on ${PORT}`))