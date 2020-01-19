const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

        var main_response = {
            status: false,
            desc: ""
        }

        /**
         * REQUEST BY ALL AGENCY NEWS
         */

        result = await new MongoDB('db', 'news').aggregate(
            [
                { $sort: { _id: -1 } },
                { $project: { text: false, keywords: false } },
                { $limit: 50 }
            ]
        );

        if(result.length > 0){
            main_response.desc = "OK";
            main_response.result = result;
            main_response.status = true;
        }else{
            main_response.desc = "Not found"
        }

    return res.json(main_response)
}