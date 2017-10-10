#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const parseString = require('xml2js').parseString;
const json2csv = require('json2csv');

function getAtomFeedXML(url, cb){
  return https.get(url, (res) => {
    console.log('status: '+res.statusCode);
    let body = '';
    res.on('data', d => {
      body += d;
    });
    res.on('end', () => {
      let parsed = {};
      parseString(body, {trim: true}, (err, result) => {
        cb(null,result);
     });
    });
  });
}

getAtomFeedXML(process.env.BLOG_ATOM_URL,(err,data) => {
  if(!err){
    let dtAr = [];
    data.feed.entry.forEach((el,i,ar) => {
      let url_ar = el.id[0].split('/');
      url_ar.shift();
      url_ar.shift();
      url_ar.shift();
      let url_partial = url_ar.join('/');
      const tmp = {
        'title': el.title[0]['_'],
        'date': el.published[0].split('T')[0],
        'url': url_partial,
        'full_url': el.id[0]
      };
      dtAr.push(tmp);
    });
    const flds = ['title', 'date','url','full_url'];
    json2csv({ data: dtAr, fields: flds }, (er, csv) => {
      if( er ){
        console.error(er);
      }else{
        fs.writeFile(path.join(__dirname,'report','blog-posts-dates.csv'), csv, e => {
          if(e){
            console.error(e);
          }else{
            console.log('blog-posts-dates.csv created in the report dir');
          }
        });
      }
    });
    console.log('done');
  }else{
    console.log(err);
  }
});
