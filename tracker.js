// For every folder in the writing folder, compare the word count with the
// file in the same name in the snapshot folder. If there is no copy in the
// snapshot folder, pretend its word count is 0.

var fs = require('fs');
var glob = require('glob');
var wc = require('word-count');
var path = require('path');
var moment = require('moment');

var writing_folder = "/home/leonardo/Dropbox/Notes/Escrita/";
var snapshot_folder = writing_folder + "snapshot/";
var logFile = "/home/leonardo/Dropbox/Notes/quantifiedself/writing.csv";

var countCurrentFile = function(file) {
  var content = fs.readFileSync(file, 'utf8');
  var count;

  if (content == null || content.length == 0) count = 0;
  else count = wc(content);

  return count;
}

var currentFilePath = function(file) {
  return path.join(writing_folder, file);
}

var oldFilePath = function(file) {
  return path.join(snapshot_folder, path.basename(file));
}

var countOldFile = function(file) {
  var path = oldFilePath(file);

  if (fs.existsSync(path)) {
    var content = fs.readFileSync(oldFilePath(file), 'utf8');
    if (content == null || content.length == 0) count = 0;
    else count = wc(content);
  } else {
    count = 0;
  }

  return count;
}

var wordCountDifferenceForFile = function(file) {
  return countCurrentFile(file) - countOldFile(file);
}

var clearSnapshot = function() {
  glob(path.join(snapshot_folder, "*.{txt,md}"), null, function(err, files) {
    files.forEach(function(file) {
      console.log('removendo ' + file);
      fs.unlinkSync(file);
    });
  });
};

var copyFileToSnapshot = function(file) {
  fs.createReadStream(file).pipe(fs.createWriteStream(oldFilePath(file)));
};

var logWordCount = function(wordCount) {
  var entry = dateTime() + "," + wordCount + "\n";
  fs.appendFile(logFile, entry, function(err) {
   if (err) throw err; 
  });
};

var dateTime = function() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};




var wordCount = 0;
glob(path.join(writing_folder, "*.{txt,md}"), null, function(err, files) {
  // First, count words by comparing to the snapshot
  files.forEach(function(file) {
    wordCount += wordCountDifferenceForFile(file);
  });

  // Then delete everything in the snapshot
  clearSnapshot();

  // And then we copy all those files to the snapshot for tomorrow's comparison
  files.forEach(function(file) {
    copyFileToSnapshot(file);
  });

  // We finish by writing today's writing count to our CSV log file
  logWordCount(wordCount);
});

