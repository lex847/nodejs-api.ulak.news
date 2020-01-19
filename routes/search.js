const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var main_response = {
        status: false,
        desc: "Not Found"
    }

    var result = [];
    var limit = 50

    if(typeof req.query.limit !== "undefined"){
        if(req.query.limit <= 50 ){
            limit = parseInt(req.query.limit);
        }
    }

    if(typeof req.query.q === "undefined"){
        return res.json(main_response);
    }

            result = await new MongoDB('db', 'news').findSearch( { $text: { '$search' : req.query.q  } }, limit );

            /**
             * search log
             */
            new MongoDB('db', 'search').update( { keyword: req.query.q }, { $inc: { search_times: 1 } }, false );
            
            if(result.length > 0){
                main_response.desc = "OK";
                main_response.result = result;
                main_response.status = true;
            }
   return res.json(main_response)
}