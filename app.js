const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express()
const port = 5001
require('dotenv').config();
var moment = require('moment-timezone');


const redis = require('redis').createClient({
    port      : 6379,               
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
 
app.use(main_middleware);

const all_news = require('./routes/all_news');
const news = require('./routes/news');
const comments = require('./routes/comments');
const most_read = require('./routes/most_read');
const agencies = require('./routes/agencies');
const search = require('./routes/search');
const login = require('./routes/login');


/**
 * ROUTES
 */
app.get('/', (req, res) =>{
    return res.json( { status: true, desc: "OK" } );
});

app.get('/news', all_news);
app.get('/news/:agency/:id', news);
app.use('/comments/:agency/:id/:process', comments);
app.post('/most_read', most_read);
app.get('/agencies', agencies);
app.get('/search', search);
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