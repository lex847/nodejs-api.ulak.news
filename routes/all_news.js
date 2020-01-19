const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

        var main_response = {
            status: false,
            desc: ""
        }

        const redisKey = `news/`;
        req.redis.get(redisKey, async (err, reply) => {
    
                if (reply !== null) {
                    return res.json(JSON.parse(reply));
                }

                var result = [];
                var limit = 50

                if(typeof req.query.limit !== "undefined"){
                    if(req.query.limit <= 50 ){
                        limit = parseInt(req.query.limit);
                    }
                }

                /**
                 * REQUEST BY ALL AGENCY NEWS
                 */

                result = await new MongoDB('db', 'news').aggregate(
                    [
                        { $sort: { _id: -1 } },
                        { $project: { text: false, keywords: false, _id: false } },
                        { $limit: limit }
                    ]
                );

                if(result.length > 0){
                    main_response.desc = "OK";
                    main_response.result = result;
                    main_response.status = true;
                    req.redis.set(redisKey, JSON.stringify(main_response), 'EX', 30); // seconds ttl
                }else{
                    main_response.desc = "Not found"
                }

            return res.json(main_response);
    });
}