const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {
    var { id } = req.params;

    id.toString();
    id = Buffer.from(id, 'base64').toString('utf8');


    const redisKey = `categories/${id}`;
    req.redis.get(redisKey, async (err, reply) => {

        if (reply !== null) {
            return res.json(JSON.parse(reply));
        }

        var main_response = {
            status: false,
            desc: "No Result!",
            result: []
        };

        var limit = 50;

        if(typeof req.query.limit !== "undefined"){
            if(req.query.limit <= 50 ){
                limit = parseInt(req.query.limit);
            }
        }

        var result = [];
        
        result = await new MongoDB('db', 'news').aggregate(
            [
                { $match: { categories: id } },
                { $sort: { date_u: -1 } },
                { $limit: limit },
                { $project: { _id: false, text: false, categories: false, keywords: false, saved_date: false, seo_link: false, spot: false, url: false  } }
            ]
        );

        if(result.length > 0){
            
            main_response.status = true;
            main_response.desc = "OK";
            main_response.result = result;
            req.redis.set(redisKey, JSON.stringify(main_response), 'EX', 3600); // seconds ttl
        }

        return res.json(main_response);
    });
}