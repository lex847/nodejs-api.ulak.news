const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {

    var main_response = {
        status: false,
        desc: ""
    }

    var result = [];
    if(typeof req.body.email !== "undefined" || typeof req.body.password !== "undefined"){
        
            /**
             * IF GETTING BY AGENCY AND NEW ID
             */

            result = await new MongoDB('db', 'users').aggregate(
                [
                    {
                        $match: 
                            {
                                email: req.body.email.toString(),
                                password: req.body.password.toString()
                            }
                    },
                    {
                        $project: { _id: false, password: false, tokes: false }
                    }
                ]
            );
    } 

    
            if(result.length > 0){
                main_response.desc = "OK";
                main_response.result = {
                    token: "",
                    user: result
                };
                main_response.status = true;
            }else{
                main_response.desc = "E-mail or Password is incorrect"
            }

    return res.json(main_response)
}