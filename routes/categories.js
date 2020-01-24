const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {


    var limit = 50;

    if(typeof req.query.limit !== "undefined"){
        if(req.query.limit <= 50 ){
            limit = parseInt(req.query.limit);
        }
    }


    const redisKey = `categories/${limit}`;
    req.redis.get(redisKey, async (err, reply) => {

        if (reply !== null) {
            return res.json(JSON.parse(reply));
        }

        main_response = {
            status: false,
            desc: "",
            result: []
        };

        var result = [];
        var tmpResult = [];
        
        result = await new MongoDB('db', 'news').aggregate([
            {
                $unwind: '$categories'
            }, 
            {
                $group: 
                    {
                        '_id': '$categories', 
                        'total': {
                        '$sum': 1
                        }
                    }
            },
            {
                $sort: {
                    'total': -1
                }
            },
            {
                $limit: limit
            }
        ]);

        if(result.length > 0){
            result.map((cat)=>{
                tmpResult.push({cat: cat._id, seo_link: 'kategori.html?kategori='+Buffer.from(cat._id).toString('base64'), total: cat.total})
            });
            
            main_response.status = true;
            main_response.desc = "OK";
            main_response.result = tmpResult;
            req.redis.set(redisKey, JSON.stringify(main_response), 'EX', 43200); // seconds ttl
        }

        return res.json(main_response);
    });
}