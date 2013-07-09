#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var restler = require('restler');
var util = require('util');

var assertFileExists = function(infile){
  var instr = infile.toString();
  if(!fs.existsSync(instr)){
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  } 
  return instr;
};

var cheerioHtmlFile = function(htmlfile){
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
  return JSON.parse(fs.readFileSync(checksfile));
}

var checkHtmlFile = function(htmlfile, checksfile){
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks){
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var checkRemoteHtmlFile = function(url, checksfile, checkHtmlFileFn){
  restler.get(url).on('complete', 
    function(result, response){
      if(result instanceof Error){
        console.error('Error: $s', util.format(response.message));
      }else{  
        //console.log('writing to tmp.txt');
        fs.writeFileSync("tmp.txt", result); 
        var resultVal = checkHtmlFileFn("tmp.txt", checksfile);
        //console.log('resultVal=%s', util.format(resultVal));
        var outJson = JSON.stringify(resultVal, null, 4);
        console.log(outJson); 
      }
    }
  );
} 

var clone = function(fn){
  return fn.bind({});
};

if(require.main == module){
  program.option('-c, --checks <check_file>', 'path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT).option('-f, --url <html_file>', 'url to index.html', null, null).parse(process.argv);
  
  checkRemoteHtmlFile(program.url, program.checks, checkHtmlFile);
} else{
  exports.checkHtmlFile = checkHtmlFile;
}
