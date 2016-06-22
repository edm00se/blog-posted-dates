#!/usr/bin/env node

var https = require('https'),
    fs = require('fs'),
    parseString = require('xml2js').parseString,
    json2csv = require('json2csv');
require('console.table');
require('dotenv').config();

function getAtomFeedXML(url, cb){
  return https.get(url, function(res){
    console.log('status: '+res.statusCode);
    //console.log('headers: ',res.headers);
    var body = '';
    res.on('data', function(d){
      body += d;
    });
    res.on('end', function(){
      var parsed = {};
      parseString(body, {trim: true}, function(err, result){
        cb(null,result);
     });
    });
  });
}

var url = process.env.BLOG_URL;
getAtomFeedXML(url,function(err,data){
  if(!err){
    var dtAr = [];
    data.feed.entry.forEach(function(el,i,ar){
      var url_ar = el.id[0].split('/');
      url_ar.shift();
      url_ar.shift();
      url_ar.shift();
      var url_partial = url_ar.join('/');
      var tmp = {
        'title': el.title[0]['_'],
        'date': el.published[0],
        'url': url_partial,
        'full_url': el.id[0]
      };
      dtAr.push(tmp);
    });
    //console.table(dtAr);
    var flds = ['title', 'date','url','full_url'];
    json2csv({ data: dtAr, fields: flds }, function(er, csv){
      if( er ){
        console.error(er);
      }else{
        fs.writeFile('blog-posts-dates.csv', csv, function(e){
          if(e){
            console.error(e);
          }else{
            console.log('blog-posts-dates.csv created');
          }
        });
      }
    });
    console.log('done');
  }else{
    console.log(err);
  }
});
