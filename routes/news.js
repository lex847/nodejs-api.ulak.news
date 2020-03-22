const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    req.params.agency = req.params.agency.toString();

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

    const redisKey = `${req.url}/${limit}`;
    req.redis.get(redisKey, async (err, reply) => {
        if (reply !== null) {
            if(typeof req.params.id !== "undefined"){
                new MongoDB('db', 'news').update( { agency: req.params.agency, id: parseInt(req.params.id) }, { $inc: { read_times: 1 } }, false );
            }
            return res.json(JSON.parse(reply));
        }

        var result = [];
        var related = [];

            
            /**
             * IF REQUEST BY AGENCY NEWS
             */
            if(req.params.id === undefined){

                result = await new MongoDB('db', 'news').aggregate(
                    [
                        { $match: { agency: req.params.agency, visible: true } },
                        { $sort: { date_u: -1 } },
                        { $limit: limit },
                        { $project: { text: false, keywords: false, _id: false, url: false} }
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

            }else{

                /**
                 * IF GETTING BY AGENCY AND NEW ID
                 */
                
                result = await new MongoDB('db', 'news').aggregate(
                    [
                        { $match: { agency: req.params.agency, id: parseInt(req.params.id), visible: true } },
                        { $limit: 1 },
                        { $project: { _id: false } }
                    ]
                );
        
                if(result.length > 0){

                    var keys = '';

                    if(typeof result[0].keywords !== "string"){
                        result[0].keywords.map((key)=>{
                                key  = key.replace(/[^a-z0-9]/gi,'');
                                if(key.length > 0){
                                    keys = keys.concat(key+" ");
                                }
                        });
                    }else{
                        result[0].keywords = result[0].keywords.split(',');
                        result[0].keywords.map((key)=>{
                                key  = key.replace(/[^a-z0-9]/gi,'');
                                key = key.replace(" ", "");
                                if(key.length > 0){
                                    keys = keys.concat(key+" ");
                                }
                        });
                    }

                    related = await new MongoDB('db', 'news').aggregate(
                        [
                            { $match: {$text: {'$search': keys} , categories: { $in: result[0].categories }, visible: true } },
                            { $limit: 3 },
                            { $project: { _id: false, text: false, categories: false, keywords: false, saved_date: false, url: false  } }
                        ]
                    )
                    /**
                     * increase read_times
                     */
                    new MongoDB('db', 'news').update( { agency: req.params.agency, id: parseInt(req.params.id) }, { $inc: { read_times: 1 } }, false );
                    if(req.params.agency === "sozcu"){
                        replace = 'aip(\'pageStructure\', {\"pageUrl\":\"https:\\/\\/www.sozcu.com.tr\\/wp-json\\/wp\\/v2\\/posts\\/'+parseInt(req.params.id)+'\",\"pageCanonical\":\"https:\\/\\/www.sozcu.com.tr\\/wp-json\\/wp\\/v2\\/posts\\/'+parseInt(req.params.id)+'\",\"pageType\":\"diger\",\"pageIdentifier\":\"\",\"pageCategory1\":\"sozcu\",\"pageCategory2\":\"\",\"pageCategory3\":\"\",\"pageCategory4\":\"\",\"pageCategory5\":\"\",\"pageTitle\":\" - S\\u00f6zc\\u00fc Gazetesi\"})';
                        result[0].text = result[0].text.replace(replace, '');
                    }
                    result[0].related = related;
                    main_response.desc = "OK";
                    main_response.result = result;
                    main_response.status = true;
                    req.redis.set(redisKey, JSON.stringify(main_response), 'EX', 43200); // seconds ttl
                }else{
                    main_response.desc = "Not found"
                }

            }
        return res.json(main_response);
    });
}