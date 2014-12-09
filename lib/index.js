var fs      = require('fs'),
    request = require('request'),
    cheerio = require('cheerio'),
    async   = require('async'),
    _       = require('underscore'),
    _str   = require('underscore.string');

_.mixin(_str.exports());

var json = {};
var url = 'http://www.imdb.com/title/tt1229340/';

var scrapePage = function (callback) {
  request(url, function(err, response, html){
    if (err) throw err;
    console.log("scraping page");
    var $ = cheerio.load(html);
    json.title = $('h1.header .itemprop').first().text();
    callback();
  });
};

var writeFile = function (callback) {
  var filename = _(json.title).slugify();
  fs.writeFile('output/'+filename+'.json', JSON.stringify(json, null, 4), function(err){
    if (err) throw err;
    console.log('File successfully written to output/'+filename+'.json');
    callback();
  });
};

async.series([
  function(next) { scrapePage(next) },
  function(next) { writeFile(next) }
]);
