const MongoDB = require('../class/MongoDB');
var moment = require('moment-timezone');

module.exports = async function (req, res) {

      function decodeHTMLEntities(text) {
        var entities = [
            ['amp', '&'],
            ['apos', '\''],
            ['#x27', '\''],
            ['#x2F', '/'],
            ['#39', '\''],
            ['#47', '/'],
            ['lt', '<'],
            ['gt', '>'],
            ['nbsp', ' '],
            ['quot', '"']
        ];

        for (var i = 0, max = entities.length; i < max; ++i) 
            text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);

        return text;
    }

    res.set('Content-Type', 'text/xml');
    var { cat } = req.params;
    var query = {};
    

    if(typeof cat === "undefined" || typeof req.query.to === "undefined"){
        return res.end("");
    }else{
      if(cat !== "sondakika"){
        query.categories = cat.toString();
      }
    }

    var first_response =`<?xml version="1.0" encoding="utf-8"?><rss xmlns:georss="http://www.georss.org/georss" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"><channel><title>Ulak News</title><link>https://ulak.news</link><description>Son Dakika Haberler</description><language>tr</language><managingEditor>ulak@orhanaydogdu.com.tr (Orhan AYDOĞDU)</managingEditor><category>Haber</category><image><title>Ulak News</title><link>https://ulak.news</link><url>https://ulak.news/img/ulak/logo_2.png</url><width>75</width><height>50</height></image><atom:link href="https://ulak.news/atom_news.php?cat=${req.query.to}" rel="self" type="application/rss+xml" />`;
    var end_response = `\n</channel></rss>`;

    var middle_response = ``;

    var db_data = [];

    const redisKey = `rss/atom_${cat}`;
    req.redis.get(redisKey, async (err, reply) => {

            if (reply !== null) {
                return res.end(first_response + reply + end_response);
            }


            db_data = await new MongoDB('db', 'news').findWithProject(query, [0, 35], {seo_link: true, agency_title: true, title: true, date_u: true, categories: true, image: true}, {_id: -1});

            db_data.map(data=>{
                data.seo_link = data.seo_link.replace(/&/g, "&amp;")
                .replace(/</g, "")
                .replace(/>/g, "")
                .replace(/"/g, "")
                .replace(/'/g, "")
                .replace('|', "")
                .replace('---', "")
                .replace(/[^\x00-\x7F]/g, "")
                .replace(/[+?+&*!'`#^%]/g, "");
                data.title = data.title.replace(/&#8217;/g, "'")
                .replace(/&#8230;/g, "'")
                .replace(/&#039;/g, "'")
                .replace(/&#8216;/g, "‘");
                data.seo_link = data.seo_link.replace(/\s/g, '');
                let cat = '';
                if(data.categories.length > 0){
                  data.categories.map((ca)=>{
                    cat += '<category>'+ca+'</category>';
                  });
                }
                middle_response = middle_response+`<item>
                <guid isPermaLink="false">${data._id}</guid>
                <link>https://ulak.news/${data.seo_link}</link>
                `+cat+`
                <title><![CDATA[${decodeHTMLEntities(data.title)}]]></title>
                <author>ulak@orhanaydogdu.com.tr (${data.agency_title})</author>
                <enclosure url="${data.image}" type="image/jpeg" length="50000" />
                <description><![CDATA[${data.title}...<a href="https://ulak.news/${data.seo_link}">Devamı için tıklayınız</a>]]></description>
                <content:encoded>
                    <![CDATA[
                      ${data.title}
                    ]]>
                </content:encoded>
                <pubDate>${moment(data.date_u, 'X').format('ddd, DD MMM YYYY HH:mm:ss')} +0300</pubDate>
                <atom:link href="https://ulak.news/${data.seo_link}"/>
                </item>\n`
            })


            var result = first_response + middle_response + end_response;
            req.redis.set(redisKey, middle_response, 'EX', 60*5); // seconds ttl
            return res.end(result);
    });
}