const MongoDB = require('../class/MongoDB');
var moment = require('moment-timezone');

module.exports = async function (req, res) {
    res.set('Content-Type', 'text/xml');
    var { cat } = req.params;
    var query = {};
    
    var first_response =`<?xml version="1.0" encoding="utf-8"?><rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"><channel><title>Ulak News</title><link>https://ulak.news</link><description>Son Dakika Haberler</description><language>tr</language><managingEditor>info@orhanaydogdu.com.tr (Orhan AYDOĞDU)</managingEditor><category>Haber</category><image><title>Ulak News</title><link>https://ulak.news</link><url>https://ulak.news/img/ulak/logo_2.webp</url><width>75</width><height>50</height></image>`;
    var end_response = `\n</channel></rss>`;

    var middle_response = ``;

    var db_data = [];

    if(typeof cat === "undefined"){
        return res.end("");
    }else{
        query.categories = cat.toString();
    }

    console.log();

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
        <title><![CDATA[${unescape(data.title)}]]></title>
        <description><![CDATA[<img src="${data.image}"/> ${data.title}...<a href="https://ulak.news/${data.seo_link}">Devamı için tıklayınız</a>]]></description>
        <pubDate>${moment(data.date_u, 'X').format('ddd, DD MMM YYYY HH:mm:ss')} +0300</pubDate>
        <atom:link href="https://ulak.news/${data.seo_link}"/>
        </item>\n`
    })


    var result = first_response + middle_response + end_response;

    return res.end(result);
}