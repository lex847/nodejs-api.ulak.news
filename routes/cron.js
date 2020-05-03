const MongoDB = require('../class/MongoDB');
const axios = require('axios');
require('dotenv').config();

module.exports = async function (req, res) {
    const main_response = {
        status: false,
        desc: "",
        added: 0,
        fail: 0
    }

    var newsData = [];

    async function get_news(agency, limit=1000, start=0){
        console.log("Kron | Başladı => "+agency+" - "+req.moment.format('Y.MM.DD HH:m:s'));
        let response = []
        response = await axios(`https://api.ulak.news/?agency=${agency}&v=`+req.moment.format('X'), {
                headers: {
                    'X-Site': process.env.CURL_AUTH,
                    'X-Site-Token': process.env.CURL_TOKEN
                }
            });
        if(response.data.status){
            response.data.result.map((news)=>{
                newsData.push(news);
            });
        }else{
            console.log("Kron | Hata => "+agency+" - "+req.moment.format('Y.MM.DD HH:m:s'))
        }
        return [];
    }

    async function get_new(agency, id){
        let response = []
        response = await axios(`https://api.ulak.news/?agency=${agency}&id=${id}`, {
            headers: {
                'X-Site': process.env.CURL_AUTH,
                'X-Site-Token': process.env.CURL_TOKEN
            }
        });
        if(response.data.status){
            main_response.added = main_response.added+1;
            console.log("Kron | Çekildi =>"+agency+" - "+id+" - "+req.moment.format('Y.MM.DD HH:m:s'));
            return true;
        }else{
            main_response.fail = main_response.fail+1;
            console.log("Kron | Çekilemedi =>"+agency+" - "+id+" - "+req.moment.format('Y.MM.DD HH:m:s'));
            return false;
        }
        return false;
    }

    if(req.query.key === process.env.CRON_KEY){
        await get_news('odatv');
        await get_news('diken');
        await get_news('haberturk');
        await get_news('sozcu');
        await get_news('halkweb');
        var newsProcess = newsData.map(async (news)=>{
            return get_new(news.agency, news.id);
        });
        Promise.all(newsProcess).then((completed) =>{
            console.log("Kron | Tamamlandı");
            console.log(main_response);
        });
    }else{
        main_response.desc = "Key wrong!"
    }

    return res.json(main_response);
}