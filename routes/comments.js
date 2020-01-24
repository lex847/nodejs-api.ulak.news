const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var { agency, id, process } = req.params;
    id = parseInt(id);
    agency = agency.toString();

    var main_result = {
        status: false,
        desc: "",
        result: []
    };

    var floodCheck = [];
    var result = "";
    var checkNew = [];

    if(process === "get"){
        result = await new MongoDB('db', 'comments').aggregate(
            [
                { $match: { agency: agency, id: id, visible: true } },
                { $sort: { date_u: -1 } },
                { $project: { _id: false, ip: false } }
            ]
        );
        
        main_result.result = result;
        main_result.desc = "Comments listed";
        main_result.status = true;

    }else if(process === "add"){

        checkNew = await new MongoDB('db', 'news').find({ agency: agency, id: id, visible: true });
        if(checkNew.length > 0){

            var { text, name, ip } = req.body;
            text = text.toString();
            name = name.toString();
            ip = ip.toString();

            floodCheck = await new MongoDB('db', 'comments').find({ ip: ip, visible: true });
            floodCheck = floodCheck.reverse();

            if(floodCheck.length > 0 && (req.timestamp-floodCheck[0].date_u < 60) ){
                main_result.desc = "Try again in 60 seconds ! Flood blocking";
                return res.json(main_result);
            }

            if(typeof text !== "undefined" || typeof name !== "undefined" || typeof ip !== "undefined"){

                result = await new MongoDB('db', 'comments').insert(
                    {
                        id: id,
                        agency: agency,
                        text: text,
                        name: name,
                        ip: ip,
                        date: req.moment.format('DD.MM.YYYY - HH:mm:ss'),
                        date_u: req.timestamp,
                        visible: true
                    }
                );

                if(result){
                    main_result.status = true;
                    main_result.desc = "Comment Added";
                }

            }else{
                main_result.desc = "Missing or incorrect parameter(s)!";
            }

        }else{
            main_result.desc = "No news found!";
        }

    }else{
        main_result.desc = "Check paramaters!";
    }
    return res.json(main_result);
}