const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const app = express()
const port = 5001

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const latest_news = require('./routes/latest_news');


/**
 * ROUTES
 */
app.get('/', (req, res) =>{
    return res.json( { status: true, desc: "OK" } );
});

app.get('/latest_news', latest_news );



app.listen(port, () =>{
    console.log(`Ulak News Node.JS API - ${port}!`);
})