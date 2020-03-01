const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var { gte, lte, agency } = req.body;
    gte = parseInt(gte);
    lte = parseInt(lte);

    var main_response = {
        status: false,
        desc: "",
        result: []
    }
    var limit = 5

    if(typeof req.query.limit !== "undefined"){
        if(req.query.limit <= 50 ){
            limit = parseInt(req.query.limit);
        }
    }

    var query = [];
    
    if(typeof gte === "undefined" || typeof lte === "undefined"){
        main_response.desc = "Missing parameter(s)"
        return res.json(main_response);
    }

    if(typeof agency === "undefined" || agency === "all"){
        agency = "all";
        query.push( { $match: { date_u: { $gte: gte, $lte: lte }, visible: true } } );
    }else{
        agency = agency.toString();
        query.push( { $match: { date_u: { $gte: gte, $lte: lte }, agency: agency, visible: true } } );
    }

    const redisKey = `most_read/${agency}/${gte}/${lte}/${limit}`;
    req.redis.get(redisKey, async (err, reply) => {

                if (reply !== null) {
                    return res.json(JSON.parse(reply));
                }

                var result = [];

                query.push({ $sort: { read_times: -1 } });
                query.push({ $limit: limit });
                query.push({ $project: { _id: false, keywords: false, text: false } });

                result = await new MongoDB('db', 'news').aggregate(query);
                if(result.length > 0){
                    main_response.desc = "OK";
                    main_response.result = result;
                    main_response.status = true;
                    req.redis.set(redisKey, JSON.stringify(main_response), 'EX', 3600); // seconds ttl
                }else{
                    main_response.desc = "Not found"
                }

        return res.json(main_response);
    });
}