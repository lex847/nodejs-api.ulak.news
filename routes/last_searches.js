const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var main_response = {
        status: false,
        desc: "",
        result: []
    }

    var limit = 50

    if(typeof req.query.limit !== "undefined"){
        if(req.query.limit <= 50 ){
            limit = parseInt(req.query.limit);
        }
    }
    
    const redisKey = `last_searches/${limit}`;
    req.redis.get(redisKey, async (err, reply) => {

            if (reply !== null) {
                return res.json(JSON.parse(reply));
            }


        var result = [];

        result = await new MongoDB('db', 'search').aggregate([
            { $sort: { _id: -1 } },
            { $limit: limit },
            { $sort: { search_times: -1 } }
        ]);

        if(result.length > 0){
            main_response.desc = "OK";
            main_response.result = result;
            main_response.status = true;
            req.redis.set(redisKey, JSON.stringify(main_response), 'EX', 18180); // seconds ttl
        }else{
            main_response.desc = "Not found"
        }

        return res.json(main_response);

    });
}