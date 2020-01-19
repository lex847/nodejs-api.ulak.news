const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var main_response = {
        status: false,
        desc: ""
    }
        
        /**
         * IF REQUEST BY AGENCY NEWS
         */
        if(req.params.id === undefined){

            result = await new MongoDB('db', 'news').aggregate(
                [
                    { $match: { agency: req.params.agency } },
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

        }else{

            /**
             * IF GETTING BY AGENCY AND NEW ID
             */

            result = await new MongoDB('db', 'news').aggregate(
                [
                    { $match: { agency: req.params.agency, id: parseInt(req.params.id) } },
                    { $limit: 1 }
                ]
            );
            
            replace = 'aip(\'pageStructure\', {\"pageUrl\":\"https:\\/\\/www.sozcu.com.tr\\/apiv2\",\"pageCanonical\":\"https:\\/\\/www.sozcu.com.tr\\/apiv2\",\"pageType\":\"diger\",\"pageIdentifier\":\"\",\"pageCategory1\":\"sozcu\",\"pageCategory2\":\"\",\"pageCategory3\":\"\",\"pageCategory4\":\"\",\"pageCategory5\":\"\",\"pageTitle\":\" - S\\u00f6zc\\u00fc Gazetesi\"});';

    
            if(result.length > 0){
                result[0].text = result[0].text.replace(replace, '');
                main_response.desc = "OK";
                main_response.result = result;
                main_response.status = true;
            }else{
                main_response.desc = "Not found"
            }

        }
    return res.json(main_response)
}