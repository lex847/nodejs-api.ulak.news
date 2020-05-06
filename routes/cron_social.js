const MongoDB = require('../class/MongoDB');
require('dotenv').config();
const Twit = require('twit');
const imageToBase64 = require('image-to-base64');
const decode = require('unescape');

var T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
})



module.exports = async function (req, res) {
    const main_response = {
        status: false,
        desc: "",
        added: 0,
        fail: 0
    }

     
    var newsData = [];

    async function get_news(){
        console.log("Kron Tweet | Başladı => "+req.moment.format('Y.MM.DD HH:m:s'));
        let response = []
        response = await new MongoDB('db', 'news').findWithProject({}, [0, 100], {title: true, image: true, agency: true, agency_title: true, id: true, image: true, seo_link: true}, {_id: -1});
        if(response.length > 0){
            response.map((re)=>{
                newsData.push(re);
            });
        }else{
            console.log("Kron Tweet | HATA => Haberler alınamadı! - "+req.moment.format('Y.MM.DD HH:m:s')); 
        }
    }

    async function check_new(news, platform){
        if(platform==="twitter"){
            // TWITTER
            
            let checkTwit = await new MongoDB('db', 'sociallogs').findWithProject({id: news.id, agency: news.agency, type: platform}, [0, 1], {_id: true});

            if(checkTwit.length < 1){

                var b64content = await imageToBase64(news.image);
        
                // first we must post the media to Twitter
                T.post('media/upload', { media_data: b64content }, function (err, data, response) {
                    // now we can assign alt text to the media, for use by screen readers and
                    // other text-based presentations and interpreters
                    var mediaIdStr = data.media_id_string
                    var altText = news.title;
                    var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
                    
                    T.post('media/metadata/create', meta_params, function (err, data, response) {
                        if (!err) {
                            news.title = news.title.replace(/&#8217;/g, "'")
                            .replace(/&#8230;/g, "'")
                            .replace(/&#039;/g, "'")
                            .replace(/&#8216;/g, "‘");
                            // now we can reference the media and post a tweet (media will attach to the tweet)
                            var params = { status: decode(news.title, 'all').substring(0, 200)+`... ===>> https://ulak.news/${news.seo_link}`+' --- #sondakika #haber #sondakikahaber #haberler', media_ids: [mediaIdStr] }
                            T.post('statuses/update', params, function (err, data, response) {
                                new MongoDB('db', 'sociallogs').insert({id: news.id, agency: news.agency, type: platform});
                                console.log("Kron Tweet | Atıldı.");
                            });
                        }else{
                            console.log(err);
                            console.log("Kron Tweet | ATILAMADI !!");
                        }
                    })
                });
            
            }


            // TWITTER END
            
        }else if(platform==="facebook"){

        }
        return false;
    }

    if(req.query.key === process.env.CRON_KEY && typeof req.query.platform !== "undefined"){
        await get_news();
        var newsProcess = newsData.map(async (news)=>{
            return check_new(news, req.query.platform);
        });
        Promise.all(newsProcess).then((completed) =>{
            console.log("Kron Tweet | Tamamlandı.");
        });
    }else{
        main_response.desc = "Key wrong!"
    }

    return res.json(main_response);
}