const MongoDB = require('../class/MongoDB');

module.exports = async function (req, res) {
    res.set('Content-Type', 'text/xml');
    var { end } = req.params;

    var first_response =`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;
    var end_response = `\n</urlset>`;

    var middle_response = ``;

    var count = [];
    var db_data = [];
    var divisor = 15000;
    var maxPage = 1;
    var start = 0;

    count = await new MongoDB('db', 'news').count()/divisor;
    
    if(count % 1 != 0){
        maxPage = Math.floor(count)+1;
    }else{
        maxPage = count;
    }

    if(end < 1){
        end = 1;
    }
    if(end > maxPage){
        end = maxPage;
    }

    start = (end*divisor)-divisor;

    start = parseInt(start);
    end = parseInt(divisor*end);
    
    

    db_data = await new MongoDB('db', 'news').findWithProject({}, [start, end], {seo_link: true}, {_id: 1});

    db_data.map(data=>{
        data.seo_link = data.seo_link.replace(/&/g, "&amp;")
        .replace(/</g, "")
        .replace(/>/g, "")
        .replace(/"/g, "")
        .replace(/'/g, "")
        .replace('|', "")
        .replace('---', "-")
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/[+?+&*!'`#^%]/g, "");
        data.seo_link = data.seo_link.replace(/\s/g, '');
        middle_response = middle_response+`<url><loc>https://ulak.news/${data.seo_link}</loc></url>\n`
    })


    var result = first_response + middle_response + end_response;

    return res.end(result);
}