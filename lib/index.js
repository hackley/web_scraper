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
    self._scrapePage(url, function(err, json) {
      self.results[url] = json;
      next(err, url);
    });
  }, function(err){
    if (err) throw new Error(err);
    self._writeFile();
  });
};

WebScraper.prototype._scrapePage = function (url, callback) {
  console.log("scraping page:", url);
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

WebScraper.prototype._writeFile = function () {
  var self = this;
  console.log("Writting file...");
  var outputPath = self.outputDir + _(self.name).slugify() + '.json';
  fs.writeFile(outputPath, JSON.stringify(self.results, null, 4), function(err){
    if (err) throw err;
    console.log('File written to', outputPath);
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
