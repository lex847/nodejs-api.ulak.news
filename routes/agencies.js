const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var main_response = {
        status: false,
        desc: "",
        result: []
    }
    
    const redisKey = `agencies/`;
    req.redis.get(redisKey, async (err, reply) => {

            if (reply !== null) {
                return res.json(JSON.parse(reply));
            }


        var result = [];

        result = await new MongoDB('db', 'agencies').find(
            {
                status: true
            }
        );

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