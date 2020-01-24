const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express()
const port = 5001
require('dotenv').config();
var moment = require('moment-timezone');
const Token = require('./class/token');


const redis = require('redis').createClient({
    port      : process.env.REDIS_PORT,               
    host      : process.env.REDIS_HOST,
    password  : process.env.REDIS_PASS 
 });


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * Middlewares
 */
function main_middleware(req, res, next) {
    req.redis=redis;
    req.moment=moment().locale("tr");
    req.timestamp=parseInt(moment().locale("tr").format('X'));
    next();
 }
 
 async function check_token(req, res, next){
    let { authorization } = req.headers;
    if(typeof authorization !== "undefined"){
        authorization = authorization.toString();
        if(new Token().verify(authorization)){
            return next();
        }
    }

    return res.json({ status: false, desc: "Check your token!" });
 }


const middlewares = [main_middleware, check_token];

const all_news = require('./routes/all_news');
const news = require('./routes/news');
const comments = require('./routes/comments');
const most_read = require('./routes/most_read');
const agencies = require('./routes/agencies');
const search = require('./routes/search');
const last_searches = require('./routes/last_searches');
const login = require('./routes/login');
const categories = require('./routes/categories');
const category = require('./routes/category');


/**
 * ROUTES
 */
app.get('/', (req, res) =>{
    return res.json( { status: true, desc: "OK" } );
});

app.get('/news', middlewares, all_news);
app.get('/news/:agency/:id?', middlewares, news);
app.use('/comments/:agency/:id/:process', middlewares, comments);
app.post('/most_read', middlewares, most_read);
app.get('/agencies', middlewares, agencies);
app.get('/search', middlewares, search);
app.get('/last_searches', middlewares, last_searches);
app.get('/categories', middlewares, categories);
app.get('/category/:id', middlewares, category);
app.post('/login', login);


/**
 * 404
 */
app.use(function (req, res, next) {
    res.status(404).json({status: false, desc: "Check your request!"})
});


app.listen(port, () =>{
    console.log(`Ulak News Node.JS API - ${port}!`);
})