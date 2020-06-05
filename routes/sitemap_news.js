const MongoDB = require('../class/MongoDB');
var moment = require('moment-timezone');

module.exports = async function (req, res) {
    res.set('Content-Type', 'text/xml');
    async function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    var { cat } = req.params;
    var query = { visible: true };
    
    var first_response =`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"       
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n\n`;
    var end_response = `\n</urlset>`;

    var middle_response = ``;

    var db_data = [];

    if(typeof cat === "undefined"){
        return res.end("");
    }else{
        query.categories = cat.toString();
    }

    console.log();

    db_data = await new MongoDB('db', 'news').findWithProject(query, [0, 999], {seo_link: true, title: true, date_u: true}, {_id: -1});

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
        middle_response = middle_response+`<url><loc>https://ulak.news/${data.seo_link}</loc><news:news>
        <news:publication>
          <news:name>Ulak News</news:name>
          <news:language>tr</news:language>
        </news:publication>
        <news:publication_date>${moment(data.date_u, 'X').format()}</news:publication_date>
          <news:title>${data.title}</news:title>
        </news:news>
      </url>\n`
    })


    var result = first_response + middle_response + end_response;

    return res.end(result);
}