const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var main_response = {
        status: false,
        desc: "Not Found",
        result: []
    }
    
    if(typeof req.query.q === "undefined"){
        return res.json(main_response);
    }
    var limit = 50

    if(typeof req.query.limit !== "undefined"){
        if(req.query.limit <= 50 ){
            limit = parseInt(req.query.limit);
        }
    }
    const redisKey = `search/${await new Buffer.from(req.query.q.toString()).toString('base64').toString()}/${limit}`;
    req.redis.get(redisKey, async (err, reply) => {
            
            if (reply !== null) {
                new MongoDB('db', 'search').update( { keyword: req.query.q.toString() }, { $inc: { search_times: 1 } }, false );
                return res.json(JSON.parse(reply));
            }

            var result = [];


            result = await new MongoDB('db', 'news').findWithProject( { $text: { '$search' : `"${req.query.q.toString()}"`  }, visible: true }, [0, limit], {text: false} );

            /**
             * search log
             */
            new MongoDB('db', 'search').update( { keyword: req.query.q.toString() }, { $inc: { search_times: 1 } }, false );
            main_response.status = true;
            if(result.length > 0){
                main_response.desc = "OK";
                main_response.result = result;
                req.redis.set(redisKey, JSON.stringify(main_response), 'EX', 10800); // seconds ttl
            }
            return res.json(main_response);
    });
}