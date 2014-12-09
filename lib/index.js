var fs      = require('fs'),
    request = require('request'),
    cheerio = require('cheerio'),
    async   = require('async'),
    _       = require('underscore'),
    _str   = require('underscore.string');

_.mixin(_str.exports());

var WebScraper = function (params) {
  if (!params.urls instanceof Array)
    throw new Error('urls must be an array');
  this.name = params.name;
  this.urls = params.urls;
  this.outputDir = params.outputDir;
  this.results = {};
};

WebScraper.prototype.run = function () {
  var self = this;
  async.each(self.urls, function (url, next) {
    console.log("scraping page:", url);
    self._scrapePage(url, function(err, json) {
      self.results[url] = json;
      next(err, url);
    });
  }, function(err){
    if (err) throw new Error(err);
    console.log("Writting file...");
    self._writeFile(function(filePath) {
      console.log('File written to', filePath);
    });
  });
};

WebScraper.prototype._scrapePage = function (url, callback) {
  var self = this;
  var json = {};
  request(url, function(err, response, html){
    if (!err) {
      var $ = cheerio.load(html);
      json.title = $('h1.header .itemprop').first().text();
    }
    callback(err, json);
  });
};

WebScraper.prototype._writeFile = function (callback) {
  var self = this;
  var outputPath = self.outputDir + _(self.name).slugify() + '.json';
  var fileData = JSON.stringify(self.results, null, 4);
  fs.writeFile(outputPath, fileData, function(err){
    if (err) throw err;
    callback(outputPath);
  });
};


var scraper = new WebScraper({
  name: "Nathan's Scraper",
  urls: [
    'http://www.imdb.com/title/tt1229340/',
    'http://www.imdb.com/title/tt0117887/'
  ],
  outputDir: "output/"
});

scraper.run();
