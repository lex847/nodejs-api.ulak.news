const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express()
const port = 5001

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const news = require('./routes/news');
const all_news = require('./routes/all_news');


/**
 * ROUTES
 */
app.get('/', (req, res) =>{
    return res.json( { status: true, desc: "OK" } );
});

app.get('/news', all_news);

app.get('/news/:agency/:id?', news);


app.use(function (req, res, next) {
    res.status(404).json({status: false, desc: "Check your request!"})
});


app.listen(port, () =>{
    console.log(`Ulak News Node.JS API - ${port}!`);
})