const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    req.params.agency = req.params.agency.toString();

    var main_response = {
        status: false,
        desc: ""
    }

    const redisKey = `${req.url}`;
    req.redis.get(redisKey, async (err, reply) => {
        console.log(redisKey);
        if (reply !== null) {
            if(typeof req.params.id !== "undefined"){
                new MongoDB('db', 'news').update( { agency: req.params.agency, id: parseInt(req.params.id) }, { $inc: { read_times: 1 } }, false );
            }
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
             * IF REQUEST BY AGENCY NEWS
             */
            if(req.params.id === undefined){

                result = await new MongoDB('db', 'news').aggregate(
                    [
                        { $match: { agency: req.params.agency } },
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

            }else{

                /**
                 * IF GETTING BY AGENCY AND NEW ID
                 */
                
                result = await new MongoDB('db', 'news').aggregate(
                    [
                        { $match: { agency: req.params.agency, id: parseInt(req.params.id) } },
                        { $project: { _id: false } },
                        { $limit: 1 }
                    ]
                );
                
                replace = 'aip(\'pageStructure\', {\"pageUrl\":\"https:\\/\\/www.sozcu.com.tr\\/apiv2\",\"pageCanonical\":\"https:\\/\\/www.sozcu.com.tr\\/apiv2\",\"pageType\":\"diger\",\"pageIdentifier\":\"\",\"pageCategory1\":\"sozcu\",\"pageCategory2\":\"\",\"pageCategory3\":\"\",\"pageCategory4\":\"\",\"pageCategory5\":\"\",\"pageTitle\":\" - S\\u00f6zc\\u00fc Gazetesi\"});';

        
                if(result.length > 0){
                    /**
                     * increase read_times
                     */
                    new MongoDB('db', 'news').update( { agency: req.params.agency, id: parseInt(req.params.id) }, { $inc: { read_times: 1 } }, false );
                    result[0].text = result[0].text.replace(replace, '');
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